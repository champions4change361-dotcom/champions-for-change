/**
 * 🏥 NFL INJURY SCRAPER
 * Automated scraping of official NFL injury reports from NFL.com
 * Scheduled updates throughout game days for real-time injury status
 */

import axios from 'axios';
import cheerio from 'cheerio';
import cron from 'node-cron';

export interface NFLInjuryData {
  playerName: string;
  team: string;
  position: string;
  injury: string;
  practiceStatus: string;
  gameStatus: 'Out' | 'Questionable' | 'Doubtful' | 'Probable' | '';
  lastUpdated: string;
}

export interface NFLInjuryReport {
  week: number;
  season: number;
  lastUpdated: string;
  injuries: NFLInjuryData[];
  totalPlayers: number;
}

export class NFLInjuryScraper {
  private static instance: NFLInjuryScraper;
  private latestReport: NFLInjuryReport | null = null;
  private isRunning = false;
  private jobs: any[] = [];

  private constructor() {
    this.setupScheduledUpdates();
  }

  public static getInstance(): NFLInjuryScraper {
    if (!NFLInjuryScraper.instance) {
      NFLInjuryScraper.instance = new NFLInjuryScraper();
    }
    return NFLInjuryScraper.instance;
  }

  /**
   * 📅 Setup automated injury report updates
   * Sunday: 2am, 11am, 11:45am, 2pm, 2:45pm, 3:30pm EST
   * Monday: 6am, 12pm, 7pm EST (MNF)
   * Thursday: 6am, 12pm, 7pm EST (TNF)
   */
  private setupScheduledUpdates(): void {
    console.log('🏥 Setting up NFL injury report scheduled updates...');

    // Sunday injury updates (Eastern Time)
    const sundayTimes = ['2 0', '11 0', '45 11', '14 0', '45 14', '30 15'];
    sundayTimes.forEach((time, index) => {
      const [minute, hour] = time.split(' ');
      const job = cron.schedule(`${minute} ${hour} * * 0`, () => {
        this.updateInjuryReport(`Sunday Update ${index + 1}`);
      }, {
        timezone: "America/New_York"
      });
      this.jobs.push(job);
    });

    // Monday updates (MNF)
    const mondayTimes = ['0 6', '0 12', '0 19'];
    mondayTimes.forEach((time, index) => {
      const [minute, hour] = time.split(' ');
      const job = cron.schedule(`${minute} ${hour} * * 1`, () => {
        this.updateInjuryReport(`Monday MNF Update ${index + 1}`);
      }, {
        timezone: "America/New_York"
      });
      this.jobs.push(job);
    });

    // Thursday updates (TNF)
    const thursdayTimes = ['0 6', '0 12', '0 19'];
    thursdayTimes.forEach((time, index) => {
      const [minute, hour] = time.split(' ');
      const job = cron.schedule(`${minute} ${hour} * * 4`, () => {
        this.updateInjuryReport(`Thursday TNF Update ${index + 1}`);
      }, {
        timezone: "America/New_York"
      });
      this.jobs.push(job);
    });

    console.log(`🗓️ Scheduled ${this.jobs.length} NFL injury update jobs`);
  }

  /**
   * 🚀 Start all scheduled injury updates
   */
  public startScheduledUpdates(): void {
    console.log('▶️ Starting NFL injury report scheduled updates...');
    this.jobs.forEach(job => job.start());
    
    // Run initial update
    this.updateInjuryReport('Initial Load');
  }

  /**
   * ⏸️ Stop all scheduled updates
   */
  public stopScheduledUpdates(): void {
    console.log('⏸️ Stopping NFL injury report scheduled updates...');
    this.jobs.forEach(job => job.stop());
  }

