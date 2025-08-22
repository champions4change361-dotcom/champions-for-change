import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Crown, Zap } from 'lucide-react';
import { Link } from 'wouter';

const plans = [
  {
    name: 'Foundation',
    price: 'Free',
    description: 'Perfect for getting started',
    features: {
      maxTournaments: 3,
      maxTeams: 16,
      advancedFormats: false,
      customBranding: false,
      multiStage: false,
      dataExport: false,
      apiAccess: false,
      whiteLabel: false,
      support: 'Basic'
    },
    highlight: false,
    cta: 'Start Free'
  },
  {
    name: 'Tournament Organizer',
    price: '$39/month',
    description: 'For serious tournament organizers',
    features: {
      maxTournaments: 25,
      maxTeams: 64,
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: false,
      whiteLabel: false,
      support: 'Standard'
    },
    highlight: true,
    cta: 'Start Pro Trial'
  },
  {
    name: 'Business Enterprise',
    price: '$149/month',
    description: 'Complete white-label solution',
    features: {
      maxTournaments: 100,
      maxTeams: 256,
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: true,
      whiteLabel: true,
      support: 'Priority'
    },
    highlight: false,
    cta: 'Contact Sales'
  },
  {
    name: 'Annual Pro',
    price: '$990/month',
    description: 'For high-volume organizations',
    features: {
      maxTournaments: 'Unlimited',
      maxTeams: 'Unlimited',
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: true,
      whiteLabel: true,
      support: 'Dedicated'
    },
    highlight: false,
    cta: 'Contact Sales'
  }
];

interface PricingComparisonProps {
  currentPlan?: string;
  highlightFeature?: string;
}

export default function PricingComparison({ currentPlan, highlightFeature }: PricingComparisonProps) {
  const getFeatureIcon = (hasFeature: boolean) => {
    return hasFeature ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-gray-300" />
    );
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Foundation': return <Zap className="h-5 w-5" />;
      case 'Tournament Organizer': return <Star className="h-5 w-5" />;
      case 'Business Enterprise': return <Crown className="h-5 w-5" />;
      case 'Annual Pro': return <Crown className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card 
          key={plan.name}
          className={`relative ${
            plan.highlight ? 'border-2 border-primary shadow-lg' : ''
          } ${
            currentPlan === plan.name.toLowerCase().replace(' ', '-') ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-white">Most Popular</Badge>
            </div>
          )}
          
          {currentPlan === plan.name.toLowerCase().replace(' ', '-') && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-blue-500 text-white">Current Plan</Badge>
            </div>
          )}

          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {getPlanIcon(plan.name)}
            </div>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <div className="text-2xl font-bold text-primary">{plan.price}</div>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Max Tournaments</span>
                <span className="font-medium">{plan.features.maxTournaments}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Max Teams</span>
                <span className="font-medium">{plan.features.maxTeams}</span>
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'advancedFormats' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>Advanced Formats</span>
                {getFeatureIcon(plan.features.advancedFormats)}
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'customBranding' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>Custom Branding</span>
                {getFeatureIcon(plan.features.customBranding)}
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'multiStage' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>Multi-Stage Events</span>
                {getFeatureIcon(plan.features.multiStage)}
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'dataExport' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>Data Export</span>
                {getFeatureIcon(plan.features.dataExport)}
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'apiAccess' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>API Access</span>
                {getFeatureIcon(plan.features.apiAccess)}
              </div>
              
              <div className={`flex items-center justify-between text-sm ${
                highlightFeature === 'whiteLabel' ? 'bg-yellow-50 p-2 rounded' : ''
              }`}>
                <span>White Label</span>
                {getFeatureIcon(plan.features.whiteLabel)}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Support</span>
                <span className="font-medium">{plan.features.support}</span>
              </div>
            </div>

            <div className="pt-4">
              {currentPlan === plan.name.toLowerCase().replace(' ', '-') ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-primary' : 'bg-secondary'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}