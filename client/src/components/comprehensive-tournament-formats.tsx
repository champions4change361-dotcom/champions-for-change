import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Medal, 
  Zap, 
  Star,
  Crown,
  GamepadIcon,
  Swords,
  Timer,
  TrendingUp,
  Award
} from 'lucide-react';

// COMPREHENSIVE TOURNAMENT FORMAT CONFIGURATIONS
export interface TournamentFormatConfig {
  sport: string;
  format: string;
  tournamentType: string;
  competitionFormat: string;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  specificOptions?: Record<string, any>;
}

// GOLF TOURNAMENT FORMATS
export const golfFormats: TournamentFormatConfig[] = [
  {
    sport: 'Golf',
    format: 'stroke-play',
    tournamentType: 'stroke-play',
    competitionFormat: 'leaderboard',
    description: 'Traditional stroke play format with cumulative scoring',
    features: ['Cut System Options', 'Handicap Integration', 'Multi-Round Scoring'],
    icon: Target,
    specificOptions: {
      cutOptions: ['no-cut', '36-hole-cut', '54-hole-cut', 'top-and-ties', 'percentage-cut'],
      handicapSystem: true,
      rounds: [1, 2, 3, 4],
      scoringMethod: 'total-strokes'
    }
  },
  {
    sport: 'Golf',
    format: 'match-play',
    tournamentType: 'match-play',
    competitionFormat: 'bracket',
    description: 'Head-to-head match play bracket elimination',
    features: ['Bracket Progression', 'Hole-by-Hole Scoring', 'Advancement Rules'],
    icon: Swords,
    specificOptions: {
      bracketSize: [8, 16, 32, 64],
      matchLength: [9, 18],
      advancementRules: 'winner-advances'
    }
  },
  {
    sport: 'Golf',
    format: 'scramble',
    tournamentType: 'scramble',
    competitionFormat: 'leaderboard',
    description: 'Team scramble format with best ball selection',
    features: ['Team Play', 'Best Ball Selection', 'Handicap Adjustments'],
    icon: Users,
    specificOptions: {
      teamSize: [2, 3, 4],
      handicapPercentages: [10, 15, 20],
      shotgunStart: true
    }
  },
  {
    sport: 'Golf',
    format: 'best-ball',
    tournamentType: 'best-ball',
    competitionFormat: 'leaderboard',
    description: 'Best ball team format with individual play',
    features: ['Individual Scores', 'Team Best Ball', 'Handicap Integration'],
    icon: Star,
    specificOptions: {
      teamSize: [2, 4],
      countBestScores: [1, 2],
      handicapAdjustments: true
    }
  }
];

// FOOTBALL TOURNAMENT FORMATS
export const footballFormats: TournamentFormatConfig[] = [
  {
    sport: 'Football',
    format: 'playoff-bracket',
    tournamentType: 'playoff-bracket',
    competitionFormat: 'bracket',
    description: 'Single elimination playoff bracket with seeding',
    features: ['Seeding System', 'Bye Management', 'Tiebreaker Rules'],
    icon: Crown,
    specificOptions: {
      seedingMethods: ['record-based', 'rpi', 'conference-standings', 'manual'],
      byeRounds: [0, 1, 2],
      tiebreakers: ['head-to-head', 'point-differential', 'common-opponents']
    }
  },
  {
    sport: 'Football',
    format: 'conference-championship',
    tournamentType: 'conference-championship',
    competitionFormat: 'bracket',
    description: 'Conference-based championship tournament',
    features: ['Conference Divisions', 'Automatic Qualifiers', 'Wildcard Spots'],
    icon: Trophy,
    specificOptions: {
      conferences: ['custom'],
      wildcardSlots: [0, 1, 2, 4],
      divisionWinners: true
    }
  },
  {
    sport: 'Football',
    format: '7v7-tournament',
    tournamentType: '7v7',
    competitionFormat: 'pool-play',
    description: '7v7 tournament with pool play and bracket',
    features: ['Pool Play', 'Bracket Advancement', 'Shortened Games'],
    icon: Zap,
    specificOptions: {
      poolSize: [4, 6, 8],
      gameLength: [20, 25, 30],
      advanceFromPools: [1, 2]
    }
  }
];

