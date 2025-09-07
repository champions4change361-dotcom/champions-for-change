import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Building, Star } from 'lucide-react';

export function BusinessPricingSection() {
  const businessTiers = [
    {
      name: 'Annual Tournament',
      price: '$99',
      period: '/year',
      description: 'Perfect for organizations running one tournament annually with year-round web presence',
      features: [
        'One tournament per year',
        'Year-round website hosting',
        'Full platform access (no restrictions)',
        'Team & athlete registration',
        'Payment processing & fee collection', 
        'Custom donation page setup',
        'Professional branding & logos',
        'Score tracking & brackets',
        'Email notifications & communication',
        'Mobile-responsive interface',
        'Basic analytics & reporting',
        'White-label tournament experience'
      ],
      cta: 'Start 14-Day Trial',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Building,
      popular: false,
      bestFor: 'Annual tournaments, schools, nonprofits',
      badge: 'Best Value',
      trialNote: 'Start with 14-day free trial • No charge until trial ends'
    },
    {
      name: 'Multi-Tournament',
      price: '$39',
      period: '/month',
      description: 'Perfect for active tournament organizers running multiple events throughout the year',
      features: [
        'Unlimited tournament events',
        'Full platform access (no restrictions)',
        'Team & athlete registration',
        'Payment processing & fee collection', 
        'Custom donation page setup',
        'Professional branding & logos',
        'Score tracking & brackets',
        'Email notifications & communication',
        'Mobile-responsive interface',
        'Advanced analytics & reporting',
        'Community support',
        'White-label tournament experience'
      ],
      cta: 'Start 14-Day Trial',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      icon: Star,
      popular: true,
      bestFor: 'Active organizers, coaches, community leaders',
      badge: 'Most Popular',
      trialNote: 'Start with 14-day free trial • No charge until trial ends'
    },
    {
      name: 'Business Enterprise',
      price: '$149',
      period: '/month',
      description: 'Complete enterprise features for small to mid-size businesses (up to 50 tournaments/year)',
      features: [
        'Unlimited tournaments per month',
        'Full enterprise AI tournament assistance',
        'Complete analytics & reporting suite',
        'White-label branding & custom domain',
        'Priority email & phone support',
        'Advanced team management tools',
        'CSV bulk import/export & API access',
        'Multi-location coordination',
        'Same enterprise capabilities as large corporations'
      ],
      cta: 'Start Enterprise',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: Building,
      popular: false,
      bestFor: 'Small to mid-size businesses',
      badge: 'Enterprise Features',
      note: 'Annual option: $1,499/year (save 2 months)'
    },
    {
      name: 'Annual Pro',
      price: '$990',
      period: '/month',
      description: 'High-volume tournament companies (50+ tournaments/year, unlimited capacity)',
      features: [
        'Everything in Business Enterprise',
        'Unlimited tournament capacity & frequency',
        'Enhanced integration capabilities',
        'Dedicated account manager & priority support',
        'Advanced enterprise reporting & analytics',
        'Custom compliance workflows',
        'Premium implementation support',
        'Advanced user management & SSO',
        'Custom feature development options',
        'Check payment option available'
      ],
      cta: 'Get Pro Access',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: Building,
      popular: false,
      bestFor: 'High-volume tournament management companies',
      badge: 'High Volume',
      note: 'For companies whose primary business is tournament management'
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Start with a 14-day free trial - full platform access, no restrictions. 
            Choose the plan that fits your tournament frequency.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Check className="h-4 w-4" />
            No Credit Card Charged During 14-Day Trial Period
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {businessTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-200'}`}
                data-testid={`card-business-${tier.name.toLowerCase()}`}
              >

                
                <CardHeader className="text-center pb-6">
                  <div className="h-8 mb-4 flex items-center justify-center">
                    {tier.popular && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">Most Popular</Badge>
                    )}
                  </div>
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
                    onClick={() => {
                      console.log(`${tier.name} button clicked - ${tier.cta}`);
                      // Route to trial signup with plan selection
                      if (tier.name === 'Annual Tournament') {
                        window.location.href = '/trial-signup?plan=annual&price=99';
                      } else if (tier.name === 'Multi-Tournament') {
                        window.location.href = '/trial-signup?plan=monthly&price=39';
                      } else if (tier.name === 'Business Enterprise') {
                        window.location.href = '/trial-signup?plan=enterprise&price=149';
                      } else if (tier.name === 'Annual Pro') {
                        window.location.href = '/trial-signup?plan=annual-pro&price=990';
                      }
                    }}
                    data-testid={`button-business-${tier.name.toLowerCase()}`}
                  >
                    {tier.cta}
                  </Button>
                  
                  {tier.trialNote && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      {tier.trialNote}
                    </p>
                  )}
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
              onClick={() => window.location.href = '/coaches-lounge'}
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