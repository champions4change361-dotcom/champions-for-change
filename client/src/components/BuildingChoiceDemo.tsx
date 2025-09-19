import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Blocks, 
  Code, 
  Palette, 
  Zap, 
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Settings,
  Globe,
  Paintbrush,
  Download,
  Trophy
} from 'lucide-react';

interface BuildingOption {
  id: 'module' | 'whitelabel';
  name: string;
  icon: any;
  tagline: string;
  description: string;
  difficulty: 'Easy' | 'Advanced';
  timeToSetup: string;
  bestFor: string[];
  features: {
    name: string;
    available: boolean;
    description?: string;
  }[];
  pros: string[];
  examples: string[];
}

const buildingOptions: BuildingOption[] = [
  {
    id: 'module',
    name: 'Module-Based Builder',
    icon: Blocks,
    tagline: 'Start simple, build professional',
    description: 'Drag-and-drop modules to create beautiful tournament websites. Perfect for getting started quickly.',
    difficulty: 'Easy',
    timeToSetup: '15-30 minutes',
    bestFor: ['First-time organizers', 'Quick setup needed', 'Focus on tournament, not tech'],
    features: [
      { name: 'Pre-built modules', available: true, description: 'Registration, brackets, standings' },
      { name: 'Drag & drop editor', available: true, description: 'Visual website building' },
      { name: 'Professional templates', available: true, description: '20+ tournament designs' },
      { name: 'Mobile responsive', available: true, description: 'Works on all devices' },
      { name: 'Custom branding', available: true, description: 'Logo, colors, fonts' },
      { name: 'SSL certificate', available: true, description: 'Secure HTTPS automatically' },
      { name: 'Custom code editing', available: false },
      { name: 'API access', available: false },
      { name: 'Custom domains', available: false },
      { name: 'Complete white-label', available: false }
    ],
    pros: [
      'Get started in minutes',
      'No technical knowledge needed',
      'Professional results guaranteed',
      'Built-in tournament features',
      'Always works perfectly'
    ],
    examples: [
      'Youth basketball tournament',
      'Local chess championship',
      'Community softball league',
      'School esports tournament'
    ]
  },
  {
    id: 'whitelabel',
    name: 'White-Label Platform',
    icon: Code,
    tagline: 'Complete control, unlimited possibilities',
    description: 'Full customization with your branding. API access, custom domains, and complete control over the experience.',
    difficulty: 'Advanced',
    timeToSetup: '1-3 hours',
    bestFor: ['Tournament businesses', 'Custom requirements', 'Brand control needed'],
    features: [
      { name: 'Everything from Module Builder', available: true, description: 'All basic features included' },
      { name: 'Custom domains', available: true, description: 'tournaments.yoursite.com' },
      { name: 'Complete white-labeling', available: true, description: 'Remove all our branding' },
      { name: 'API access', available: true, description: 'Connect to your systems' },
      { name: 'Custom code injection', available: true, description: 'Add any functionality' },
      { name: 'Advanced analytics', available: true, description: 'Google Analytics, custom tracking' },
      { name: 'Database export', available: true, description: 'Full data ownership' },
      { name: 'Priority support', available: true, description: 'Direct developer access' },
      { name: 'Unlimited customization', available: true, description: 'Modify anything' },
      { name: 'Enterprise integrations', available: true, description: 'Connect to your tools' }
    ],
    pros: [
      'Complete brand control',
      'Unlimited customization',
      'Professional business tool',
      'API integrations available',
      'Your domain, your brand'
    ],
    examples: [
      'Regional tournament series',
      'Corporate event platform',
      'Multi-state championship',
      'Professional esports league'
    ]
  }
];

