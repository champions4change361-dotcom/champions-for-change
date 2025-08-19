import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  RotateCcw,
  Zap, 
  Target,
  TrendingUp,
  Brain,
  Eye,
  Clock,
  BarChart3,
  Upload,
  Video,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";

interface VideoAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  sport: string;
}

interface AnalysisResult {
  timestamp: string;
  confidence: number;
  insight: string;
  category: 'technique' | 'performance' | 'injury_risk' | 'tactical';
  recommendation: string;
}

export function AIVideoAnalysis({ isOpen, onClose, sport }: VideoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults([]);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          generateMockResults();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const generateMockResults = () => {
    const mockResults: AnalysisResult[] = [
      {
        timestamp: "0:23",
        confidence: 94,
        insight: "Optimal knee alignment during landing phase",
        category: 'technique',
        recommendation: "Maintain current landing mechanics - excellent form reduces ACL injury risk by 67%"
      },
      {
        timestamp: "0:47",
        confidence: 89,
        insight: "Slight forward lean during acceleration",
        category: 'performance',
        recommendation: "Focus on chest up position to improve sprint efficiency by 8-12%"
      },
      {
        timestamp: "1:15",
        confidence: 92,
        insight: "High ground contact time detected",
        category: 'injury_risk',
        recommendation: "Implement plyometric training to reduce contact time and lower leg stress"
      },
      {
        timestamp: "1:43",
        confidence: 87,
        insight: "Excellent shoulder positioning in throwing motion",
        category: 'technique',
        recommendation: "Current form minimizes shoulder impingement risk - maintain this pattern"
      },
      {
        timestamp: "2:08",
        confidence: 91,
        insight: "Fatigue indicators in movement quality",
        category: 'performance',
        recommendation: "Consider load management - technique degradation suggests overtraining"
      }
    ];
    setAnalysisResults(mockResults);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const filteredResults = selectedCategory === 'all' 
    ? analysisResults 
    : analysisResults.filter(result => result.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technique': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-green-100 text-green-800';
      case 'injury_risk': return 'bg-red-100 text-red-800';
      case 'tactical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Video Breakdown - {sport} Analysis</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              BETA FEATURE
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Training Video</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload practice footage, game clips, or skill demonstrations
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select Video File
                </Button>
                {videoFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {videoFile.name} selected
                  </p>
                )}
              </div>
              
              {videoFile && !isAnalyzing && analysisResults.length === 0 && (
                <div className="flex space-x-2">
                  <Button onClick={mockAnalysis} className="flex-1">
                    <Brain className="h-4 w-4 mr-2" />
                    Start AI Analysis
                  </Button>
                  <Button variant="outline" onClick={() => setVideoFile(null)}>
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 animate-pulse text-blue-600" />
                    <span className="font-medium">AI Analysis in Progress...</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>Computer Vision</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>Biomechanics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <span>Performance Metrics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Injury Prevention</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Analysis Results</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analysis Complete
                  </Badge>
                </div>
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({analysisResults.length})</TabsTrigger>
                  <TabsTrigger value="technique">
                    Technique ({analysisResults.filter(r => r.category === 'technique').length})
                  </TabsTrigger>
                  <TabsTrigger value="performance">
                    Performance ({analysisResults.filter(r => r.category === 'performance').length})
                  </TabsTrigger>
                  <TabsTrigger value="injury_risk">
                    Injury Risk ({analysisResults.filter(r => r.category === 'injury_risk').length})
                  </TabsTrigger>
                  <TabsTrigger value="tactical">
                    Tactical ({analysisResults.filter(r => r.category === 'tactical').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-4">
                  <div className="space-y-3">
                    {filteredResults.map((result, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {result.timestamp}
                                </Badge>
                                <Badge className={getCategoryColor(result.category)}>
                                  {result.category.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-3 w-3 text-yellow-600" />
                                  <span className="text-sm font-medium">{result.confidence}% confidence</span>
                                </div>
                              </div>
                              <h4 className="font-medium text-gray-900">{result.insight}</h4>
                              <p className="text-sm text-gray-600">{result.recommendation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* AI Capabilities Overview */}
          {analysisResults.length === 0 && !isAnalyzing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>AI Video Analysis Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>Biomechanical Analysis</span>
                    </h4>
                    <ul className="space-y-1 text-gray-600 ml-6">
                      <li>• Joint angle measurement and optimization</li>
                      <li>• Movement efficiency scoring</li>
                      <li>• Force production analysis</li>
                      <li>• Balance and stability assessment</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Injury Prevention</span>
                    </h4>
                    <ul className="space-y-1 text-gray-600 ml-6">
                      <li>• High-risk movement pattern detection</li>
                      <li>• Fatigue and overload indicators</li>
                      <li>• Asymmetry identification</li>
                      <li>• Return-to-play readiness assessment</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span>Performance Optimization</span>
                    </h4>
                    <ul className="space-y-1 text-gray-600 ml-6">
                      <li>• Speed and acceleration metrics</li>
                      <li>• Technique refinement suggestions</li>
                      <li>• Comparative analysis vs. elite athletes</li>
                      <li>• Progress tracking over time</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>Sport-Specific Intelligence</span>
                    </h4>
                    <ul className="space-y-1 text-gray-600 ml-6">
                      <li>• Sport-specific technique analysis</li>
                      <li>• Tactical decision evaluation</li>
                      <li>• Game situation recognition</li>
                      <li>• Position-specific insights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}