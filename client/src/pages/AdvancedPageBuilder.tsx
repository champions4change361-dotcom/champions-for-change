import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Globe, Plus, Settings, Eye, Save, Palette, Image, Type, Layout, Code2 } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdvancedPageBuilder() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('layout');
  const [currentPage, setCurrentPage] = useState({
    name: 'New Page',
    slug: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f59e0b'
  });

  const layoutBlocks = [
    { 
      id: 'header', 
      name: 'Header Section', 
      icon: Layout, 
      description: 'Logo, navigation, hero content',
      isPro: false
    },
    { 
      id: 'text', 
      name: 'Text Block', 
      icon: Type, 
      description: 'Rich text content editor',
      isPro: false
    },
    { 
      id: 'image', 
      name: 'Image Gallery', 
      icon: Image, 
      description: 'Photo galleries and single images',
      isPro: false
    },
    { 
      id: 'form', 
      name: 'Contact Form', 
      icon: Globe, 
      description: 'Registration and contact forms',
      isPro: true
    },
    { 
      id: 'sponsors', 
      name: 'Sponsor Grid', 
      icon: Trophy, 
      description: 'Display sponsor logos in grid',
      isPro: true
    },
    { 
      id: 'custom', 
      name: 'Custom HTML', 
      icon: Code2, 
      description: 'Advanced custom code blocks',
      isPro: true
    }
  ];

  const backgroundColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
    '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b',
    '#0f172a', '#7c3aed', '#a855f7', '#c084fc', '#e879f9'
  ];

  const accentColors = [
    '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b'
  ];

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
                  <p className="text-xs text-yellow-400">Advanced Page Builder</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
                data-testid="button-preview-page"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                className="bg-yellow-600 hover:bg-yellow-500 text-slate-900"
                data-testid="button-publish-page"
              >
                <Save className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-8 max-w-7xl">
        {/* Page Settings Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Advanced Page Builder</h1>
              <p className="text-slate-300">Create professional website pages with custom layouts and branding</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2">
              PRO FEATURE
            </Badge>
          </div>
          
          {/* Page Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Page Name</label>
              <Input 
                value={currentPage.name}
                onChange={(e) => setCurrentPage(prev => ({...prev, name: e.target.value}))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="e.g., About Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">URL Slug</label>
              <Input 
                value={currentPage.slug}
                onChange={(e) => setCurrentPage(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')}))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="about-us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preview URL</label>
              <div className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 text-sm">
                {user?.organizationName?.toLowerCase() || 'yourdomain'}.com/{currentPage.slug || 'page-url'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Design Customization */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Theme & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {backgroundColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setCurrentPage(prev => ({...prev, backgroundColor: color}))}
                        className={`w-8 h-8 rounded border-2 ${currentPage.backgroundColor === color ? 'border-yellow-500' : 'border-slate-600'}`}
                        style={{backgroundColor: color}}
                        data-testid={`bg-color-${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {accentColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setCurrentPage(prev => ({...prev, accentColor: color}))}
                        className={`w-8 h-8 rounded border-2 ${currentPage.accentColor === color ? 'border-yellow-500' : 'border-slate-600'}`}
                        style={{backgroundColor: color}}
                        data-testid={`accent-color-${color}`}
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-upload-logo"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </CardContent>
            </Card>

            {/* Content Blocks */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Content Blocks
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Drag blocks to build your page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {layoutBlocks.map(block => {
                  const IconComponent = block.icon;
                  return (
                    <div
                      key={block.id}
                      className={`p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-yellow-500/50 transition-all ${
                        block.isPro ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      data-testid={`block-${block.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium text-sm text-white">{block.name}</div>
                            <div className="text-xs text-slate-400">{block.description}</div>
                          </div>
                        </div>
                        {block.isPro && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                            PRO
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Page Canvas</CardTitle>
                    <CardDescription className="text-slate-300">
                      Design your page layout - drag blocks from the sidebar
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                      Desktop
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-500">
                      Tablet
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-500">
                      Mobile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Canvas */}
                <div 
                  className="min-h-[600px] border-2 border-dashed border-slate-600 rounded-lg p-8"
                  style={{ backgroundColor: currentPage.backgroundColor }}
                >
                  <div className="text-center py-20">
                    <Layout className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-medium text-slate-600 mb-2">Start Building Your Page</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      Drag content blocks from the sidebar to start building your custom page. 
                      Professional layouts, responsive design, and custom branding included.
                    </p>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button 
                        variant="outline"
                        className="text-slate-600 border-slate-400 hover:bg-slate-100"
                        data-testid="button-add-header"
                      >
                        <Layout className="h-4 w-4 mr-2" />
                        Add Header
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-slate-600 border-slate-400 hover:bg-slate-100"
                        data-testid="button-add-text"
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Add Text
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-slate-600 border-slate-400 hover:bg-slate-100"
                        data-testid="button-browse-templates"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Browse Templates
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Prompt */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    🎨 Unlock Advanced Page Builder
                  </div>
                  <p className="text-slate-300 mb-4">
                    Get drag-and-drop layouts, custom CSS, image uploads, and professional templates
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-slate-800/50 p-3 rounded">
                      <div className="font-medium text-white">✓ Unlimited Pages</div>
                      <div className="text-slate-400">Create as many as you need</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <div className="font-medium text-white">✓ Custom CSS</div>
                      <div className="text-slate-400">Advanced styling control</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <div className="font-medium text-white">✓ Image Upload</div>
                      <div className="text-slate-400">Your logos and photos</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <div className="font-medium text-white">✓ Pro Templates</div>
                      <div className="text-slate-400">Professional designs</div>
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
                    data-testid="button-upgrade-advanced"
                  >
                    Upgrade to Pro - $39/month
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}