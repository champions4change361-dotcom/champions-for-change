import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Sparkles, 
  UserPlus, 
  LogIn, 
  X, 
  Clock, 
  CheckCircle, 
  Trophy,
  Heart,
  Zap,
  Save
} from "lucide-react";
import { useTournamentPreview } from "@/hooks/useTournamentPreview";

interface TournamentSmartPromptProps {
  className?: string;
}

export default function TournamentSmartPrompt({ className = "" }: TournamentSmartPromptProps) {
  const { 
    showSmartPrompt, 
    progress, 
    timeSpent, 
    dismissSmartPrompt 
  } = useTournamentPreview();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  if (!showSmartPrompt || !isVisible) return null;

  const formatTimeSpent = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return 'less than a minute';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissSmartPrompt();
  };

  const getMotivationalMessage = () => {
    if (progress.percentage >= 60) {
      return {
        title: "You're Almost Done! 🎉",
        subtitle: "Don't lose this great tournament setup",
        urgency: "high"
      };
    } else if (progress.percentage >= 30) {
      return {
        title: "Great Progress! ⚡",
        subtitle: "You've invested time building this tournament",
        urgency: "medium"
      };
    } else {
      return {
        title: "Looking Good! 👍",
        subtitle: "Save your work and keep building",
        urgency: "low"
      };
    }
  };

  const message = getMotivationalMessage();

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-lg shadow-2xl border-2 border-orange-200 animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            data-testid="smart-prompt-close"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{message.title}</CardTitle>
              <p className="text-orange-100 text-sm">{message.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-orange-100">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeSpent(timeSpent)} invested</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{progress.percentage}% complete</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Save className="h-5 w-5 mr-2 text-blue-600" />
              Save Your Tournament Progress
            </h3>
            
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start space-x-3">
                <Trophy className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Keep Your Work</p>
                  <p className="text-sm">Don't lose the tournament setup you've been building</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Instant Access</p>
                  <p className="text-sm">Manage registrations, brackets, and live scoring</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Support Education</p>
                  <p className="text-sm">Every platform helps fund student educational opportunities</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg py-3"
              onClick={() => setLocation('/smart-signup')}
              data-testid="smart-prompt-signup"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Sign Up Free & Save Progress
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setLocation('/login')}
              data-testid="smart-prompt-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              I Already Have an Account
            </Button>
            
            <div className="text-center">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                data-testid="smart-prompt-continue"
              >
                Continue in preview mode
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-6 text-xs text-blue-600">
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                ✨ Free to start
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                🚀 No credit card
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                💡 Cancel anytime
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}