export default function BuildingChoiceDemo() {
  const [selectedOption, setSelectedOption] = useState<'module' | 'whitelabel'>('module');
  const [showComparison, setShowComparison] = useState(false);

  const currentOption = buildingOptions.find(opt => opt.id === selectedOption) || buildingOptions[0];
  const IconComponent = currentOption.icon;

  const renderFeatureList = (option: BuildingOption) => (
    <div className="space-y-3">
      {option.features.map((feature, idx) => (
        <div key={idx} className="flex items-start space-x-3">
          <div className="mt-0.5">
            {feature.available ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 border border-gray-300 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <div className={`font-medium text-sm ${!feature.available ? 'text-gray-400' : ''}`}>
              {feature.name}
            </div>
            {feature.description && (
              <div className={`text-xs mt-1 ${!feature.available ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMockup = (option: BuildingOption) => {
    if (option.id === 'module') {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border">
          <div className="bg-white rounded shadow-sm p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">Tournament Website Builder</div>
              <Badge className="bg-green-100 text-green-800 text-xs">Live Preview</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-100 p-2 rounded text-center text-xs">
                <Blocks className="h-4 w-4 mx-auto mb-1" />
                Registration
              </div>
              <div className="bg-green-100 p-2 rounded text-center text-xs">
                <Trophy className="h-4 w-4 mx-auto mb-1" />
                Brackets
              </div>
              <div className="bg-purple-100 p-2 rounded text-center text-xs">
                <Star className="h-4 w-4 mx-auto mb-1" />
                Results
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Drag & drop to customize
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border text-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">White-Label Dashboard</div>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Enterprise</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <Code className="h-3 w-3 mb-1" />
                Custom Code
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <Globe className="h-3 w-3 mb-1" />
                Custom Domain
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <Palette className="h-3 w-3 mb-1" />
                Full Branding
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <Download className="h-3 w-3 mb-1" />
                API Access
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              yoursite.com/tournaments
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 rounded-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Building Style</h1>
            <p className="text-lg text-gray-600">Start simple or go advanced - you decide</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-3xl mx-auto">
          <p className="text-orange-800">
            🎯 <strong>Growth Path:</strong> Tournament organizers can start with modules and upgrade to white-label when ready. 
            Team managers get modules only - perfect for their needs.
          </p>
        </div>
      </div>

      {/* Option Selector */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={selectedOption === 'module' ? 'default' : 'outline'}
          onClick={() => setSelectedOption('module')}
          className="flex items-center space-x-2"
          data-testid="button-module-builder"
        >
          <Blocks className="h-4 w-4" />
          <span>Module Builder</span>
          <Badge className="bg-green-100 text-green-800 ml-2">Easy</Badge>
        </Button>
        <Button
          variant={selectedOption === 'whitelabel' ? 'default' : 'outline'}
          onClick={() => setSelectedOption('whitelabel')}
          className="flex items-center space-x-2"
          data-testid="button-whitelabel"
        >
          <Code className="h-4 w-4" />
          <span>White-Label</span>
          <Badge className="bg-blue-100 text-blue-800 ml-2">Advanced</Badge>
        </Button>
      </div>

      {/* Selected Option Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className={`${selectedOption === 'module' ? 'border-green-200' : 'border-blue-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <IconComponent className={`h-5 w-5 mr-2 ${selectedOption === 'module' ? 'text-green-600' : 'text-blue-600'}`} />
                {currentOption.name}
              </div>
              <Badge className={selectedOption === 'module' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {currentOption.difficulty}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              {currentOption.tagline}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              {currentOption.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Setup Time:</span>
                <p className="text-gray-600">{currentOption.timeToSetup}</p>
              </div>
              <div>
                <span className="font-medium">Difficulty:</span>
                <p className="text-gray-600">{currentOption.difficulty}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Perfect For:</h4>
              <div className="space-y-2">
                {currentOption.bestFor.map((use, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {use}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Key Benefits:</h4>
              <ul className="text-sm space-y-1">
                {currentOption.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-center">
                    <Zap className="h-3 w-3 text-yellow-500 mr-2" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Preview & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderMockup(currentOption)}
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Feature Comparison</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  data-testid="button-feature-comparison"
                >
                  {showComparison ? 'Hide' : 'Show'} All Features
                </Button>
              </div>
              {showComparison ? (
                renderFeatureList(currentOption)
              ) : (
                <div className="text-sm text-gray-600">
                  Click "Show All Features" to see complete feature list
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Path */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Growth Path for Tournament Organizers
          </CardTitle>
          <CardDescription>
            Start simple, grow advanced - upgrade anytime without losing data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-2">
                <Blocks className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <div className="text-sm font-medium">Start: Module Builder</div>
              <div className="text-xs text-gray-600">Learn the platform</div>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg mb-2">
                <Users className="h-8 w-8 text-yellow-600 mx-auto" />
              </div>
              <div className="text-sm font-medium">Grow: More Events</div>
              <div className="text-xs text-gray-600">Build confidence</div>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-2">
                <Code className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <div className="text-sm font-medium">Advance: White-Label</div>
              <div className="text-xs text-gray-600">Full customization</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 mb-4">
              <strong>Team managers get modules</strong> (perfect for their needs) • 
              <strong> Tournament organizers get both</strong> (growth path available)
            </p>
            <div className="flex justify-center space-x-4">
              {currentOption.examples.map((example, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Ready to Build Your Tournament Platform?</h3>
          <p className="text-lg mb-6 opacity-90">
            Choose your style, start building, upgrade anytime - complete flexibility
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-orange-600 hover:text-orange-700"
            data-testid="button-start-trial-building"
          >
            Start Your 14-Day Free Trial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}