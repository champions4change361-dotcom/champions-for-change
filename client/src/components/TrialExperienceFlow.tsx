import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Play, 
  Target,
  Grid,
  Settings,
  Brain,
  BarChart3,
  Trophy,
  Star
} from 'lucide-react';

// Import our demo components
import SmartSeedingDemo from '@/components/SmartSeedingDemo';
import TournamentFormatShowcase from '@/components/TournamentFormatShowcase';
import BuildingChoiceDemo from '@/components/BuildingChoiceDemo';

interface TrialFlowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  component: any;
  forPlans: string[];
  competitorComparison: string;
  valueProposition: string;
}

const trialFlowSteps: TrialFlowStep[] = [
  {
    id: 'smart-seeding',
    title: 'Smart Seeding Algorithm',
    description: 'See how skill-based seeding creates better tournaments than random brackets',
    icon: Target,
    component: SmartSeedingDemo,
    forPlans: ['all'],
    competitorComparison: 'Challonge uses random placement',
    valueProposition: 'Professional tournament structure with fair matchups'
  },
  {
    id: 'tournament-formats',
    title: 'Professional Tournament Formats',
    description: 'Explore 6 different tournament formats vs basic single-elimination',
    icon: Grid,
    component: TournamentFormatShowcase,
    forPlans: ['all'],
    competitorComparison: 'Most competitors offer only single-elimination',
    valueProposition: '6 formats for every type of event and sport'
  },
  {
    id: 'building-choice',
    title: 'Module vs White-Label Choice',
    description: 'Choose your building style and upgrade when ready',
    icon: Settings,
    component: BuildingChoiceDemo,
    forPlans: ['monthly', 'annual'],
    competitorComparison: 'Competitors force one building approach',
    valueProposition: 'Start simple, grow advanced - complete flexibility'
  },
  {
    id: 'ai-assistance',
    title: 'AI Database Integration',
    description: 'Smart help that learns from your tournament history',
    icon: Brain,
    component: null, // Will redirect to AIDemo
    forPlans: ['all'],
    competitorComparison: 'Generic chatbots with no context',
    valueProposition: 'Contextual AI that knows your specific needs'
  },
  {
    id: 'organizer-analytics',
    title: 'Tournament Analytics Dashboard',
    description: 'Track contacts, page views, and grow your tournaments',
    icon: BarChart3,
    component: null, // Will redirect to OrganizerAnalyticsDemo
    forPlans: ['monthly', 'annual'],
    competitorComparison: 'Basic stats or no analytics at all',
    valueProposition: 'Professional analytics for tournament growth'
  }
];

interface TrialExperienceFlowProps {
  selectedPlan?: string;
  onComplete?: () => void;
  onStartTrial?: () => void;
}

export default function TrialExperienceFlow({ 
  selectedPlan = 'monthly', 
  onComplete, 
  onStartTrial 
}: TrialExperienceFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Filter steps based on selected plan
  const relevantSteps = trialFlowSteps.filter(step => 
    step.forPlans.includes('all') || step.forPlans.includes(selectedPlan)
  );

  const currentStepData = relevantSteps[currentStep];
  const progress = ((currentStep) / relevantSteps.length) * 100;
  const isLastStep = currentStep === relevantSteps.length - 1;

  const handleNext = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStepData.id)) {
      setCompletedSteps([...completedSteps, currentStepData.id]);
    }

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToDemo = (stepId: string) => {
    const stepIndex = relevantSteps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'starter': return 'Starter Team';
      case 'growing': return 'Growing Team';
      case 'elite': return 'Elite Program';
      case 'annual': return 'Annual Tournament Organizer';
      case 'monthly': return 'Multi-Tournament Organizer';
      default: return 'Tournament Platform';
    }
  };

  // If it's a redirect step (AI or Analytics), show navigation card
  if (!currentStepData.component) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Progress */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Trial Experience</h1>
                <p className="text-purple-600 font-medium">{getPlanName(selectedPlan)} Features</p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">
                Step {currentStep + 1} of {relevantSteps.length}
              </p>
            </div>
          </div>

          {/* Redirect Card */}
          <Card className="border-blue-200 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <currentStepData.icon className="h-6 w-6 mr-3 text-blue-600" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">❌ Competitors:</h4>
                  <p className="text-sm text-red-700">{currentStepData.competitorComparison}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">✅ Your Platform:</h4>
                  <p className="text-sm text-green-700">{currentStepData.valueProposition}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  data-testid="button-previous-step"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStepData.id === 'ai-assistance' && (
                  <Button 
                    onClick={() => window.open('/ai-demo', '_blank')}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-ai-demo"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try AI Demo
                  </Button>
                )}
                
                {currentStepData.id === 'organizer-analytics' && (
                  <Button 
                    onClick={() => window.open('/organizer-analytics', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-analytics-demo"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try Analytics Demo
                  </Button>
                )}
                
                <Button 
                  onClick={handleNext}
                  data-testid="button-next-step"
                >
                  {isLastStep ? 'Complete Experience' : 'Next Step'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const CurrentComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Fixed Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Trial Experience</h1>
                  <p className="text-sm text-purple-600">{getPlanName(selectedPlan)}</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                {relevantSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                      index === currentStep 
                        ? 'bg-blue-100 text-blue-800' 
                        : completedSteps.includes(step.id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    } cursor-pointer hover:opacity-80`}
                    onClick={() => handleSkipToDemo(step.id)}
                    data-testid={`nav-${step.id}`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <step.icon className="h-3 w-3" />
                    )}
                    <span>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Progress value={progress} className="w-32 h-2" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {currentStep + 1} of {relevantSteps.length}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  data-testid="header-button-previous"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm"
                  onClick={handleNext}
                  data-testid="header-button-next"
                >
                  {isLastStep ? 'Complete' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Competitive Context Bar */}
          <div className="mt-4 bg-gradient-to-r from-red-50 to-green-50 p-3 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌ Competitors:</span>
                <span className="text-red-700">{currentStepData.competitorComparison}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅ Your Platform:</span>
                <span className="text-green-700">{currentStepData.valueProposition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Component */}
      <div className="pt-8">
        <CurrentComponent />
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs">
              <currentStepData.icon className="h-3 w-3 mr-1" />
              {currentStepData.title}
            </Badge>
            <span className="text-sm text-gray-600">
              {currentStepData.description}
            </span>
          </div>
          
          <div className="flex space-x-3">
            {isLastStep && (
              <Button 
                onClick={onStartTrial}
                className="bg-green-600 hover:bg-green-700"
                data-testid="bottom-start-trial"
              >
                <Star className="h-4 w-4 mr-2" />
                Start Your 14-Day Trial
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              variant={isLastStep ? 'outline' : 'default'}
              data-testid="bottom-next-step"
            >
              {isLastStep ? 'Complete Experience' : 'Continue Experience'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}