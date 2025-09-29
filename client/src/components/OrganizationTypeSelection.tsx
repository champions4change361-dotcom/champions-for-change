import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, GraduationCap, Heart, Check, Sparkles } from 'lucide-react';

export enum OrganizationType {
  FANTASY_SPORTS = 'fantasy_sports',
  YOUTH_ORGANIZATION = 'youth_organization', 
  PRIVATE_SCHOOL = 'private_school'
}

interface OrganizationTypeProps {
  onTypeSelect: (type: OrganizationType) => void;
  selectedType?: OrganizationType;
}

export const OrganizationTypeSelection: React.FC<OrganizationTypeProps> = ({
  onTypeSelect,
  selectedType
}) => {
  const organizationTypes = [
    {
      type: OrganizationType.FANTASY_SPORTS,
      icon: Trophy,
      title: 'Fantasy Sports',
      subtitle: 'Individual fantasy league participation',
      description: 'Join fantasy leagues and compete with friends. Support our educational mission with suggested donations.',
      pricing: 'Donation-based',
      priceDetail: 'Free access with optional donations',
      badge: 'Free',
      badgeVariant: 'secondary' as const,
      features: [
        'Fantasy league participation',
        'Score tracking and rankings',
        'Community features',
        'Support educational mission',
        'No monthly fees'
      ],
      benefits: [
        'Completely free to use',
        'Support Champions for Change educational mission',
        'Access to community leagues',
        'Real-time scoring and updates'
      ]
    },
    {
      type: OrganizationType.YOUTH_ORGANIZATION,
      icon: Users,
      title: 'Youth Organizations',
      subtitle: 'YMCA, Boys & Girls Clubs, Pop Warner, local sports leagues',
      description: 'Complete platform access for youth sports organizations. All tournament and team management features included.',
      pricing: '$50/month or $480/year',
      priceDetail: '20% discount on annual plans',
      badge: 'Most Popular',
      badgeVariant: 'default' as const,
      features: [
        'Unlimited tournaments',
        'Team roster management', 
        'Parent communication tools',
        'Scheduling and notifications',
        'Payment processing',
        'Custom branding',
        'Analytics and reporting'
      ],
      benefits: [
        'Save $120 annually with yearly plan',
        'Complete tournament management',
        'Parent engagement features',
        'Professional branding options'
      ]
    },
    {
      type: OrganizationType.PRIVATE_SCHOOL,
      icon: GraduationCap,
      title: 'Private Schools',
      subtitle: 'Private schools and private charter schools',
      description: 'Full enterprise platform for private and charter schools. Comprehensive athletic and academic management.',
      pricing: '$2,000/year',
      priceDetail: 'Annual subscription only',
      badge: 'Enterprise',
      badgeVariant: 'destructive' as const,
      features: [
        'Multi-sport management',
        'Academic integration',
        'Advanced analytics',
        'Compliance tools',
        'FERPA compliance',
        'Dedicated support',
        'API access',
        'Custom integrations',
        'White-label options'
      ],
      benefits: [
        'Complete school athletic management',
        'Academic and athletic integration',
        'Enterprise-level support',
        'Compliance and security features'
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Organization Type
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select the category that best describes your organization to see appropriate pricing and features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {organizationTypes.map((orgType) => {
          const Icon = orgType.icon;
          const isSelected = selectedType === orgType.type;
          
          return (
            <Card
              key={orgType.type}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : 'hover:scale-102'
              }`}
              data-testid={`card-organization-${orgType.type}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      orgType.type === OrganizationType.FANTASY_SPORTS ? 'bg-orange-100 text-orange-600' :
                      orgType.type === OrganizationType.YOUTH_ORGANIZATION ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold" data-testid={`title-${orgType.type}`}>
                        {orgType.title}
                      </CardTitle>
                      <Badge variant={orgType.badgeVariant} className="mt-1">
                        {orgType.badge}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <CardDescription className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {orgType.subtitle}
                </CardDescription>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {orgType.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4">
                  <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <div className={`text-2xl font-bold ${
                      orgType.type === OrganizationType.FANTASY_SPORTS ? 'text-orange-600' :
                      orgType.type === OrganizationType.YOUTH_ORGANIZATION ? 'text-blue-600' :
                      'text-purple-600'
                    }`} data-testid={`price-${orgType.type}`}>
                      {orgType.pricing}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {orgType.priceDetail}
                    </div>
                    {orgType.type === OrganizationType.YOUTH_ORGANIZATION && (
                      <div className="flex items-center justify-center mt-2">
                        <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-600">Save $120 yearly!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features Included:</h4>
                  <ul className="space-y-2">
                    {orgType.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {orgType.features.length > 5 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500 pl-6">
                        +{orgType.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={() => onTypeSelect(orgType.type)}
                  className={`w-full ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : orgType.type === OrganizationType.FANTASY_SPORTS ? 'bg-orange-600 hover:bg-orange-700' :
                        orgType.type === OrganizationType.YOUTH_ORGANIZATION ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-purple-600 hover:bg-purple-700'
                  }`}
                  data-testid={`button-select-${orgType.type}`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select This Plan'
                  )}
                </Button>

                {orgType.type === OrganizationType.FANTASY_SPORTS && (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Supporting Education
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Your donations help fund educational trips for underprivileged students
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Perfect Choice!
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              You've selected{' '}
              <span className="font-semibold">
                {organizationTypes.find(t => t.type === selectedType)?.title}
              </span>
              . Continue to complete your registration and setup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationTypeSelection;