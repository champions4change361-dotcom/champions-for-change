import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Plus, Edit, Trash2, Eye, Globe, Layout, Settings, 
  Calendar, Users, Trophy, Heart, ArrowLeft, Copy
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PageData {
  id: string;
  name: string;
  slug: string;
  type: 'modular' | 'advanced';
  isPublished: boolean;
  lastModified: string;
  modules: number;
  visits: number;
  isTemplate?: boolean;
}

export default function PageManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageType, setNewPageType] = useState<'modular' | 'advanced'>('modular');

  const [pages, setPages] = useState<PageData[]>([
    {
      id: '1',
      name: 'Home Page',
      slug: 'home',
      type: 'modular',
      isPublished: true,
      lastModified: '2 hours ago',
      modules: 4,
      visits: 1250
    },
    {
      id: '2', 
      name: 'About Us',
      slug: 'about',
      type: 'advanced',
      isPublished: true,
      lastModified: '1 day ago',
      modules: 0,
      visits: 340
    },
    {
      id: '3',
      name: 'Tournament Registration', 
      slug: 'register',
      type: 'modular',
      isPublished: false,
      lastModified: '3 days ago',
      modules: 2,
      visits: 0
    }
  ]);

  const pageTemplates = [
    {
      id: 'tournament-home',
      name: 'Tournament Home',
      description: 'Perfect for tournament main pages with registration and schedule',
      modules: ['hero', 'registration', 'schedule', 'sponsors'],
      preview: '/api/templates/tournament-home-preview.jpg'
    },
    {
      id: 'about-organization',
      name: 'About Organization',
      description: 'Professional about page with mission, team, and contact info',
      modules: ['hero', 'mission', 'team', 'contact'],
      preview: '/api/templates/about-preview.jpg'
    },
    {
      id: 'donation-page',
      name: 'Donation Page',
      description: 'Effective fundraising page with impact tracking',
      modules: ['hero', 'donation', 'impact', 'testimonials'],
      preview: '/api/templates/donation-preview.jpg'
    }
  ];

  const handleCreatePage = () => {
    if (!newPageName.trim()) return;
    
    const newPage: PageData = {
      id: Date.now().toString(),
      name: newPageName,
      slug: newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: newPageType,
      isPublished: false,
      lastModified: 'Just now',
      modules: 0,
      visits: 0
    };
    
    setPages(prev => [...prev, newPage]);
    setShowCreateDialog(false);
    setNewPageName('');
    
    toast({
      title: "Page Created",
      description: `${newPageName} is ready to edit`
    });
  };

  const handleDeletePage = (pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
    toast({
      title: "Page Deleted",
      description: "Page has been permanently removed"
    });
  };

  const handleDuplicatePage = (page: PageData) => {
    const duplicatedPage: PageData = {
      ...page,
      id: Date.now().toString(),
      name: `${page.name} (Copy)`,
      slug: `${page.slug}-copy`,
      isPublished: false,
      lastModified: 'Just now',
      visits: 0
    };
    
    setPages(prev => [...prev, duplicatedPage]);
    toast({
      title: "Page Duplicated",
      description: `${page.name} has been copied successfully`
    });
  };

  const handleTogglePublish = (pageId: string) => {
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, isPublished: !p.isPublished } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Globe className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{user?.organizationName ? `${user.organizationName} Arena` : 'Tournament Arena'}</h1>
                  <p className="text-xs text-yellow-400">Page Manager</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-yellow-600 hover:bg-yellow-500 text-slate-900"
                data-testid="button-create-page"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Website Pages</h1>
          <p className="text-slate-300">Manage all your website pages in one place</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Pages</span>
                  <span className="text-yellow-400 font-bold">{pages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Published</span>
                  <span className="text-green-400 font-bold">{pages.filter(p => p.isPublished).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Visits</span>
                  <span className="text-blue-400 font-bold">{pages.reduce((sum, p) => sum + p.visits, 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Page Builder Options */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Page Builders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/modular-builder">
                  <div className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors border border-slate-600 hover:border-yellow-500/50">
                    <div className="flex items-center space-x-3">
                      <Layout className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="font-medium text-sm text-white">Modular Builder</div>
                        <div className="text-xs text-slate-400">Free - Drag & drop modules</div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <Link href="/webpage-builder">
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:from-purple-500/20 hover:to-pink-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="font-medium text-sm text-white">Advanced Builder</div>
                          <div className="text-xs text-slate-400">Pro - Custom layouts & CSS</div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                        PRO
                      </Badge>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Pages Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pages List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pages.map((page) => (
                <Card key={page.id} className="bg-slate-800 border-slate-700 hover:border-yellow-500/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{page.name}</h3>
                        {page.isPublished ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Live
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-slate-400 hover:text-white"
                          onClick={() => handleDuplicatePage(page)}
                          data-testid={`button-duplicate-${page.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-slate-400 hover:text-red-400"
                          onClick={() => handleDeletePage(page.id)}
                          data-testid={`button-delete-${page.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      /{page.slug} • Modified {page.lastModified}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-slate-400">Type</div>
                        <div className="text-white capitalize">{page.type}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Modules</div>
                        <div className="text-white">{page.modules}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Visits</div>
                        <div className="text-white">{page.visits.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={page.type === 'modular' ? '/modular-builder' : '/webpage-builder'}>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-slate-900"
                          data-testid={`button-edit-${page.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-slate-300 border-slate-600 hover:bg-slate-700"
                        data-testid={`button-preview-${page.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`flex-1 ${page.isPublished ? 'text-gray-400 border-gray-600' : 'text-green-400 border-green-600'}`}
                        onClick={() => handleTogglePublish(page.id)}
                        data-testid={`button-publish-${page.id}`}
                      >
                        {page.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Page Templates */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Page Templates</CardTitle>
                <CardDescription className="text-slate-300">
                  Start with professionally designed templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pageTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-yellow-500/50 transition-colors cursor-pointer"
                      data-testid={`template-${template.id}`}
                    >
                      <div className="aspect-video bg-slate-600 rounded mb-3 flex items-center justify-center">
                        <Layout className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">{template.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900"
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Page</DialogTitle>
            <DialogDescription className="text-slate-300">
              Choose how you want to build your new page
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Page Name</label>
              <Input 
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="e.g., About Us, Contact, Donations"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-page-name"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Page Type</label>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="pageType" 
                    value="modular" 
                    checked={newPageType === 'modular'}
                    onChange={(e) => setNewPageType(e.target.value as 'modular')}
                    className="text-yellow-500"
                  />
                  <div>
                    <div className="text-white font-medium">Modular Builder (Free)</div>
                    <div className="text-sm text-slate-400">Pre-built modules, perfect for beginners</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="pageType" 
                    value="advanced" 
                    checked={newPageType === 'advanced'}
                    onChange={(e) => setNewPageType(e.target.value as 'advanced')}
                    className="text-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="text-white font-medium">Advanced Builder</div>
                      <div className="text-sm text-slate-400">Custom layouts, CSS, unlimited design</div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                      PRO
                    </Badge>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="flex-1 text-slate-300 border-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePage}
              disabled={!newPageName.trim()}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-slate-900"
              data-testid="button-confirm-create"
            >
              Create Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}