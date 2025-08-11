import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Eye, Save, Globe, Palette, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const whitelabelConfigSchema = z.object({
  domain: z.string().min(1, "Domain is required").regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  companyName: z.string().min(1, "Company name is required"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  customCss: z.string().optional(),
  allowedFeatures: z.array(z.string()).optional(),
  revenueSharePercentage: z.number().min(0).max(100),
  isActive: z.boolean()
});

type WhitelabelConfigFormData = z.infer<typeof whitelabelConfigSchema>;

export default function WhiteLabelAdmin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<WhitelabelConfigFormData>({
    resolver: zodResolver(whitelabelConfigSchema),
    defaultValues: {
      domain: "",
      companyName: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      logoUrl: "",
      faviconUrl: "",
      customCss: "",
      allowedFeatures: ["tournaments", "analytics", "payments"],
      revenueSharePercentage: 0,
      isActive: true
    }
  });

  // Get existing config
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/whitelabel-config/me"],
    enabled: isAuthenticated,
    retry: false
  });

  // Update form when config loads
  useEffect(() => {
    if (config && typeof config === 'object') {
      const configData = config as any;
      form.reset({
        domain: configData.domain || "",
        companyName: configData.companyName || "",
        primaryColor: configData.primaryColor || "#3b82f6",
        secondaryColor: configData.secondaryColor || "#1e40af",
        logoUrl: configData.logoUrl || "",
        faviconUrl: configData.faviconUrl || "",
        customCss: configData.customCss || "",
        allowedFeatures: configData.allowedFeatures || ["tournaments", "analytics", "payments"],
        revenueSharePercentage: configData.revenueSharePercentage || 0,
        isActive: configData.isActive ?? true
      });
    }
  }, [config, form]);

  const createConfigMutation = useMutation({
    mutationFn: async (data: WhitelabelConfigFormData) => {
      return apiRequest("POST", "/api/whitelabel-config", data);
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Your white-label configuration has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whitelabel-config/me"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WhitelabelConfigFormData }) => {
      return apiRequest("PATCH", `/api/whitelabel-config/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Your white-label configuration has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whitelabel-config/me"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: WhitelabelConfigFormData) => {
    if (config && typeof config === 'object' && (config as any).id) {
      updateConfigMutation.mutate({ id: (config as any).id, data });
    } else {
      createConfigMutation.mutate(data);
    }
  };

  const applyPreviewStyles = () => {
    const values = form.getValues();
    document.documentElement.style.setProperty('--primary', values.primaryColor);
    document.documentElement.style.setProperty('--secondary', values.secondaryColor);
    
    // Apply custom CSS if provided
    if (values.customCss) {
      let styleElement = document.getElementById('whitelabel-preview-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'whitelabel-preview-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = values.customCss;
    }
  };

  const resetPreviewStyles = () => {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--secondary');
    const styleElement = document.getElementById('whitelabel-preview-styles');
    if (styleElement) {
      styleElement.remove();
    }
  };

  useEffect(() => {
    if (previewMode) {
      applyPreviewStyles();
    } else {
      resetPreviewStyles();
    }

    return () => resetPreviewStyles();
  }, [previewMode, form.watch()]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the white-label admin panel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">White-Label Configuration</h1>
          <p className="text-muted-foreground">Customize your tournament platform branding and domain</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Switch
              checked={previewMode}
              onCheckedChange={setPreviewMode}
              data-testid="toggle-preview"
            />
            <span className="text-sm">Preview Mode</span>
          </div>
          {config && typeof config === 'object' && (config as any).isActive && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Globe className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Configuration</CardTitle>
                  <CardDescription>
                    Set up your custom domain for the white-label platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="yourcompany.com" 
                            {...field}
                            data-testid="input-domain"
                          />
                        </FormControl>
                        <FormDescription>
                          Your tournament platform will be available at this domain
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your Company Name" 
                            {...field}
                            data-testid="input-company-name"
                          />
                        </FormControl>
                        <FormDescription>
                          This will replace "Champions for Change" throughout the platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Configuration
                          </FormLabel>
                          <FormDescription>
                            Enable this white-label configuration
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Choose the primary and secondary colors for your platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type="color" 
                                {...field}
                                className="w-16 h-10 p-1 border rounded"
                                data-testid="input-primary-color"
                              />
                            </FormControl>
                            <FormControl>
                              <Input 
                                placeholder="#3b82f6" 
                                {...field}
                                className="font-mono"
                                data-testid="input-primary-color-hex"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type="color" 
                                {...field}
                                className="w-16 h-10 p-1 border rounded"
                                data-testid="input-secondary-color"
                              />
                            </FormControl>
                            <FormControl>
                              <Input 
                                placeholder="#1e40af" 
                                {...field}
                                className="font-mono"
                                data-testid="input-secondary-color-hex"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Favicon</CardTitle>
                  <CardDescription>
                    Upload your company logo and favicon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yoursite.com/logo.png" 
                            {...field}
                            data-testid="input-logo-url"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your company logo (recommended: 200x60px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yoursite.com/favicon.ico" 
                            {...field}
                            data-testid="input-favicon-url"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your favicon (recommended: 32x32px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>
                    Add custom CSS to further customize your platform appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="customCss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom CSS</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`/* Custom styles for your platform */
.tournament-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.hero-section {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}`}
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                            data-testid="textarea-custom-css"
                          />
                        </FormControl>
                        <FormDescription>
                          CSS will be applied to your white-label platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sharing</CardTitle>
                  <CardDescription>
                    Configure revenue sharing percentage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="revenueSharePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenue Share Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-revenue-share"
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage of tournament fees you keep (0-100%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Preview</CardTitle>
                  <CardDescription>
                    See how your white-label platform will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 bg-background">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {form.watch("logoUrl") ? (
                          <img 
                            src={form.watch("logoUrl")} 
                            alt="Logo" 
                            className="h-8"
                            data-testid="preview-logo"
                          />
                        ) : (
                          <div className="w-24 h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
                            Your Logo
                          </div>
                        )}
                        <h2 className="text-xl font-bold" data-testid="preview-company-name">
                          {form.watch("companyName") || "Your Company"}
                        </h2>
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid="preview-domain">
                        {form.watch("domain") || "yourcompany.com"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="w-full" data-testid="preview-primary-button">
                        Primary Button
                      </Button>
                      <Button variant="secondary" className="w-full" data-testid="preview-secondary-button">
                        Secondary Button
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 border rounded">
                      <h3 className="font-medium mb-2">Tournament Card Preview</h3>
                      <div className="p-3 bg-card border rounded">
                        <div className="font-medium">Sample Tournament</div>
                        <div className="text-sm text-muted-foreground">16 teams • Single Elimination</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-reset"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              {createConfigMutation.isPending || updateConfigMutation.isPending
                ? "Saving..."
                : config ? "Update Configuration" : "Save Configuration"
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}