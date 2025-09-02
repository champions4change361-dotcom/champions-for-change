import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, BarChart3, Database, MessageSquare, Download, Trash2, Play, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Hidden AI Training Admin Interface
 * 
 * This page is only accessible when ENABLE_AI_TRAINING=true in development.
 * It allows you to train AI models behind the scenes without affecting production.
 * 
 * Access: /admin/ai-training (hidden route)
 */

export default function AITrainingAdmin() {
  const { toast } = useToast();
  const [testInput, setTestInput] = useState('');
  const [testContext, setTestContext] = useState<'tournament' | 'fantasy' | 'coaching'>('tournament');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Get training status and analytics
  const { data: trainingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/admin/ai-training/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Training simulation mutation
  const simulateMutation = useMutation({
    mutationFn: async (scenario: string) => {
      return apiRequest('POST', '/api/admin/ai-training/simulate', { scenario });
    },
    onSuccess: () => {
      toast({
        title: "Training Simulation Complete",
        description: "AI training scenarios have been executed successfully.",
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Collect training data mutation
  const collectMutation = useMutation({
    mutationFn: async (data: { input: string; context: string; metadata?: any }) => {
      return apiRequest('POST', '/api/admin/ai-training/collect', data);
    },
    onSuccess: () => {
      toast({
        title: "Training Data Collected",
        description: "AI response generated and stored for training analysis.",
      });
      setTestInput('');
      refetchStatus();
    },
  });

  // Export training data mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', '/api/admin/ai-training/export');
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-training-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Training Data Exported",
        description: `Downloaded ${data.count} training interactions.`,
      });
    },
  });

  // Clear training data mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/admin/ai-training/clear');
    },
    onSuccess: () => {
      toast({
        title: "Training Data Cleared",
        description: "All training data has been removed.",
      });
      refetchStatus();
    },
  });

  if (!trainingStatus?.enabled) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>AI Training Disabled:</strong> Training mode is not enabled. 
            Set <code>ENABLE_AI_TRAINING=true</code> in development environment to access training features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const analytics = trainingStatus?.analytics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8" />
          AI Training Administration
        </h1>
        <p className="text-purple-100 mt-2">
          Hidden development interface for training AI models behind the scenes
        </p>
        <Badge className="mt-2 bg-green-500">
          Development Mode Active
        </Badge>
      </div>

      {/* Training Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Training Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalInteractions || 0}
              </div>
              <div className="text-sm text-blue-800">Total Interactions</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(analytics.contextBreakdown || {}).length}
              </div>
              <div className="text-sm text-green-800">Context Types</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.feedbackStats?.positive || 0}
              </div>
              <div className="text-sm text-purple-800">Positive Feedback</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.feedbackStats?.negative || 0}
              </div>
              <div className="text-sm text-orange-800">Needs Improvement</div>
            </div>
          </div>

          {/* Context Breakdown */}
          {analytics.contextBreakdown && Object.keys(analytics.contextBreakdown).length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Training by Context:</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(analytics.contextBreakdown).map(([context, count]) => (
                  <div key={context} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium capitalize">{context}</div>
                    <div className="text-2xl font-bold text-gray-600">{count as number}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Interface */}
      <Tabs defaultValue="collect" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collect">Collect Data</TabsTrigger>
          <TabsTrigger value="simulate">Simulate Training</TabsTrigger>
          <TabsTrigger value="interactions">Recent Interactions</TabsTrigger>
          <TabsTrigger value="export">Export/Clear</TabsTrigger>
        </TabsList>

        {/* Collect Training Data */}
        <TabsContent value="collect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test AI Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="context">Context</Label>
                <Select value={testContext} onValueChange={(value: any) => setTestContext(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament Management</SelectItem>
                    <SelectItem value="fantasy">Fantasy Sports</SelectItem>
                    <SelectItem value="coaching">Athletic Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="input">Test Input</Label>
                <Textarea
                  id="input"
                  placeholder="Enter a question or scenario to test AI training..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => collectMutation.mutate({ input: testInput, context: testContext })}
                disabled={!testInput.trim() || collectMutation.isPending}
                className="w-full"
              >
                {collectMutation.isPending ? 'Training...' : 'Generate AI Response'}
              </Button>

              {collectMutation.data && (
                <Alert className="bg-green-50 border-green-200">
                  <Brain className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Training ID:</strong> {collectMutation.data.trainingId}<br/>
                    <strong>Confidence:</strong> {collectMutation.data.confidence}%<br/>
                    <strong>Response:</strong> {collectMutation.data.response?.substring(0, 200)}...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulate Training */}
        <TabsContent value="simulate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Training Simulations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => simulateMutation.mutate('tournament')}
                  disabled={simulateMutation.isPending}
                  className="h-20 flex-col"
                >
                  <Brain className="h-6 w-6 mb-2" />
                  Tournament Scenarios
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => simulateMutation.mutate('fantasy')}
                  disabled={simulateMutation.isPending}
                  className="h-20 flex-col"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Fantasy Sports
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => simulateMutation.mutate('coaching')}
                  disabled={simulateMutation.isPending}
                  className="h-20 flex-col"
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Coaching Scenarios
                </Button>
              </div>

              {simulateMutation.data && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Simulation Complete!</strong> Check console logs for detailed results.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Interactions */}
        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Recent Training Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recentInteractions && analytics.recentInteractions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics.recentInteractions.map((interaction: any) => (
                    <div key={interaction.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{interaction.context}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {interaction.input.substring(0, 150)}...
                      </div>
                      {interaction.userFeedback && (
                        <Badge className={`mt-2 ${
                          interaction.userFeedback === 'positive' ? 'bg-green-500' : 
                          interaction.userFeedback === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {interaction.userFeedback}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    No training interactions yet. Use the "Collect Data" tab to start training.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export and Clear */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                  className="h-16 flex-col"
                >
                  <Download className="h-5 w-5 mb-2" />
                  Export Training Data
                </Button>
                
                <Button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  variant="destructive"
                  className="h-16 flex-col"
                >
                  <Trash2 className="h-5 w-5 mb-2" />
                  Clear All Data
                </Button>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <strong>Development Only:</strong> This training system operates completely 
                  behind the scenes and will not affect your production deployment. 
                  Training data is stored locally for analysis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}