// SWIMMING TOURNAMENT FORMATS
export const swimmingFormats: TournamentFormatConfig[] = [
  {
    sport: 'Swimming & Diving',
    format: 'preliminary-finals',
    tournamentType: 'preliminary-finals',
    competitionFormat: 'multi-stage',
    description: 'Preliminary heats with top finalists advancing',
    features: ['Heat Management', 'Time Standards', 'Finals Advancement'],
    icon: Timer,
    specificOptions: {
      preliminaryHeats: true,
      finalsCount: [6, 8, 10],
      timeStandards: ['A', 'B', 'C'],
      heatSheets: true
    }
  },
  {
    sport: 'Swimming & Diving',
    format: 'dual-meet',
    tournamentType: 'dual-meet',
    competitionFormat: 'team_vs_individual',
    description: 'Head-to-head dual meet scoring format',
    features: ['Team Scoring', 'Individual Results', 'Relay Events'],
    icon: Users,
    specificOptions: {
      scoringSystem: 'dual-meet-scoring',
      relayEvents: true,
      teamScoring: true
    }
  },
  {
    sport: 'Swimming & Diving',
    format: 'invitational',
    tournamentType: 'invitational',
    competitionFormat: 'leaderboard',
    description: 'Large invitational meet with multiple sessions',
    features: ['Multiple Sessions', 'Heat Management', 'Team Scoring'],
    icon: Medal,
    specificOptions: {
      sessions: ['preliminaries', 'finals'],
      heatManagement: true,
      teamScoring: 'championship-scoring'
    }
  }
];

// BASKETBALL TOURNAMENT FORMATS
export const basketballFormats: TournamentFormatConfig[] = [
  {
    sport: 'Basketball',
    format: '5v5-bracket',
    tournamentType: 'single',
    competitionFormat: 'bracket',
    description: 'Traditional 5v5 single elimination bracket',
    features: ['Seeding', 'Bracket Progression', 'Championship Game'],
    icon: Trophy,
    specificOptions: {
      bracketSize: [8, 16, 32, 64],
      seedingMethod: ['random', 'ranking-based', 'manual'],
      consolationBracket: false
    }
  },
  {
    sport: 'Basketball',
    format: '3v3-tournament',
    tournamentType: '3v3-tournament',
    competitionFormat: 'pool-play',
    description: '3-on-3 tournament with pool play format',
    features: ['Pool Play', 'Shortened Games', 'Quick Turnaround'],
    icon: Zap,
    specificOptions: {
      teamSize: 3,
      gameLength: [15, 20],
      poolSize: [4, 6],
      advancementRules: 'top-teams-advance'
    }
  },
  {
    sport: 'Basketball',
    format: 'skills-competition',
    tournamentType: 'skills-competition',
    competitionFormat: 'scored',
    description: 'Skills competition with multiple events',
    features: ['3-Point Contest', 'Free Throw Contest', 'Shooting Stars'],
    icon: Target,
    specificOptions: {
      events: ['three-point', 'free-throw', 'shooting-stars'],
      individualCompetition: true,
      scoringMethod: 'points'
    }
  }
];

