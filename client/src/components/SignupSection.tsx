import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap } from 'lucide-react';
import { useDomain } from '@/hooks/useDomain';

export function SignupSection() {
  const { isSchoolSafe } = useDomain();
  
  if (!isSchoolSafe()) return null;
  
  const startRegistration = (tier: string) => {
    window.location.href = `/register?tier=${tier}`;
  };

  const tiers = [
    {
      name: 'Foundation',
      price: 'Free',
      description: 'Perfect for single schools and small tournaments',
      features: [
        'Up to 5 tournaments per month',
        'Basic bracket management',
        'Score tracking',
        'Email notifications',
        'Community support'
      ],
      tier: 'foundation',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false
    },
    {
      name: 'Champion',
      price: '$29',
      period: '/month',
      description: 'Multi-school districts and advanced features',
      features: [
        'Unlimited tournaments',
        'Multi-school management',
        'Custom branding',
        'AI tournament suggestions',
        'Priority support',
        'Advanced analytics'
      ],
      tier: 'champion',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: true
    },
    {
      name: 'District Enterprise',
      price: 'Custom',
      description: 'White-label solution for large districts',
      features: [
        'Everything in Champion',
        'Custom domain',
        'White-label branding',
        'Multi-organization support',
        'Dedicated account manager',
        'Custom integrations'
      ],
      tier: 'enterprise',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: false
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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold mb-2">{tier.name}</CardTitle>
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
                  {tier.tier === 'enterprise' ? 'Contact Sales' : 'Get Started'}
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