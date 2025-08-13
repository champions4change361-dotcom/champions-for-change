import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GraduationCap, Building, Star } from 'lucide-react';

export function EducationPricingSection() {
  const educationTiers = [
    {
      name: 'Foundation',
      price: 'Free',
      description: 'Perfect for single schools and small tournaments',
      features: [
        'Up to 5 tournaments per month',
        'Basic bracket management',
        'Score tracking & live updates',
        'Email notifications',
        'Registration fee collection (you keep 100%)',
        'Tournament donation pages (you keep 100%)',
        'Mobile-friendly interface',
        'Community support'
      ],
      cta: 'Get Started Free',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      note: 'Suggested $25 donation per tournament to support student educational trips',
      icon: GraduationCap,
      popular: false
    },
    {
      name: 'District Enterprise',
      price: '$399',
      period: '/month',
      description: 'Complete solution for school districts and large organizations',
      features: [
        'Everything in Foundation',
        'Unlimited tournaments',
        'Multi-school management',
        'White-label branding with custom domain',
        'Custom logos and color schemes',
        'AI tournament setup assistance',
        'Advanced analytics & reporting',
        'Multi-organization support',
        'Dedicated account manager',
        'Priority phone support',
        'Staff training & onboarding',
        'Custom integrations available'
      ],
      cta: 'Contact Sales',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      note: 'Includes implementation support and training for your entire district',
      icon: Building,
      popular: true
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <GraduationCap className="h-4 w-4" />
            Champions for Change Educational Platform
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Educational Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple pricing for schools and districts. Every subscription helps fund 
            student educational trips in Corpus Christi.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {educationTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-2 border-green-500 shadow-xl' : 'border border-gray-200'}`}
                data-testid={`card-education-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Most Districts Choose This
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                    <IconComponent className="h-8 w-8 text-green-600" />
                  </div>
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
                    className={`w-full ${tier.buttonColor} text-white`} 
                    size="lg"
                    data-testid={`button-education-${tier.name.toLowerCase()}`}
                  >
                    {tier.cta}
                  </Button>
                  
                  {tier.note && (
                    <p className="text-xs text-gray-600 text-center mt-4 italic">
                      {tier.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12 bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🎓 Educational Impact Guarantee
          </h3>
          <p className="text-gray-600">
            Every subscription directly supports Champions for Change, funding educational 
            trips for students. We've already funded over $15,000 in student opportunities!
          </p>
        </div>
      </div>
    </section>
  );
}