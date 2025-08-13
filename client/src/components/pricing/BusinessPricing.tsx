import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Building, Star } from 'lucide-react';

export function BusinessPricingSection() {
  const businessTiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small office competitions and hackathons',
      features: [
        'Up to 5 tournaments per month',
        'Basic bracket management',
        'Score tracking & leaderboards',
        'Email notifications',
        'Registration fee collection (you keep 100%)',
        'Team management tools',
        'Mobile access'
      ],
      cta: 'Start Free',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Building,
      popular: false,
      bestFor: 'Small teams, one-off events'
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'Advanced features for growing businesses and regular competitions',
      features: [
        'Everything in Starter',
        'Unlimited tournaments',
        'AI tournament setup assistance',
        'Advanced analytics & insights',
        'Custom branding options',
        'Priority email support',
        'API access for integrations',
        'Export capabilities',
        'Multi-location support'
      ],
      cta: 'Upgrade to Pro',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Star,
      popular: true,
      bestFor: 'Regular events, growing companies'
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'Complete white-label solution for large organizations',
      features: [
        'Everything in Professional',
        'White-label branding',
        'Custom subdomain (yourcompany.tournaments.pro)',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'Advanced user management',
        'SSO integration',
        'Custom reporting',
        'Implementation support'
      ],
      cta: 'Contact Sales',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: Building,
      popular: false,
      bestFor: 'Large corporations, white-label needs'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Building className="h-4 w-4" />
            Tournament Pro for Business
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Professional Tournament Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scale from office competitions to enterprise-wide tournaments. 
            Grow with plans that match your business needs.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {businessTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-200'}`}
                data-testid={`card-business-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">{tier.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                    {tier.period && <span className="text-lg text-gray-600">{tier.period}</span>}
                  </div>
                  <CardDescription className="text-sm mb-2">{tier.description}</CardDescription>
                  <Badge variant="outline" className="text-xs">
                    {tier.bestFor}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${tier.buttonColor} text-white`} 
                    size="lg"
                    data-testid={`button-business-${tier.name.toLowerCase()}`}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cross-selling to Coaches Lounge */}
        <div className="mt-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 border border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              🎮 Add Some Fun to Your Office Culture
            </h3>
            <p className="text-purple-800 mb-6">
              Looking for fantasy sports leagues or gaming tournaments for your team? 
              Check out Coaches Lounge for ad-free fantasy leagues and gaming competitions!
            </p>
            <Button 
              variant="outline" 
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => window.open('https://coaches.trantortournaments.org', '_blank')}
              data-testid="button-coaches-lounge-crosssell"
            >
              Explore Coaches Lounge
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}