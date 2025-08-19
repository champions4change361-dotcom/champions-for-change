import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, Briefcase, Minimize, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { KeystoneAvatar } from '@/components/KeystoneAvatar';

interface AvatarPreferences {
  avatarEnabled: boolean;
  avatarStyle: 'professional_coach' | 'friendly_advisor' | 'minimalist_icon' | 'sports_mascot';
  hasCompletedOnboarding: boolean;
}

const avatarStyles = [
  {
    id: 'professional_coach',
    name: 'Professional Coach',
    description: 'Formal, educational tone perfect for school districts',
    icon: Briefcase,
    preview: '🏫',
    domain: 'Education'
  },
  {
    id: 'friendly_advisor',
    name: 'Friendly Advisor',
    description: 'Helpful and approachable for business users',
    icon: Users,
    preview: '🤝',
    domain: 'Business'
  },
  {
    id: 'sports_mascot',
    name: 'Sports Mascot',
    description: 'Fun and energetic for tournament communities',
    icon: Trophy,
    preview: '🏆',
    domain: 'Community'
  },
  {
    id: 'keystone_coach',
    name: 'Keystone Coach',
    description: 'Mission-focused AI coach for Champions for Change',
    icon: Trophy,
    preview: '🔑',
    domain: 'Champions'
  },
  {
    id: 'minimalist_icon',
    name: 'Minimalist',
    description: 'Clean, simple interface without personality',
    icon: Minimize,
    preview: '⚡',
    domain: 'Minimal'
  }
];

export function AIAvatarSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Partial<AvatarPreferences>>({});

  const { data: preferences, isLoading } = useQuery<AvatarPreferences>({
    queryKey: ['/api/ai/avatar-preferences'],
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<AvatarPreferences>) => {
      return apiRequest('POST', '/api/ai/avatar-preferences', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/avatar-preferences'] });
      setPendingChanges({});
      toast({
        title: "Preferences Updated",
        description: "Your AI avatar settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleAvatar = (enabled: boolean) => {
    const changes = { ...pendingChanges, avatarEnabled: enabled };
    setPendingChanges(changes);
  };

  const handleStyleChange = (style: string) => {
    const changes = { 
      ...pendingChanges, 
      avatarStyle: style as AvatarPreferences['avatarStyle'] 
    };
    setPendingChanges(changes);
  };

  const handleSave = () => {
    if (Object.keys(pendingChanges).length > 0) {
      updatePreferences.mutate(pendingChanges);
    }
  };

  const currentPrefs = { ...preferences, ...pendingChanges };
  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (isLoading) {
    return (
      <Card data-testid="avatar-settings-loading">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="ai-avatar-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Keystone AI Avatar Settings
        </CardTitle>
        <CardDescription>
          Customize how Keystone AI appears and interacts with you during tournament setup and guidance.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="avatar-enabled" className="text-base font-medium">
              Enable AI Avatar
            </Label>
            <p className="text-sm text-gray-600">
              Show a visual representation and personality for Keystone AI
            </p>
          </div>
          <Switch
            id="avatar-enabled"
            checked={currentPrefs?.avatarEnabled ?? false}
            onCheckedChange={handleToggleAvatar}
            data-testid="switch-avatar-enabled"
          />
        </div>

        {/* Avatar Style Selection */}
        {currentPrefs?.avatarEnabled && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Avatar Style</Label>
              <p className="text-sm text-gray-600">
                Choose the personality and tone that works best for your environment
              </p>
            </div>

            <RadioGroup
              value={currentPrefs?.avatarStyle || 'professional_coach'}
              onValueChange={handleStyleChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {avatarStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <div key={style.id} className="relative">
                    <RadioGroupItem
                      value={style.id}
                      id={style.id}
                      className="peer sr-only"
                      data-testid={`radio-avatar-${style.id}`}
                    />
                    <Label
                      htmlFor={style.id}
                      className="flex flex-col p-4 border-2 border-gray-200 rounded-lg cursor-pointer 
                               hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50
                               transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{style.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{style.preview}</span>
                          <Badge variant="secondary" className="text-xs">
                            {style.domain}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        {style.description}
                      </p>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {/* Avatar Preview */}
        {currentPrefs?.avatarEnabled && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <KeystoneAvatar 
                    state="idle" 
                    size="large" 
                    domain={
                      currentPrefs.avatarStyle === 'professional_coach' ? 'education' :
                      currentPrefs.avatarStyle === 'friendly_advisor' ? 'business' :
                      currentPrefs.avatarStyle === 'sports_mascot' ? 'coaches' :
                      'education'
                    }
                  />
                </div>
                <div className="text-sm text-blue-800">
                  {currentPrefs.avatarStyle === 'professional_coach' && 
                    "Good morning. I'm here to assist you with your tournament management needs. How may I help you today?"}
                  {currentPrefs.avatarStyle === 'friendly_advisor' && 
                    "Hi there! I'm Keystone AI, your tournament assistant. Ready to create something amazing together?"}
                  {currentPrefs.avatarStyle === 'sports_mascot' && 
                    "Hey coach! Let's fire up some epic tournaments and get this competition rolling! What's the game plan?"}
                  {(currentPrefs?.avatarStyle as string) === 'keystone_coach' && 
                    "Ready to create opportunities for students! I'm Keystone AI, here to help Champions for Change build amazing tournaments that fund educational dreams."}
                  {currentPrefs.avatarStyle === 'minimalist_icon' && 
                    "Tournament assistance available. How can I help?"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              data-testid="button-save-avatar-preferences"
            >
              {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Domain Recommendations */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-sm">
              <div className="font-medium mb-2">Domain Recommendations:</div>
              <div className="space-y-1 text-gray-600">
                <div>🏫 <strong>Education</strong>: Professional Coach (districts prefer formal interfaces)</div>
                <div>💼 <strong>Business</strong>: Friendly Advisor (helpful guidance for professionals)</div>
                <div>🎮 <strong>Community</strong>: Sports Mascot (fun personality for gaming platforms)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}