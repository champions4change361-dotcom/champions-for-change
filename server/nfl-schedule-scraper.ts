/**
 * 🗓️ NFL SCHEDULE SCRAPER
 * Automated scraping of official NFL schedules from NFL.com
 * Provides current week, team matchups, and bye week identification
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

export interface NFLGame {
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  gameDay: string;
  status: 'scheduled' | 'live' | 'final';
  homeScore?: number;
  awayScore?: number;
}

export interface NFLWeekSchedule {
  currentWeek: number;
  season: number;
  weekType: 'regular' | 'preseason' | 'playoffs';
  lastUpdated: string;
  games: NFLGame[];
  byeTeams: string[];
  totalGames: number;
  teamsPlaying: string[];
}

export class NFLScheduleScraper {
  private static instance: NFLScheduleScraper;
  private latestSchedule: NFLWeekSchedule | null = null;
  private isRunning = false;
  private jobs: any[] = [];

  private constructor() {
    this.setupScheduledUpdates();
  }

  public static getInstance(): NFLScheduleScraper {
    if (!NFLScheduleScraper.instance) {
      NFLScheduleScraper.instance = new NFLScheduleScraper();
    }
    return NFLScheduleScraper.instance;
  }

  /**
   * 📅 Setup automated schedule updates
   * Tuesday: 3am EST (New week setup)
   * Sunday: 1am, 10am, 1pm EST (Game day updates)
   */
  private setupScheduledUpdates(): void {
    console.log('📅 Setting up NFL schedule update system...');

    // Tuesday new week setup (3am EST)
    const tuesdayJob = cron.schedule('0 3 * * 2', () => {
      this.updateSchedule('Tuesday New Week');
    }, {
      timezone: "America/New_York"
    });
    this.jobs.push(tuesdayJob);

    // Sunday game day updates
    const sundayTimes = ['0 1', '0 10', '0 13']; // 1am, 10am, 1pm EST
    sundayTimes.forEach((time, index) => {
      const [minute, hour] = time.split(' ');
      const job = cron.schedule(`${minute} ${hour} * * 0`, () => {
        this.updateSchedule(`Sunday Game Day ${index + 1}`);
      }, {
        timezone: "America/New_York"
      });
      this.jobs.push(job);
    });

    console.log(`🗓️ Scheduled ${this.jobs.length} NFL schedule update jobs`);
  }

  /**
   * 🚀 Start all scheduled updates
   */
  public startScheduledUpdates(): void {
    console.log('▶️ Starting NFL schedule update system...');
    this.jobs.forEach(job => job.start());
    
    // Run initial update
    this.updateSchedule('Initial Load');
  }

  /**
   * ⏸️ Stop all scheduled updates
   */
  public stopScheduledUpdates(): void {
    console.log('⏸️ Stopping NFL schedule updates...');
    this.jobs.forEach(job => job.stop());
  }

  /**
   * 🔄 Update schedule data
   */
  public async updateSchedule(trigger: string = 'Manual'): Promise<NFLWeekSchedule | null> {
    if (this.isRunning) {
      console.log('⏳ NFL schedule update already in progress, skipping...');
      return this.latestSchedule;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`🗓️ [${trigger}] Fetching NFL schedule from NFL.com...`);
      
      const schedule = await this.scrapeNFLSchedule();
      
      if (schedule) {
        const changeCount = this.compareSchedules(this.latestSchedule, schedule);
        this.latestSchedule = schedule;
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${trigger}] NFL schedule updated successfully`);
        console.log(`📊 Current week: ${schedule.currentWeek}, ${schedule.totalGames} games, ${schedule.byeTeams.length} bye teams`);
        console.log(`🔄 ${changeCount} changes detected since last update`);
        console.log(`⏱️ Processing time: ${processingTime}ms`);
        
        return schedule;
      }
      
      return null;
    } catch (error: any) {
      console.error(`❌ [${trigger}] Failed to update NFL schedule:`, error.message);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 🕸️ Scrape schedule data from NFL.com
   */
  private async scrapeNFLSchedule(): Promise<NFLWeekSchedule | null> {
    try {
      const url = 'https://www.nfl.com/schedules/';
      
      // Respectful scraping with proper headers
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Champions4Change-Schedule-Bot/1.0; +https://championsforchange.net)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const games: NFLGame[] = [];
      const teamsPlaying: Set<string> = new Set();

      // Extract current week number from page
      let currentWeek = 1;
      const weekMatch = response.data.match(/week[\\s-]*(\d+)/i) || 
                        $('.week-selector, .week-nav, h1, h2').text().match(/week[\\s-]*(\d+)/i);
      if (weekMatch) {
        currentWeek = parseInt(weekMatch[1]);
      }

      // Extract season year
      const seasonMatch = response.data.match(/(\d{4})\s*(?:nfl|season)/i);
      const season = seasonMatch ? parseInt(seasonMatch[1]) : new Date().getFullYear();

      // Parse games from the schedule
      $('.schedules-list-matchup, .game-card, .nfl-c-matchup-strip').each((index: number, gameElement: any) => {
        try {
          const $game = $(gameElement);
          
          // Extract team names
          const teams = $game.find('.team-name, .nfl-c-matchup-strip__team-name, .team-abbr')
                              .map((i: number, el: any) => $(el).text().trim())
                              .get()
                              .filter((team: string) => team && team.length > 0);

          // Extract team abbreviations from various selectors
          const teamAbbrs = $game.find('[class*="team"], [class*="abbr"]')
                                 .map((i: number, el: any) => {
                                   const text = $(el).text().trim();
                                   return this.extractTeamAbbreviation(text);
                                 })
                                 .get()
                                 .filter((abbr: string) => abbr && abbr !== 'UNK');

          // Combine teams and abbreviations
          const allTeams = [...teams, ...teamAbbrs].filter((team: string) => 
            team && team.length >= 2 && team.length <= 4
          );

          if (allTeams.length >= 2) {
            const awayTeam = this.normalizeTeamName(allTeams[0]);
            const homeTeam = this.normalizeTeamName(allTeams[1]);

            // Extract game time
            const gameTimeText = $game.find('.game-time, .matchup-time, [class*="time"]').text().trim();
            const gameTime = gameTimeText || 'TBD';

            // Extract game day
            const gameDayText = $game.find('.game-date, .matchup-date, [class*="date"]').text().trim();
            const gameDay = gameDayText || 'Sunday';

            // Determine game status
            let status: 'scheduled' | 'live' | 'final' = 'scheduled';
            const statusText = $game.find('.game-status, [class*="status"]').text().toLowerCase();
            if (statusText.includes('live') || statusText.includes('in progress')) {
              status = 'live';
            } else if (statusText.includes('final') || statusText.includes('end')) {
              status = 'final';
            }

            if (awayTeam && homeTeam && awayTeam !== homeTeam) {
              games.push({
                homeTeam,
                awayTeam,
                gameTime,
                gameDay,
                status
              });

              teamsPlaying.add(awayTeam);
              teamsPlaying.add(homeTeam);
            }
          }
        } catch (gameError) {
          console.log('⚠️ Error parsing individual game:', gameError);
        }
      });

      // Calculate bye teams
      const allNFLTeams = this.getAllNFLTeams();
      const byeTeams = allNFLTeams.filter(team => !teamsPlaying.has(team));

      console.log(`🏈 Parsed ${games.length} games for Week ${currentWeek}`);
      console.log(`🔍 Sample games:`, games.slice(0, 3));
      console.log(`😴 Bye teams (${byeTeams.length}):`, byeTeams);

      return {
        currentWeek,
        season,
        weekType: currentWeek <= 18 ? 'regular' : 'playoffs',
        lastUpdated: new Date().toISOString(),
        games,
        byeTeams,
        totalGames: games.length,
        teamsPlaying: Array.from(teamsPlaying)
      };

    } catch (error: any) {
      console.error('❌ Error scraping NFL schedule:', error.message);
      throw error;
    }
  }

  /**
   * 🏈 Get all 32 NFL team abbreviations
   */
  private getAllNFLTeams(): string[] {
    return [
      'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
      'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
      'LV', 'LAC', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
      'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
    ];
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

    // Direct abbreviation match
    const upperName = teamName.toUpperCase();
    if (this.getAllNFLTeams().includes(upperName)) {
      return upperName;
    }

    // Team name to abbreviation
    for (const [name, abbr] of Object.entries(teamMap)) {
      if (teamName.toLowerCase().includes(name.toLowerCase())) {
        return abbr;
      }
    }

    return 'UNK';
  }

  /**
   * 🏈 Normalize team name to standard abbreviation
   */
  private normalizeTeamName(teamName: string): string {
    const abbr = this.extractTeamAbbreviation(teamName);
    return abbr !== 'UNK' ? abbr : teamName.toUpperCase().slice(0, 3);
  }

  /**
   * 🔄 Compare two schedules and count changes
   */
  private compareSchedules(oldSchedule: NFLWeekSchedule | null, newSchedule: NFLWeekSchedule): number {
    if (!oldSchedule) return newSchedule.totalGames;

    let changes = 0;
    
    if (oldSchedule.currentWeek !== newSchedule.currentWeek) changes++;
    if (oldSchedule.totalGames !== newSchedule.totalGames) changes++;
    if (oldSchedule.byeTeams.length !== newSchedule.byeTeams.length) changes++;

    return changes;
  }

  /**
   * 📊 Get current schedule data
   */
  public getLatestSchedule(): NFLWeekSchedule | null {
    return this.latestSchedule;
  }

  /**
   * 🏈 Get current NFL week
   */
  public getCurrentWeek(): number {
    return this.latestSchedule?.currentWeek || 1;
  }

  /**
   * 😴 Get teams on bye this week
   */
  public getByeTeams(): string[] {
    return this.latestSchedule?.byeTeams || [];
  }

  /**
   * 🆚 Get opponent for a team
   */
  public getOpponent(team: string): string | null {
    if (!this.latestSchedule) return null;

    const game = this.latestSchedule.games.find(
      g => g.homeTeam === team || g.awayTeam === team
    );

    if (game) {
      return game.homeTeam === team ? game.awayTeam : game.homeTeam;
    }

    return null;
  }

  /**
   * ✅ Check if team is playing this week
   */
  public isTeamPlaying(team: string): boolean {
    if (!this.latestSchedule) return true; // Default to true if no data

    return this.latestSchedule.teamsPlaying.includes(team);
  }
}

// Export singleton instance for easy access
export const nflScheduleScraper = NFLScheduleScraper.getInstance();