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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Save, Layout, Image, Type, Link, ShoppingCart, Users, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  metaDescription: z.string().max(160, "Meta description must be under 160 characters").optional(),
  isPublished: z.boolean(),
  pageType: z.enum(["landing", "about", "contact", "custom"]),
  templateId: z.string().optional()
});

type PageFormData = z.infer<typeof pageSchema>;

const defaultTemplates = {
  landing: {
    title: "Welcome to Our Tournament Platform",
    content: `<div class="hero-section bg-gradient-to-r from-primary to-secondary text-white py-20">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold mb-6">Professional Tournament Management</h1>
    <p class="text-xl mb-8">Create, manage, and run tournaments with ease</p>
    <button class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
      Get Started
    </button>
  </div>
</div>

<div class="features-section py-16">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Easy to Use</h3>
        <p class="text-gray-600">Intuitive interface that anyone can master</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Team Management</h3>
        <p class="text-gray-600">Manage teams, players, and schedules effortlessly</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Real-time Updates</h3>
        <p class="text-gray-600">Live brackets and instant notifications</p>
      </div>
    </div>
  </div>
</div>`
  },
  about: {
    title: "About Us",
    content: `<div class="py-16">
  <div class="container mx-auto max-w-4xl">
    <h1 class="text-4xl font-bold text-center mb-8">About Our Organization</h1>
    
    <div class="prose prose-lg mx-auto">
      <p class="text-xl text-gray-600 mb-8 text-center">
        We are dedicated to providing the best tournament management experience for sports organizations worldwide.
      </p>
      
      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
          <p>
            To revolutionize how tournaments are organized and managed, making it easier for communities 
            to bring people together through the power of sports and competition.
          </p>
        </div>
        <div>
          <h2 class="text-2xl font-bold mb-4">Our Vision</h2>
          <p>
            A world where every sports organization, regardless of size, has access to professional-grade 
            tournament management tools that enhance the experience for athletes and organizers alike.
          </p>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Our Story</h2>
      <p>
        Founded by passionate sports enthusiasts and technology experts, our platform was born from the 
        frustration of managing tournaments with outdated tools. We believe that great software should 
        empower organizers to focus on what matters most: creating amazing experiences for participants.
      </p>
      
      <p>
        Today, we serve hundreds of organizations across multiple sports, from local community leagues 
        to major sporting events. Our commitment to innovation and user experience drives everything we do.
      </p>
    </div>
  </div>
</div>`
  },
  contact: {
    title: "Contact Us",
    content: `<div class="py-16">
  <div class="container mx-auto max-w-4xl">
    <h1 class="text-4xl font-bold text-center mb-8">Get in Touch</h1>
    <p class="text-xl text-gray-600 text-center mb-12">
      We'd love to hear from you. Send us a message and we'll respond as soon as possible.
    </p>
    
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-2xl font-bold mb-6">Contact Information</h2>
        
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-primary mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <div>
              <h3 class="font-semibold">Email</h3>
              <p class="text-gray-600">support@yourcompany.com</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-primary mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            <div>
              <h3 class="font-semibold">Phone</h3>
              <p class="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-primary mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h3 class="font-semibold">Address</h3>
              <p class="text-gray-600">123 Tournament Ave<br>Sports City, SC 12345</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Subject</label>
            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Message</label>
            <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</div>`
  }
};

