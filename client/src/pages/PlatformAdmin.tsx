import { useState } from "react";
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
import { Save, Palette, FileText, Settings as SettingsIcon, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const platformConfigSchema = z.object({
  // Theme settings
  primaryColor: z.union([z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"), z.literal("")]).optional(),
  secondaryColor: z.union([z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"), z.literal("")]).optional(),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  
  // Content settings
  landingHeadline: z.string().optional(),
  landingSubheadline: z.string().optional(),
  heroDescription: z.string().optional(),
  footerText: z.string().optional(),
  
  // General settings
  supportEmail: z.union([z.string().email(), z.literal("")]).optional(),
  contactPhone: z.string().optional(),
  platformName: z.string().optional(),
});

type PlatformConfigFormData = z.infer<typeof platformConfigSchema>;

export default function PlatformAdmin() {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("theme");

  const form = useForm<PlatformConfigFormData>({
    resolver: zodResolver(platformConfigSchema),
    defaultValues: {
      primaryColor: "#10b981",
      secondaryColor: "#3b82f6",
      logoUrl: "",
      landingHeadline: "",
      landingSubheadline: "",
      heroDescription: "",
      footerText: "",
      supportEmail: "",
      contactPhone: "",
      platformName: "Champions for Change",
    }
  });

  // Get platform settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/platform-settings"],
    enabled: isSuperAdmin,
    retry: false
  });

  const saveSettingMutation = useMutation({
    mutationFn: async (data: { category: string; settingKey: string; settingValue: string; description?: string }) => {
      return apiRequest("/api/platform-settings", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/platform-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: PlatformConfigFormData) => {
    try {
      // Save each setting individually
      const settingsToSave = [
        { category: "theme", settingKey: "primaryColor", settingValue: data.primaryColor || "", description: "Primary brand color" },
        { category: "theme", settingKey: "secondaryColor", settingValue: data.secondaryColor || "", description: "Secondary brand color" },
        { category: "theme", settingKey: "logoUrl", settingValue: data.logoUrl || "", description: "Platform logo URL" },
        { category: "content", settingKey: "landingHeadline", settingValue: data.landingHeadline || "", description: "Landing page main headline" },
        { category: "content", settingKey: "landingSubheadline", settingValue: data.landingSubheadline || "", description: "Landing page subheadline" },
        { category: "content", settingKey: "heroDescription", settingValue: data.heroDescription || "", description: "Hero section description" },
        { category: "content", settingKey: "footerText", settingValue: data.footerText || "", description: "Footer text" },
        { category: "general", settingKey: "supportEmail", settingValue: data.supportEmail || "", description: "Support email address" },
        { category: "general", settingKey: "contactPhone", settingValue: data.contactPhone || "", description: "Contact phone number" },
        { category: "general", settingKey: "platformName", settingValue: data.platformName || "", description: "Platform name" },
      ];

      for (const setting of settingsToSave) {
        if (setting.settingValue) {
          await saveSettingMutation.mutateAsync(setting);
        }
      }

      toast({
        title: "All Settings Saved",
        description: "Your platform configuration has been updated successfully."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access Denied: Super admin privileges required to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Customize your platform's appearance and content</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <SettingsIcon className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="media">
                <ImageIcon className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Colors</CardTitle>
                  <CardDescription>
                    Set your platform's color scheme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input 
                              type="color" 
                              {...field} 
                              className="w-20 h-10"
                              data-testid="input-primary-color"
                            />
                          </FormControl>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field}
                              placeholder="#10b981"
                              className="flex-1"
                              data-testid="input-primary-color-hex"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Main brand color used throughout the platform
                        </FormDescription>
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
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input 
                              type="color" 
                              {...field} 
                              className="w-20 h-10"
                              data-testid="input-secondary-color"
                            />
                          </FormControl>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field}
                              placeholder="#3b82f6"
                              className="flex-1"
                              data-testid="input-secondary-color-hex"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Accent color for buttons and highlights
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Landing Page Content</CardTitle>
                  <CardDescription>
                    Edit text and messaging on your landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="landingHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Headline</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Welcome to Champions for Change" 
                            {...field}
                            data-testid="input-landing-headline"
                          />
                        </FormControl>
                        <FormDescription>
                          The main headline displayed on the landing page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="landingSubheadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subheadline</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tournament management made simple" 
                            {...field}
                            data-testid="input-landing-subheadline"
                          />
                        </FormControl>
                        <FormDescription>
                          Supporting text below the main headline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your platform's mission and value..." 
                            {...field}
                            rows={4}
                            data-testid="input-hero-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Longer description text in the hero section
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Text</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="© 2025 Champions for Change" 
                            {...field}
                            data-testid="input-footer-text"
                          />
                        </FormControl>
                        <FormDescription>
                          Copyright and footer information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Platform-wide configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platformName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Champions for Change" 
                            {...field}
                            data-testid="input-platform-name"
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="support@championsforchange.net" 
                            {...field}
                            data-testid="input-support-email"
                          />
                        </FormControl>
                        <FormDescription>
                          Email address for user support inquiries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="(555) 123-4567" 
                            {...field}
                            data-testid="input-contact-phone"
                          />
                        </FormControl>
                        <FormDescription>
                          Support phone number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Media & Images</CardTitle>
                  <CardDescription>
                    Manage logos and platform images
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
                            type="url"
                            placeholder="https://example.com/logo.png" 
                            {...field}
                            data-testid="input-logo-url"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your platform logo image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("logoUrl") && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm font-medium mb-2">Logo Preview</p>
                      <img 
                        src={form.watch("logoUrl")} 
                        alt="Platform Logo" 
                        className="max-h-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={saveSettingMutation.isPending}
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveSettingMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
