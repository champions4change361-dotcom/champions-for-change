import { useState, useCallback } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, Edit, Trash2, Eye, Save, Layout, Image, Type, Link as LinkIcon, 
  ShoppingCart, Users, Calendar, BarChart3, Palette, GripVertical,
  Heart, Trophy, Info, Phone, Settings
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import ModuleConfigurator from "@/components/ModuleConfigurator";

// Module types with their configurations
const moduleTypes = {
  registration: {
    name: "Registration",
    icon: Users,
    description: "Allow teams/athletes to register for your tournament",
    color: "bg-blue-500",
    defaultConfig: {
      title: "Tournament Registration",
      description: "Register your team or individual athlete",
      registrationFee: 0,
      maxParticipants: 32,
      registrationDeadline: "",
      requiresApproval: false
    }
  },
  donation: {
    name: "Donation",
    icon: Heart,
    description: "Accept donations for your cause",
    color: "bg-red-500",
    defaultConfig: {
      title: "Support Our Cause",
      description: "Help us raise funds for our mission",
      goalAmount: 1000,
      showProgress: true,
      suggestedAmounts: [25, 50, 100, 250]
    }
  },
  sponsors: {
    name: "Sponsors",
    icon: Trophy,
    description: "Showcase your tournament sponsors",
    color: "bg-yellow-500",
    defaultConfig: {
      title: "Our Sponsors",
      description: "Thanks to our amazing sponsors",
      sponsorLogos: [],
      layoutStyle: "grid"
    }
  },
  schedule: {
    name: "Schedule",
    icon: Calendar,
    description: "Display tournament schedule and brackets",
    color: "bg-green-500",
    defaultConfig: {
      title: "Tournament Schedule",
      description: "View all matches and game times",
      showBrackets: true,
      showResults: true
    }
  },
  info: {
    name: "Info Block",
    icon: Info,
    description: "Add custom information or announcements",
    color: "bg-purple-500",
    defaultConfig: {
      title: "Important Information",
      content: "Add your custom content here",
      showTitle: true
    }
  },
  contact: {
    name: "Contact",
    icon: Phone,
    description: "Contact information and social links",
    color: "bg-indigo-500",
    defaultConfig: {
      title: "Contact Us",
      email: "",
      phone: "",
      address: "",
      socialLinks: []
    }
  }
};

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  isRegistrationOpen: z.boolean(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageModule {
  id: string;
  type: keyof typeof moduleTypes;
  position: number;
  config: any;
  styling: {
    background?: {
      type: 'color' | 'gradient' | 'image';
      value: string;
      opacity?: number;
    };
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    margin?: number;
  };
}

export default function ModularPageBuilder() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageModules, setPageModules] = useState<PageModule[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showPageManager, setShowPageManager] = useState(false);
  const [createNewPage, setCreateNewPage] = useState(false);
  const [currentPage, setCurrentPage] = useState({
    id: 'default-page',
    title: 'Home Page',
    slug: 'home',
    description: 'Default tournament home page',
    isPublished: false
  });

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: currentPage.title,
      slug: currentPage.slug,
      description: currentPage.description,
      isPublished: currentPage.isPublished,
      isRegistrationOpen: false
    }
  });

  // Demo pages for free tier users
  const pages = [
    { id: 'home', title: 'Home Page', slug: 'home', description: 'Default tournament home page', isPublished: true, modules: 3 },
    { id: 'about', title: 'About Us', slug: 'about', description: 'About our organization', isPublished: false, modules: 1, isPaidFeature: true },
    { id: 'sponsors', title: 'Sponsors', slug: 'sponsors', description: 'Tournament sponsors', isPublished: false, modules: 1, isPaidFeature: true }
  ];

  const handleAddModule = (moduleType: keyof typeof moduleTypes) => {
    const newModule: PageModule = {
      id: `module-${Date.now()}`,
      type: moduleType,
      position: pageModules.length,
      config: moduleTypes[moduleType].defaultConfig,
      styling: {
        background: { type: 'color', value: '#ffffff' },
        textColor: '#000000',
        borderRadius: 8,
        padding: 16,
        margin: 8
      }
    };
    setPageModules(prev => [...prev, newModule]);
  };

  const handleMoveModule = useCallback((dragIndex: number, hoverIndex: number) => {
    setPageModules(prev => {
      const draggedItem = prev[dragIndex];
      const newItems = [...prev];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems.map((item, index) => ({ ...item, position: index }));
    });
  }, []);

  const handleDeleteModule = (moduleId: string) => {
    setPageModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const handleSaveModuleConfig = (updatedModule: PageModule) => {
    setPageModules(prev => 
      prev.map(m => m.id === updatedModule.id ? updatedModule : m)
    );
  };

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModule(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedModule) return;

    const draggedIndex = pageModules.findIndex(m => m.id === draggedModule);
    if (draggedIndex !== -1) {
      handleMoveModule(draggedIndex, targetIndex);
    }
    setDraggedModule(null);
  };

  const renderModule = (module: PageModule, index: number) => {
    const moduleInfo = moduleTypes[module.type];
    const IconComponent = moduleInfo.icon;

    return (
      <div
        key={module.id}
        draggable
        onDragStart={(e) => handleDragStart(e, module.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-move"
        data-testid={`module-${module.type}-${index}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            <div className={`p-2 rounded-md ${moduleInfo.color} text-white`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{moduleInfo.name}</h3>
              <p className="text-sm text-gray-500">{module.config.title || moduleInfo.defaultConfig.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingModule(module.id)}
              data-testid={`button-edit-${module.type}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteModule(module.id)}
              data-testid={`button-delete-${module.type}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the page builder.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Layout className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{user?.organizationName ? `${user.organizationName} Arena` : 'Tournament Arena'}</h1>
                  <p className="text-xs text-yellow-400">Page Builder</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setPreviewMode(!previewMode)} 
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
                data-testid="button-toggle-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit Mode" : "Preview"}
              </Button>
              <Button 
                type="submit" 
                form="page-form"
                className="bg-yellow-600 hover:bg-yellow-500 text-slate-900"
                data-testid="button-save-page"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Page
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Management Tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {pages.map((page) => (
              <div key={page.id} className="flex-shrink-0">
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage.id === page.id
                      ? 'bg-yellow-600 text-slate-900'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  data-testid={`tab-page-${page.slug}`}
                >
                  {page.title}
                  {page.isPaidFeature && (
                    <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                      PRO
                    </Badge>
                  )}
                </button>
              </div>
            ))}
            <Button 
              onClick={() => setCreateNewPage(true)}
              variant="ghost"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              data-testid="button-create-page"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {currentPage.title}
            </h1>
            <p className="text-slate-300">
              Will be available at: <span className="text-yellow-400">{user?.organizationName?.toLowerCase() || 'yourdomain'}.com/{currentPage.slug}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              data-testid="button-page-settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Page Settings
            </Button>
          </div>
        </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Module Library Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Module Library</CardTitle>
              <CardDescription className="text-slate-300">Drag modules to your page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(moduleTypes).map(([type, info]) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={type}
                    className={`p-3 border border-slate-600 rounded-lg cursor-pointer hover:shadow-md transition-all hover:border-yellow-500/50 bg-slate-700 hover:bg-slate-600 text-white`}
                    onClick={() => handleAddModule(type as keyof typeof moduleTypes)}
                    data-testid={`add-module-${type}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${info.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{info.name}</div>
                        <div className="text-xs text-slate-400">{info.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Upgrade Prompt for Free Tier */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-2">Want More?</div>
                  <div className="text-xs text-slate-300 mb-3">
                    Upgrade for advanced layouts, custom CSS, and unlimited pages
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    data-testid="button-upgrade-prompt"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Builder */}
        <div className="lg:col-span-3">
          {previewMode ? (
            // Preview Mode
            <Card>
              <CardHeader>
                <CardTitle>Page Preview</CardTitle>
                <CardDescription>How your page will look to visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 min-h-[600px] p-6">
                  <h1 className="text-3xl font-bold mb-4">{form.watch("title") || "Your Tournament Page"}</h1>
                  <p className="text-gray-600 mb-8">{form.watch("description") || "Tournament description will appear here"}</p>
                  
                  {/* Registration Open Banner - Always at top like Jersey Watch */}
                  {form.watch("isRegistrationOpen") && (
                    <div className="bg-green-500 text-white p-4 rounded-lg mb-6 text-center">
                      <h2 className="text-xl font-bold">🏆 Registration is Open!</h2>
                      <p className="mb-3">Join our tournament - spaces are filling fast!</p>
                      <Button className="bg-white text-green-500 hover:bg-gray-100" data-testid="button-registration-open">
                        Register Now
                      </Button>
                    </div>
                  )}
                  
                  {/* Modules */}
                  <div className="space-y-6">
                    {pageModules.map((module, index) => {
                      const moduleInfo = moduleTypes[module.type];
                      const IconComponent = moduleInfo.icon;
                      
                      return (
                        <div
                          key={module.id}
                          className="border border-gray-200 rounded-lg p-6"
                          style={{
                            backgroundColor: module.styling.background?.value || '#ffffff',
                            color: module.styling.textColor || '#000000',
                            borderRadius: `${module.styling.borderRadius || 8}px`,
                            padding: `${module.styling.padding || 16}px`,
                            margin: `${module.styling.margin || 8}px 0`
                          }}
                          data-testid={`preview-module-${module.type}`}
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <IconComponent className="h-5 w-5" />
                            <h3 className="text-xl font-bold">{module.config.title}</h3>
                          </div>
                          <p className="mb-4">{module.config.description}</p>
                          
                          {/* Module-specific content preview */}
                          {module.type === 'registration' && (
                            <div className="space-y-3">
                              <div className="text-sm">
                                Registration Fee: ${module.config.registrationFee || 0}
                              </div>
                              <Button className="bg-blue-500 text-white">
                                Register Team
                              </Button>
                            </div>
                          )}
                          
                          {module.type === 'donation' && (
                            <div className="space-y-3">
                              <div className="text-sm">
                                Goal: ${module.config.goalAmount || 1000}
                              </div>
                              <div className="flex space-x-2">
                                {(module.config.suggestedAmounts || [25, 50, 100]).map((amount: number) => (
                                  <Button key={amount} variant="outline" size="sm">
                                    ${amount}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {module.type === 'info' && (
                            <div className="prose prose-sm">
                              <p>{module.config.content || "Your custom content will appear here"}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {pageModules.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Add modules from the sidebar to build your page</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Page Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Settings</CardTitle>
                  <CardDescription>Configure your tournament page details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form id="page-form" className="space-y-4">
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

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of your tournament..."
                                {...field}
                                data-testid="textarea-page-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-6">
                        <FormField
                          control={form.control}
                          name="isRegistrationOpen"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-registration-open"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Registration Open (shows banner at top)
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-is-published"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Publish Page
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Module Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Modules</CardTitle>
                  <CardDescription>Drag and drop to reorder modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="modules-container">
                    {pageModules.map((module, index) => renderModule(module, index))}
                    
                    {pageModules.length === 0 && (
                      <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No modules added yet</p>
                        <p className="text-sm">Choose modules from the sidebar to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Module Configuration Dialog */}
      {editingModule && (
        <ModuleConfigurator
          module={pageModules.find(m => m.id === editingModule)!}
          isOpen={!!editingModule}
          onClose={() => setEditingModule(null)}
          onSave={handleSaveModuleConfig}
        />
      )}
    </div>
  );
}