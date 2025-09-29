import React from 'react';
import { useDomain } from '@/hooks/useDomain';
import PricingComparison from '@/components/pricing-comparison';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Users, Building, Trophy } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Pricing() {
  const { config, isSchoolDomain, isFantasyDomain, isProDomain } = useDomain();
  const [, navigate] = useLocation();

  // Check for highlighted feature via URL params
  const urlParams = new URLSearchParams(window.location.search);
  const highlightFeature = urlParams.get('highlight');

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

      {/* Organization Type Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Organization Type</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Three distinct pricing tiers designed for different organization types and needs
          </p>
          
          {/* Quick Organization Type Guide */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <Trophy className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-800 mb-1">Fantasy Sports</h3>
              <p className="text-sm text-orange-700">Individual users joining fantasy leagues</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800 mb-1">Youth Organizations</h3>
              <p className="text-sm text-blue-700">Community sports programs and leagues</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800 mb-1">Private Schools</h3>
              <p className="text-sm text-purple-700">Private schools and charter schools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Tier Pricing Comparison */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <PricingComparison 
            highlightFeature={highlightFeature || undefined}
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How do I choose the right organization type?
              </h3>
              <p className="text-gray-600 text-sm">
                Fantasy Sports is for individual users joining fantasy leagues. Youth Organizations 
                is for community programs like YMCA or local leagues. Private Schools is for 
                private educational institutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can Youth Organizations save with annual billing?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! Youth Organizations can pay $480/year instead of $50/month, 
                saving $120 (20% discount) with annual billing.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is Fantasy Sports really free?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, Fantasy Sports access is completely free. Users can optionally 
                make donations to support our Champions for Change educational programs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in Private Schools pricing?
              </h3>
              <p className="text-gray-600 text-sm">
                Private Schools get enterprise-level features including HIPAA/FERPA compliance, 
                unlimited athletic and academic management, priority support, and dedicated training.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards and PayPal. Private Schools 
                can also use ACH transfers and receive flexible billing arrangements.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How does the educational mission work?
              </h3>
              <p className="text-gray-600 text-sm">
                All subscriptions and donations support Champions for Change, funding 
                educational trips and opportunities for underprivileged students in Corpus Christi, Texas.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:champions4change361@gmail.com?subject=Pricing Questions&body=Hello, I have questions about the pricing tiers and would like to learn more about which option is best for my organization.'}
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