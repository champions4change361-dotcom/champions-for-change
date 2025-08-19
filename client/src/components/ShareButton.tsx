import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  Link,
  Instagram,
  MessageCircle,
  CheckCircle,
  Download,
  QrCode,
  Users
} from "lucide-react";

interface ShareButtonProps {
  content: {
    title: string;
    description: string;
    url?: string;
    type: 'tournament' | 'result' | 'announcement' | 'resource';
    data?: any;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function ShareButton({ 
  content, 
  size = 'md', 
  variant = 'outline',
  className = '' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = content.url || window.location.href;
  const shareTitle = content.title;
  const shareDescription = content.description;

  const sharingOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => shareToFacebook()
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-400 hover:bg-sky-500',
      action: () => shareToTwitter()
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: () => shareToInstagram()
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => shareViaEmail()
    },
    {
      name: 'SMS',
      icon: Phone,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => shareViaSMS()
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => copyToClipboard()
    }
  ];

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle + ' - ' + shareDescription)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = customMessage || `${shareTitle} - ${shareDescription}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=ChampionsForChange,Athletics,Tournament`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we copy the content
    copyToClipboard();
    alert('Content copied! You can now paste it in your Instagram post or story.');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(
      `${customMessage || 'Check this out!'}\n\n${shareDescription}\n\n${shareUrl}\n\nShared via Champions for Change Tournament Platform`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(
      `${customMessage || shareTitle}\n\n${shareUrl}`
    );
    window.location.href = `sms:?body=${message}`;
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = customMessage 
        ? `${customMessage}\n\n${shareUrl}`
        : `${shareTitle}\n${shareDescription}\n\n${shareUrl}`;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRCode = () => {
    // Implementation for QR code generation
    console.log('Generating QR code for:', shareUrl);
  };

  const downloadContent = () => {
    // Implementation for downloading shareable content
    console.log('Downloading shareable content');
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setIsOpen(true)}
        className={className}
        data-testid="button-share"
      >
        <Share2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Share {content.type}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Content Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">{shareTitle}</h4>
              <p className="text-xs text-gray-600 mt-1">{shareDescription}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {content.type}
                </Badge>
                <span className="text-xs text-gray-500">{shareUrl}</span>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a personal message (optional)
              </label>
              <Textarea
                placeholder="Add your thoughts or context..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="text-sm"
                rows={3}
              />
            </div>

            {/* Sharing Options */}
            <div>
              <label className="text-sm font-medium mb-3 block">Share via</label>
              <div className="grid grid-cols-3 gap-2">
                {sharingOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="outline"
                    className={`flex flex-col items-center p-3 h-auto ${option.color} text-white border-0`}
                    onClick={option.action}
                  >
                    <option.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{option.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateQRCode}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadContent}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Copy Link Section */}
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="text-xs"
                />
                <Button
                  onClick={copyToClipboard}
                  variant={copied ? "default" : "outline"}
                  size="sm"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">
                  Link copied to clipboard!
                </p>
              )}
            </div>

            {/* Platform Specific Tips */}
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <strong>Tip:</strong> Use hashtags like #ChampionsForChange #Athletics #Tournament 
              to increase visibility and connect with the broader sports community.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}