import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  RefreshCw, 
  Trophy, 
  CheckCircle, 
  X, 
  Calendar,
  Users,
  Settings,
  ArrowRight
} from "lucide-react";
import { useTournamentPreview } from "@/hooks/useTournamentPreview";
import { useAuth } from "@/hooks/useAuth";

interface TournamentRecoveryPromptProps {
  className?: string;
}

export default function TournamentRecoveryPrompt({ className = "" }: TournamentRecoveryPromptProps) {
  const { isAuthenticated } = useAuth();
  const { recoveryData, clearPreviewData, hasSavedData } = useTournamentPreview();
  const [, setLocation] = useLocation();
  const [showRecovery, setShowRecovery] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Check for recovery data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && hasSavedData && recoveryData) {
      setShowRecovery(true);
    }
  }, [isAuthenticated, hasSavedData, recoveryData]);

  if (!showRecovery || !recoveryData) return null;

  const formatTimeSpent = (timestamp: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diffMs = now - timestamp;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return 'just now';
  };

  const handleRecoverTournament = async () => {
    setIsRecovering(true);
    
    try {
      // Here we would normally save the recovery data to the user's account
      // For now, we'll simulate the recovery process
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Clear the preview data since it's now saved
      clearPreviewData();
      
      // Navigate to tournament creation with recovered data
      setLocation('/create-tournament?recovered=true');
      
      setShowRecovery(false);
    } catch (error) {
      console.error('Recovery failed:', error);
      setIsRecovering(false);
    }
  };

  const handleDiscard = () => {
    clearPreviewData();
    setShowRecovery(false);
  };

  const getTournamentSummary = () => {
    const sections = [];
    if (recoveryData.name) sections.push(`Tournament: ${recoveryData.name}`);
    if (recoveryData.sport) sections.push(`Sport: ${recoveryData.sport}`);
    if (recoveryData.format) sections.push(`Format: ${recoveryData.format}`);
    if (recoveryData.teams?.length) sections.push(`${recoveryData.teams.length} teams`);
    
    return sections.length > 0 ? sections : ['Tournament configuration in progress'];
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-blue-200 animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Welcome Back!</CardTitle>
                <p className="text-blue-100 text-sm">We found your tournament in progress</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              className="text-white/80 hover:text-white hover:bg-white/20"
              data-testid="recovery-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tournament Progress Found</h3>
              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                {recoveryData.sectionsCompleted?.length || 0} sections completed
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Progress Summary:</p>
                  <ul className="text-gray-600 space-y-1">
                    {getTournamentSummary().map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">Session Info:</p>
                  <div className="text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Last saved: {formatTimeSpent(recoveryData.lastSavedAt || recoveryData.startedAt)}</span>
                    </div>
                    {recoveryData.flow && (
                      <div className="flex items-center space-x-2">
                        <Settings className="h-3 w-3" />
                        <span>Flow: {recoveryData.flow === 'registration' ? 'Registration First' : 'Bracket First'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Continue Where You Left Off</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your tournament configuration will be restored and you can continue building or make changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRecoverTournament}
                disabled={isRecovering}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                data-testid="recovery-continue"
              >
                {isRecovering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Recovering Tournament...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Continue Tournament
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                data-testid="recovery-discard"
              >
                Start Fresh Instead
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Don't worry - you can always start a new tournament if you prefer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}