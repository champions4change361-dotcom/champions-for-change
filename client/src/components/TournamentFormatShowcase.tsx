import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Users, 
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  Grid,
  Award,
  CheckCircle
} from 'lucide-react';

interface TournamentFormat {
  id: string;
  name: string;
  icon: any;
  description: string;
  bestFor: string[];
  features: string[];
  structure: string;
  timeRequired: string;
  participantRange: string;
  advantages: string[];
  realWorldExample: string;
}

const tournamentFormats: TournamentFormat[] = [
  {
    id: 'single',
    name: 'Single Elimination',
    icon: Trophy,
    description: 'Classic tournament bracket - lose once and you\'re out',
    bestFor: ['Quick tournaments', 'Limited time', 'Clear winner needed'],
    features: ['Smart seeding', 'Automatic bye handling', 'Perfect bracket structure'],
    structure: '8 teams → 4 matches → 2 matches → 1 final',
    timeRequired: 'Fast (1-2 hours)',
    participantRange: '4-64 teams',
    advantages: ['Quick completion', 'Clear progression', 'Exciting elimination'],
    realWorldExample: 'March Madness, FIFA World Cup knockout rounds'
  },
  {
    id: 'double',
    name: 'Double Elimination',
    icon: RotateCcw,
    description: 'Second chance format - must lose twice to be eliminated',
    bestFor: ['Fair competition', 'Skill-based events', 'Major tournaments'],
    features: ['Winners & losers brackets', 'Second chance system', 'True skill determination'],
    structure: 'Winners bracket + Losers bracket + Championship',
    timeRequired: 'Moderate (2-4 hours)',
    participantRange: '4-32 teams',
    advantages: ['Fairer elimination', 'Better skill assessment', 'Exciting comebacks'],
    realWorldExample: 'Fighting game tournaments, Esports championships'
  },
  {
    id: 'pool',
    name: 'Pool Play',
    icon: Grid,
    description: 'Round robin pools followed by elimination brackets',
    bestFor: ['Balanced competition', 'Team assessment', 'Multi-day events'],
    features: ['Round robin pools', 'Advancement rules', 'Tiebreaker systems'],
    structure: 'Pools (everyone plays) → Bracket (top teams advance)',
    timeRequired: 'Long (4-8 hours)',
    participantRange: '8-32 teams',
    advantages: ['Everyone plays multiple games', 'Better seeding for finals', 'Fair group stage'],
    realWorldExample: 'Olympic soccer, World Cup group stage'
  },
  {
    id: 'roundrobin',
    name: 'Round Robin',
    icon: Users,
    description: 'Everyone plays everyone - most games, fairest format',
    bestFor: ['League play', 'Skill development', 'Social tournaments'],
    features: ['Complete rotation', 'Point standings', 'Head-to-head records'],
    structure: 'Every team plays every other team once',
    timeRequired: 'Very Long (All day)',
    participantRange: '4-12 teams',
    advantages: ['Maximum games played', 'True skill ranking', 'No early elimination'],
    realWorldExample: 'Regular sports seasons, chess tournaments'
  },
  {
    id: 'swiss',
    name: 'Swiss System',
    icon: Target,
    description: 'Pair teams with similar records - no elimination',
    bestFor: ['Large tournaments', 'Skill matching', 'Chess/gaming events'],
    features: ['Smart pairing', 'No elimination', 'Skill-based matching'],
    structure: 'Multiple rounds with record-based pairing',
    timeRequired: 'Flexible (3-6 hours)',
    participantRange: '8-128 teams',
    advantages: ['No elimination stress', 'Competitive balance', 'Accommodates large fields'],
    realWorldExample: 'Chess tournaments, Magic: The Gathering events'
  },
  {
    id: 'leaderboard',
    name: 'Individual Leaderboard',
    icon: Award,
    description: 'Individual performance tracking for solo sports',
    bestFor: ['Track & field', 'Golf', 'Swimming', 'Time trials'],
    features: ['Performance tracking', 'Real-time standings', 'Personal records'],
    structure: 'Individual events with ranked results',
    timeRequired: 'Variable',
    participantRange: '10-500 individuals',
    advantages: ['Individual focus', 'Personal achievement', 'No direct competition pressure'],
    realWorldExample: 'Track meets, golf tournaments, swimming competitions'
  }
];

