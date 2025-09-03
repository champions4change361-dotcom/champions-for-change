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

// MASTER SPORT EVENT MAPPING
export const sportEventMap = {
  'Swimming & Diving': swimmingEvents,
  'Track & Field': trackEvents,
  'Basketball': basketballEvents,
  'Cheer/Dance': cheerDanceEvents,
  'Gymnastics': gymnasticsEvents,
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