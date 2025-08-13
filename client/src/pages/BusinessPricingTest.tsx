import React from 'react';
import { BusinessPricingSection } from '@/components/pricing/BusinessPricing';

export default function BusinessPricingTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Business Pricing Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Testing the updated 3-tier business pricing structure
          </p>
        </div>
        <BusinessPricingSection />
      </div>
    </div>
  );
}