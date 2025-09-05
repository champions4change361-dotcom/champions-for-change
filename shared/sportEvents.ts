// Sport-Specific Event Definitions for Multi-Event Tournaments
// Each sport has predefined events with their scoring types and units

export interface SportEventDefinition {
  eventName: string;
  eventType: 'timed' | 'distance' | 'scored' | 'points' | 'team_game';
  scoringUnit: 'seconds' | 'minutes' | 'meters' | 'feet' | 'points' | 'goals' | 'custom';
  genderDivisions: ('Men' | 'Women' | 'Boys' | 'Girls' | 'Mixed' | 'Co-Ed')[];
  ageGroups: ('Elementary' | 'Middle School' | 'High School' | 'College' | 'Adult' | 'Masters' | 'Senior' | 'All Ages')[];
  description?: string;
  maxParticipants?: number;
}

// SWIMMING & DIVING EVENTS
export const swimmingEvents: SportEventDefinition[] = [
  // Freestyle Events
  {
    eventName: '50m Freestyle',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '100m Freestyle',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '200m Freestyle',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '500m Freestyle',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Backstroke Events
  {
    eventName: '100m Backstroke',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '200m Backstroke',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Breaststroke Events
  {
    eventName: '100m Breaststroke',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '200m Breaststroke',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Butterfly Events
  {
    eventName: '50m Butterfly',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '100m Butterfly',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  
  // Individual Medley
  {
    eventName: '200m Individual Medley',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '400m Individual Medley',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Relay Events
  {
    eventName: '4x100m Freestyle Relay',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    maxParticipants: 4
  },
  {
    eventName: '4x100m Medley Relay',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 4
  },
  
  // Diving Events
  {
    eventName: '1-Meter Diving',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '3-Meter Diving',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Platform Diving',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  }
];

// TRACK & FIELD EVENTS
export const trackEvents: SportEventDefinition[] = [
  // Sprint Events (Timed)
  {
    eventName: '100m Sprint',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '200m Sprint',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '400m Sprint',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  
  // Middle Distance (Timed)
  {
    eventName: '800m Run',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: '1500m Run',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Distance Events (Timed)
  {
    eventName: '3000m Run',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '5000m Run',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Men', 'Women'],
    ageGroups: ['College', 'Adult']
  },
  
  // Hurdles (Timed)
  {
    eventName: '100m Hurdles',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Girls', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '110m Hurdles',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '300m Hurdles',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Field Events - Jumping (Distance)
  {
    eventName: 'Long Jump',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Triple Jump',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'High Jump',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Pole Vault',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  
  // Field Events - Throwing (Distance)
  {
    eventName: 'Shot Put',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Discus Throw',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Javelin Throw',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Hammer Throw',
    eventType: 'distance',
    scoringUnit: 'meters',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['College', 'Adult']
  },
  
  // Relay Events (Timed)
  {
    eventName: '4x100m Relay',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    maxParticipants: 4
  },
  {
    eventName: '4x400m Relay',
    eventType: 'timed',
    scoringUnit: 'seconds',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 4
  }
];

// BASKETBALL EVENTS  
export const basketballEvents: SportEventDefinition[] = [
  {
    eventName: 'Tournament Game',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Co-Ed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    maxParticipants: 10 // 5 per team
  },
  {
    eventName: '3-Point Contest',
    eventType: 'points',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Free Throw Contest',
    eventType: 'points',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult']
  }
];

// CHEER/DANCE EVENTS
export const cheerDanceEvents: SportEventDefinition[] = [
  {
    eventName: 'Small Varsity Cheer',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School'],
    maxParticipants: 20
  },
  {
    eventName: 'Large Varsity Cheer',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School'],
    maxParticipants: 35
  },
  {
    eventName: 'Jazz Dance',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed', 'Girls'],
    ageGroups: ['Middle School', 'High School']
  },
  {
    eventName: 'Pom Dance',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed', 'Girls'],
    ageGroups: ['Middle School', 'High School']
  },
  {
    eventName: 'Hip Hop Dance',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed', 'Boys', 'Girls'],
    ageGroups: ['Middle School', 'High School']
  }
];

// GYMNASTICS EVENTS
export const gymnasticsEvents: SportEventDefinition[] = [
  // Women's Artistic Gymnastics
  {
    eventName: 'Vault (Women)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Women', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Women\'s vault apparatus - scored by panel of judges'
  },
  {
    eventName: 'Uneven Bars (Women)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Women', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Women\'s uneven bars apparatus - scored by panel of judges'
  },
  {
    eventName: 'Balance Beam (Women)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Women', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Women\'s balance beam apparatus - scored by panel of judges'
  },
  {
    eventName: 'Floor Exercise (Women)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Women', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Women\'s floor exercise apparatus - scored by panel of judges'
  },
  {
    eventName: 'All-Around (Women)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Women', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Women\'s all-around competition (combined scores from all apparatus)'
  },

  // Men's Artistic Gymnastics
  {
    eventName: 'Floor Exercise (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s floor exercise apparatus - scored by panel of judges'
  },
  {
    eventName: 'Pommel Horse (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s pommel horse apparatus - scored by panel of judges'
  },
  {
    eventName: 'Still Rings (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s still rings apparatus - scored by panel of judges'
  },
  {
    eventName: 'Vault (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s vault apparatus - scored by panel of judges'
  },
  {
    eventName: 'Parallel Bars (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s parallel bars apparatus - scored by panel of judges'
  },
  {
    eventName: 'High Bar (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s high bar apparatus - scored by panel of judges'
  },
  {
    eventName: 'All-Around (Men)',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Men', 'Boys'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Men\'s all-around competition (combined scores from all apparatus)'
  },

  // Mixed/Team Events
  {
    eventName: 'Team Competition',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed', 'Men', 'Women', 'Boys', 'Girls'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult'],
    description: 'Team gymnastics competition - combined team scores'
  }
];

// GOLF EVENTS
export const golfEvents: SportEventDefinition[] = [
  {
    eventName: 'Individual Stroke Play',
    eventType: 'scored',
    scoringUnit: 'strokes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Individual Match Play',
    eventType: 'scored',
    scoringUnit: 'holes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Team Scramble',
    eventType: 'scored',
    scoringUnit: 'strokes',
    genderDivisions: ['Mixed', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 4
  },
  {
    eventName: 'Best Ball',
    eventType: 'scored',
    scoringUnit: 'strokes',
    genderDivisions: ['Mixed', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 4
  },
  {
    eventName: 'Alternate Shot',
    eventType: 'scored',
    scoringUnit: 'strokes',
    genderDivisions: ['Mixed', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 2
  }
];

// FOOTBALL EVENTS
export const footballEvents: SportEventDefinition[] = [
  {
    eventName: 'Regular Season Game',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: 'Playoff Game',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '7v7 Tournament',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 7
  }
];

// SOCCER EVENTS
export const soccerEvents: SportEventDefinition[] = [
  {
    eventName: 'Tournament Match',
    eventType: 'team_game',
    scoringUnit: 'goals',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Co-Ed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Penalty Shootout',
    eventType: 'scored',
    scoringUnit: 'goals',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  }
];

// VOLLEYBALL EVENTS
export const volleyballEvents: SportEventDefinition[] = [
  {
    eventName: 'Tournament Match',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Co-Ed'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Beach Volleyball',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['High School', 'College', 'Adult'],
    maxParticipants: 2
  }
];

// BASEBALL/SOFTBALL EVENTS
export const baseballEvents: SportEventDefinition[] = [
  {
    eventName: 'Tournament Game',
    eventType: 'team_game',
    scoringUnit: 'runs',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Home Run Derby',
    eventType: 'points',
    scoringUnit: 'home runs',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College', 'Adult']
  }
];

export const softballEvents: SportEventDefinition[] = [
  {
    eventName: 'Tournament Game',
    eventType: 'team_game',
    scoringUnit: 'runs',
    genderDivisions: ['Girls', 'Women', 'Co-Ed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College', 'Adult']
  }
];

// TENNIS EVENTS
export const tennisEvents: SportEventDefinition[] = [
  {
    eventName: 'Singles Match',
    eventType: 'team_game',
    scoringUnit: 'sets',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult']
  },
  {
    eventName: 'Doubles Match',
    eventType: 'team_game',
    scoringUnit: 'sets',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women', 'Mixed'],
    ageGroups: ['Middle School', 'High School', 'College', 'Adult'],
    maxParticipants: 2
  }
];

// WRESTLING EVENTS
export const wrestlingEvents: SportEventDefinition[] = [
  {
    eventName: '106 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '113 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '120 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '126 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '132 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '138 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '145 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '152 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '160 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '170 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '182 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '195 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '220 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: '285 lbs',
    eventType: 'team_game',
    scoringUnit: 'points',
    genderDivisions: ['Boys', 'Men'],
    ageGroups: ['High School', 'College']
  }
];

// CROSS COUNTRY EVENTS
export const crossCountryEvents: SportEventDefinition[] = [
  {
    eventName: '5K Race',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Boys', 'Girls', 'Men', 'Women'],
    ageGroups: ['High School', 'College', 'Adult']
  },
  {
    eventName: '8K Race',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Men'],
    ageGroups: ['College', 'Adult']
  },
  {
    eventName: '6K Race',
    eventType: 'timed',
    scoringUnit: 'minutes',
    genderDivisions: ['Women'],
    ageGroups: ['College', 'Adult']
  }
];

// ACADEMIC COMPETITION EVENTS
export const academicEvents: SportEventDefinition[] = [
  // UIL Academic Events
  {
    eventName: 'Mathematics',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Number Sense',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Calculator Applications',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Science',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Computer Science',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  },
  {
    eventName: 'Computer Applications',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Accounting',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  },
  {
    eventName: 'Current Issues & Events',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  },
  {
    eventName: 'Literary Criticism',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  },
  {
    eventName: 'Social Studies',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Spelling & Vocabulary',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Ready Writing',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  }
];

// SPEECH & DEBATE EVENTS
export const speechDebateEvents: SportEventDefinition[] = [
  {
    eventName: 'Cross Examination Debate',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College'],
    maxParticipants: 2
  },
  {
    eventName: 'Lincoln-Douglas Debate',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Informative Speaking',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Persuasive Speaking',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Poetry Interpretation',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Prose Interpretation',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Extemporaneous Speaking',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Original Oratory',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Impromptu Speaking',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College']
  },
  {
    eventName: 'Oral Reading',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School']
  }
];

// MUSIC COMPETITION EVENTS
export const musicEvents: SportEventDefinition[] = [
  {
    eventName: 'Concert Band',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Marching Band',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Jazz Band',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Orchestra',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Choir',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed', 'Boys', 'Girls'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Solo & Ensemble',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'All-State Auditions',
    eventType: 'scored',
    scoringUnit: 'ranking',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  }
];

// VISUAL ARTS EVENTS
export const visualArtsEvents: SportEventDefinition[] = [
  {
    eventName: 'Art Competition',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College']
  },
  {
    eventName: 'Photography',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Digital Art',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Painting',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College']
  },
  {
    eventName: 'Drawing',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College']
  },
  {
    eventName: 'Sculpture',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  }
];

// THEATER EVENTS
export const theaterEvents: SportEventDefinition[] = [
  {
    eventName: 'One Act Play',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School', 'College']
  },
  {
    eventName: 'Musical Theater',
    eventType: 'scored',
    scoringUnit: 'rating',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Technical Theater',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Improvisation',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  }
];

// STEM COMPETITION EVENTS
export const stemEvents: SportEventDefinition[] = [
  {
    eventName: 'Science Olympiad',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School']
  },
  {
    eventName: 'Math Olympiad',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Elementary', 'Middle School', 'High School']
  },
  {
    eventName: 'Robotics Competition',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Programming Competition',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School', 'College']
  },
  {
    eventName: 'Engineering Challenge',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Quiz Bowl',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['Middle School', 'High School', 'College']
  },
  {
    eventName: 'Academic Decathlon',
    eventType: 'scored',
    scoringUnit: 'points',
    genderDivisions: ['Mixed'],
    ageGroups: ['High School']
  }
];

// MASTER SPORT EVENT MAPPING - COMPREHENSIVE
export const sportEventMap = {
  'Swimming & Diving': swimmingEvents,
  'Track & Field': trackEvents,
  'Basketball': basketballEvents,
  'Cheer/Dance': cheerDanceEvents,
  'Gymnastics': gymnasticsEvents,
  'Golf': golfEvents,
  'Football': footballEvents,
  'Soccer': soccerEvents,
  'Volleyball': volleyballEvents,
  'Baseball': baseballEvents,
  'Softball': softballEvents,
  'Tennis': tennisEvents,
  'Wrestling': wrestlingEvents,
  'Cross Country': crossCountryEvents,
  'Academic': academicEvents,
  'Speech & Debate': speechDebateEvents,
  'Music': musicEvents,
  'Visual Arts': visualArtsEvents,
  'Theater': theaterEvents,
  'STEM': stemEvents,
} as const;

// Helper function to get events for a sport
export function getEventsForSport(sport: string): SportEventDefinition[] {
  // Handle gender-specific sport names by extracting the base sport name
  let baseSport = sport;
  
  // Handle basketball variants
  if (sport.startsWith('Basketball')) {
    baseSport = 'Basketball';
  }
  // Handle soccer variants
  else if (sport.startsWith('Soccer')) {
    baseSport = 'Soccer';
  }
  // Handle volleyball variants
  else if (sport.startsWith('Volleyball')) {
    baseSport = 'Volleyball';
  }
  // Handle other team sports that might have gender divisions
  else if (sport.includes('(') && sport.includes(')')) {
    baseSport = sport.split('(')[0].trim();
  }
  
  return sportEventMap[baseSport as keyof typeof sportEventMap] || [];
}

// Helper function to get all available sports
export function getAvailableSports(): string[] {
  return Object.keys(sportEventMap);
}