export default function WebsiteBuilder() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      metaDescription: "",
      isPublished: false,
      pageType: "custom"
    }
  });

  // Get pages
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["/api/pages"],
    enabled: isAuthenticated
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      return apiRequest("POST", "/api/pages", data);
    },
    onSuccess: () => {
      toast({
        title: "Page Created",
        description: "Your page has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      form.reset();
      setSelectedPage(null);
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PageFormData }) => {
      return apiRequest("PATCH", `/api/pages/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Page Updated",
        description: "Your page has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/pages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Page Deleted",
        description: "Page has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setSelectedPage(null);
      form.reset();
    }
  });

  const onSubmit = (data: PageFormData) => {
    if (selectedPage) {
      updatePageMutation.mutate({ id: selectedPage, data });
    } else {
      createPageMutation.mutate(data);
    }
  };

  const handleSelectPage = (page: any) => {
    setSelectedPage(page.id);
    form.reset({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
      pageType: page.pageType
    });
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    form.reset({
      title: "",
      slug: "",
      content: "",
      metaDescription: "",
      isPublished: false,
      pageType: "custom"
    });
  };

  const handleTemplateSelect = (templateType: keyof typeof defaultTemplates) => {
    const template = defaultTemplates[templateType];
    form.setValue("title", template.title);
    form.setValue("content", template.content);
    form.setValue("pageType", templateType);
    form.setValue("slug", templateType === "landing" ? "home" : templateType);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the website builder.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Website Builder</h1>
          <p className="text-muted-foreground">Create and manage custom pages for your white-label platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewPage} data-testid="button-new-page">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <Button variant="outline" data-testid="button-tournament-integration">
            <Calendar className="h-4 w-4 mr-2" />
            Tournament Integration
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Page List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pages</CardTitle>
              <CardDescription>Manage your website pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(pages as any[]).map((page: any) => (
                <div
                  key={page.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-muted/50 ${
                    selectedPage === page.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectPage(page)}
                  data-testid={`page-item-${page.slug}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{page.title}</div>
                      <div className="text-xs text-muted-foreground">/{page.slug}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {page.isPublished && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Live
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {page.pageType}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!pages || (pages as any[]).length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pages yet</p>
                  <p className="text-xs">Create your first page</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedPage ? "Edit Page" : "Create New Page"}
                      </CardTitle>
                      <CardDescription>
                        {selectedPage ? "Update your page content and settings" : "Build a new page for your website"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPage && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePageMutation.mutate(selectedPage)}
                          data-testid="button-delete-page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Page Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter page title" 
                                  {...field}
                                  data-testid="input-page-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="page-url" 
                                  {...field}
                                  data-testid="input-page-slug"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Quick Templates</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect("landing")}
                            data-testid="button-template-landing"
                          >
                            Landing Page
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect("about")}
                            data-testid="button-template-about"
                          >
                            About Page
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect("contact")}
                            data-testid="button-template-contact"
                          >
                            Contact Page
                          </Button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Content (HTML)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your page HTML content..."
                                className="min-h-[400px] font-mono text-sm"
                                {...field}
                                data-testid="textarea-page-content"
                              />
                            </FormControl>
                            <FormDescription>
                              Use HTML to create your page layout. Tailwind CSS classes are available.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="pageType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-page-type">
                                  <SelectValue placeholder="Select page type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="landing">Landing Page</SelectItem>
                                <SelectItem value="about">About Page</SelectItem>
                                <SelectItem value="contact">Contact Page</SelectItem>
                                <SelectItem value="custom">Custom Page</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description for search engines..."
                                maxLength={160}
                                {...field}
                                data-testid="textarea-meta-description"
                              />
                            </FormControl>
                            <FormDescription>
                              SEO description that appears in search results (max 160 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Publish Page
                              </FormLabel>
                              <FormDescription>
                                Make this page visible on your website
                              </FormDescription>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                data-testid="checkbox-published"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-4">
                      <div className="border rounded-lg bg-white">
                        <div className="border-b p-4 bg-gray-50">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            Preview: /{form.watch("slug")}
                          </div>
                        </div>
                        <div 
                          className="p-0 min-h-[400px]"
                          dangerouslySetInnerHTML={{ __html: form.watch("content") || "<p>No content to preview</p>" }}
                          data-testid="content-preview"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedPage(null);
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPageMutation.isPending || updatePageMutation.isPending}
                  data-testid="button-save-page"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createPageMutation.isPending || updatePageMutation.isPending
                    ? "Saving..."
                    : selectedPage ? "Update Page" : "Create Page"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}