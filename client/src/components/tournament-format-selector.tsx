import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Target, Zap, Clock, Crown } from 'lucide-react';

interface TournamentFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  bestFor: string[];
  teamCount: { min: number; max: number; optimal: number };
  duration: string;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  pros: string[];
  cons: string[];
}

interface TournamentFormatSelectorProps {
  onFormatSelect: (format: string) => void;
  selectedFormat?: string;
  teamCount: number;
}

const tournamentFormats: TournamentFormat[] = [
  {
    id: 'single',
    name: 'Single Elimination',
    description: 'One loss and you\'re out. Fast-paced bracket tournament.',
    icon: Trophy,
    bestFor: ['Time-limited events', 'Large team counts', 'Clear winner needed'],
    teamCount: { min: 4, max: 64, optimal: 16 },
    duration: 'Short',
    complexity: 'Simple',
    pros: ['Quick completion', 'Easy to understand', 'High excitement'],
    cons: ['Teams eliminated early', 'Less game time', 'Upsets can end strong teams quickly']
  },
  {
    id: 'double',
    name: 'Double Elimination',
    description: 'Second chances! Lose twice to be eliminated.',
    icon: Crown,
    bestFor: ['Competitive balance', 'Fair elimination', 'Skilled teams'],
    teamCount: { min: 4, max: 32, optimal: 12 },
    duration: 'Medium',
    complexity: 'Moderate',
    pros: ['More fair elimination', 'More games per team', 'Better determines skill'],
    cons: ['Longer duration', 'More complex bracket', 'Requires more planning']
  },
  {
    id: 'pool-play',
    name: 'Pool Play + Bracket',
    description: 'Round robin pools followed by elimination bracket.',
    icon: Users,
    bestFor: ['Balanced competition', 'Guaranteed games', 'Skill assessment'],
    teamCount: { min: 8, max: 32, optimal: 16 },
    duration: 'Long',
    complexity: 'Complex',
    pros: ['Guaranteed multiple games', 'Fair seeding for bracket', 'Comprehensive results'],
    cons: ['Longest format', 'Complex scheduling', 'Requires more time/venues']
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Everyone plays everyone. Complete competition.',
    icon: Zap,
    bestFor: ['League play', 'Skill development', 'Complete rankings'],
    teamCount: { min: 4, max: 12, optimal: 8 },
    duration: 'Long',
    complexity: 'Simple',
    pros: ['Everyone plays everyone', 'Complete standings', 'No elimination pressure'],
    cons: ['Many games required', 'Can be lengthy', 'Less excitement toward end']
  },
  {
    id: 'swiss-system',
    name: 'Swiss System',
    description: 'Pair teams with similar records each round.',
    icon: Clock,
    bestFor: ['Chess tournaments', 'Skill matching', 'Fair pairings'],
    teamCount: { min: 6, max: 50, optimal: 20 },
    duration: 'Medium',
    complexity: 'Moderate',
    pros: ['Dynamic pairings', 'No elimination', 'Skill-based matching'],
    cons: ['Complex scheduling', 'Requires software', 'Less traditional']
  },
  {
    id: 'leaderboard',
    name: 'Individual Leaderboard',
    description: 'Track individual performances and rank by score.',
    icon: Target,
    bestFor: ['Individual sports', 'Track & field', 'Golf/swimming'],
    teamCount: { min: 1, max: 200, optimal: 50 },
    duration: 'Variable',
    complexity: 'Simple',
    pros: ['Individual focus', 'Real-time updates', 'Performance tracking'],
    cons: ['No head-to-head', 'Less team interaction', 'May lack excitement']
  }
];

