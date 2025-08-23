import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { Brain, Database, TrendingUp, Calendar, Target, Trophy } from 'lucide-react';

interface AIStatusData {
  status: string;
  message: string;
  historicalData: {
    totalPlayers: number;
    totalGames: number;
    avgConsistency: number;
    topPerformers: string[];
    sleepers: string[];
  };
  mlModels: {
    modelsCount: number;
    avgAccuracy: number;
    lastTraining: string | null;
    positionModels: {
      [position: string]: {
        accuracy: number;
        trained: string;
      };
    };
  };
  features: string[];
}

export default function HistoricalAIStatus() {
  const [aiStatus, setAiStatus] = useState<AIStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/fantasy/ai-status', 'GET');
      const data = await response.json();
      
      if (data.success) {
        setAiStatus(data);
      } else {
        setError('Failed to load AI status');
      }
    } catch (err) {
      setError('Error fetching AI status');
      console.error('AI Status error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-purple-600">Loading AI Training Data...</span>
      </div>
    );
  }

  if (error || !aiStatus) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {error || 'Unable to load AI status'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          📊 Historical AI Training System
        </h2>
        <p className="text-muted-foreground mt-2">
          Enhanced with 2020-2024 NFL player statistics and machine learning models
        </p>
      </div>

      {/* Status Overview */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="w-5 h-5" />
            AI Training Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{aiStatus.historicalData.totalPlayers}</div>
              <div className="text-sm text-gray-600">Players Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{aiStatus.historicalData.totalGames}</div>
              <div className="text-sm text-gray-600">Game Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{aiStatus.mlModels.avgAccuracy}%</div>
              <div className="text-sm text-gray-600">ML Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{aiStatus.mlModels.modelsCount}</div>
              <div className="text-sm text-gray-600">ML Models</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Historical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Consistency</span>
                <Badge variant="outline">{aiStatus.historicalData.avgConsistency}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${aiStatus.historicalData.avgConsistency}%` }}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                Top Performers
              </h4>
              <div className="flex flex-wrap gap-1">
                {aiStatus.historicalData.topPerformers.slice(0, 6).map((player, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {player}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Emerging Sleepers
              </h4>
              <div className="flex flex-wrap gap-1">
                {aiStatus.historicalData.sleepers.map((player, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                    {player}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              ML Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(aiStatus.mlModels.positionModels).map(([position, model]) => (
              <div key={position} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{position}</Badge>
                  <span className="text-sm text-gray-600">Model</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{model.accuracy}%</div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {aiStatus.mlModels.lastTraining && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Last Training: {new Date(aiStatus.mlModels.lastTraining).toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Enhanced AI Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {aiStatus.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Data Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 text-lg">🧠</div>
            <div>
              <h4 className="font-semibold text-amber-800">Historical Training Data</h4>
              <p className="text-sm text-amber-700 mt-1">
                Our AI is trained on comprehensive 2020-2024 NFL statistics, providing enhanced predictions 
                based on multi-year performance patterns, injury recovery data, and seasonal trends. Perfect 
                for preseason analysis when current year data is limited.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}