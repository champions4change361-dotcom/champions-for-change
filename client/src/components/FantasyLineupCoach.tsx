import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, Users, Zap } from 'lucide-react';
import { KeystoneAvatar } from './KeystoneAvatar';
import { FantasyCoachingInsight } from './FantasyCoachingInsight';
import { apiRequest } from '@/lib/queryClient';

interface FantasyLineupCoachProps {
  userId: string;
  week: number;
}

interface CoachingData {
  overallStrategy: string;
  playerInsights: Array<{
    insight: string;
    confidence: number;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
    supportingData: any;
    upside: string;
    downside: string;
    playerName: string;
    position: string;
  }>;
  riskAssessment: string;
  confidence: number;
  stackRecommendations: string[];
  pivots: Array<{
    originalPlayer: string;
    suggestedPivot: string;
    reason: string;
    confidence: number;
  }>;
}

export function FantasyLineupCoach({ userId, week }: FantasyLineupCoachProps) {
  const [coaching, setCoaching] = useState<CoachingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCoaching = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/fantasy/coaching/${userId}/${week}`);
        const data = await response.json();
        setCoaching(data);
      } catch (error) {
        console.error('Failed to fetch coaching:', error);
        setError('Unable to load coaching insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId && week) {
      fetchCoaching();
    }
  }, [userId, week]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading-state">
        <KeystoneAvatar state="thinking" size="medium" domain="coaches" />
        <span className="ml-3 text-gray-600">Analyzing your lineup...</span>
      </div>
    );
  }
  
  if (error || !coaching) {
    return (
      <Alert data-testid="error-state">
        <AlertDescription>
          {error || 'Unable to load coaching insights. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6" data-testid="fantasy-lineup-coach">
      {/* Overall Strategy */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200" data-testid="overall-strategy">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Brain className="h-5 w-5" />
            Week {week} Coaching Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-800 font-medium mb-3">{coaching.overallStrategy}</p>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-purple-700">
              <strong>Risk Assessment:</strong> {coaching.riskAssessment}
            </span>
            <Badge className="bg-purple-600 text-white" data-testid="overall-confidence">
              {Math.round(coaching.confidence)}% Overall Confidence
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stack Recommendations */}
      {coaching.stackRecommendations && coaching.stackRecommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" data-testid="stack-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Users className="h-5 w-5" />
              Stack Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coaching.stackRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pivot Suggestions */}
      {coaching.pivots && coaching.pivots.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" data-testid="pivot-suggestions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Zap className="h-5 w-5" />
              Pivot Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coaching.pivots.map((pivot, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-yellow-900">
                      {pivot.originalPlayer} → {pivot.suggestedPivot}
                    </span>
                    <Badge className="bg-yellow-600 text-white text-xs">
                      {pivot.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-700">{pivot.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Individual Player Insights */}
      <div className="space-y-4" data-testid="player-insights">
        <h3 className="text-lg font-semibold text-gray-900">Individual Player Analysis</h3>
        {coaching.playerInsights && coaching.playerInsights.length > 0 ? (
          coaching.playerInsights.map((playerInsight, index) => (
            <FantasyCoachingInsight
              key={index}
              insight={{
                description: playerInsight.insight,
                confidence: playerInsight.confidence,
                recommendation: playerInsight.recommendation,
                riskLevel: playerInsight.riskLevel,
                supportingData: playerInsight.supportingData,
                upside: playerInsight.upside,
                downside: playerInsight.downside
              }}
              playerName={playerInsight.playerName}
              position={playerInsight.position}
            />
          ))
        ) : (
          <Alert>
            <AlertDescription>
              No player insights available. Make sure you have players selected in your lineup.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}