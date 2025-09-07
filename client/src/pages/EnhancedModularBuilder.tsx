import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Edit, Trash2, Eye, Save, Layout, 
  Heart, Trophy, Info, Phone, Settings, Calendar, Users
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
      maxParticipants: 32
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
      description: "Thanks to our amazing sponsors"
    }
  },
  schedule: {
    name: "Schedule",
    icon: Calendar,
    description: "Display tournament schedule and brackets",
    color: "bg-green-500",
    defaultConfig: {
      title: "Tournament Schedule",
      description: "View all matches and game times"
    }
  },
  info: {
    name: "Info Block",
    icon: Info,
    description: "Add custom information or announcements",
    color: "bg-purple-500",
    defaultConfig: {
      title: "Important Information",
      content: "Add your custom content here"
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
      phone: ""
    }
  }
};

interface PageModule {
  id: string;
  type: keyof typeof moduleTypes;
  position: number;
  config: any;
}

export default function EnhancedModularBuilder() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [pageModules, setPageModules] = useState<PageModule[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState({
    id: 'home',
    title: 'Home Page',
    slug: 'home',
    description: 'Default tournament home page',
    isPublished: true
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
      config: moduleTypes[moduleType].defaultConfig
    };
    setPageModules(prev => [...prev, newModule]);
    toast({
      title: "Module Added",
      description: `${moduleTypes[moduleType].name} module added to your page`
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    setPageModules(prev => prev.filter(m => m.id !== moduleId));
    toast({
      title: "Module Deleted",
      description: "Module removed from your page"
    });
  };

  const handleSavePage = () => {
    toast({
      title: "Page Saved",
      description: `${currentPage.title} has been saved successfully`
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300">You need to be logged in to access the page builder.</p>
          <Link href="/">
            <Button className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-slate-900">
              Back to Home
            </Button>
          </Link>
        </div>
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
                onClick={handleSavePage}
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
                <CardDescription className="text-slate-300">Click to add modules to your page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(moduleTypes).map(([type, info]) => {
                  const IconComponent = info.icon;
                  return (
                    <div
                      key={type}
                      className="p-3 border border-slate-600 rounded-lg cursor-pointer hover:shadow-md transition-all hover:border-yellow-500/50 bg-slate-700 hover:bg-slate-600 text-white"
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
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Page Preview</CardTitle>
                  <CardDescription className="text-slate-300">How your page will look to visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white min-h-[600px] p-6 rounded-lg">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">{currentPage.title}</h1>
                    <p className="text-gray-600 mb-8">{currentPage.description}</p>
                    
                    {/* Modules Preview */}
                    <div className="space-y-6">
                      {pageModules.map((module) => {
                        const moduleInfo = moduleTypes[module.type];
                        const IconComponent = moduleInfo.icon;
                        
                        return (
                          <div
                            key={module.id}
                            className="border border-gray-200 rounded-lg p-6"
                          >
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`p-2 rounded ${moduleInfo.color} text-white`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">{module.config.title}</h3>
                            </div>
                            <p className="text-gray-600">{module.config.description}</p>
                          </div>
                        );
                      })}
                      
                      {pageModules.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No modules added yet. Use the Module Library to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Edit Mode
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Page Editor</CardTitle>
                  <CardDescription className="text-slate-300">Build your page with drag-and-drop modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pageModules.map((module, index) => {
                      const moduleInfo = moduleTypes[module.type];
                      const IconComponent = moduleInfo.icon;

                      return (
                        <div
                          key={module.id}
                          className="group relative bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-yellow-500/50 transition-all"
                          data-testid={`module-${module.type}-${index}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded ${moduleInfo.color} text-white`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{moduleInfo.name}</h3>
                                <p className="text-sm text-slate-400">{module.config.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-300 hover:text-white"
                                data-testid={`button-edit-${module.type}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-300 hover:text-red-400"
                                onClick={() => handleDeleteModule(module.id)}
                                data-testid={`button-delete-${module.type}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {pageModules.length === 0 && (
                      <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-600 rounded-lg">
                        <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No modules added yet. Use the Module Library to get started!</p>
                        <p className="text-sm mt-2">Click on any module type to add it to your page</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}