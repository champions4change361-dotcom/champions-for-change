import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shuffle, 
  Target, 
  Users, 
  Zap, 
  Trophy,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface Participant {
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating: number;
}

const demoParticipants: Participant[] = [
  { name: 'Alex "The Ace" Johnson', skillLevel: 'expert', rating: 950 },
  { name: 'Jordan Smith', skillLevel: 'intermediate', rating: 600 },
  { name: 'Casey Wong', skillLevel: 'beginner', rating: 200 },
  { name: 'Taylor "Thunder" Davis', skillLevel: 'advanced', rating: 800 },
  { name: 'Morgan Lee', skillLevel: 'beginner', rating: 150 },
  { name: 'Riley "Rocket" Brown', skillLevel: 'expert', rating: 920 },
  { name: 'Avery Wilson', skillLevel: 'intermediate', rating: 550 },
  { name: 'Cameron Martinez', skillLevel: 'advanced', rating: 750 }
];

const getSkillColor = (skillLevel: string) => {
  switch (skillLevel) {
    case 'expert': return 'bg-red-100 text-red-800 border-red-200';
    case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function SmartSeedingDemo() {
  const [currentDemo, setCurrentDemo] = useState<'random' | 'smart' | 'comparison'>('comparison');
  const [isAnimating, setIsAnimating] = useState(false);

  // Random seeding (Challonge style)
  const randomSeeded = [...demoParticipants].sort(() => Math.random() - 0.5);
  
  // Smart seeding (Our platform)
  const smartSeeded = [...demoParticipants].sort((a, b) => b.rating - a.rating);

  const runAnimation = async (type: 'random' | 'smart') => {
    setIsAnimating(true);
    setCurrentDemo(type);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnimating(false);
  };

  const getMatchupQuality = (p1: Participant, p2: Participant): 'excellent' | 'good' | 'poor' => {
    const ratingDiff = Math.abs(p1.rating - p2.rating);
    if (ratingDiff <= 150) return 'excellent';
    if (ratingDiff <= 400) return 'good';
    return 'poor';
  };

  const renderBracket = (participants: Participant[], title: string, type: 'random' | 'smart') => {
    const pairs = [];
    for (let i = 0; i < participants.length; i += 2) {
      pairs.push([participants[i], participants[i + 1]]);
    }

    return (
      <Card className={`${type === 'smart' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {type === 'smart' ? (
                <Target className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <Shuffle className="h-5 w-5 text-red-600 mr-2" />
              )}
              {title}
            </span>
            <Badge variant={type === 'smart' ? 'default' : 'destructive'} className="text-xs">
              {type === 'smart' ? 'Professional' : 'Basic'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {type === 'smart' 
              ? 'Skill-based seeding ensures competitive matches and fair advancement'
              : 'Random placement can create unfair matchups and early eliminations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pairs.map((pair, idx) => {
              const quality = getMatchupQuality(pair[0], pair[1]);
              return (
                <div key={idx} className="bg-white rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Round 1, Match {idx + 1}</span>
                    <div className="flex items-center">
                      {quality === 'excellent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {quality === 'good' && <div className="h-4 w-4 bg-yellow-400 rounded-full" />}
                      {quality === 'poor' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className={`text-xs ml-1 ${
                        quality === 'excellent' ? 'text-green-600' : 
                        quality === 'good' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {quality}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{pair[0].name}</span>
                        <Badge className={`ml-2 text-xs ${getSkillColor(pair[0].skillLevel)}`}>
                          {pair[0].skillLevel} ({pair[0].rating})
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Seed #{participants.indexOf(pair[0]) + 1}</div>
                    </div>
                    <div className="px-3">
                      <span className="text-gray-400">vs</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-end">
                        <Badge className={`mr-2 text-xs ${getSkillColor(pair[1].skillLevel)}`}>
                          {pair[1].skillLevel} ({pair[1].rating})
                        </Badge>
                        <span className="font-medium text-sm">{pair[1].name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">Seed #{participants.indexOf(pair[1]) + 1}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">Smart Seeding Algorithm</h1>
            <p className="text-lg text-gray-600">Professional tournament management vs basic brackets</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">Challonge</div>
            <div className="text-sm text-gray-500">Random placement</div>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">Your Platform</div>
            <div className="text-sm text-gray-500">Smart seeding</div>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Interactive Demo: 8-Player Basketball Tournament
          </CardTitle>
          <CardDescription>
            See how seeding affects tournament quality and fairness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={() => runAnimation('random')}
              variant={currentDemo === 'random' ? 'default' : 'outline'}
              className="flex items-center"
              disabled={isAnimating}
              data-testid="button-random-seeding"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              {isAnimating && currentDemo === 'random' ? 'Generating...' : 'Random Seeding'}
            </Button>
            <Button
              onClick={() => runAnimation('smart')}
              variant={currentDemo === 'smart' ? 'default' : 'outline'}
              className="flex items-center"
              disabled={isAnimating}
              data-testid="button-smart-seeding"
            >
              <Target className="h-4 w-4 mr-2" />
              {isAnimating && currentDemo === 'smart' ? 'Generating...' : 'Smart Seeding'}
            </Button>
            <Button
              onClick={() => setCurrentDemo('comparison')}
              variant={currentDemo === 'comparison' ? 'default' : 'outline'}
              className="flex items-center"
              data-testid="button-comparison"
            >
              <Zap className="h-4 w-4 mr-2" />
              Side-by-Side
            </Button>
          </div>

          {isAnimating && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">
                {currentDemo === 'smart' ? 'Analyzing player skills and optimizing bracket...' : 'Randomly shuffling participants...'}
              </p>
            </div>
          )}

          {!isAnimating && currentDemo === 'random' && (
            <div className="space-y-4">
              {renderBracket(randomSeeded, 'Random Seeding (Challonge Style)', 'random')}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Problems with Random Seeding:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Top players might eliminate each other early</li>
                  <li>• Beginners face experts in first round</li>
                  <li>• Finals might not feature the best players</li>
                  <li>• Unfair competitive experience</li>
                </ul>
              </div>
            </div>
          )}

          {!isAnimating && currentDemo === 'smart' && (
            <div className="space-y-4">
              {renderBracket(smartSeeded, 'Smart Seeding (Professional)', 'smart')}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Benefits of Smart Seeding:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Top players separated until later rounds</li>
                  <li>• Competitive balance in every match</li>
                  <li>• Best players advance to showcase skills</li>
                  <li>• Professional tournament structure</li>
                </ul>
              </div>
            </div>
          )}

          {currentDemo === 'comparison' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {renderBracket(randomSeeded, 'Random Seeding (Challonge)', 'random')}
              {renderBracket(smartSeeded, 'Smart Seeding (Your Platform)', 'smart')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Ready for Professional Tournaments?</h3>
          <p className="text-lg mb-6 opacity-90">
            Start your 14-day trial and experience smart seeding + professional tournament management
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-blue-600 hover:text-blue-700"
            data-testid="button-start-trial-seeding"
          >
            Start Your Free Trial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}