import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  Code, 
  Shield,
  CheckCircle,
  ArrowRight,
  Factory,
  Store,
  Laptop,
  Heart
} from "lucide-react";
import type { Company } from "@shared/schema";

interface CompanyRegistrationData {
  name: string;
  industry: string;
  contactEmail: string;
  estimatedEmployees: string;
  subscriptionTier: "starter" | "professional" | "enterprise";
  codePrefix: string;
  departments: string[];
}

interface CompanyRegistrationProps {
  onRegistrationComplete?: (company: Company) => void;
}

export default function CompanyRegistration({ onRegistrationComplete }: CompanyRegistrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyRegistrationData>({
    name: "",
    industry: "",
    contactEmail: "",
    estimatedEmployees: "",
    subscriptionTier: "starter",
    codePrefix: "",
    departments: []
  });

  // Register company mutation
  const registerCompanyMutation = useMutation({
    mutationFn: async (data: CompanyRegistrationData) => {
      return apiRequest("POST", "/api/corporate/companies", data);
    },
    onSuccess: (company: Company) => {
      queryClient.invalidateQueries({ queryKey: ["/api/corporate/companies"] });
      toast({
        title: "Company Registered",
        description: "Your company has been successfully registered for corporate competitions!",
      });
      onRegistrationComplete?.(company);
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateCodePrefix = (companyName: string) => {
    const cleanName = companyName.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const year = new Date().getFullYear();
    return `${cleanName.slice(0, 8)}${year}`;
  };

  const addDepartment = (department: string) => {
    if (department && !companyData.departments.includes(department)) {
      setCompanyData(prev => ({
        ...prev,
        departments: [...prev.departments, department]
      }));
    }
  };

  const removeDepartment = (department: string) => {
    setCompanyData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== department)
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!companyData.name || !companyData.industry || !companyData.contactEmail)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !companyData.estimatedEmployees) {
      toast({
        title: "Missing Information",
        description: "Please select your company size.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
      
      // Auto-generate code prefix when moving to step 3
      if (step === 2 && companyData.name && !companyData.codePrefix) {
        setCompanyData(prev => ({
          ...prev,
          codePrefix: generateCodePrefix(prev.name)
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!companyData.codePrefix) {
      toast({
        title: "Missing Code Prefix",
        description: "Please enter a registration code prefix.",
        variant: "destructive",
      });
      return;
    }
    registerCompanyMutation.mutate(companyData);
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case "retail": return <Store className="h-5 w-5" />;
      case "manufacturing": return <Factory className="h-5 w-5" />;
      case "tech": return <Laptop className="h-5 w-5" />;
      case "healthcare": return <Heart className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getTierBadge = (tier: string) => {
    const tierMap = {
      "starter": { color: "bg-green-100 text-green-800", text: "Starter", employees: "Up to 50" },
      "professional": { color: "bg-blue-100 text-blue-800", text: "Professional", employees: "Up to 500" },
      "enterprise": { color: "bg-purple-100 text-purple-800", text: "Enterprise", employees: "500+" }
    };
    return tierMap[tier as keyof typeof tierMap] || tierMap.starter;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                data-testid="input-company-name"
                placeholder="Acme Corporation"
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={companyData.industry}
                onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger data-testid="select-industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Retail & Sales
                    </div>
                  </SelectItem>
                  <SelectItem value="manufacturing">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Manufacturing & Production
                    </div>
                  </SelectItem>
                  <SelectItem value="tech">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      Technology & Software
                    </div>
                  </SelectItem>
                  <SelectItem value="healthcare">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Healthcare & Medical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email *</Label>
              <Input
                id="contact-email"
                data-testid="input-contact-email"
                type="email"
                placeholder="admin@company.com"
                value={companyData.contactEmail}
                onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Company Size *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "1-50", label: "1-50 employees", tier: "starter" },
                  { value: "51-500", label: "51-500 employees", tier: "professional" },
                  { value: "500+", label: "500+ employees", tier: "enterprise" }
                ].map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-colors ${
                      companyData.estimatedEmployees === option.value
                        ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setCompanyData(prev => ({ 
                      ...prev, 
                      estimatedEmployees: option.value,
                      subscriptionTier: option.tier as "starter" | "professional" | "enterprise"
                    }))}
                    data-testid={`card-company-size-${option.value}`}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                      <h3 className="font-medium text-gray-900 dark:text-white">{option.label}</h3>
                      <Badge className={`mt-2 ${getTierBadge(option.tier).color}`}>
                        {getTierBadge(option.tier).text}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code-prefix">Registration Code Prefix *</Label>
              <Input
                id="code-prefix"
                data-testid="input-code-prefix"
                placeholder="ACME2024"
                value={companyData.codePrefix}
                onChange={(e) => setCompanyData(prev => ({ ...prev, codePrefix: e.target.value.toUpperCase() }))}
                required
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This prefix will be used to generate department-specific registration codes like "{companyData.codePrefix}-SALES"
              </p>
            </div>

            <div className="space-y-4">
              <Label>Departments</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add department (e.g., Sales, Marketing, Production)"
                  data-testid="input-department"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDepartment((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('[data-testid="input-department"]') as HTMLInputElement;
                    if (input?.value) {
                      addDepartment(input.value);
                      input.value = "";
                    }
                  }}
                  data-testid="button-add-department"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {companyData.departments.map((dept) => (
                  <Badge
                    key={dept}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeDepartment(dept)}
                  >
                    {dept} ×
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add departments that will participate in competitions. You can add more later.
              </p>
            </div>

            {/* Preview Registration Codes */}
            {companyData.codePrefix && companyData.departments.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Registration Codes Preview:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {companyData.departments.map((dept) => (
                    <div key={dept} className="flex items-center gap-2 text-sm">
                      <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {companyData.codePrefix}-{dept.toUpperCase().replace(/\s+/g, "")}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Register
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your information and complete the registration
              </p>
            </div>

            {/* Registration Summary */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getIndustryIcon(companyData.industry)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{companyData.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)} • {companyData.estimatedEmployees} employees
                      </p>
                    </div>
                    <Badge className={getTierBadge(companyData.subscriptionTier).color}>
                      {getTierBadge(companyData.subscriptionTier).text}
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{companyData.contactEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Code Prefix:</span>
                        <p className="font-mono font-medium text-gray-900 dark:text-white">{companyData.codePrefix}</p>
                      </div>
                    </div>
                  </div>

                  {companyData.departments.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Departments:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {companyData.departments.map((dept) => (
                          <Badge key={dept} variant="outline" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            Corporate Registration
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Register your company for enterprise-grade tournament competitions
        </CardDescription>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-8 h-1 ${stepNumber < step ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStepContent()}
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            data-testid="button-previous"
          >
            Previous
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-next"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={registerCompanyMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-complete-registration"
            >
              {registerCompanyMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Complete Registration
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}