import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Grid, 
  Settings, 
  Brain, 
  BarChart3,
  ArrowRight,
  Trophy,
  Zap,
  CheckCircle,
  X,
  Play
} from 'lucide-react';

interface CompetitorComparison {
  competitor: string;
  problems: string[];
  limitations: string[];
  color: string;
}

interface OurAdvantage {
  title: string;
  description: string;
  icon: any;
  demoId: string;
  benefit: string;
}

const competitorProblems: CompetitorComparison[] = [
  {
    competitor: 'Challonge',
    problems: [
      'Random bracket seeding creates unfair matchups',
      'Only single-elimination format available',
      'Basic tournament management with no customization',
      'No analytics or contact collection',
      'Limited branding options'
    ],
    limitations: [
      'No smart seeding algorithm',
      'Single format only',
      'Basic free/premium tiers',
      'No growth path for organizers'
    ],
    color: 'red'
  },
  {
    competitor: 'Jersey Watch',
    problems: [
      'Team management only - no tournament hosting',
      'Limited tournament features',
      'High per-tournament costs ($50+ each)',
      'No professional tournament formats',
      'Basic communication tools'
    ],
    limitations: [
      'Team-focused only',
      'Expensive tournament add-ons',
      'No tournament business tools',
      'Limited customization'
    ],
    color: 'orange'
  },
  {
    competitor: 'Other Platforms',
    problems: [
      'Feature restrictions based on price tiers',
      'Forced into single building approach',
      'Generic AI/help with no context',
      'High enterprise pricing for basic features',
      'Complex setup processes'
    ],
    limitations: [
      'Pay more for basic features',
      'No flexibility in approach',
      'Generic support systems',
      'High barrier to entry'
    ],
    color: 'gray'
  }
];

const ourAdvantages: OurAdvantage[] = [
  {
    title: 'Smart Seeding Algorithm',
    description: 'Skill-based placement creates fair, competitive tournaments vs random brackets',
    icon: Target,
    demoId: 'smart-seeding',
    benefit: 'Better tournaments, happier participants, professional structure'
  },
  {
    title: '6 Tournament Formats',
    description: 'Professional formats for every sport and event type vs basic single-elimination',
    icon: Grid,
    demoId: 'tournament-formats',
    benefit: 'Perfect format for your specific needs and sport requirements'
  },
  {
    title: 'Growth Path Flexibility',
    description: 'Choose your complexity: Module-based OR White-label building approach',
    icon: Settings,
    demoId: 'building-choice',
    benefit: 'Start simple, grow advanced - no platform switching needed'
  },
  {
    title: 'AI Database Integration',
    description: 'Smart help that learns from YOUR tournament history, not generic responses',
    icon: Brain,
    demoId: 'ai-assistance',
    benefit: 'Contextual guidance that improves with every tournament'
  },
  {
    title: 'Professional Analytics',
    description: 'Track contacts, growth, and optimize your tournament business',
    icon: BarChart3,
    demoId: 'organizer-analytics',
    benefit: 'Data-driven decisions to grow your tournament business'
  }
];

interface ValueDiscoveryOverviewProps {
  selectedPlan?: string;
  onStartFlow?: () => void;
  onSkipToTrial?: () => void;
}

export default function ValueDiscoveryOverview({ 
  selectedPlan = 'monthly', 
  onStartFlow, 
  onSkipToTrial 
}: ValueDiscoveryOverviewProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('Challonge');

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'supporter': return 'Champions for Change Supporter';
      case 'supporter-basic': return 'Basic Supporter';
      case 'elite': return 'Elite Program';
      case 'annual': return 'Annual Tournament Organizer';
      case 'monthly': return 'Multi-Tournament Organizer';
      default: return 'Tournament Platform';
    }
  };

  const selectedCompetitorData = competitorProblems.find(c => c.competitor === selectedCompetitor) || competitorProblems[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Why Choose Our Platform?</h1>
              <p className="text-xl text-purple-600 font-medium">{getPlanName(selectedPlan)} Features</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700">
              See exactly why tournament organizers are switching from Challonge, Jersey Watch, 
              and other platforms to our <strong>professional-grade tournament management system</strong>.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button 
              onClick={onStartFlow}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
              data-testid="button-start-discovery"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Feature Tour (3 minutes)
            </Button>
            <Button 
              variant="outline"
              onClick={onSkipToTrial}
              size="lg"
              data-testid="button-skip-to-trial"
            >
              Skip to Trial Signup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Problem/Solution Showcase */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Competitor Problems */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              What's Wrong with Current Options?
            </h2>
            
            <div className="flex justify-center space-x-2 mb-6">
              {competitorProblems.map((comp) => (
                <Button
                  key={comp.competitor}
                  variant={selectedCompetitor === comp.competitor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCompetitor(comp.competitor)}
                  className={selectedCompetitor === comp.competitor ? 'bg-red-600 hover:bg-red-700' : ''}
                  data-testid={`button-competitor-${comp.competitor.toLowerCase()}`}
                >
                  {comp.competitor}
                </Button>
              ))}
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  {selectedCompetitorData.competitor} Problems
                </CardTitle>
                <CardDescription className="text-red-600">
                  Real issues tournament organizers face
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedCompetitorData.problems.map((problem, idx) => (
                    <li key={idx} className="flex items-start text-red-700">
                      <X className="h-4 w-4 mr-3 mt-0.5 text-red-500" />
                      <span className="text-sm">{problem}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Bottom Line:</h4>
                  <p className="text-sm text-red-700">
                    {selectedCompetitorData.competitor === 'Challonge' && 'Great for casual brackets, but lacks professional tournament management features.'}
                    {selectedCompetitorData.competitor === 'Jersey Watch' && 'Excellent for team management, but expensive and limited for tournament hosting.'}
                    {selectedCompetitorData.competitor === 'Other Platforms' && 'Enterprise features locked behind high price tiers with no flexibility.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Our Solutions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Our Professional Solutions
            </h2>
            
            <div className="space-y-4">
              {ourAdvantages.map((advantage, idx) => {
                const IconComponent = advantage.icon;
                return (
                  <Card key={advantage.demoId} className="border-green-200 bg-green-50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <IconComponent className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-900 mb-1">{advantage.title}</h3>
                          <p className="text-sm text-green-700 mb-2">{advantage.description}</p>
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>{advantage.benefit}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Our Philosophy:</h4>
              <p className="text-sm text-green-700">
                <strong>Enterprise features for everyone.</strong> No feature restrictions based on price. 
                Small tournaments get the same professional tools as large enterprises.
              </p>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold mb-4">The Complete Tournament Solution</h2>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-lg mb-3">
                    <Target className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">vs Challonge</h3>
                  <p className="text-sm opacity-90">Everything they offer + smart seeding + professional formats</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-lg mb-3">
                    <Trophy className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">vs Jersey Watch</h3>
                  <p className="text-sm opacity-90">All team features + tournament hosting at better prices</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-lg mb-3">
                    <Zap className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">vs Enterprise Platforms</h3>
                  <p className="text-sm opacity-90">Enterprise features without enterprise pricing</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <Button 
                  onClick={onStartFlow}
                  variant="secondary"
                  size="lg"
                  className="text-blue-600 hover:text-blue-700"
                  data-testid="bottom-start-tour"
                >
                  <Play className="h-4 w-4 mr-2" />
                  See It in Action
                </Button>
                <Button 
                  variant="outline"
                  onClick={onSkipToTrial}
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                  data-testid="bottom-start-trial"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}