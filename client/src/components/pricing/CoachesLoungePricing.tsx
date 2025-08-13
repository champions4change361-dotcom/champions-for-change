import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Gamepad2, Trophy, Users, Star, Zap, Crown } from 'lucide-react';

export function CoachesLoungePricingSection() {
  const coachesLoungeTiers = [
    {
      name: 'Community',
      price: 'Free',
      description: 'Perfect for small groups and friends',
      features: [
        'Join unlimited leagues',
        'Create 2 leagues per month',
        'Up to 12 participants per league',
        'Basic scoring & leaderboards',
        'Mobile access',
        'Email notifications',
        'Community chat',
        'Standard support'
      ],
      cta: 'Join Free',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: Users,
      popular: false,
      note: 'Perfect for friends and small office groups',
      badge: 'Always Free'
    },
    {
      name: 'Commissioner Pro',
      price: '$19',
      period: '/month',
      description: 'Advanced features for serious league commissioners',
      features: [
        'Everything in Community',
        'Unlimited league creation',
        'Up to 50 participants per league',
        'Advanced analytics & reports',
        'Custom scoring rules',
        'Prize tracking tools',
        'Priority support',
        'Custom league branding',
        'Export capabilities',
        'Advanced chat features'
      ],
      cta: 'Upgrade to Pro',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: Crown,
      popular: true,
      note: 'Most commissioners choose this for advanced features',
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise Leagues',
      price: '$99',
      period: '/month',
      description: 'White-label solution for large organizations',
      features: [
        'Everything in Commissioner Pro',
        'Unlimited participants',
        'White-label branding',
        'Custom subdomain',
        'API access',
        'SSO integration',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'Advanced user management',
        'Detailed reporting suite'
      ],
      cta: 'Contact Sales',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Zap,
      popular: false,
      note: 'Perfect for large corporations and organizations',
      badge: 'Enterprise'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Gamepad2 className="h-4 w-4" />
            Coaches Lounge Gaming Community
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Choose Your Gaming Experience
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            From friendly competitions to enterprise leagues. 
            Scale your gaming community with plans that grow with you.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {coachesLoungeTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className={`relative bg-white/10 backdrop-blur-sm border-white/20 ${
                  tier.popular ? 'border-2 border-purple-400 shadow-2xl scale-105' : ''
                }`}
                data-testid={`card-coaches-${tier.name.toLowerCase().replace(' ', '-')}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {tier.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-3 bg-purple-500/20 rounded-full w-fit">
                    <IconComponent className="h-6 w-6 text-purple-300" />
                  </div>
                  <Badge variant="outline" className="mb-2 text-xs border-purple-300 text-purple-200">
                    {tier.badge}
                  </Badge>
                  <CardTitle className="text-xl font-bold mb-2 text-white">{tier.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    {tier.period && <span className="text-lg text-purple-200">{tier.period}</span>}
                  </div>
                  <CardDescription className="text-sm text-purple-200">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-purple-100">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${tier.buttonColor} text-white`} 
                    size="lg"
                    data-testid={`button-coaches-${tier.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {tier.cta}
                  </Button>
                  
                  {tier.note && (
                    <p className="text-xs text-purple-300 text-center mt-4 italic">
                      {tier.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Educational Mission Cross-sell */}
        <div className="mt-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-8 border border-green-400/30">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-300 mb-4">
              🎓 Support Student Education
            </h3>
            <p className="text-green-200 mb-6">
              Every Coaches Lounge subscription helps fund educational trips for students 
              through Champions for Change nonprofit. Game for a cause!
            </p>
            <Button 
              variant="outline" 
              className="border-green-300 text-green-200 hover:bg-green-500/10"
              onClick={() => window.open('https://tournaments.trantortournaments.org/donate', '_blank')}
              data-testid="button-education-support"
            >
              Learn About Our Mission
            </Button>
          </div>
        </div>

        {/* Legal compliance and safe gaming reminder */}
        <div className="mt-8 text-center">
          <p className="text-xs text-purple-400">
            Coaches Lounge is a community gaming platform, NOT a gambling site. 
            All leagues are commissioner-managed with optional prizes between participants.
          </p>
        </div>
      </div>
    </section>
  );
}