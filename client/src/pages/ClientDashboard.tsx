import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Palette, 
  Globe, 
  Eye, 
  Save, 
  RefreshCw, 
  FileText, 
  Image, 
  Smartphone,
  Monitor,
  Search
} from "lucide-react";

interface ClientConfig {
  id: string;
  userId: string;
  domain: string;
  clientName: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    theme: 'light' | 'dark' | 'auto';
  };
  heroContent: {
    mainHeading: string;
    subheading: string;
    ctaText: string;
    ctaUrl: string;
    backgroundImageUrl?: string;
    showMissionBanner: boolean;
    missionText: string;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
    supportEmail?: string;
  };
  features: {
    showDonationButton: boolean;
    enableTournamentOrganizers: boolean;
    showHealthBenefits: boolean;
    enableAcademicPrograms: boolean;
    showTestimonials: boolean;
  };
  seoConfig: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
  };
  customStyles?: string;
  isActive: boolean;
}

export default function ClientDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get client configuration
  const { data: config, isLoading, error } = useQuery<ClientConfig>({
    queryKey: ['/api/my-client-config'],
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<ClientConfig>) => {
      if (!config?.id) throw new Error("No configuration ID");
      return apiRequest(`/api/client-config/${config.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-client-config'] });
      toast({
        title: "Configuration Updated",
        description: "Your website configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  // Create new configuration if none exists
  const createConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<ClientConfig>) => {
      return apiRequest('/api/client-config', {
        method: 'POST',
        body: JSON.stringify(newConfig),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-client-config'] });
      toast({
        title: "Configuration Created",
        description: "Your website configuration has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error?.message || "Failed to create configuration",
        variant: "destructive",
      });
    },
  });

  const handleUpdateConfig = (updates: Partial<ClientConfig>) => {
    updateConfigMutation.mutate(updates);
  };

  const handleCreateConfig = () => {
    const defaultConfig: Partial<ClientConfig> = {
      domain: "championsforchange.net",
      clientName: "Champions for Change",
      branding: {
        primaryColor: "#059669",
        secondaryColor: "#10b981",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        theme: "light"
      },
      heroContent: {
        mainHeading: "Champions for Change",
        subheading: "Empowering student athletes through educational opportunities",
        ctaText: "Support Our Mission",
        ctaUrl: "/donate",
        showMissionBanner: true,
        missionText: "Built by coaches to fund educational opportunities for underprivileged student competitors"
      },
      contactInfo: {
        email: "champions4change361@gmail.com",
        phone: "(361) 300-1552"
      },
      features: {
        showDonationButton: true,
        enableTournamentOrganizers: true,
        showHealthBenefits: true,
        enableAcademicPrograms: true,
        showTestimonials: true
      },
      seoConfig: {
        metaTitle: "Champions for Change - Athletic & Academic Management Platform",
        metaDescription: "Empowering student athletes through professional tournament management and educational opportunities.",
        keywords: ["champions for change", "student athletes", "educational opportunities", "tournaments"]
      }
    };
    
    createConfigMutation.mutate(defaultConfig);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading your configuration...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">No Configuration Found</CardTitle>
            <CardDescription className="text-slate-400">
              Let's set up your white-label website configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleCreateConfig}
              disabled={createConfigMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-create-config"
            >
              {createConfigMutation.isPending ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Settings className="mr-2 h-4 w-4" /> Create Configuration</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Client Management Dashboard</h1>
          <p className="text-slate-400">Manage your white-label website configuration for {config.domain}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white">
              <Eye className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-slate-300 data-[state=active]:text-white">
              <Palette className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="content" className="text-slate-300 data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="features" className="text-slate-300 data-[state=active]:text-white">
              <Settings className="mr-2 h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-slate-300 data-[state=active]:text-white">
              <Search className="mr-2 h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-slate-300 data-[state=active]:text-white">
              <Globe className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-emerald-400" />
                    Domain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-400">{config.domain}</p>
                  <p className="text-slate-400 text-sm mt-1">Your custom domain</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-blue-400" />
                    Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-400 capitalize">{config.branding.theme}</p>
                  <div className="flex space-x-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-600" 
                      style={{ backgroundColor: config.branding.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-600" 
                      style={{ backgroundColor: config.branding.secondaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-600" 
                      style={{ backgroundColor: config.branding.accentColor }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-orange-400" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-400">
                    {config.isActive ? "Active" : "Inactive"}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Configuration status</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-slate-400">
                  Common tasks for managing your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setActiveTab("branding")}
                    variant="outline" 
                    className="justify-start border-slate-600 text-white hover:bg-slate-700"
                    data-testid="button-edit-branding"
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Update Branding
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("content")}
                    variant="outline" 
                    className="justify-start border-slate-600 text-white hover:bg-slate-700"
                    data-testid="button-edit-content"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Content
                  </Button>
                  <Button 
                    onClick={() => window.open(`https://${config.domain}`, '_blank')}
                    variant="outline" 
                    className="justify-start border-slate-600 text-white hover:bg-slate-700"
                    data-testid="button-view-live"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    View Live Site
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("preview")}
                    variant="outline" 
                    className="justify-start border-slate-600 text-white hover:bg-slate-700"
                    data-testid="button-preview"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <BrandingEditor config={config} onUpdate={handleUpdateConfig} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <ContentEditor config={config} onUpdate={handleUpdateConfig} />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <FeaturesEditor config={config} onUpdate={handleUpdateConfig} />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <SEOEditor config={config} onUpdate={handleUpdateConfig} />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <PreviewPanel config={config} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Branding Editor Component
function BrandingEditor({ config, onUpdate }: { config: ClientConfig, onUpdate: (updates: Partial<ClientConfig>) => void }) {
  const [formData, setFormData] = useState(config.branding);

  const handleSave = () => {
    onUpdate({ branding: formData });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          Brand Colors & Theme
        </CardTitle>
        <CardDescription className="text-slate-400">
          Customize your website's visual identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-10 border-slate-600 bg-slate-700"
                  data-testid="input-primary-color"
                />
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 border-slate-600 bg-slate-700 text-white"
                  data-testid="input-primary-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-16 h-10 border-slate-600 bg-slate-700"
                  data-testid="input-secondary-color"
                />
                <Input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 border-slate-600 bg-slate-700 text-white"
                  data-testid="input-secondary-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-16 h-10 border-slate-600 bg-slate-700"
                  data-testid="input-accent-color"
                />
                <Input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 border-slate-600 bg-slate-700 text-white"
                  data-testid="input-accent-color-text"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-16 h-10 border-slate-600 bg-slate-700"
                  data-testid="input-bg-color"
                />
                <Input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="flex-1 border-slate-600 bg-slate-700 text-white"
                  data-testid="input-bg-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="text-color"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-16 h-10 border-slate-600 bg-slate-700"
                  data-testid="input-text-color"
                />
                <Input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="flex-1 border-slate-600 bg-slate-700 text-white"
                  data-testid="input-text-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                type="url"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-logo-url"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-save-branding"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Content Editor Component
function ContentEditor({ config, onUpdate }: { config: ClientConfig, onUpdate: (updates: Partial<ClientConfig>) => void }) {
  const [heroData, setHeroData] = useState(config.heroContent);
  const [contactData, setContactData] = useState(config.contactInfo);

  const handleSaveHero = () => {
    onUpdate({ heroContent: heroData });
  };

  const handleSaveContact = () => {
    onUpdate({ contactInfo: contactData });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Hero Section
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your homepage hero content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-heading">Main Heading</Label>
            <Input
              id="main-heading"
              value={heroData.mainHeading}
              onChange={(e) => setHeroData({ ...heroData, mainHeading: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="input-main-heading"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subheading">Subheading</Label>
            <Textarea
              id="subheading"
              value={heroData.subheading}
              onChange={(e) => setHeroData({ ...heroData, subheading: e.target.value })}
              rows={3}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="textarea-subheading"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta-text">Call-to-Action Text</Label>
              <Input
                id="cta-text"
                value={heroData.ctaText}
                onChange={(e) => setHeroData({ ...heroData, ctaText: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-cta-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-url">Call-to-Action URL</Label>
              <Input
                id="cta-url"
                value={heroData.ctaUrl}
                onChange={(e) => setHeroData({ ...heroData, ctaUrl: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-cta-url"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-mission"
                checked={heroData.showMissionBanner}
                onCheckedChange={(checked) => setHeroData({ ...heroData, showMissionBanner: checked })}
                data-testid="switch-mission-banner"
              />
              <Label htmlFor="show-mission">Show Mission Banner</Label>
            </div>

            {heroData.showMissionBanner && (
              <div className="space-y-2">
                <Label htmlFor="mission-text">Mission Banner Text</Label>
                <Textarea
                  id="mission-text"
                  value={heroData.missionText}
                  onChange={(e) => setHeroData({ ...heroData, missionText: e.target.value })}
                  rows={2}
                  className="border-slate-600 bg-slate-700 text-white"
                  data-testid="textarea-mission-text"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveHero}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-save-hero"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Hero Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-contact-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactData.phone || ''}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-contact-phone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email (Optional)</Label>
            <Input
              id="support-email"
              type="email"
              value={contactData.supportEmail || ''}
              onChange={(e) => setContactData({ ...contactData, supportEmail: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="input-support-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea
              id="address"
              value={contactData.address || ''}
              onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
              rows={2}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="textarea-address"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveContact}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-save-contact"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Contact Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Features Editor Component
function FeaturesEditor({ config, onUpdate }: { config: ClientConfig, onUpdate: (updates: Partial<ClientConfig>) => void }) {
  const [featuresData, setFeaturesData] = useState(config.features);

  const handleSave = () => {
    onUpdate({ features: featuresData });
  };

  const features = [
    { key: 'showDonationButton', label: 'Show Donation Button', description: 'Display donation button in header and pages' },
    { key: 'enableTournamentOrganizers', label: 'Tournament Organizer Section', description: 'Show tournament organizer signup and login options' },
    { key: 'showHealthBenefits', label: 'Health Benefits Section', description: 'Display health and wellness content' },
    { key: 'enableAcademicPrograms', label: 'Academic Programs', description: 'Show academic competition features' },
    { key: 'showTestimonials', label: 'Testimonials Section', description: 'Display user testimonials and reviews' },
  ];

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Website Features
        </CardTitle>
        <CardDescription className="text-slate-400">
          Enable or disable features on your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-white">{feature.label}</h4>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
              <Switch
                checked={featuresData[feature.key as keyof typeof featuresData]}
                onCheckedChange={(checked) => 
                  setFeaturesData({ ...featuresData, [feature.key]: checked })
                }
                data-testid={`switch-${feature.key}`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-save-features"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// SEO Editor Component
function SEOEditor({ config, onUpdate }: { config: ClientConfig, onUpdate: (updates: Partial<ClientConfig>) => void }) {
  const [seoData, setSeoData] = useState(config.seoConfig);
  const [keywordInput, setKeywordInput] = useState('');

  const handleSave = () => {
    onUpdate({ seoConfig: seoData });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData({
        ...seoData,
        keywords: [...seoData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoData({
      ...seoData,
      keywords: seoData.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5" />
          SEO Configuration
        </CardTitle>
        <CardDescription className="text-slate-400">
          Optimize your website for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={seoData.metaTitle}
              onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="input-meta-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={seoData.metaDescription}
              onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
              rows={3}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="textarea-meta-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex space-x-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Add a keyword"
                className="flex-1 border-slate-600 bg-slate-700 text-white"
                data-testid="input-keyword"
              />
              <Button 
                onClick={addKeyword}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
                data-testid="button-add-keyword"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {seoData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-slate-400 hover:text-white"
                    data-testid={`button-remove-keyword-${index}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="og-title">Open Graph Title</Label>
              <Input
                id="og-title"
                value={seoData.ogTitle || ''}
                onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-og-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">Open Graph Image URL</Label>
              <Input
                id="og-image"
                type="url"
                value={seoData.ogImageUrl || ''}
                onChange={(e) => setSeoData({ ...seoData, ogImageUrl: e.target.value })}
                className="border-slate-600 bg-slate-700 text-white"
                data-testid="input-og-image"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">Open Graph Description</Label>
            <Textarea
              id="og-description"
              value={seoData.ogDescription || ''}
              onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
              rows={2}
              className="border-slate-600 bg-slate-700 text-white"
              data-testid="textarea-og-description"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-save-seo"
          >
            <Save className="mr-2 h-4 w-4" />
            Save SEO Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Preview Panel Component
function PreviewPanel({ config }: { config: ClientConfig }) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Live Preview
          </div>
          <div className="flex space-x-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="border-slate-600"
              data-testid="button-desktop-preview"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="border-slate-600"
              data-testid="button-mobile-preview"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Preview how your changes will look on your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`bg-white rounded-lg overflow-hidden mx-auto ${
          previewMode === 'desktop' ? 'max-w-full' : 'max-w-sm'
        }`}>
          <div 
            className="p-8 text-center"
            style={{ 
              backgroundColor: config.branding.backgroundColor,
              color: config.branding.textColor 
            }}
          >
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: config.branding.primaryColor }}
            >
              {config.heroContent.mainHeading}
            </h1>
            <p 
              className="text-xl mb-6"
              style={{ color: config.branding.textColor }}
            >
              {config.heroContent.subheading}
            </p>
            <button
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: config.branding.accentColor }}
            >
              {config.heroContent.ctaText}
            </button>
            
            {config.heroContent.showMissionBanner && (
              <div 
                className="mt-6 p-4 rounded-lg"
                style={{ 
                  backgroundColor: config.branding.secondaryColor,
                  color: 'white'
                }}
              >
                <p className="text-sm">{config.heroContent.missionText}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => window.open(`https://${config.domain}`, '_blank')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-view-full-site"
          >
            <Globe className="mr-2 h-4 w-4" />
            View Full Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}