import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent?: string;
  projectedPoints?: number;
  salary?: number;
  injuryStatus?: string;
}

interface PFRPlayerModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onDraftPlayer: (player: Player) => void;
  slotPosition?: string;
}

export function PFRPlayerModal({ 
  player, 
  isOpen, 
  onClose, 
  onDraftPlayer,
  slotPosition 
}: PFRPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!player) return null;

  // Generate Pro Football Reference URL for the player
  const generatePFRUrl = (player: Player) => {
    // PFR URL format: /players/{LastInitial}/{LastFourFirst2Number}.htm
    // Example: Sam Darnold -> /players/D/DarnSa00.htm
    const nameParts = player.name.split(' ');
    if (nameParts.length < 2) return null;
    
    const firstName = nameParts[0].replace(/[^a-zA-Z]/g, '');
    const lastName = nameParts[nameParts.length - 1].replace(/[^a-zA-Z]/g, '');
    
    if (!firstName || !lastName) return null;
    
    const lastInitial = lastName.charAt(0).toUpperCase();
    const lastFour = lastName.substring(0, 4);
    const firstTwo = firstName.substring(0, 2);
    
    // Most players use 00, some use 01, 02 for duplicates
    // We'll default to 00 and let PFR handle redirects if needed
    const playerCode = `${lastFour}${firstTwo}00`;
    
    return `https://www.pro-football-reference.com/players/${lastInitial}/${playerCode}.htm`;
  };

  const pfrUrl = generatePFRUrl(player);

  const handleDraft = () => {
    onDraftPlayer(player);
    onClose();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getStatusBadge = () => {
    if (!player.injuryStatus || player.injuryStatus === 'healthy') return null;
    
    const variants = {
      'out': 'destructive',
      'doubtful': 'secondary',
      'questionable': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[player.injuryStatus as keyof typeof variants] || 'outline'}>
        {player.injuryStatus.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        {/* Header with Draft Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{player.position}</span>
                <span>•</span>
                <span className="font-medium">{player.team}</span>
                {player.opponent && (
                  <>
                    <span>vs {player.opponent}</span>
                  </>
                )}
                {getStatusBadge()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDraft}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
              data-testid={`button-draft-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              🏈 Draft {player.name}
              {slotPosition && ` (${slotPosition})`}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pro Football Reference Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading player stats from Pro Football Reference...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20 p-8">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>Unable to load player data from Pro Football Reference.</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(pfrUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in New Tab
                      </Button>
                      <Button
                        onClick={() => {
                          setHasError(false);
                          setIsLoading(true);
                        }}
                        size="sm"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {pfrUrl ? (
            <iframe
              src={pfrUrl}
              className="w-full h-full border-0"
              title={`${player.name} - Pro Football Reference`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to generate Pro Football Reference URL for {player.name}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Attribution Footer */}
        <div className="p-3 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-600">
            📊 <span className="font-semibold">Detailed stats via Pro Football Reference</span> - 
            Support quality sports data
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}