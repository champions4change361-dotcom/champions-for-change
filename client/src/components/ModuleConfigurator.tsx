import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, Users, Trophy, Calendar, Info, Phone, 
  Palette, Upload, X, Plus, Trash2, Eye, Settings 
} from "lucide-react";
import FormBuilder from "@/components/FormBuilder";
import RegistrationPreview from "@/components/RegistrationPreview";

interface ModuleConfig {
  id: string;
  type: string;
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

interface ModuleConfiguratorProps {
  module: ModuleConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedModule: ModuleConfig) => void;
}

export default function ModuleConfigurator({ module, isOpen, onClose, onSave }: ModuleConfiguratorProps) {
  const [localModule, setLocalModule] = useState<ModuleConfig>(module);

  const updateConfig = (key: string, value: any) => {
    setLocalModule(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const updateStyling = (key: string, value: any) => {
    setLocalModule(prev => ({
      ...prev,
      styling: { ...prev.styling, [key]: value }
    }));
  };

  const updateBackgroundStyling = (key: string, value: any) => {
    setLocalModule(prev => ({
      ...prev,
      styling: { 
        ...prev.styling, 
        background: { ...prev.styling.background, [key]: value }
      }
    }));
  };

  const handleSave = () => {
    onSave(localModule);
    onClose();
  };

  const renderRegistrationConfig = () => (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings" className="space-y-6 mt-6">
        {/* Basic Registration Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Registration Title</label>
            <Input
              value={localModule.config.title || ""}
              onChange={(e) => updateConfig('title', e.target.value)}
              placeholder="Hoops for History Capital Classic 12u"
              data-testid="input-registration-title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tournament Description</label>
            <Textarea
              value={localModule.config.description || ""}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Join us for an exciting basketball tournament supporting youth education. All proceeds go toward funding educational trips for underprivileged students."
              className="min-h-[100px]"
              data-testid="textarea-registration-description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Registration Fee ($)</label>
              <Input
                type="number"
                value={localModule.config.registrationFee || 0}
                onChange={(e) => updateConfig('registrationFee', parseFloat(e.target.value) || 0)}
                data-testid="input-registration-fee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Participants</label>
              <Input
                type="number"
                value={localModule.config.maxParticipants || 32}
                onChange={(e) => updateConfig('maxParticipants', parseInt(e.target.value) || 32)}
                data-testid="input-max-participants"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Registration Deadline</label>
            <Input
              type="datetime-local"
              value={localModule.config.registrationDeadline || ""}
              onChange={(e) => updateConfig('registrationDeadline', e.target.value)}
              data-testid="input-registration-deadline"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localModule.config.requiresApproval || false}
              onChange={(e) => updateConfig('requiresApproval', e.target.checked)}
              className="rounded"
              data-testid="checkbox-requires-approval"
            />
            <label className="text-sm">Require manual approval for registrations</label>
          </div>
        </div>

        {/* Form Builder */}
        <div className="border-t pt-6">
          <FormBuilder
            moduleId={localModule.id}
            initialFields={localModule.config.formFields || []}
            onChange={(fields) => updateConfig('formFields', fields)}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="preview" className="mt-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Registration Page Preview</h3>
            <p className="text-sm text-gray-500">This is how participants will see your registration</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm max-h-[600px] overflow-y-auto">
            <RegistrationPreview 
              config={{
                title: localModule.config.title || "Tournament Registration",
                description: localModule.config.description || "",
                registrationFee: localModule.config.registrationFee || 0,
                maxParticipants: localModule.config.maxParticipants || 32,
                registrationDeadline: localModule.config.registrationDeadline || "",
                requiresApproval: localModule.config.requiresApproval || false,
                formFields: localModule.config.formFields || []
              }}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderDonationConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Donation Title</label>
        <Input
          value={localModule.config.title || ""}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Support Our Cause"
          data-testid="input-donation-title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={localModule.config.description || ""}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Help us raise funds for our mission"
          data-testid="textarea-donation-description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Goal Amount ($)</label>
        <Input
          type="number"
          value={localModule.config.goalAmount || 1000}
          onChange={(e) => updateConfig('goalAmount', parseFloat(e.target.value) || 1000)}
          data-testid="input-goal-amount"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={localModule.config.showProgress || true}
          onChange={(e) => updateConfig('showProgress', e.target.checked)}
          className="rounded"
          data-testid="checkbox-show-progress"
        />
        <label className="text-sm">Show progress bar</label>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Suggested Amounts</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(localModule.config.suggestedAmounts || []).map((amount: number, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>${amount}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const newAmounts = [...(localModule.config.suggestedAmounts || [])];
                  newAmounts.splice(index, 1);
                  updateConfig('suggestedAmounts', newAmounts);
                }}
              />
            </Badge>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="25"
            className="w-24"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt((e.target as HTMLInputElement).value);
                if (value > 0) {
                  const newAmounts = [...(localModule.config.suggestedAmounts || []), value];
                  updateConfig('suggestedAmounts', newAmounts.sort((a, b) => a - b));
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
            data-testid="input-suggested-amount"
          />
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSponsorsConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <Input
          value={localModule.config.title || ""}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Our Sponsors"
          data-testid="input-sponsors-title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={localModule.config.description || ""}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Thanks to our amazing sponsors"
          data-testid="textarea-sponsors-description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Layout Style</label>
        <Select
          value={localModule.config.layoutStyle || 'grid'}
          onValueChange={(value) => updateConfig('layoutStyle', value)}
        >
          <SelectTrigger data-testid="select-layout-style">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid Layout</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="list">List View</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Sponsor Logos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Upload sponsor logos (coming soon)</p>
        </div>
      </div>
    </div>
  );

  const renderInfoConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Info Title</label>
        <Input
          value={localModule.config.title || ""}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Important Information"
          data-testid="input-info-title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <Textarea
          value={localModule.config.content || ""}
          onChange={(e) => updateConfig('content', e.target.value)}
          placeholder="Add your custom content here..."
          className="min-h-[120px]"
          data-testid="textarea-info-content"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={localModule.config.showTitle !== false}
          onChange={(e) => updateConfig('showTitle', e.target.checked)}
          className="rounded"
          data-testid="checkbox-show-title"
        />
        <label className="text-sm">Show title</label>
      </div>
    </div>
  );

  const renderStylesConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Background</label>
        <div className="space-y-3">
          <Select
            value={localModule.styling.background?.type || 'color'}
            onValueChange={(value) => updateBackgroundStyling('type', value as 'color' | 'gradient' | 'image')}
          >
            <SelectTrigger data-testid="select-background-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
          
          {localModule.styling.background?.type === 'color' && (
            <Input
              type="color"
              value={localModule.styling.background.value || '#ffffff'}
              onChange={(e) => updateBackgroundStyling('value', e.target.value)}
              data-testid="input-background-color"
            />
          )}
          
          {localModule.styling.background?.type === 'gradient' && (
            <Input
              value={localModule.styling.background.value || 'linear-gradient(to right, #3b82f6, #8b5cf6)'}
              onChange={(e) => updateBackgroundStyling('value', e.target.value)}
              placeholder="linear-gradient(to right, #3b82f6, #8b5cf6)"
              data-testid="input-background-gradient"
            />
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <Input
          type="color"
          value={localModule.styling.textColor || '#000000'}
          onChange={(e) => updateStyling('textColor', e.target.value)}
          data-testid="input-text-color"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Border Radius</label>
          <Input
            type="number"
            value={localModule.styling.borderRadius || 8}
            onChange={(e) => updateStyling('borderRadius', parseInt(e.target.value) || 8)}
            data-testid="input-border-radius"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Padding</label>
          <Input
            type="number"
            value={localModule.styling.padding || 16}
            onChange={(e) => updateStyling('padding', parseInt(e.target.value) || 16)}
            data-testid="input-padding"
          />
        </div>
      </div>
    </div>
  );

  const renderModuleConfig = () => {
    switch (localModule.type) {
      case 'registration':
        return renderRegistrationConfig();
      case 'donation':
        return renderDonationConfig();
      case 'sponsors':
        return renderSponsorsConfig();
      case 'info':
        return renderInfoConfig();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p>Configuration options coming soon for {localModule.type} modules</p>
          </div>
        );
    }
  };

  const getModuleIcon = () => {
    const iconMap = {
      registration: Users,
      donation: Heart,
      sponsors: Trophy,
      schedule: Calendar,
      info: Info,
      contact: Phone
    };
    return iconMap[localModule.type as keyof typeof iconMap] || Info;
  };

  const ModuleIcon = getModuleIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ModuleIcon className="h-5 w-5" />
            <span>Configure {localModule.type} Module</span>
          </DialogTitle>
          <DialogDescription>
            Customize the content and appearance of your module
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Module Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {renderModuleConfig()}
            </CardContent>
          </Card>
          
          {/* Styling Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Style Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStylesConfig()}
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-config">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-config">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}