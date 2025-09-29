import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Users, GraduationCap, Building, Heart, Trophy, Shield, Target, CreditCard, UserCheck, Star, Crown } from 'lucide-react';
import { Link } from 'wouter';

type OrganizationType = 'fantasy' | 'youth' | 'private-school';

interface PricingTier {
  id: string;
  organizationType: OrganizationType;
  name: string;
  monthlyPrice?: number;
  annualPrice?: number;
  annualDiscount?: number;
  displayPrice: string;
  description: string;
  features: string[];
  highlight: boolean;
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
  badgeText?: string;
  valueProposition: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'fantasy-sports',
    organizationType: 'fantasy',
    name: 'Fantasy Sports',
    displayPrice: 'Free',
    description: 'Individual users for fantasy leagues',
    features: [
      'Join fantasy leagues and compete with friends',
      'Access to all fantasy sports platforms',
      'Community building and social features',
      'Educational mission support through participation',
      'Mobile-responsive fantasy management',
      'Real-time scoring and updates',
      'League creation and management tools',
      'Player statistics and analytics'
    ],
    highlight: false,
    ctaText: 'Start Playing Fantasy Sports',
    ctaLink: '/register-organization?type=fantasy',
    icon: <Trophy className="h-8 w-8 text-orange-500" />,
    badgeText: 'Free Access',
    valueProposition: 'Support our educational mission while enjoying fantasy sports'
  },
  {
    id: 'youth-organizations',
    organizationType: 'youth',
    name: 'Youth Organizations',
    monthlyPrice: 50,
    annualPrice: 480,
    annualDiscount: 20,
    displayPrice: '$50/month',
    description: 'YMCA, Boys & Girls Clubs, Pop Warner, local leagues',
    features: [
      'Complete tournament and team management',
      'Nonprofit pricing designed for community programs',
      'Unlimited teams and participants',
      'Event registration and payment processing',
      'Communication tools for parents and participants',
      'Equipment inventory management',
      'Volunteer coordination systems',
      'Custom branding for your organization',
      'Mobile-responsive tournament management',
      'Basic reporting and analytics',
      'Standard email support'
    ],
    highlight: true,
    ctaText: 'Start Youth Program Management',
    ctaLink: '/register-organization?type=youth',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    badgeText: 'Most Popular',
    valueProposition: 'Affordable comprehensive management for community sports programs'
  },
  {
    id: 'private-schools',
    organizationType: 'private-school',
    name: 'Private Schools',
    annualPrice: 2000,
    displayPrice: '$2,000/year',
    description: 'Private schools and private charter schools',
    features: [
      'Enterprise-level athletic and academic management',
      'Full compliance with HIPAA/FERPA requirements',
      'Comprehensive district-to-student management hierarchy',
      'Advanced role-based access controls',
      'Unlimited athletic and academic competitions',
      'Professional health monitoring and injury tracking',
      'Equipment management with audit trails',
      'Advanced analytics and compliance reporting',
      'Custom integrations and API access',
      'White-label branding capabilities',
      'Priority support with dedicated account manager',
      'Professional training and onboarding'
    ],
    highlight: false,
    ctaText: 'Contact for Enterprise Setup',
    ctaLink: '/register-organization?type=private-school',
    icon: <Building className="h-8 w-8 text-purple-500" />,
    badgeText: 'Enterprise',
    valueProposition: 'Professional capabilities with full compliance and unlimited scale'
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
      <Check className="h-4 w-4 text-gray-300" />
    );
  };

  const formatAnnualSavings = (tier: PricingTier) => {
    if (!tier.monthlyPrice || !tier.annualPrice || !tier.annualDiscount) return null;
    
    const monthlyTotal = tier.monthlyPrice * 12;
    const savings = monthlyTotal - tier.annualPrice;
    return {
      savings,
      percentage: tier.annualDiscount
    };
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Organization Type
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
          Three distinct pricing tiers designed for different organization types and needs
        </p>
        <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <Heart className="h-4 w-4 mr-2" />
          All subscriptions support Champions for Change educational programs
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => {
          const annualSavings = formatAnnualSavings(tier);
          
          return (
            <Card 
              key={tier.id}
              className={`relative ${
                tier.highlight ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-200'
              } ${
                currentPlan === tier.id ? 'ring-2 ring-green-500' : ''
              } transition-all duration-300 hover:shadow-lg`}
              data-testid={`pricing-card-${tier.organizationType}`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    {tier.badgeText}
                  </Badge>
                </div>
              )}
              
              {currentPlan === tier.id && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {tier.icon}
                </div>
                <CardTitle className="text-xl font-bold mb-2">{tier.name}</CardTitle>
                
                {/* Pricing Display */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {tier.displayPrice}
                  </div>
                  
                  {/* Annual Pricing Option for Youth Organizations */}
                  {tier.organizationType === 'youth' && annualSavings && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">
                        ${tier.annualPrice}/year
                      </div>
                      <div className="text-sm text-green-600">
                        Save ${annualSavings.savings} ({annualSavings.percentage}% discount)
                      </div>
                    </div>
                  )}
                  
                  {/* Annual Only for Private Schools */}
                  {tier.organizationType === 'private-school' && (
                    <div className="text-sm text-gray-500 mt-1">
                      Annual billing only
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                
                {/* Value Proposition */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    {tier.valueProposition}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div 
                      key={index}
                      className={`flex items-start text-sm ${
                        highlightFeature && feature.toLowerCase().includes(highlightFeature.toLowerCase()) 
                          ? 'bg-yellow-50 p-2 rounded border border-yellow-200' 
                          : ''
                      }`}
                    >
                      {getFeatureIcon(true)}
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="pt-6">
                  {currentPlan === tier.id ? (
                    <Button 
                      disabled 
                      className="w-full"
                      data-testid={`button-current-plan-${tier.organizationType}`}
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Link href={tier.ctaLink}>
                      <Button 
                        className={`w-full ${
                          tier.highlight 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : tier.organizationType === 'fantasy'
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        data-testid={`button-select-${tier.organizationType}`}
                      >
                        {tier.ctaText}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Questions About Organization Type Selection?
          </h3>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Not sure which tier fits your organization? Our team can help you determine the best option 
            based on your specific needs and requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Organization Type Selection - Pricing Inquiry&body=Hello, I need help determining which pricing tier is best for my organization. Please provide guidance on organization type selection.'}
              data-testid="button-pricing-help"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Get Pricing Help
            </Button>
            <Button 
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => window.location.href = '/register-organization'}
              data-testid="button-start-registration"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Start Organization Registration
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Impact */}
      <div className="text-center bg-white rounded-lg p-8 shadow-md border border-green-200">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          🎓 Supporting Student Education
        </h3>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Every subscription and donation directly supports Champions for Change, funding educational 
          trips and opportunities for underprivileged students in Corpus Christi, Texas.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Goes to Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">501(c)(3)</div>
            <div className="text-sm text-gray-600">Tax Deductible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">$15,000+</div>
            <div className="text-sm text-gray-600">Already Funded</div>
          </div>
        </div>
      </div>
    </div>
  );
}