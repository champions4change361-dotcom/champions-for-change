/**
 * CSV utility functions for tournament team management
 * Supports bulk import/export of team data across all subdomain types
 */

export interface TeamData {
  teamName: string;
  captainName?: string;
  contactEmail?: string;
  school?: string;
  division?: string;
  notes?: string;
}

export interface TournamentCSVTemplate {
  headers: string[];
  sampleData: TeamData[];
  filename: string;
}

/**
 * Generate CSV template based on tournament type and subdomain
 */
export function generateCSVTemplate(tournamentType: 'district' | 'enterprise' | 'free' | 'general' = 'general'): TournamentCSVTemplate {
  const baseHeaders = ['teamName'];
  const sampleData: TeamData[] = [];

  switch (tournamentType) {
    case 'district':
      return {
        headers: [...baseHeaders, 'school', 'division', 'captainName', 'contactEmail', 'notes'],
        sampleData: [
          { teamName: 'Eagles', school: 'Lincoln Middle School', division: '7th Grade', captainName: 'John Smith', contactEmail: 'coach.smith@lincoln.edu', notes: 'Returning champions' },
          { teamName: 'Warriors', school: 'Washington High School', division: '9th Grade', captainName: 'Jane Doe', contactEmail: 'jane.doe@washington.edu', notes: '' },
          { teamName: 'Panthers', school: 'Roosevelt Elementary', division: '5th Grade', captainName: 'Mike Johnson', contactEmail: 'mike.j@roosevelt.edu', notes: 'New team' },
        ],
        filename: 'district_tournament_teams_template.csv'
      };

    case 'enterprise':
      return {
        headers: [...baseHeaders, 'department', 'division', 'captainName', 'contactEmail', 'employeeId', 'notes'],
        sampleData: [
          { teamName: 'Marketing Mavericks', captainName: 'Sarah Wilson', contactEmail: 'sarah.wilson@company.com', notes: 'Creative team from marketing dept' },
          { teamName: 'Engineering Eagles', captainName: 'David Chen', contactEmail: 'david.chen@company.com', notes: 'Software development team' },
          { teamName: 'Sales Storm', captainName: 'Lisa Garcia', contactEmail: 'lisa.garcia@company.com', notes: 'Top performing sales team' },
        ],
        filename: 'enterprise_tournament_teams_template.csv'
      };

    case 'free':
      return {
        headers: [...baseHeaders, 'captainName', 'contactEmail', 'notes'],
        sampleData: [
          { teamName: 'Team Alpha', captainName: 'Alex Johnson', contactEmail: 'alex@email.com', notes: 'Competitive team' },
          { teamName: 'Team Beta', captainName: 'Morgan Davis', contactEmail: 'morgan@email.com', notes: 'Fun recreational team' },
          { teamName: 'Team Gamma', captainName: 'Jordan Smith', contactEmail: 'jordan@email.com', notes: 'First-time participants' },
        ],
        filename: 'tournament_teams_template.csv'
      };

    default:
      return {
        headers: [...baseHeaders, 'captainName', 'contactEmail', 'notes'],
        sampleData: [
          { teamName: 'Team 1', captainName: 'Captain 1', contactEmail: 'captain1@email.com', notes: 'Sample team 1' },
          { teamName: 'Team 2', captainName: 'Captain 2', contactEmail: 'captain2@email.com', notes: 'Sample team 2' },
          { teamName: 'Team 3', captainName: 'Captain 3', contactEmail: 'captain3@email.com', notes: 'Sample team 3' },
        ],
        filename: 'tournament_teams_template.csv'
      };
  }
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in CSV values
      if (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvText: string, expectedHeaders: string[]): { data: TeamData[], errors: string[] } {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  
  if (lines.length < 2) {
    errors.push('CSV must contain at least a header row and one data row');
    return { data: [], errors };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Validate headers
  if (!headers.includes('teamName')) {
    errors.push('CSV must contain a "teamName" column');
  }

  const data: TeamData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
      continue;
    }

    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index];
    });

    if (!rowData.teamName || rowData.teamName.trim() === '') {
      errors.push(`Row ${i + 1}: Team name is required`);
      continue;
    }

    data.push(rowData as TeamData);
  }

  return { data, errors };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentValue += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
    
    i++;
  }
  
  values.push(currentValue.trim());
  return values;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Generate and download CSV template for team import
 */
export function downloadTeamTemplate(
  tournamentType: 'district' | 'enterprise' | 'free' | 'general' = 'general',
  teamCount: number = 8
): void {
  const template = generateCSVTemplate(tournamentType);
  
  // Generate sample data for the specified number of teams
  const sampleData: TeamData[] = [];
  for (let i = 0; i < teamCount; i++) {
    const baseTeam = template.sampleData[i % template.sampleData.length];
    sampleData.push({
      ...baseTeam,
      teamName: i < template.sampleData.length ? baseTeam.teamName : `Team ${i + 1}`
    });
  }
  
  const csvContent = arrayToCSV(sampleData, template.headers);
  downloadCSV(csvContent, template.filename);
}

/**
 * Validate team names for tournament
 */
export function validateTeamNames(teams: TeamData[]): { isValid: boolean, errors: string[] } {
  const errors: string[] = [];
  const teamNames = new Set<string>();
  
  teams.forEach((team, index) => {
    // Check for required team name
    if (!team.teamName || team.teamName.trim() === '') {
      errors.push(`Row ${index + 1}: Team name is required`);
      return;
    }
    
    // Check for duplicate team names
    const normalizedName = team.teamName.trim().toLowerCase();
    if (teamNames.has(normalizedName)) {
      errors.push(`Row ${index + 1}: Duplicate team name "${team.teamName}"`);
    } else {
      teamNames.add(normalizedName);
    }
    
    // Check team name length
    if (team.teamName.trim().length > 50) {
      errors.push(`Row ${index + 1}: Team name too long (max 50 characters)`);
    }
    
    // Validate email format if provided
    if (team.contactEmail && team.contactEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(team.contactEmail)) {
        errors.push(`Row ${index + 1}: Invalid email format "${team.contactEmail}"`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}