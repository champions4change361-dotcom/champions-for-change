// Random name generator for tournament participants
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 
  'Cameron', 'Drew', 'Sage', 'River', 'Skylar', 'Rowan', 'Phoenix', 'Kai',
  'Emery', 'Reese', 'Blake', 'Finley', 'Harper', 'Parker', 'Hayden', 'Peyton',
  'Kendall', 'Logan', 'Ryan', 'Devon', 'Dylan', 'Jaime', 'Jesse', 'Remy',
  'Charlie', 'Sam', 'Dakota', 'Emerson', 'Ashton', 'Marlowe', 'Rory', 'Shay'
];

const lastNames = [
  'Anderson', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

export function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

export function generateRandomNames(count: number): string[] {
  const names = new Set<string>();
  
  while (names.size < count) {
    names.add(generateRandomName());
  }
  
  return Array.from(names);
}