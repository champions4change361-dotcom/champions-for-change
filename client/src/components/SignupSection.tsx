import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDomain } from '@/hooks/useDomain';

export function SignupSection() {
  const { isSchoolSafe } = useDomain();
  
  if (!isSchoolSafe()) return null;
  
  const startRegistration = (tier: string) => {
    window.location.href = `/register?tier=${tier}`;
  };

  const tiers = [
    {
      name: 'Freemium',
      price: 'Free',
      description: 'Perfect for casual users and small business tournaments',
      features: [
        'Up to 3 tournaments per year',
        'Basic bracket management',
        'Score tracking',
        'Community support'
      ],
      tier: 'freemium',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false,
      badge: 'Free'
    },
    {
      name: 'Annual Pro',
      price: '$990',
      period: '/year',
      description: 'Best value for active tournament organizers',
      features: [
        'Unlimited tournaments',
        'Advanced analytics',
        'Team management',
        'Priority support',
        'Custom branding',
        'Save $198 per year'
      ],
      tier: 'annual',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: true,
      badge: 'Best Value'
    },
    {
      name: 'Champions District',
      price: '$2,490',
      period: '/year',
      description: 'Complete solution for school districts',
      features: [
        'Everything in Annual Pro',
        'Multi-school management',
        'District-wide analytics',
        'FERPA compliance',
        'Dedicated account manager'
      ],
      tier: 'champions',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false,
      badge: 'Popular'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="signup-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Tournament Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join Champions for Change and help fund $2,600+ educational trips for students 
            while revolutionizing your tournament management
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative ${tier.popular ? 'border-2 border-blue-500 shadow-xl' : 'border border-gray-200'}`}
              data-testid={`tier-${tier.tier}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {tier.badge}
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  {tier.badge && !tier.popular && <Badge className="bg-blue-500 text-white">{tier.badge}</Badge>}
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-lg text-gray-600">{tier.period}</span>}
                </div>
                <CardDescription className="text-base">{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => startRegistration(tier.tier)}
                  className={`w-full ${tier.buttonColor} text-white`}
                  size="lg"
                  data-testid={`button-start-${tier.tier}`}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🎓 Educational Mission First
          </h3>
          <p className="text-gray-600">
            Every subscription helps fund educational trips for Corpus Christi students. 
            We're Champions for Change - transforming athletic programs while supporting education.
          </p>
        </div>
      </div>
    </section>
  );
}