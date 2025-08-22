import React, { useState } from 'react';
import { Search, Globe, Shield, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface DomainSearchResult {
  name: string;
  available: boolean;
  price: number;
  championsCost: number;
  savings: string;
  premium: boolean;
}

export default function DomainManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (term: string) => {
      const response = await apiRequest('POST', '/api/domains/search', {
        searchTerm: term,
        tlds: ['.com', '.org', '.net', '.info', '.biz', '.us']
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results);
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Unable to search domains",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (domainData: any) => {
      const response = await apiRequest('POST', '/api/domains/register', domainData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Domain Registered!",
        description: `Successfully registered ${data.domain}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register domain",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMutation.mutate(searchTerm.trim());
    }
  };

  const handleRegister = (domain: DomainSearchResult) => {
    // For demo - in production this would open a registration form
    toast({
      title: "Registration Coming Soon",
      description: `Domain registration for ${domain.name} will be available soon!`,
    });
  };

  return (
    <AuthenticatedLayout
      title="Domain Manager"
      subtitle="Champions for Change • Nonprofit Domain Services"
      variant="default"
    >
      <div className="space-y-8">
        
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            <span>Nonprofit Domain Services</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get Your Perfect Domain
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Professional domains at nonprofit pricing. We offer domains at cost plus a small processing fee, 
            saving you money while supporting educational programs.
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Domain Search
            </CardTitle>
            <CardDescription>
              Search for available domains with transparent nonprofit pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your desired domain name (without extension)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg"
                  data-testid="input-domain-search"
                />
              </div>
              <Button 
                type="submit" 
                disabled={searchMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-search-domains"
              >
                {searchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Search Results for "{searchTerm}"
            </h2>
            
            <div className="grid gap-4">
              {searchResults.map((domain, index) => (
                <Card 
                  key={domain.name} 
                  className={`border-2 ${domain.available 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10'
                  }`}
                  data-testid={`card-domain-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <span className="text-xl font-semibold" data-testid={`text-domain-name-${index}`}>
                            {domain.name}
                          </span>
                        </div>
                        
                        {domain.available ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Taken
                          </Badge>
                        )}
                        
                        {domain.premium && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Zap className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      {domain.available && (
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600" data-testid={`text-price-${index}`}>
                              ${domain.championsCost.toFixed(2)}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              {domain.savings}
                            </div>
                            <div className="text-xs text-gray-500">
                              Nonprofit pricing
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => handleRegister(domain)}
                            disabled={registerMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-register-${index}`}
                          >
                            Register
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Nonprofit Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Domains at registry cost plus minimal processing fee. Transparent pricing that supports educational programs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>White-Label Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic DNS setup for your Champions for Change platform. Your domain, your brand.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Full Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Domain transfers, renewals, DNS management, and SSL certificates all included.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Info */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Transparent Nonprofit Pricing
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What You Pay:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Registry cost price (what we pay)</li>
                  <li>• $3 processing fee for new registrations</li>
                  <li>• $2 processing fee for renewals</li>
                  <li>• No hidden markups or fees</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What You Get:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Professional domain registration</li>
                  <li>• Free DNS management</li>
                  <li>• White-label platform setup</li>
                  <li>• Support for educational mission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}