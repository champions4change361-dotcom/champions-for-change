import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, Trophy, Users, Calendar, DollarSign, Globe, ArrowRight, CheckCircle } from "lucide-react";

interface AIConsultantProps {
  domain?: 'education' | 'business' | 'coaches';
}

export function AIConsultant({ domain = 'education' }: AIConsultantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [consultation, setConsultation] = useState({
    sport: '',
    participantCount: '',
    budget: '',
    goals: '',
    timeline: '',
    features: [] as string[]
  });

  const domainConfig = {
    education: {
      title: "AI Tournament Consultant",
      subtitle: "Get professional tournament recommendations",
      primaryColor: "green",
      features: ["FERPA Compliance", "Student Safety Protocols", "Educational Trip Integration", "Parent Communication"]
    },
    business: {
      title: "AI Tournament Builder",  
      subtitle: "Custom tournament solutions for your business",
      primaryColor: "blue",
      features: ["Custom Branding", "Sponsorship Integration", "Revenue Analytics", "Professional Reporting"]
    },
    coaches: {
      title: "AI Fantasy Coach",
      subtitle: "Smart tournament and league management",
      primaryColor: "purple", 
      features: ["League Management", "Player Analytics", "Community Building", "Live Updates"]
    }
  };

  const config = domainConfig[domain];

  const handleFeatureToggle = (feature: string) => {
    setConsultation(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const generateRecommendations = () => {
    // This would integrate with actual AI API
    return {
      tournamentStructure: "Single Elimination with Consolation Bracket",
      estimatedCost: "$299/month",
      timeline: "2-3 weeks setup",
      features: consultation.features,
      customizations: [
        "Automated bracket generation",
        "Real-time score updates", 
        "Registration management",
        "Payment processing integration"
      ]
    };
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`${
            config.primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
            config.primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
            'bg-purple-600 hover:bg-purple-700'
          } text-white shadow-lg rounded-full p-4 h-auto`}
          data-testid="button-open-ai-consultant"
        >
          <Brain className="h-6 w-6 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Need Help?</div>
            <div className="text-xs opacity-90">AI Tournament Consultant</div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] overflow-y-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className={`${
          config.primaryColor === 'green' ? 'bg-green-50 border-green-200' :
          config.primaryColor === 'blue' ? 'bg-blue-50 border-blue-200' :
          'bg-purple-50 border-purple-200'
        } border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className={`h-5 w-5 ${
                config.primaryColor === 'green' ? 'text-green-600' :
                config.primaryColor === 'blue' ? 'text-blue-600' :
                'text-purple-600'
              }`} />
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription>{config.subtitle}</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              data-testid="button-close-ai-consultant"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Tell me about your tournament needs:</h4>
              
              <div>
                <label className="text-sm font-medium">Sport/Activity</label>
                <Select value={consultation.sport} onValueChange={(value) => 
                  setConsultation(prev => ({ ...prev, sport: value }))
                }>
                  <SelectTrigger data-testid="select-sport">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="baseball">Baseball</SelectItem>
                    <SelectItem value="track">Track & Field</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Number of Participants</label>
                <Input 
                  placeholder="e.g., 16 teams, 50 individuals"
                  value={consultation.participantCount}
                  onChange={(e) => setConsultation(prev => ({ ...prev, participantCount: e.target.value }))}
                  data-testid="input-participants"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Budget Range</label>
                <Select value={consultation.budget} onValueChange={(value) => 
                  setConsultation(prev => ({ ...prev, budget: value }))
                }>
                  <SelectTrigger data-testid="select-budget">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (Foundation Tier)</SelectItem>
                    <SelectItem value="99">$99/month (Professional)</SelectItem>
                    <SelectItem value="399">$399/month (Enterprise)</SelectItem>
                    <SelectItem value="custom">Custom Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!consultation.sport || !consultation.participantCount}
                data-testid="button-continue-consultation"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold">What features do you need?</h4>
              
              <div className="grid grid-cols-1 gap-2">
                {config.features.map((feature) => (
                  <div 
                    key={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      consultation.features.includes(feature)
                        ? `border-${config.primaryColor}-500 bg-${config.primaryColor}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature}</span>
                      {consultation.features.includes(feature) && (
                        <CheckCircle className={`h-4 w-4 text-${config.primaryColor}-600`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium">Your Mission & Goals</label>
                <Textarea 
                  placeholder="Share your mission - examples: Fund educational trips, Generate revenue, Spread faith through sports, Build community, Support local athletes, Create competitive opportunities..."
                  value={consultation.goals}
                  onChange={(e) => setConsultation(prev => ({ ...prev, goals: e.target.value }))}
                  data-testid="textarea-goals"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  data-testid="button-get-recommendations"
                >
                  Get Recommendations
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Custom Tournament Plan
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Recommended Structure</div>
                  <div className="text-sm text-gray-600">Single Elimination with Consolation Bracket</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Estimated Cost</div>
                  <div className="text-sm text-gray-600">{consultation.budget === 'free' ? 'Free (up to 3 tournaments)' : `$${consultation.budget}/month`}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Setup Timeline</div>
                  <div className="text-sm text-gray-600">2-3 weeks with our team</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Included Features</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {consultation.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Modify</Button>
                <Button 
                  className={`flex-1 ${
                    config.primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                    config.primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                  onClick={() => window.location.href = '/register'}
                  data-testid="button-start-setup"
                >
                  Start Setup Process
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}