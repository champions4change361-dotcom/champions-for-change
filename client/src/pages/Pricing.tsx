import React from 'react';
import { useDomain } from '@/hooks/useDomain';
import { EducationPricingSection } from '@/components/pricing/EducationPricing';
import { BusinessPricingSection } from '@/components/pricing/BusinessPricing';
import { CoachesLoungePricingSection } from '@/components/pricing/CoachesLoungePricing';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Pricing() {
  const { config, isSchoolDomain, isFantasyDomain, isProDomain } = useDomain();
  const [, navigate] = useLocation();

  // Check for pricing type override via URL params
  const urlParams = new URLSearchParams(window.location.search);
  const pricingType = urlParams.get('type');

  // Debug logging
  console.log('Pricing page - Domain config:', config);
  console.log('Pricing page - URL params type:', pricingType);
  console.log('Pricing page - Is school domain:', isSchoolDomain());
  console.log('Pricing page - Is pro domain:', isProDomain());
  console.log('Pricing page - Is fantasy domain:', isFantasyDomain());

  // Show appropriate pricing based on domain context or URL override
  const renderPricingSection = () => {
    // Allow URL override for testing/demo purposes
    if (pricingType === 'business') {
      console.log('Rendering BusinessPricingSection via URL override');
      return <BusinessPricingSection />;
    } else if (pricingType === 'education') {
      console.log('Rendering EducationPricingSection via URL override');
      return <EducationPricingSection />;
    } else if (pricingType === 'coaches') {
      console.log('Rendering CoachesLoungePricingSection via URL override');
      return <CoachesLoungePricingSection />;
    }
    
    // Default domain-based routing
    if (isSchoolDomain()) {
      return (
        <>
          <EducationPricingSection />
          <div className="bg-gradient-to-r from-orange-50 to-green-50 py-8 border-t border-orange-200">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Looking for Tournament Organizer Pricing?
              </h3>
              <p className="text-gray-600 mb-6">
                Individual tournament organizers, coaches, and community leaders can access our specialized pricing tiers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
                  onClick={() => {
                    console.log('Bottom Tournament Organizer button clicked - navigating to /pricing?type=business');
                    window.location.href = '/pricing?type=business';
                  }}
                  data-testid="button-tournament-organizer-pricing"
                >
                  View Tournament Organizer Plans ($39/month)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    console.log('Bottom Coaches button clicked - navigating to /pricing?type=coaches');
                    window.location.href = '/pricing?type=coaches';
                  }}
                  data-testid="button-coaches-pricing"
                >
                  Coaches Lounge Pricing
                </Button>
              </div>
            </div>
          </div>
        </>
      );
    } else if (isProDomain()) {
      return <BusinessPricingSection />;
    } else if (isFantasyDomain()) {
      return <CoachesLoungePricingSection />;
    } else {
      // Default to business pricing for general users
      return <BusinessPricingSection />;
    }
  };

  const getBrandClass = () => {
    if (!config) return "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50";
    
    if (config.brand === 'SCHOLASTIC_TOURNAMENTS') {
      return "min-h-screen bg-gradient-to-br from-green-50 to-blue-50";
    }
    if (config.brand === 'COACHES_LOUNGE') {
      return "min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
    }
    if (config.brand === 'TOURNAMENT_PRO') {
      return "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50";
    }
    return "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100";
  };

  // Handle anchor scrolling for pricing cards
  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className={getBrandClass()}>
      {/* Header with back navigation */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Platform
          </Button>
        </div>
      </div>

      {/* Pricing Type Navigation */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Choose Your Platform</h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant={pricingType === 'education' || (!pricingType && isSchoolDomain()) ? 'default' : 'outline'}
              onClick={() => {
                console.log('Education button clicked - navigating to /pricing?type=education');
                window.location.href = '/pricing?type=education';
              }}
              data-testid="nav-education-pricing"
              className="px-6 py-3"
            >
              Education & Schools
            </Button>
            <Button 
              onClick={() => {
                console.log('Business button clicked - navigating to /pricing?type=business');
                window.location.href = '/pricing?type=business';
              }}
              data-testid="nav-business-pricing"
              className={`px-6 py-3 ${pricingType === 'business' 
                ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' 
                : 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50'}`}
            >
              Tournament Organizers ($39/month)
            </Button>
            <Button 
              variant={pricingType === 'coaches' ? 'default' : 'outline'}
              onClick={() => {
                console.log('Coaches button clicked - navigating to /pricing?type=coaches');
                window.location.href = '/pricing?type=coaches';
              }}
              data-testid="nav-coaches-pricing"
              className="px-6 py-3"
            >
              Coaches Lounge
            </Button>
          </div>
        </div>
      </div>

      {/* Domain-specific pricing content */}
      {renderPricingSection()}

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and ACH transfers 
                for enterprise accounts.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600 text-sm">
                No setup fees for any plan. Enterprise customers receive 
                free implementation support and training.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How does the educational mission work?
              </h3>
              <p className="text-gray-600 text-sm">
                All platform revenue supports Champions for Change, funding 
                educational trips for students in Corpus Christi, Texas.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:champions4change361@gmail.com'}
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}