  /**
   * 🔄 Manually trigger injury report update
   */
  public async updateInjuryReport(trigger: string = 'Manual'): Promise<NFLInjuryReport | null> {
    if (this.isRunning) {
      console.log('⏳ NFL injury update already in progress, skipping...');
      return this.latestReport;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`🏥 [${trigger}] Fetching NFL injury report from NFL.com...`);
      
      const report = await this.scrapeNFLInjuries();
      
      if (report) {
        const changeCount = this.compareReports(this.latestReport, report);
        this.latestReport = report;
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${trigger}] NFL injury report updated successfully`);
        console.log(`📊 Found ${report.totalPlayers} players with injury designations`);
        console.log(`🔄 ${changeCount} changes detected since last update`);
        console.log(`⏱️ Processing time: ${processingTime}ms`);
        
        return report;
      }
      
      return null;
    } catch (error: any) {
      console.error(`❌ [${trigger}] Failed to update NFL injury report:`, error.message);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 🕸️ Scrape injury data from NFL.com
   */
  private async scrapeNFLInjuries(): Promise<NFLInjuryReport | null> {
    try {
      const url = 'https://www.nfl.com/injuries/';
      
      // Respectful scraping - add user agent and delay
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Champions4Change-Fantasy-Bot/1.0; +https://championsforchange.net)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const injuries: NFLInjuryData[] = [];
      
      // Parse the injury table structure
      $('table').each((tableIndex: number, table: any) => {
        const teamName = $(table).closest('div').find('h3, h4').first().text().trim();
        
        $(table).find('tbody tr').each((rowIndex: number, row: any) => {
          const cells = $(row).find('td');
          
          if (cells.length >= 5) {
            const playerName = $(cells[0]).text().trim();
            const position = $(cells[1]).text().trim();
            const injury = $(cells[2]).text().trim();
            const practiceStatus = $(cells[3]).text().trim();
            const gameStatus = $(cells[4]).text().trim() as 'Out' | 'Questionable' | 'Doubtful' | 'Probable' | '';
            
            if (playerName && position) {
              // Extract team abbreviation from team name or use a mapping
              const team = this.extractTeamAbbreviation(teamName);
              
              injuries.push({
                playerName,
                team,
                position,
                injury: injury || '',
                practiceStatus: practiceStatus || '',
                gameStatus: gameStatus || '',
                lastUpdated: new Date().toISOString()
              });
            }
          }
        });
      });

      // Extract week and season from page
      const weekMatch = response.data.match(/WEEK\s+(\d+)/i);
      const seasonMatch = response.data.match(/(\d{4})\s+NFL/i);
      
      const week = weekMatch ? parseInt(weekMatch[1]) : this.getCurrentNFLWeek();
      const season = seasonMatch ? parseInt(seasonMatch[1]) : new Date().getFullYear();

      return {
        week,
        season,
        lastUpdated: new Date().toISOString(),
        injuries,
        totalPlayers: injuries.length
      };

    } catch (error: any) {
      console.error('❌ Failed to scrape NFL injury data:', error.message);
      throw error;
    }
  }

  /**
   * 🏈 Extract team abbreviation from team name
   */
  private extractTeamAbbreviation(teamName: string): string {
    const teamMap: Record<string, string> = {
      'Cardinals': 'ARI', 'Falcons': 'ATL', 'Ravens': 'BAL', 'Bills': 'BUF',
      'Panthers': 'CAR', 'Bears': 'CHI', 'Bengals': 'CIN', 'Browns': 'CLE',
      'Cowboys': 'DAL', 'Broncos': 'DEN', 'Lions': 'DET', 'Packers': 'GB',
      'Texans': 'HOU', 'Colts': 'IND', 'Jaguars': 'JAX', 'Chiefs': 'KC',
      'Raiders': 'LV', 'Chargers': 'LAC', 'Rams': 'LAR', 'Dolphins': 'MIA',
      'Vikings': 'MIN', 'Patriots': 'NE', 'Saints': 'NO', 'Giants': 'NYG',
      'Jets': 'NYJ', 'Eagles': 'PHI', 'Steelers': 'PIT', '49ers': 'SF',
      'Seahawks': 'SEA', 'Buccaneers': 'TB', 'Titans': 'TEN', 'Commanders': 'WAS'
    };

    // Try to find team abbreviation in the team name
    for (const [name, abbr] of Object.entries(teamMap)) {
      if (teamName.toLowerCase().includes(name.toLowerCase())) {
        return abbr;
      }
    }

    // Fallback - extract first 3 letters or existing abbreviation
    const abbr = teamName.match(/\b([A-Z]{2,3})\b/);
    return abbr ? abbr[1] : teamName.substring(0, 3).toUpperCase();
  }

  /**
   * 📅 Get current NFL week (rough estimate)
   */
  private getCurrentNFLWeek(): number {
    const now = new Date();
    const seasonStart = new Date(now.getFullYear(), 8, 1); // September 1st
    const weeksSince = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(18, weeksSince + 1));
  }

  /**
   * 🔍 Compare two injury reports and count changes
   */
  private compareReports(oldReport: NFLInjuryReport | null, newReport: NFLInjuryReport): number {
    if (!oldReport) return newReport.totalPlayers;

    let changes = 0;
    const oldPlayers = new Map(oldReport.injuries.map(p => [`${p.playerName}_${p.team}`, p]));
    
    newReport.injuries.forEach(newPlayer => {
      const key = `${newPlayer.playerName}_${newPlayer.team}`;
      const oldPlayer = oldPlayers.get(key);
      
      if (!oldPlayer || oldPlayer.gameStatus !== newPlayer.gameStatus) {
        changes++;
      }
    });

    return changes;
  }

  /**
   * 📊 Get latest injury report
   */
  public getLatestReport(): NFLInjuryReport | null {
    return this.latestReport;
  }

  /**
   * 🔍 Get injury status for specific player
   */
  public getPlayerInjuryStatus(playerName: string, team: string): NFLInjuryData | null {
    if (!this.latestReport) return null;
    
    return this.latestReport.injuries.find(
      injury => injury.playerName.toLowerCase().includes(playerName.toLowerCase()) &&
                injury.team.toLowerCase() === team.toLowerCase()
    ) || null;
  }

  /**
   * 📋 Get all injuries for a specific team
   */
  public getTeamInjuries(team: string): NFLInjuryData[] {
    if (!this.latestReport) return [];
    
    return this.latestReport.injuries.filter(
      injury => injury.team.toLowerCase() === team.toLowerCase()
    );
  }

  /**
   * 🏥 Convert NFL game status to our injury status format
   */
  public static convertToInjuryStatus(nflStatus: string): 'active' | 'out' | 'questionable' | 'doubtful' | 'probable' {
    switch (nflStatus.toLowerCase()) {
      case 'out': return 'out';
      case 'questionable': return 'questionable';
      case 'doubtful': return 'doubtful';
      case 'probable': return 'probable';
      default: return 'active';
    }
  }
}

// Export singleton instance
export const nflInjuryScraper = NFLInjuryScraper.getInstance();