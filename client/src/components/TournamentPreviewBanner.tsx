import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { 
  Eye, 
  UserPlus, 
  LogIn, 
  X, 
  Clock, 
  CheckCircle, 
  Zap,
  Trophy,
  ArrowRight
} from "lucide-react";
import { useTournamentPreview } from "@/hooks/useTournamentPreview";

interface TournamentPreviewBannerProps {
  className?: string;
}

export default function TournamentPreviewBanner({ className = "" }: TournamentPreviewBannerProps) {
  const { isPreviewMode, progress, timeSpent } = useTournamentPreview();
  const [, setLocation] = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isPreviewMode) return null;

  const formatTimeSpent = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-blue-500";
  };

  if (isMinimized) {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Preview Mode</span>
              <Badge variant="secondary" className="text-xs">
                {progress.percentage}% Complete
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setLocation('/smart-signup')}
                data-testid="banner-signup-button"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Sign Up to Save
              </Button>
              <button
                onClick={() => setIsMinimized(false)}
                className="text-white/80 hover:text-white"
                data-testid="banner-expand-button"
              >
                <ArrowRight className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Tournament Preview Mode</h3>
                <p className="text-blue-100 text-sm">
                  Explore the platform - Sign up to save your tournament
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white p-1"
                data-testid="banner-minimize-button"
              >
                <ArrowRight className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Progress Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Progress</span>
                  <span className="text-xs text-blue-100">
                    {progress.completedSections}/{progress.totalSections} sections
                  </span>
                </div>
                <Progress 
                  value={progress.percentage} 
                  className="h-2 mb-2"
                />
                <div className="flex items-center justify-between text-xs text-blue-100">
                  <span>{progress.percentage}% complete</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeSpent(timeSpent)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-white mb-2 flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  When You Save:
                </h4>
                <ul className="text-xs text-blue-100 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-300" />
                    Keep all your progress
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-300" />
                    Access tournament management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-300" />
                    Share with participants
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                    onClick={() => setLocation('/smart-signup')}
                    data-testid="banner-primary-signup"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up Free
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                    onClick={() => setLocation('/login')}
                    data-testid="banner-login"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Already have account?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center space-x-6 text-xs text-blue-100">
              <span className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Free to start
              </span>
              <span className="flex items-center">
                <Trophy className="h-3 w-3 mr-1" />
                Professional features
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}