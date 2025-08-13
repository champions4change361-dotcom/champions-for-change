import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Target, Zap, Brain, Trophy } from 'lucide-react';
import { KeystoneAvatar } from './KeystoneAvatar';

interface CoachingInsightProps {
  insight: {
    title?: string;
    description: string;
    confidence: number;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
    supportingData: any;
    upside: string;
    downside: string;
  };
  playerName: string;
  position: string;
}

export function FantasyCoachingInsight({ insight, playerName, position }: CoachingInsightProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };
  
  return (
    <Card className="border-l-4 border-l-blue-500" data-testid={`coaching-insight-${playerName}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeystoneAvatar state="thinking" size="small" domain="coaches" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900" data-testid="player-name">
                {playerName} ({position})
              </CardTitle>
              <CardDescription className="text-sm text-gray-600" data-testid="insight-title">
                {insight.title || "AI Analysis"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getConfidenceColor(insight.confidence)} border-0 font-semibold`} data-testid="confidence-badge">
              {insight.confidence}% Confidence
            </Badge>
            <div data-testid="risk-icon">
              {getRiskIcon(insight.riskLevel)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50" data-testid="ai-analysis">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Keystone AI Analysis:</strong> {insight.description}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg" data-testid="recommendation">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              Recommendation
            </h4>
            <p className="text-sm text-gray-700">{insight.recommendation}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg" data-testid="upside">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Upside
            </h4>
            <p className="text-sm text-green-700">{insight.upside}</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg" data-testid="downside">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Downside
            </h4>
            <p className="text-sm text-red-700">{insight.downside}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg" data-testid="supporting-data">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
            <Trophy className="h-4 w-4 text-blue-500" />
            Supporting Data
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(insight.supportingData).map(([key, value]) => (
              <p key={key} className="text-xs text-gray-600">
                <span className="font-medium">{key}:</span> {value as string}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}