// WRESTLING TOURNAMENT FORMATS
export const wrestlingFormats: TournamentFormatConfig[] = [
  {
    sport: 'Wrestling',
    format: 'weight-class-bracket',
    tournamentType: 'weight-class-bracket',
    competitionFormat: 'bracket',
    description: 'Traditional weight class bracket tournament',
    features: ['Weight Classes', 'Individual Brackets', 'Team Scoring'],
    icon: Medal,
    specificOptions: {
      weightClasses: ['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285'],
      bracketFormat: 'single-elimination',
      teamScoring: true
    }
  },
  {
    sport: 'Wrestling',
    format: 'dual-meet',
    tournamentType: 'dual-meet',
    competitionFormat: 'team_vs_individual',
    description: 'Head-to-head dual meet format',
    features: ['Team vs Team', 'Weight Class Matches', 'Team Scoring'],
    icon: Swords,
    specificOptions: {
      matchFormat: 'dual-meet',
      teamScoring: 'dual-meet-points',
      weightClasses: 'standard'
    }
  }
];

// TENNIS TOURNAMENT FORMATS
export const tennisFormats: TournamentFormatConfig[] = [
  {
    sport: 'Tennis',
    format: 'draw-management',
    tournamentType: 'single',
    competitionFormat: 'bracket',
    description: 'Professional draw management system',
    features: ['Draw Sizes', 'Seeding', 'Byes', 'Consolation'],
    icon: Trophy,
    specificOptions: {
      drawSizes: [16, 32, 64, 128],
      seedingEnabled: true,
      consolationBracket: true,
      byeManagement: 'highest-seed'
    }
  },
  {
    sport: 'Tennis',
    format: 'doubles-tournament',
    tournamentType: 'doubles-tournament',
    competitionFormat: 'bracket',
    description: 'Doubles-specific tournament format',
    features: ['Doubles Play', 'Team Formation', 'Mixed Doubles'],
    icon: Users,
    specificOptions: {
      doublesType: ['men', 'women', 'mixed'],
      teamFormation: 'partnership',
      bracketSize: [8, 16, 32]
    }
  }
];

// ACADEMIC COMPETITION FORMATS
export const academicFormats: TournamentFormatConfig[] = [
  {
    sport: 'Academic',
    format: 'written-test',
    tournamentType: 'written-test',
    competitionFormat: 'scored',
    description: 'Written test competition with timed format',
    features: ['Time Limits', 'Multiple Events', 'Team & Individual'],
    icon: Clock,
    specificOptions: {
      testDuration: [30, 45, 60],
      multipleEvents: true,
      teamAndIndividual: true,
      advancementRules: 'top-scorers'
    }
  },
  {
    sport: 'Academic',
    format: 'debate-bracket',
    tournamentType: 'debate-bracket',
    competitionFormat: 'bracket',
    description: 'Debate tournament with elimination rounds',
    features: ['Elimination Rounds', 'Judge Assignments', 'Topic Progression'],
    icon: GamepadIcon,
    specificOptions: {
      debateFormat: ['policy', 'lincoln-douglas', 'public-forum'],
      rounds: [3, 4, 5, 6],
      judgeAssignments: true
    }
  },
  {
    sport: 'Academic',
    format: 'uil-academic-meet',
    tournamentType: 'multi-event-scoring',
    competitionFormat: 'multi-stage',
    description: 'UIL Academic Meet with multiple competitions',
    features: ['50+ Competitions', 'District/Regional/State', 'Team Scoring'],
    icon: Award,
    specificOptions: {
      competitions: 'uil-standard',
      advancementLevels: ['district', 'regional', 'state'],
      teamScoring: true,
      substitutionRules: true
    }
  }
];

