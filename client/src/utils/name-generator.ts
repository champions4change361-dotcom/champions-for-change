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
  const maxAttempts = count * 3; // Prevent infinite loops
  let attempts = 0;
  
  while (names.size < count && attempts < maxAttempts) {
    names.add(generateRandomName());
    attempts++;
  }
  
  // If we couldn't generate enough unique names, fill with numbered fallbacks
  const nameArray = Array.from(names);
  while (nameArray.length < count) {
    nameArray.push(`Participant ${nameArray.length + 1}`);
  }
  
  return nameArray;
}