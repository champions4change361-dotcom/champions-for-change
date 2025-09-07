import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Code, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  sport?: string;
  teamSize: number;
  status: string;
}

interface EmbedCodeModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedCodeModal({ tournament, isOpen, onClose }: EmbedCodeModalProps) {
  const [embedSize, setEmbedSize] = useState('medium');
  const [embedTheme, setEmbedTheme] = useState('light');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'small':
        return { width: 400, height: 300 };
      case 'medium':
        return { width: 600, height: 400 };
      case 'large':
        return { width: 800, height: 600 };
      default:
        return { width: 600, height: 400 };
    }
  };

  const generateEmbedCode = () => {
    const { width, height } = getSizeConfig(embedSize);
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/tournament/${tournament.id}?theme=${embedTheme}&size=${embedSize}`;
    
    return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="${tournament.name} - Live Tournament Bracket">
</iframe>`;
  };

  const handleCopy = async () => {
    const embedCode = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: "Embed Code Copied!",
        description: "The embed code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const { width, height } = getSizeConfig(embedSize);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Embed Tournament - {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Settings Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Embed Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Size Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Select value={embedSize} onValueChange={setEmbedSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Small (400×300)
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Tablet className="h-4 w-4" />
                          Medium (600×400)
                        </div>
                      </SelectItem>
                      <SelectItem value="large">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Large (800×600)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <Select value={embedTheme} onValueChange={setEmbedTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="tournament">Tournament Colors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Features</label>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="mr-2">
                      ✅ Live Updates
                    </Badge>
                    <Badge variant="secondary" className="mr-2">
                      ✅ Responsive Design
                    </Badge>
                    <Badge variant="secondary" className="mr-2">
                      ✅ Mobile Friendly
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Embed Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <textarea
                    className="w-full h-32 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={generateEmbedCode()}
                    readOnly
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <Button
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant={copied ? "default" : "outline"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Click the code to select all, then copy and paste into your website's HTML
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <div 
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                    style={{ 
                      width: `${Math.min(width, 350)}px`, 
                      height: `${Math.min(height, 250)}px`,
                      transform: width > 350 || height > 250 ? `scale(${Math.min(350/width, 250/height)})` : 'none',
                      transformOrigin: 'top left'
                    }}
                  >
                    {/* Mini Tournament Preview */}
                    <div className={`h-full p-3 ${embedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
                      <div className="text-center mb-3">
                        <h3 className="font-bold text-sm truncate">{tournament.name}</h3>
                        <p className="text-xs opacity-75">{tournament.sport} • {tournament.teamSize} Teams</p>
                      </div>
                      
                      {/* Mock bracket preview */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-blue-50 dark:bg-blue-900 p-1 rounded text-xs">
                            Team A vs Team B
                          </div>
                          <div className="bg-green-50 dark:bg-green-900 p-1 rounded text-xs">
                            Team C vs Team D
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-yellow-50 dark:bg-yellow-900 p-1 rounded text-xs inline-block">
                            Championship
                          </div>
                        </div>
                      </div>

                      {/* Live indicator */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          LIVE
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  This is how your tournament will appear when embedded
                </p>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Where to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Perfect for:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Team websites</li>
                    <li>League pages</li>
                    <li>Social media posts</li>
                    <li>Email newsletters</li>
                    <li>Blog articles</li>
                    <li>Event announcements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}