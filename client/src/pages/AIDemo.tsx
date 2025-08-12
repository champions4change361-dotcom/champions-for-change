// AI Contextual Help Demo Page
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Database, MessageCircle, Zap, TrendingUp, Users, Target, Settings } from 'lucide-react';
import AIContextualHelp from '@/components/AIContextualHelp';
import { useAuth } from '@/hooks/useAuth';

export default function AIDemo() {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState<'beginner' | 'experienced' | 'enterprise'>('beginner');

  const demoScenarios = {
    beginner: {
      title: 'First-Time Tournament Organizer',
      description: 'New coach setting up their first basketball tournament',
      context: {
        totalTournaments: 0,
        successfulSetups: 0,
        techSkillLevel: 'beginner',
        averageDonationGoal: 0
      },
      expectedResponse: "I'll walk you through Stripe step by step! Since this is your first time, I'll give you detailed instructions with screenshots. Ready to start?"
    },
    experienced: {
      title: 'Veteran Tournament Manager',
      description: 'Athletic director with 5+ tournaments under their belt',
      context: {
        totalTournaments: 8,
        successfulSetups: 5,
        techSkillLevel: 'intermediate',
        averageDonationGoal: 750
      },
      expectedResponse: "I see you've set up donations 5 times before! Based on your $750 average goal, I'd suggest setting a goal between $600-900 for this tournament."
    },
    enterprise: {
      title: 'District Athletic Director',
      description: 'Managing multiple schools and complex tournaments',
      context: {
        totalTournaments: 25,
        successfulSetups: 20,
        techSkillLevel: 'advanced',
        averageDonationGoal: 1200
      },
      expectedResponse: "With your extensive experience (20 successful setups), I can provide streamlined guidance. Need your usual Stripe dashboard link?"
    }
  };

  const aiFeatures = [
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Live Database Context',
      description: 'References your actual tournament history, not generic responses',
      examples: ['Previous donation goals', 'Common sports you organize', 'Success patterns']
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'Adaptive Communication',
      description: 'Adjusts help level based on your experience and tech skills',
      examples: ['Detailed steps for beginners', 'Quick links for experts', 'Visual guides when needed']
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Proactive Suggestions',
      description: 'Spots opportunities and recommends improvements automatically',
      examples: ['Missing donation modules', 'Revenue optimization', 'Setup reminders']
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Smart Recommendations',
      description: 'Uses your data patterns to suggest realistic goals and strategies',
      examples: ['Goal range based on history', 'Sport-specific advice', 'Timing recommendations']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Database Integration</h1>
              <p className="text-purple-600 font-medium">Smart help that knows your tournament history</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600">
              Our AI doesn't just give generic advice - it references your live tournament data to provide 
              contextual, personalized help that gets smarter as you use the platform.
            </p>
          </div>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="features">How It Works</TabsTrigger>
            <TabsTrigger value="scenarios">Use Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Demo Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Demo Scenarios
                  </CardTitle>
                  <CardDescription>
                    See how AI responses change based on user experience level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(demoScenarios).map(([key, scenario]) => (
                    <div 
                      key={key}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedDemo === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDemo(key as any)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{scenario.title}</h4>
                        <Badge variant={selectedDemo === key ? 'default' : 'secondary'}>
                          {scenario.context.successfulSetups} setups
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>Tech Level: <span className="font-medium">{scenario.context.techSkillLevel}</span></div>
                        <div>Tournaments: <span className="font-medium">{scenario.context.totalTournaments}</span></div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Expected AI Response Preview:</h5>
                    <div className="bg-gray-100 p-3 rounded text-sm italic">
                      "{demoScenarios[selectedDemo].expectedResponse}"
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live AI Chat */}
              <div className="space-y-4">
                <AIContextualHelp />
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-medium">Try asking:</span>
                    </div>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• "Help me set up Stripe for donations"</li>
                      <li>• "What donation goal should I set?"</li>
                      <li>• "How do I optimize tournament revenue?"</li>
                      <li>• "What's the best practice for my sport?"</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        {feature.icon}
                      </div>
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Database Schema Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">User Context Fields</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• aiPreferences</li>
                      <li>• techSkillLevel</li>
                      <li>• completedAITutorials</li>
                      <li>• aiInteractionCount</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Tournament AI Fields</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• aiSetupProgress</li>
                      <li>• aiContext</li>
                      <li>• setupAssistanceLevel</li>
                      <li>• donationSetupData</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Smart Analytics</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Average donation goals</li>
                      <li>• Success patterns</li>
                      <li>• Common sports</li>
                      <li>• Setup completion rates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Real-World Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-blue-900">New Coach Onboarding</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        "I'm setting up my first basketball tournament for middle school. What should my donation goal be?"
                      </p>
                      <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                        <strong>AI Response:</strong> "For middle school basketball tournaments, most organizers set goals between $250-500 for local events. 
                        Since this is your first time, I'll guide you through the complete setup process with detailed steps."
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-green-900">Experienced Organizer Optimization</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        "How can I improve my donation results? Last year we raised $800."
                      </p>
                      <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                        <strong>AI Response:</strong> "Based on your $800 success last year and 3 previous tournaments, you could target $900-1000 this time. 
                        I notice you organize soccer - adding registration fees ($15-20) could reduce your donation goal while maintaining revenue."
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-medium text-purple-900">District-Level Strategy</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        "I'm managing 5 tournaments across different schools. How do I streamline the setup?"
                      </p>
                      <div className="mt-2 p-3 bg-purple-50 rounded text-sm">
                        <strong>AI Response:</strong> "With your district-level experience (12 tournaments managed), I recommend template creation. 
                        Your average $1,200 goal suggests premium positioning - let me set up automated workflows for your recurring tournaments."
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Target className="h-5 w-5" />
                    Implementation Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-orange-800 mb-3">For Users</h4>
                      <ul className="space-y-2 text-sm text-orange-700">
                        <li>✅ Faster setup with personalized guidance</li>
                        <li>✅ Higher success rates through smart recommendations</li>
                        <li>✅ Reduced learning curve for complex features</li>
                        <li>✅ Proactive problem prevention</li>
                        <li>✅ Contextual help that improves over time</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-800 mb-3">For Champions for Change</h4>
                      <ul className="space-y-2 text-sm text-orange-700">
                        <li>🚀 Increased user engagement and retention</li>
                        <li>🚀 Higher feature adoption rates</li>
                        <li>🚀 Reduced support ticket volume</li>
                        <li>🚀 Better user onboarding experience</li>
                        <li>🚀 Data-driven platform improvements</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}