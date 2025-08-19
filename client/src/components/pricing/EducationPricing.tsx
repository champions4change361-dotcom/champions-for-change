import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GraduationCap, Building, Star, Mail } from 'lucide-react';

export function EducationPricingSection() {
  const educationTiers = [
    {
      name: 'Foundation',
      price: 'Free',
      description: 'Perfect for single schools, small nonprofits, testing the waters',
      features: [
        'Up to 3 tournaments per year',
        'Basic bracket management',
        'Score tracking & live updates',
        'Email notifications',
        'Tournament donation pages (you keep 100%)',
        'Mobile-friendly interface',
        'Community support'
      ],
      cta: 'Get Started Free',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      note: '$25 suggested donation per tournament to support Champions for Change student trips',
      icon: GraduationCap,
      popular: false,
      badge: 'Free',
      contactInfo: true
    },
    {
      name: 'Tournament Organizer',
      price: '$39',
      period: '/month',
      description: 'Perfect for individual tournament organizers and coaches',
      features: [
        'Unlimited tournaments',
        'AI tournament assistance',
        'Advanced analytics & reporting',
        'Custom branding options',
        'Priority email support',
        'Team management tools',
        'CSV bulk import/export',
        '5-step tournament wizard'
      ],
      cta: 'Start Tournament Organizer',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      note: 'Annual option: $399/year (save 2 months)',
      icon: Star,
      popular: true,
      badge: 'Most Tournament Organizers Choose This',
      contactInfo: true
    },
    {
      name: 'Champions District',
      price: '$2,490',
      period: '/year',
      description: 'Complete enterprise district platform - same capabilities, mission pricing',
      features: [
        'Everything in Tournament Organizer',
        'Full enterprise district management (up to 15 schools)',
        'HIPAA/FERPA compliant data management',
        'Complete role hierarchy (Athletic Director → Student)',
        'Athletic trainer medical data management', 
        'Comprehensive audit trails & compliance',
        'White-label branding & custom domain',
        'Emergency notification system',
        'Cross-school coordination & analytics',
        'Same enterprise features as large districts'
      ],
      cta: 'Register District',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      note: 'Full enterprise capabilities for smaller districts. Alternative payment methods available.',
      icon: GraduationCap,
      popular: false,
      badge: 'Enterprise Features',
      contactInfo: true
    },
    {
      name: 'District Enterprise',
      price: '$4,500',
      period: '/year',
      description: 'Enterprise platform for large districts (15+ schools, 25,000+ students)',
      features: [
        'Everything in Champions District',
        'Unlimited schools & student capacity',
        'Enhanced integration capabilities',
        'Dedicated account manager & priority support',
        'Advanced enterprise reporting',
        'Custom compliance workflows',
        'Multi-district coordination options',
        'Premium implementation support',
        'Staff training & onboarding programs',
        'Save $26,000+ annually vs current solutions'
      ],
      cta: 'Register',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      note: 'For large districts. Alternative payment methods available.',
      icon: Building,
      popular: false,
      badge: 'Large Districts',
      contactInfo: true
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
            Start free with 3 tournaments, then grow with unlimited options. Every subscription helps fund 
            student educational trips in Corpus Christi.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                    {tier.badge}
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
                  
                  {tier.contactInfo && (
                    <Button 
                      variant="outline"
                      className={`w-full mt-3 ${
                        tier.name === 'District Enterprise' 
                          ? 'border-blue-500 text-blue-700 hover:bg-blue-50 bg-blue-500 text-white hover:text-blue-700' 
                          : 'border-blue-500 text-white hover:bg-blue-700 bg-blue-600'
                      }`}
                      size="lg"
                      onClick={() => {
                        const subject = tier.name === 'District Enterprise' 
                          ? 'District Enterprise Pricing Inquiry'
                          : `${tier.name} Pricing Inquiry`;
                        const body = tier.name === 'District Enterprise'
                          ? 'Hello, I am interested in learning more about District Enterprise pricing and alternative payment methods for our district.'
                          : `Hello, I am interested in learning more about ${tier.name} and would like to discuss pricing options.`;
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