export default function TournamentFormatSelector({ 
  onFormatSelect, 
  selectedFormat, 
  teamCount 
}: TournamentFormatSelectorProps) {

  const getRecommendation = (format: TournamentFormat): 'perfect' | 'good' | 'okay' | 'poor' => {
    if (teamCount >= format.teamCount.min && teamCount <= format.teamCount.max) {
      if (teamCount === format.teamCount.optimal) return 'perfect';
      if (Math.abs(teamCount - format.teamCount.optimal) <= 4) return 'good';
      return 'okay';
    }
    return 'poor';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'perfect': return 'bg-green-100 border-green-300';
      case 'good': return 'bg-blue-100 border-blue-300';
      case 'okay': return 'bg-yellow-100 border-yellow-300';
      case 'poor': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'perfect': return <Badge className="bg-green-500">Perfect Fit</Badge>;
      case 'good': return <Badge className="bg-blue-500">Good Choice</Badge>;
      case 'okay': return <Badge variant="secondary">Acceptable</Badge>;
      case 'poor': return <Badge variant="destructive">Not Recommended</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4" data-testid="tournament-format-selector">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Tournament Format</h3>
        <p className="text-gray-600">
          Select the best format for your {teamCount} {teamCount === 1 ? 'participant' : 'teams'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tournamentFormats.map((format) => {
          const recommendation = getRecommendation(format);
          const IconComponent = format.icon;
          const isSelected = selectedFormat === format.id;

          return (
            <Card 
              key={format.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              } ${getRecommendationColor(recommendation)}`}
              onClick={() => onFormatSelect(format.id)}
              data-testid={`format-card-${format.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{format.name}</CardTitle>
                  </div>
                  {getRecommendationBadge(recommendation)}
                </div>
                <CardDescription className="text-sm">
                  {format.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Format Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Teams:</span> {format.teamCount.min}-{format.teamCount.max}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {format.duration}
                  </div>
                  <div>
                    <span className="font-medium">Optimal:</span> {format.teamCount.optimal} teams
                  </div>
                  <div>
                    <Badge variant={
                      format.complexity === 'Simple' ? 'default' :
                      format.complexity === 'Moderate' ? 'secondary' : 'outline'
                    } className="text-xs">
                      {format.complexity}
                    </Badge>
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <div className="font-medium text-sm mb-1">Best for:</div>
                  <div className="flex flex-wrap gap-1">
                    {format.bestFor.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-sm text-green-700 mb-1">Pros:</div>
                    <ul className="text-xs text-green-600 space-y-1">
                      {format.pros.slice(0, 2).map((pro, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-sm text-red-700 mb-1">Cons:</div>
                    <ul className="text-xs text-red-600 space-y-1">
                      {format.cons.slice(0, 2).map((con, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Selection Button */}
                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFormatSelect(format.id);
                  }}
                  data-testid={`button-select-${format.id}`}
                >
                  {isSelected ? 'Selected' : 'Select Format'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Format Comparison Table */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Format Comparison</CardTitle>
            <CardDescription>
              Quick comparison for {teamCount} teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Format</th>
                    <th className="text-left p-2">Games per Team</th>
                    <th className="text-left p-2">Total Matches</th>
                    <th className="text-left p-2">Time Required</th>
                    <th className="text-left p-2">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentFormats.map((format) => {
                    const recommendation = getRecommendation(format);
                    let gamesPerTeam = 'Varies';
                    let totalMatches = 'Varies';

                    // Calculate approximate values for current team count
                    if (format.id === 'single') {
                      gamesPerTeam = '1-' + Math.ceil(Math.log2(teamCount));
                      totalMatches = (teamCount - 1).toString();
                    } else if (format.id === 'round-robin') {
                      gamesPerTeam = (teamCount - 1).toString();
                      totalMatches = Math.floor(teamCount * (teamCount - 1) / 2).toString();
                    } else if (format.id === 'double') {
                      gamesPerTeam = '2-' + (Math.ceil(Math.log2(teamCount)) + 2);
                      totalMatches = ((teamCount - 1) * 2 - 1).toString();
                    }

                    return (
                      <tr key={format.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{format.name}</td>
                        <td className="p-2">{gamesPerTeam}</td>
                        <td className="p-2">{totalMatches}</td>
                        <td className="p-2">{format.duration}</td>
                        <td className="p-2">{getRecommendationBadge(recommendation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}