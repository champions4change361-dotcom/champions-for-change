import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Gamepad2, Trophy, Users, Star, Zap, Crown } from 'lucide-react';

export function CoachesLoungePricingSection() {
  const coachesLoungeTiers = [
    {
      name: 'Freemium',
      price: 'Free',
      description: 'Perfect for casual users and small tournaments',
      features: [
        'Up to 3 tournaments per year',
        'Basic bracket management',
        'Score tracking',
        'Community support',
        'Join unlimited leagues',
        'Create 2 leagues per month'
      ],
      cta: 'Join Free',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: Users,
      popular: false,
      note: 'After 3 tournaments, purchase tournament credits or upgrade',
      badge: 'Free'
    },
    {
      name: 'Tournament Credits',
      price: '$15',
      period: '/tournament',
      description: 'Pay-per-tournament for occasional organizers',
      features: [
        'Full tournament features per credit',
        'No monthly commitment',
        'Advanced bracket management',
        'Email support',
        'League creation tools'
      ],
      cta: 'Buy Credits',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: Star,
      popular: false,
      note: 'Perfect for seasonal organizers'
    },
    {
      name: 'Monthly Pro',
      price: '$99',
      period: '/month',
      description: 'Regular tournament organizers and coaches',
      features: [
        'Unlimited tournaments',
        'Advanced analytics',
        'Team management',
        'Priority support',
        'Custom branding',
        'Unlimited league creation'
      ],
      cta: 'Start Monthly',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: Crown,
      popular: true,
      note: 'Most commissioners choose this for advanced features',
      badge: 'Popular'
    },
    {
      name: 'Annual Pro',
      price: '$990',
      period: '/year',
      description: 'Best value for active tournament organizers',
      features: [
        'Everything in Monthly Pro',
        'Save $198 per year',
        'Enhanced analytics',
        'API access',
        'Priority phone support'
      ],
      cta: 'Save with Annual',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: Star,
      popular: false,
      note: 'Save $198 compared to monthly billing',
      badge: 'Best Value'
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
        
        <div className="grid lg:grid-cols-4 gap-6">
          {coachesLoungeTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card 
                key={tier.name} 
                className="relative bg-white/10 backdrop-blur-sm border-white/20"
                data-testid={`card-coaches-${tier.name.toLowerCase().replace(' ', '-')}`}
              >
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-3 bg-purple-500/20 rounded-full w-fit">
                    <IconComponent className="h-6 w-6 text-purple-300" />
                  </div>
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