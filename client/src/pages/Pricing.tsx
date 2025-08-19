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
      return <EducationPricingSection />;
    } else if (isProDomain()) {
      return <BusinessPricingSection />;
    } else if (isFantasyDomain()) {
      return <CoachesLoungePricingSection />;
    } else {
      // Default to education pricing with note about other options
      return (
        <>
          <EducationPricingSection />
          <div className="bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Looking for different pricing options?
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://pro.trantortournaments.org/pricing', '_blank')}
                  data-testid="button-business-pricing"
                >
                  Business Pricing
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://coaches.trantortournaments.org/pricing', '_blank')}
                  data-testid="button-coaches-pricing"
                >
                  Coaches Lounge Pricing
                </Button>
              </div>
            </div>
          </div>
        </>
      );
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