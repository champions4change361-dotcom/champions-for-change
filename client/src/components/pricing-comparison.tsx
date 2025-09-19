import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Crown, Zap } from 'lucide-react';
import { Link } from 'wouter';

const plans = [
  {
    name: 'Team Starter',
    price: '$23/month',
    description: 'Perfect for small teams getting started',
    features: {
      maxTournaments: '5/month included',
      maxTeams: '20 players',
      advancedFormats: true,
      customBranding: false,
      multiStage: true,
      dataExport: true,
      apiAccess: false,
      whiteLabel: false,
      support: 'Standard',
      perEventOption: true
    },
    highlight: false,
    cta: 'Start Team Management',
    category: 'team'
  },
  {
    name: 'Team Growing',
    price: '$39/month',
    description: 'Most popular choice for active teams',
    features: {
      maxTournaments: '15/month included',
      maxTeams: '35 players',
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: false,
      whiteLabel: false,
      support: 'Standard',
      perEventOption: true
    },
    highlight: true,
    cta: 'Most Popular',
    category: 'team'
  },
  {
    name: 'Team Elite',
    price: '$63/month',
    description: 'Complete solution for large teams',
    features: {
      maxTournaments: '50/month included',
      maxTeams: 'Unlimited players',
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: true,
      whiteLabel: false,
      support: 'Priority',
      perEventOption: true
    },
    highlight: false,
    cta: 'Enterprise Team',
    category: 'team'
  },
  {
    name: 'Tournament Organizer',
    price: '$39/month',
    description: 'Unlimited tournament hosting',
    features: {
      maxTournaments: 'Unlimited',
      maxTeams: 'Unlimited entries',
      advancedFormats: true,
      customBranding: true,
      multiStage: true,
      dataExport: true,
      apiAccess: true,
      whiteLabel: false,
      support: 'Priority',
      perEventOption: false
    },
    highlight: false,
    cta: 'Pure Organizer',
    category: 'organizer'
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
      case 'Team Starter': return <Zap className="h-5 w-5" />;
      case 'Team Growing': return <Star className="h-5 w-5" />;
      case 'Team Elite': return <Crown className="h-5 w-5" />;
      case 'Tournament Organizer': return <Star className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  // Separate plans by category for logical organization
  const teamPlans = plans.filter(plan => plan.category === 'team');
  const organizerPlans = plans.filter(plan => plan.category === 'organizer');

  return (
    <div className="space-y-12">
      {/* Team Management Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Management Plans</h2>
          <p className="text-gray-600">Pricing based on team size and communication needs</p>
          <div className="inline-flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm mt-2">
            <span className="mr-1">💡</span>
            Team plans include tournaments per month. Additional hosting: +$50 per tournament.
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamPlans.map((plan) => (
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
                <span>Tournament Access</span>
                <span className="font-medium">{plan.features.maxTournaments}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>{plan.category === 'team' ? 'Team Size' : 'Event Capacity'}</span>
                <span className="font-medium">{plan.features.maxTeams}</span>
              </div>
              
              {plan.features.perEventOption && (
                <div className="flex items-center justify-between text-sm bg-orange-50 p-2 rounded border">
                  <span>Unlimited Add-on</span>
                  <span className="font-medium text-orange-600">+$50/tournament</span>
                </div>
              )}
              
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
      </div>

      {/* Tournament Organizer Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Organizer Plans</h2>
          <p className="text-gray-600">Unlimited tournament hosting without team management</p>
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm mt-2">
            <span className="mr-1">🏆</span>
            Perfect for coaches and organizers who focus purely on tournaments
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto">
          {organizerPlans.map((plan) => (
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
                    <span>Tournament Access</span>
                    <span className="font-medium">{plan.features.maxTournaments}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>{plan.category === 'team' ? 'Team Size' : 'Event Capacity'}</span>
                    <span className="font-medium">{plan.features.maxTeams}</span>
                  </div>
                  
                  {plan.features.perEventOption && (
                    <div className="flex items-center justify-between text-sm bg-orange-50 p-2 rounded border">
                      <span>Per-event hosting</span>
                      <span className="font-medium text-orange-600">+$50/tournament</span>
                    </div>
                  )}
                  
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
                    <Link href={plan.category === 'team' ? `/teams/signup?plan=${plan.name.toLowerCase().replace('team ', '').replace(' ', '')}&price=${plan.price.replace('$', '').replace('/month', '')}` : '/pricing?type=business'}>
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
      </div>
    </div>
  );
}