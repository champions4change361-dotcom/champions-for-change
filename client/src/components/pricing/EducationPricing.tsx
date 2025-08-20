import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GraduationCap, Building, Star, Mail } from 'lucide-react';

export function EducationPricingSection() {
  const educationTiers = [
    {
      name: 'Educational Partnership',
      price: '$99',
      period: '/month',
      description: 'Essential features for smaller private schools (under 200 students)',
      features: [
        'Athletic program management',
        'Basic injury tracking & forms',
        'Equipment inventory system',
        'Practice & game scheduling',
        'Parent communication portal',
        'Basic tournament management',
        'Community support forum',
        'Mobile-friendly interface'
      ],
      cta: 'Start Partnership',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      note: 'Perfect for smaller private schools and religious institutions',
      icon: Star,
      contactInfo: true
    },
    {
      name: 'Independent School Pro',
      price: '$199',
      period: '/month',
      description: 'Complete athletic management for mid-size private schools (up to 500 students)',
      features: [
        'Unlimited tournaments & events',
        'AI injury prediction (95% accuracy)',
        'Health communication system',
        'Equipment management & tracking',
        'Smart scheduling with conflict detection',
        'UIL compliance tracking',
        'Parent/athlete communication portal',
        'Budget allocation tools',
        'Multi-sport coordination'
      ],
      cta: 'Start Independent Pro',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      note: 'Perfect for mid-size private schools and religious institutions',
      icon: GraduationCap,
      contactInfo: true
    },
    {
      name: 'Champions Level',
      price: '$399',
      period: '/month',
      description: 'Enterprise platform for large private schools (500-1,500 students)',
      features: [
        'Everything in Tournament Organizer',
        'Multi-school management capabilities',
        'HIPAA/FERPA compliant data management',
        'Complete role hierarchy (Athletic Director → Student)',
        'Athletic trainer medical data management', 
        'Comprehensive audit trails & compliance',
        'White-label branding & custom domain',
        'Emergency notification system',
        'Advanced analytics & reporting',
        'Priority support & training'
      ],
      cta: 'Start Enterprise',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      note: 'Perfect for large private schools and charter organizations.',
      icon: Building,
      contactInfo: true
    },

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
            Private School Athletic Management Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive athletic management tailored for private schools and charter organizations. 
            Every subscription helps fund student educational trips in Corpus Christi.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {educationTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className="relative border border-gray-200"
                data-testid={`card-education-${tier.name.toLowerCase()}`}
              >
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
                  
                  {tier.contactInfo && (
                    <Button 
                      variant="outline"
                      className="w-full mt-3 border-blue-500 text-white hover:bg-blue-700 bg-blue-600"
                      size="lg"
                      onClick={() => {
                        const subject = `${tier.name} Pricing Inquiry`;
                        const body = `Hello, I am interested in learning more about ${tier.name} and would like to discuss pricing options for our private school.`;
                        window.location.href = `mailto:Champions4change361@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                      data-testid={`button-contact-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                  )}
                  
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