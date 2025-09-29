import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Users, Award, Calendar, DollarSign, CheckCircle, ArrowRight, School, Building } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface RegistrationAssistantProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface ConsultationData {
  organizationType: string;
  organizationSize: string;
  currentChallenges: string;
  desiredFeatures: string[];
  budget: string;
  timeline: string;
}

export default function RegistrationAssistant({ isOpen, setIsOpen }: RegistrationAssistantProps) {
  const [step, setStep] = useState(1);
  const [consultation, setConsultation] = useState<ConsultationData>({
    organizationType: '',
    organizationSize: '',
    currentChallenges: '',
    desiredFeatures: [],
    budget: '',
    timeline: ''
  });

  const config = {
    title: "Plan Selector",
    subtitle: "Find the perfect plan for your organization",
    primaryColor: 'green',
    steps: {
      1: "Tell me about your program",
      2: "What are your goals?", 
      3: "Perfect plan recommendations"
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = consultation.desiredFeatures.includes(feature)
      ? consultation.desiredFeatures.filter(f => f !== feature)
      : [...consultation.desiredFeatures, feature];
    
    setConsultation(prev => ({
      ...prev,
      desiredFeatures: newFeatures
    }));
  };

  const getRecommendation = () => {
    const { organizationType, organizationSize, desiredFeatures, budget } = consultation;
    
    // Private School recommendations
    if (organizationType === 'private-school') {
      if (organizationSize === 'small' || organizationSize === 'under-200') {
        return {
          plan: 'Private Schools',
          price: '$2,000/year',
          features: ['Enterprise athletic & academic management', 'HIPAA/FERPA compliance', 'District-to-student hierarchy', 'Professional health monitoring'],
          reason: 'Enterprise-level platform for private schools with comprehensive compliance and management features.',
          signupUrl: '/register-organization?type=private-school'
        };
      } else if (organizationSize === 'medium' || organizationSize === '200-500') {
        return {
          plan: 'Private Schools',
          price: '$2,000/year',
          features: ['Enterprise athletic & academic management', 'HIPAA/FERPA compliance', 'Equipment management', 'Smart scheduling', 'Advanced analytics'],
          reason: 'Comprehensive enterprise solution for private schools with multiple sports programs.',
          signupUrl: '/register-organization?type=private-school'
        };
      } else {
        return {
          plan: 'Private Schools',
          price: '$2,000/year',
          features: ['Enterprise athletic & academic management', 'HIPAA/FERPA compliance', 'Custom branding', 'Priority support', 'Advanced compliance tools'],
          reason: 'Enterprise-grade solution for large private institutions with comprehensive compliance needs.',
          signupUrl: '/register-organization?type=private-school'
        };
      }
    }
    
    // Community Organizations
    if (organizationType === 'nonprofit' || organizationType === 'church' || organizationType === 'community') {
      return {
        plan: 'Youth Organizations',
        price: '$50/month or $480/year',
        features: ['Complete tournament management', 'Nonprofit pricing', 'Community-focused tools', 'Custom branding'],
        reason: 'Designed specifically for nonprofits and community organizations running tournaments with affordable pricing.',
        signupUrl: '/register-organization?type=youth'
      };
    }
    
    // Business/Enterprise
    if (organizationType === 'business' || organizationType === 'enterprise') {
      return {
        plan: 'Youth Organizations',
        price: '$50/month or $480/year',
        features: ['Complete tournament management', 'Professional features', 'Custom branding', 'Community support'],
        reason: 'Professional tournament platform for businesses and organizations at nonprofit pricing.',
        signupUrl: '/register-organization?type=youth'
      };
    }
    
    // Default recommendation
    return {
      plan: 'Youth Organizations',
      price: '$50/month or $480/year',
      features: ['Essential tournament management', 'Community support', 'Basic analytics', 'Affordable pricing'],
      reason: 'Great starting point for most community and educational organizations.',
      signupUrl: '/register-organization?type=youth'
    };
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full p-4 h-auto"
          data-testid="button-open-registration-assistant"
        >
          <Brain className="h-6 w-6 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Need Help Choosing?</div>
            <div className="text-xs opacity-90">Plan Selector</div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] overflow-y-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className="bg-green-50 border-green-200 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription>{config.subtitle}</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              data-testid="button-close-registration-assistant"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Tell me about your organization:</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">What type of organization are you?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'private-school', label: 'Private School', icon: School },
                      { value: 'nonprofit', label: 'Nonprofit', icon: Users },
                      { value: 'church', label: 'Church', icon: Users },
                      { value: 'business', label: 'Business', icon: Building }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={consultation.organizationType === value ? "default" : "outline"}
                        onClick={() => setConsultation(prev => ({ ...prev, organizationType: value }))}
                        className="h-12 text-xs"
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">How many students/participants?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'under-200', label: 'Under 200' },
                      { value: '200-500', label: '200-500' },
                      { value: '500-1000', label: '500-1000' },
                      { value: 'over-1000', label: 'Over 1000' }
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={consultation.organizationSize === value ? "default" : "outline"}
                        onClick={() => setConsultation(prev => ({ ...prev, organizationSize: value }))}
                        className="h-10 text-xs"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What challenges are you facing?</label>
                  <Textarea
                    placeholder="e.g., Managing multiple sports, tracking injuries, scheduling conflicts..."
                    value={consultation.currentChallenges}
                    onChange={(e) => setConsultation(prev => ({ ...prev, currentChallenges: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={!consultation.organizationType || !consultation.organizationSize}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold">What features are most important to you?</h4>
              
              <div className="space-y-2">
                {[
                  'Athletic Management',
                  'Health & Safety Monitoring',
                  'Tournament Organization',
                  'Equipment Tracking',
                  'Smart Scheduling',
                  'Parent Communication',
                  'Budget Management',
                  'Compliance Tracking',
                  'AI Injury Prediction',
                  'Custom Branding'
                ].map((feature) => (
                  <Button
                    key={feature}
                    variant={consultation.desiredFeatures.includes(feature) ? "default" : "outline"}
                    onClick={() => handleFeatureToggle(feature)}
                    className="w-full justify-start h-auto p-3"
                  >
                    <CheckCircle className={`h-4 w-4 mr-2 ${
                      consultation.desiredFeatures.includes(feature) ? 'text-white' : 'text-gray-400'
                    }`} />
                    {feature}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Get Recommendations <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {(() => {
                const recommendation = getRecommendation();
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-semibold text-lg mb-2">Perfect Match Found!</h4>
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        {recommendation.plan}
                      </Badge>
                    </div>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <div className="text-2xl font-bold text-green-600">{recommendation.price}</div>
                          <div className="text-sm text-gray-600">for your organization size</div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium">Included Features:</h5>
                          <ul className="text-sm space-y-1">
                            {recommendation.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-700">
                            <strong>Why this plan:</strong> {recommendation.reason}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = recommendation.signupUrl}
                      >
                        Sign Up for {recommendation.plan}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        View All Plans
                      </Button>
                    </div>

                    <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-sm">
                      Start Over
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}