export default function TournamentFormatShowcase() {
  const [selectedFormat, setSelectedFormat] = useState<string>('single');
  const [showComparison, setShowComparison] = useState(false);

  const currentFormat = tournamentFormats.find(f => f.id === selectedFormat) || tournamentFormats[0];
  const IconComponent = currentFormat.icon;

  const renderBracketVisualization = (format: TournamentFormat) => {
    switch (format.id) {
      case 'single':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-100 p-2 rounded">Team 1</div>
                <div className="bg-gray-50 p-2 rounded">→</div>
                <div className="bg-gray-50 p-2 rounded">→</div>
                <div className="bg-yellow-100 p-2 rounded">Winner</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-100 p-2 rounded">Team 2</div>
                <div className="bg-gray-50 p-2 rounded">↗</div>
                <div className="bg-gray-50 p-2 rounded">↘</div>
                <div className="bg-gray-100 p-2 rounded text-gray-500">Final</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-100 p-2 rounded">Team 3</div>
                <div className="bg-gray-50 p-2 rounded">↗</div>
                <div className="bg-gray-50 p-2 rounded">↗</div>
                <div className="bg-gray-100 p-2 rounded text-gray-500">Championship</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-100 p-2 rounded">Team 4</div>
                <div className="bg-gray-50 p-2 rounded">→</div>
                <div className="bg-gray-50 p-2 rounded">→</div>
                <div className="bg-gray-100 p-2 rounded text-gray-500">Match</div>
              </div>
            </div>
          </div>
        );
      case 'double':
        return (
          <div className="bg-white p-4 rounded-lg border space-y-3">
            <div className="text-center">
              <Badge className="bg-green-100 text-green-800 mb-2">Winners Bracket</Badge>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="bg-blue-100 p-1 rounded">A vs B</div>
                <div className="bg-blue-100 p-1 rounded">Winner</div>
                <div className="bg-yellow-100 p-1 rounded">Finals</div>
              </div>
            </div>
            <div className="text-center">
              <Badge className="bg-red-100 text-red-800 mb-2">Losers Bracket</Badge>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-red-100 p-1 rounded">Loser A</div>
                <div className="bg-red-100 p-1 rounded">Loser B</div>
                <div className="bg-orange-100 p-1 rounded">Second</div>
              </div>
            </div>
          </div>
        );
      case 'pool':
        return (
          <div className="bg-white p-4 rounded-lg border space-y-3">
            <div className="text-center">
              <Badge className="bg-blue-100 text-blue-800 mb-2">Pool Stage</Badge>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-medium">Pool A</div>
                  <div className="bg-blue-50 p-1 rounded">Team 1 vs 2</div>
                  <div className="bg-blue-50 p-1 rounded">Team 3 vs 4</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Pool B</div>
                  <div className="bg-green-50 p-1 rounded">Team 5 vs 6</div>
                  <div className="bg-green-50 p-1 rounded">Team 7 vs 8</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge className="bg-yellow-100 text-yellow-800 mb-2">Bracket Stage</Badge>
              <div className="text-xs bg-yellow-50 p-2 rounded">Top 2 from each pool advance</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-gray-500 text-sm">
              {format.structure}
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
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg">
            <Grid className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">Professional Tournament Formats</h1>
            <p className="text-lg text-gray-600">6 different formats vs basic single-elimination brackets</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 font-medium">
            🚀 <strong>Challonge only offers single-elimination.</strong> We provide 6 professional formats for every type of event.
          </p>
        </div>
      </div>

      {/* Format Selector */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Choose Your Tournament Format</span>
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(!showComparison)}
              data-testid="button-toggle-comparison"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {tournamentFormats.map((format) => {
              const FormatIcon = format.icon;
              return (
                <Button
                  key={format.id}
                  variant={selectedFormat === format.id ? 'default' : 'outline'}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                    selectedFormat === format.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                  data-testid={`button-format-${format.id}`}
                >
                  <FormatIcon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{format.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Selected Format Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconComponent className="h-5 w-5 mr-2 text-blue-600" />
                  {currentFormat.name}
                </CardTitle>
                <CardDescription>{currentFormat.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Best For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentFormat.bestFor.map((use, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Professional Features:</h4>
                  <ul className="text-sm space-y-1">
                    {currentFormat.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Time:</span> {currentFormat.timeRequired}
                  </div>
                  <div>
                    <span className="font-medium">Teams:</span> {currentFormat.participantRange}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">Real World:</span>
                  <p className="text-sm text-gray-600 mt-1">{currentFormat.realWorldExample}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Tournament Structure</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBracketVisualization(currentFormat)}
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Key Advantages:</h4>
                  <ul className="text-sm space-y-1">
                    {currentFormat.advantages.map((advantage, idx) => (
                      <li key={idx} className="flex items-center">
                        <Zap className="h-3 w-3 text-yellow-500 mr-2" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {showComparison && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Format Comparison Chart
            </CardTitle>
            <CardDescription>Choose the right format for your event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Format</th>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Fairness</th>
                    <th className="text-left py-2">Games Played</th>
                    <th className="text-left py-2">Complexity</th>
                    <th className="text-left py-2">Best Use</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentFormats.map((format, idx) => (
                    <tr key={format.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{format.name}</td>
                      <td className="py-3">{format.timeRequired}</td>
                      <td className="py-3">
                        {format.id === 'roundrobin' && <Badge className="bg-green-100 text-green-800">Highest</Badge>}
                        {format.id === 'double' && <Badge className="bg-blue-100 text-blue-800">High</Badge>}
                        {(format.id === 'pool' || format.id === 'swiss') && <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>}
                        {(format.id === 'single' || format.id === 'leaderboard') && <Badge className="bg-gray-100 text-gray-800">Basic</Badge>}
                      </td>
                      <td className="py-3">
                        {format.id === 'roundrobin' && 'Most'}
                        {format.id === 'pool' && 'Many'}
                        {format.id === 'swiss' && 'Many'}
                        {format.id === 'double' && 'More'}
                        {format.id === 'single' && 'Fewest'}
                        {format.id === 'leaderboard' && 'Individual'}
                      </td>
                      <td className="py-3">
                        {(format.id === 'single' || format.id === 'leaderboard') && 'Simple'}
                        {(format.id === 'double' || format.id === 'swiss') && 'Medium'}
                        {(format.id === 'pool' || format.id === 'roundrobin') && 'Complex'}
                      </td>
                      <td className="py-3 text-xs">{format.bestFor[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Ready to Create Professional Tournaments?</h3>
          <p className="text-lg mb-6 opacity-90">
            Choose from 6 tournament formats + smart seeding + automatic management
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-purple-600 hover:text-purple-700"
            data-testid="button-start-trial-formats"
          >
            Start Your 14-Day Free Trial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}