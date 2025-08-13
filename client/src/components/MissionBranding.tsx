import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, DollarSign, Users, Cross, Trophy, Star, Palette, Type, Eye, Save } from 'lucide-react';

interface MissionBrandingProps {
  userMission?: string;
  organizationName?: string;
  onSave?: (branding: any) => void;
  mode?: 'setup' | 'edit' | 'preview';
}

export function MissionBranding({ 
  userMission = "", 
  organizationName = "", 
  onSave,
  mode = 'setup' 
}: MissionBrandingProps) {
  const [branding, setBranding] = useState({
    missionStatement: userMission,
    tagline: '',
    primaryColor: '#22c55e', // Champions green
    secondaryColor: '#3b82f6', // Blue
    logoText: organizationName,
    headerStyle: 'centered', // centered, left, banner
    missionPlacement: 'header', // header, banner, footer, hidden
    customCSS: ''
  });

  const missionTemplates = [
    {
      category: 'Educational',
      icon: <Trophy className="h-4 w-4" />,
      missions: [
        "Funding educational trips that transform young lives",
        "Supporting student athletes through tournament excellence",
        "Building character through competitive sports"
      ]
    },
    {
      category: 'Faith-Based',
      icon: <Cross className="h-4 w-4" />,
      missions: [
        "Spreading God's love through athletics",
        "Building Christian character through sports",
        "Glorifying Jesus Christ in competition"
      ]
    },
    {
      category: 'Community',
      icon: <Users className="h-4 w-4" />,
      missions: [
        "Bringing our community together through sports",
        "Creating lasting memories for local families",
        "Building stronger neighborhoods through athletics"
      ]
    },
    {
      category: 'Revenue',
      icon: <DollarSign className="h-4 w-4" />,
      missions: [
        "Generating sustainable revenue for our organization",
        "Creating profitable tournament experiences",
        "Building financial stability through sports"
      ]
    },
    {
      category: 'Excellence',
      icon: <Star className="h-4 w-4" />,
      missions: [
        "Promoting athletic excellence and sportsmanship",
        "Developing championship-level competition",
        "Inspiring greatness in every athlete"
      ]
    }
  ];

  const colorPresets = [
    { name: 'Champions Green', primary: '#22c55e', secondary: '#3b82f6' },
    { name: 'Faith Blue', primary: '#3b82f6', secondary: '#6366f1' },
    { name: 'Community Orange', primary: '#f97316', secondary: '#eab308' },
    { name: 'Excellence Purple', primary: '#8b5cf6', secondary: '#a855f7' },
    { name: 'Professional Navy', primary: '#1e40af', secondary: '#0f172a' },
    { name: 'Energetic Red', primary: '#ef4444', secondary: '#dc2626' }
  ];

  const handleSave = () => {
    if (onSave) {
      onSave(branding);
    }
  };

  // Preview component
  const PreviewHeader = () => (
    <div className="border rounded-lg p-6 mb-4" style={{ 
      borderColor: branding.primaryColor + '40',
      backgroundColor: branding.headerStyle === 'banner' ? branding.primaryColor + '10' : 'transparent'
    }}>
      <div className={`${branding.headerStyle === 'centered' ? 'text-center' : 'text-left'}`}>
        <h1 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
          {branding.logoText || organizationName}
        </h1>
        {branding.tagline && (
          <p className="text-gray-600 mt-1">{branding.tagline}</p>
        )}
        {branding.missionPlacement === 'header' && branding.missionStatement && (
          <div className="mt-3 p-3 border-l-4 italic text-gray-700" style={{ borderColor: branding.secondaryColor }}>
            "{branding.missionStatement}"
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        <PreviewHeader />
        {branding.missionPlacement === 'banner' && branding.missionStatement && (
          <div className="p-4 rounded-lg text-center" style={{ 
            backgroundColor: branding.primaryColor + '15',
            borderLeft: `4px solid ${branding.primaryColor}`
          }}>
            <p className="italic font-medium">{branding.missionStatement}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card data-testid="mission-branding-editor">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Mission & Branding Setup
        </CardTitle>
        <CardDescription>
          Customize how your mission appears on tournament pages and enterprise websites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mission" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mission">Mission</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="space-y-6">
            <div>
              <Label>Mission Statement</Label>
              <Textarea
                placeholder="Your mission and goals..."
                value={branding.missionStatement}
                onChange={(e) => setBranding(prev => ({ ...prev, missionStatement: e.target.value }))}
                rows={3}
                data-testid="textarea-mission"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear on your tournament pages and enterprise website
              </p>
            </div>

            <div>
              <Label>Quick Mission Templates</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                {missionTemplates.map((template) => (
                  <div key={template.category}>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      {template.icon}
                      {template.category}
                    </h4>
                    <div className="space-y-1">
                      {template.missions.map((mission, idx) => (
                        <button
                          key={idx}
                          onClick={() => setBranding(prev => ({ ...prev, missionStatement: mission }))}
                          className="block w-full text-left text-xs p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          data-testid={`mission-template-${template.category.toLowerCase()}-${idx}`}
                        >
                          "{mission}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Tagline (Optional)</Label>
              <Input
                placeholder="e.g., Building Champions, One Tournament at a Time"
                value={branding.tagline}
                onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                data-testid="input-tagline"
              />
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <div>
              <Label>Organization/Logo Text</Label>
              <Input
                placeholder="Organization name"
                value={branding.logoText}
                onChange={(e) => setBranding(prev => ({ ...prev, logoText: e.target.value }))}
                data-testid="input-logo-text"
              />
            </div>

            <div>
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBranding(prev => ({ 
                      ...prev, 
                      primaryColor: preset.primary, 
                      secondaryColor: preset.secondary 
                    }))}
                    className="p-3 border rounded-lg text-left hover:border-gray-400 transition-colors"
                    data-testid={`color-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <div className="text-xs font-medium">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Header Style</Label>
                <Select 
                  value={branding.headerStyle} 
                  onValueChange={(value) => setBranding(prev => ({ ...prev, headerStyle: value }))}
                >
                  <SelectTrigger data-testid="select-header-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="left">Left Aligned</SelectItem>
                    <SelectItem value="banner">Full Width Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mission Placement</Label>
                <Select 
                  value={branding.missionPlacement} 
                  onValueChange={(value) => setBranding(prev => ({ ...prev, missionPlacement: value }))}
                >
                  <SelectTrigger data-testid="select-mission-placement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">In Header</SelectItem>
                    <SelectItem value="banner">Separate Banner</SelectItem>
                    <SelectItem value="footer">In Footer</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div>
              <Label className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4" />
                Live Preview
              </Label>
              <PreviewHeader />
              
              {branding.missionPlacement === 'banner' && branding.missionStatement && (
                <div className="p-4 rounded-lg text-center" style={{ 
                  backgroundColor: branding.primaryColor + '15',
                  borderLeft: `4px solid ${branding.primaryColor}`
                }}>
                  <p className="italic font-medium">{branding.missionStatement}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Spring Basketball Tournament</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Sample tournament content would appear here with your branding applied.
                </p>
                <Badge style={{ backgroundColor: branding.secondaryColor }}>
                  Registration Open
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} className="flex items-center gap-2" data-testid="button-save-branding">
            <Save className="h-4 w-4" />
            Save Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}