// MASTER FORMAT MAPPING
export const allTournamentFormats: Record<string, TournamentFormatConfig[]> = {
  'Golf': golfFormats,
  'Football': footballFormats,
  'Swimming & Diving': swimmingFormats,
  'Basketball': basketballFormats,
  'Wrestling': wrestlingFormats,
  'Tennis': tennisFormats,
  'Academic': academicFormats,
  'Speech & Debate': academicFormats,
  'Music': academicFormats,
  'Visual Arts': academicFormats,
  'Theater': academicFormats,
  'STEM': academicFormats,
  'Soccer': [
    {
      sport: 'Soccer',
      format: 'group-stage-knockout',
      tournamentType: 'group-stage-knockout',
      competitionFormat: 'multi-stage',
      description: 'Group stage followed by knockout rounds',
      features: ['Group Play', 'Knockout Rounds', 'Tiebreakers'],
      icon: Trophy,
      specificOptions: {
        groupSize: [3, 4, 5],
        advanceFromGroups: [1, 2],
        extraTime: true,
        penaltyShootouts: true
      }
    }
  ],
  'Volleyball': [
    {
      sport: 'Volleyball',
      format: 'pool-to-bracket',
      tournamentType: 'pool-play',
      competitionFormat: 'multi-stage',
      description: 'Pool play advancing to bracket',
      features: ['Pool Play', 'Bracket Advancement', 'Seeding'],
      icon: TrendingUp,
      specificOptions: {
        poolSize: [4, 6, 8],
        advanceCount: [1, 2],
        bracketSeeding: true
      }
    }
  ]
};

// COMPREHENSIVE TOURNAMENT FORMAT SELECTOR COMPONENT
export interface ComprehensiveTournamentFormatSelectorProps {
  sport: string;
  onFormatSelect: (format: TournamentFormatConfig) => void;
  selectedFormat?: string;
}

export const ComprehensiveTournamentFormatSelector: React.FC<ComprehensiveTournamentFormatSelectorProps> = ({
  sport,
  onFormatSelect,
  selectedFormat
}) => {
  const formats = allTournamentFormats[sport] || [];

  if (formats.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Custom tournament formats coming soon for {sport}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Tournament Format for {sport}</h3>
        <p className="text-muted-foreground">Select the tournament format that best fits your competition</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formats.map((format) => {
          const IconComponent = format.icon;
          const isSelected = selectedFormat === format.format;
          
          return (
            <Card 
              key={format.format}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => onFormatSelect(format)}
              data-testid={`format-card-${format.format}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {format.format.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {format.tournamentType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-3">
                  {format.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Key Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {format.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {format.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{format.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// SPORT-SPECIFIC CONFIGURATION COMPONENT
export interface SportSpecificConfigProps {
  format: TournamentFormatConfig;
  onConfigChange: (config: Record<string, any>) => void;
  currentConfig?: Record<string, any>;
}

export const SportSpecificConfig: React.FC<SportSpecificConfigProps> = ({
  format,
  onConfigChange,
  currentConfig = {}
}) => {
  const handleConfigUpdate = (key: string, value: any) => {
    const newConfig = { ...currentConfig, [key]: value };
    onConfigChange(newConfig);
  };

  if (!format.specificOptions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configure {format.format} Settings</CardTitle>
        <CardDescription>
          Customize the specific options for your {format.sport.toLowerCase()} tournament
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(format.specificOptions).map(([key, options]) => {
          if (Array.isArray(options)) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">
                  {key.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </Label>
                <Select 
                  value={currentConfig[key] || options[0]} 
                  onValueChange={(value) => handleConfigUpdate(key, value)}
                >
                  <SelectTrigger data-testid={`config-select-${key}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option.toString().replace(/-/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }
          
          if (typeof options === 'boolean') {
            return (
              <div key={key} className="flex items-center space-x-2">
                <Switch 
                  id={key}
                  checked={currentConfig[key] ?? options}
                  onCheckedChange={(checked) => handleConfigUpdate(key, checked)}
                  data-testid={`config-switch-${key}`}
                />
                <Label htmlFor={key} className="text-sm">
                  {key.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </Label>
              </div>
            );
          }
          
          if (typeof options === 'number') {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">
                  {key.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </Label>
                <Input 
                  type="number"
                  value={currentConfig[key] || options}
                  onChange={(e) => handleConfigUpdate(key, parseInt(e.target.value))}
                  data-testid={`config-input-${key}`}
                />
              </div>
            );
          }
          
          return null;
        })}
      </CardContent>
    </Card>
  );
};

export default ComprehensiveTournamentFormatSelector;