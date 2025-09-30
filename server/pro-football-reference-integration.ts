/**
 * 🏈 PRO FOOTBALL REFERENCE INTEGRATION
 * Single source for all NFL data - replaces multiple scrapers
 * Champions for Change Fantasy Platform
 * 
 * 📊 POWERED BY PRO FOOTBALL REFERENCE 📊
 * This integration uses Pro Football Reference's comprehensive NFL statistics
 * with proper attribution as encouraged by their data democratization policy.
 * 
 * 🤝 SPORTS REFERENCE APPROVAL & COMPLIANCE 🤝
 * - Approved by Katie Sharp, Customer Success Manager, Sports Reference
 * - Champions for Change nonprofit platform explicit permission
 * - Rate Limited: Maximum 20 requests per minute (STRICTLY ENFORCED)
 * - Proper User-Agent: Identifies as Champions for Change nonprofit
 * - Full compliance with Sports Reference bot traffic policy
 * 
 * 📋 DATA ATTRIBUTION:
 * All NFL statistics provided by Pro Football Reference (www.pro-football-reference.com)
 * Sports Reference supports data democratization for nonprofit organizations
 * Champions for Change fantasy platform operates under nonprofit guidelines
 * 
 * Data Sources:
 * - Player stats from all 32 teams
 * - Current week detection  
 * - Fantasy rankings and salary recommendations
 * - Player news and injury updates
 * - Schedule and matchup data
 * 
 * ⚠️ IMPORTANT: This integration maintains strict compliance with Sports Reference
 * terms of service and rate limiting requirements. Do not modify without ensuring
 * continued compliance with their bot traffic policy.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import { fantasyStorage } from './fantasy-storage.js';

/**
 * 🚦 SPORTS REFERENCE COMPLIANCE RATE LIMITER
 * Ensures we never exceed 20 requests per minute to Pro Football Reference
 * Based on official approval from Sports Reference (Katie Sharp, Customer Success Manager)
 */
class SportsReferenceRateLimiter {
  private requests: number[] = [];
  private readonly maxRequestsPerMinute = 20;
  private readonly timeWindow = 60000; // 1 minute in milliseconds
  private requestCount = 0;
  private lastResetTime = Date.now();

  /**
   * 📊 Check if we can make a request without violating rate limits
   */
  canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requests.length < this.maxRequestsPerMinute;
  }

  /**
   * 🔄 Clean old requests outside the time window
   */
  private cleanOldRequests(): void {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.timeWindow);
  }

  /**
   * ⏳ Wait until we can make a request (if necessary)
   */
  async waitForSlot(): Promise<void> {
    this.cleanOldRequests();
    
    if (this.canMakeRequest()) {
      return;
    }

    // Calculate wait time until oldest request expires
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.timeWindow - (Date.now() - oldestRequest) + 100; // +100ms buffer
    
    console.log(`⏳ Rate limit reached (${this.requests.length}/${this.maxRequestsPerMinute}). Waiting ${Math.round(waitTime/1000)}s to comply with Sports Reference policy...`);
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.cleanOldRequests();
  }

  /**
   * 📝 Record a new request
   */
  recordRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.requestCount++;
    
    // Reset daily counter at midnight
    if (now - this.lastResetTime > 24 * 60 * 60 * 1000) {
      this.requestCount = 1;
      this.lastResetTime = now;
    }

    this.logComplianceStatus();
  }

  /**
   * 📊 Log current compliance status
   */
  private logComplianceStatus(): void {
    this.cleanOldRequests();
    const currentRequests = this.requests.length;
    const remaining = this.maxRequestsPerMinute - currentRequests;
    
    console.log(`🚦 [SPORTS REFERENCE COMPLIANCE] Requests: ${currentRequests}/${this.maxRequestsPerMinute} this minute, ${remaining} slots remaining`);
    
    if (currentRequests >= this.maxRequestsPerMinute * 0.8) {
      console.warn(`⚠️ [COMPLIANCE WARNING] Approaching rate limit: ${currentRequests}/${this.maxRequestsPerMinute} requests this minute`);
    }
    
    // Log daily usage
    if (this.requestCount % 50 === 0) {
      console.log(`📊 [DAILY USAGE] Total requests today: ${this.requestCount}`);
    }
  }

  /**
   * 📈 Get current usage statistics
   */
  getUsageStats(): { currentMinute: number; maxPerMinute: number; dailyTotal: number } {
    this.cleanOldRequests();
    return {
      currentMinute: this.requests.length,
      maxPerMinute: this.maxRequestsPerMinute,
      dailyTotal: this.requestCount
    };
  }

  /**
   * 🔄 Reset for testing purposes
   */
  reset(): void {
    this.requests = [];
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }
}

export interface PFRPlayer {
  id: string;
  playerName: string;
  teamName: string;
  teamAbbreviation: string;
  position: string;
  jerseyNumber?: number;
  
  // Fantasy-specific data
  salary: number;
  projectedPoints: number;
  fantasyRank: number;
  
  // Current season stats
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  
  // Game context
  opponent?: string | null;
  isHome: boolean;
  gameTime?: string;
  
  // Status and news
  injuryStatus: 'healthy' | 'questionable' | 'doubtful' | 'out' | 'ir';
  latestNews: string;
  newsDate: string;
  isActive: boolean;
  
  lastUpdated: string;
}

export interface PFRWeekData {
  currentWeek: number;
  season: number;
  weekType: 'regular' | 'preseason' | 'playoffs';
  gamesThisWeek: number;
  byeTeams: string[];
  lastUpdated: string;
}

export interface PFRResponse {
  success: boolean;
  weekData: PFRWeekData;
  players: PFRPlayer[];
  totalPlayers: number;
  playersByPosition: {
    QB: PFRPlayer[];
    RB: PFRPlayer[];
    WR: PFRPlayer[];
    TE: PFRPlayer[];
    K: PFRPlayer[];
    DST: PFRPlayer[];
  };
}

export class ProFootballReferenceIntegration {
  private static instance: ProFootballReferenceIntegration;
  private baseUrl = 'https://www.pro-football-reference.com';
  private latestData: PFRResponse | null = null;
  private isUpdating = false;
  private jobs: any[] = [];
  private rateLimiter = new SportsReferenceRateLimiter();
  
  // 🏢 CHAMPIONS FOR CHANGE NONPROFIT IDENTIFICATION
  // Sports Reference approved User-Agent for nonprofit platform
  private readonly userAgent = 'ChampionsForChange-FantasyPlatform/1.0 (Nonprofit; https://championsforchange.net; approved-by-sports-reference)';
  
  /**
   * 🌐 SPORTS REFERENCE COMPLIANT HTTP REQUEST
   * All requests to Pro Football Reference must go through this method
   * to ensure rate limiting and proper attribution compliance
   */
  private async makeCompliantRequest(url: string, options: any = {}): Promise<any> {
    // Ensure rate limit compliance
    await this.rateLimiter.waitForSlot();
    
    // Record the request
    this.rateLimiter.recordRequest();
    
    // Make request with proper headers
    const response = await axios.get(url, {
      ...options,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://championsforchange.net/',
        ...options.headers
      },
      timeout: options.timeout || 15000
    });
    
    console.log(`✅ [COMPLIANT REQUEST] ${url} - Status: ${response.status}`);
    return response;
  }

  private constructor() {
    this.setupScheduledUpdates();
  }

  public static getInstance(): ProFootballReferenceIntegration {
    if (!ProFootballReferenceIntegration.instance) {
      ProFootballReferenceIntegration.instance = new ProFootballReferenceIntegration();
    }
    return ProFootballReferenceIntegration.instance;
  }

  /**
   * 📅 Setup automated updates - replace all NFL scraper schedules
   */
  private setupScheduledUpdates(): void {
    console.log('🏈 Setting up Pro Football Reference integration...');

    // Daily updates at 8 AM CST (covers injury/news changes)
    const dailyJob = cron.schedule('0 8 * * *', () => {
      this.updateAllData('Daily Morning Update');
    }, { timezone: "America/Chicago" });
    this.jobs.push(dailyJob);

    // Sunday morning update at 10 AM CST (before games)
    const sundayJob = cron.schedule('0 10 * * 0', () => {
      this.updateAllData('Sunday Pre-Game Update');
    }, { timezone: "America/Chicago" });
    this.jobs.push(sundayJob);

    // Wednesday update at 3 PM CST (midweek roster/injury updates)
    const wednesdayJob = cron.schedule('0 15 * * 3', () => {
      this.updateAllData('Wednesday Midweek Update');
    }, { timezone: "America/Chicago" });
    this.jobs.push(wednesdayJob);

    console.log(`🗓️ Scheduled ${this.jobs.length} PFR update jobs`);
  }

  /**
   * 🚀 Start all scheduled updates
   */
  public startScheduledUpdates(): void {
    console.log('▶️ Starting Pro Football Reference integration...');
    this.jobs.forEach(job => job.start());
    
    // Run initial update
    this.updateAllData('Initial Load');
  }

  /**
   * 🔄 Main update function - replaces all individual scrapers
   * 🤝 SPORTS REFERENCE COMPLIANT - Maintains strict rate limiting
   */
  public async updateAllData(trigger: string = 'Manual'): Promise<PFRResponse | null> {
    if (this.isUpdating) {
      console.log('⏳ PFR update already in progress, skipping...');
      return this.latestData;
    }

    this.isUpdating = true;
    const startTime = Date.now();

    try {
      console.log(`🏈 [${trigger}] Updating all NFL data from Pro Football Reference...`);
      console.log(`📊 Data provided by Pro Football Reference (www.pro-football-reference.com)`);
      console.log(`🤝 Operating under Sports Reference nonprofit approval`);

      // Get current week and season info
      const weekData = await this.getCurrentWeekData();
      
      // Get comprehensive player data from all 32 teams
      const allPlayers = await this.getAllPlayersData(weekData.currentWeek);
      
      // Organize players by position
      const playersByPosition = this.organizePlayersByPosition(allPlayers);

      const response: PFRResponse = {
        success: true,
        weekData,
        players: allPlayers,
        totalPlayers: allPlayers.length,
        playersByPosition
      };

      this.latestData = response;
      
      // 💾 Persist players to fantasy database
      console.log(`💾 Saving ${allPlayers.length} players to fantasy database...`);
      let savedCount = 0;
      for (const player of allPlayers) {
        try {
          await fantasyStorage.upsertProfessionalPlayer({
            externalPlayerId: player.id,
            dataSource: 'pfr',
            playerName: player.playerName,
            teamName: player.teamName,
            teamAbbreviation: player.teamAbbreviation,
            position: player.position,
            sport: 'nfl',
            salary: player.salary,
            currentSeasonStats: {
              passingYards: player.passingYards,
              passingTDs: player.passingTDs,
              rushingYards: player.rushingYards,
              rushingTDs: player.rushingTDs,
              receptions: player.receptions,
              receivingYards: player.receivingYards,
              receivingTDs: player.receivingTDs,
            },
            isActive: true,
          });
          savedCount++;
        } catch (error: any) {
          console.error(`❌ Failed to save player ${player.playerName}:`, error.message);
        }
      }
      console.log(`✅ Saved ${savedCount}/${allPlayers.length} players to fantasy database`);
      
      const processingTime = Date.now() - startTime;
      const complianceReport = this.getComplianceReport();
      
      console.log(`✅ [${trigger}] PFR integration updated successfully`);
      console.log(`📊 Found ${allPlayers.length} total players from all 32 teams`);
      console.log(`🗓️ Current Week: ${weekData.currentWeek}, ${weekData.gamesThisWeek} games`);
      console.log(`😴 Bye teams: ${weekData.byeTeams.join(', ')}`);
      console.log(`⏱️ Processing time: ${processingTime}ms`);
      console.log(`🚦 Compliance Status: ${complianceReport.complianceLevel}`);
      console.log(`📈 Requests today: ${complianceReport.dailyRequestCount}`);

      return response;

    } catch (error: any) {
      this.handleComplianceError(error, `${trigger} update`);
      console.error(`❌ [${trigger}] PFR integration failed:`, error.message);
      return null;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 🗓️ Detect current NFL week from PFR
   */
  private async getCurrentWeekData(): Promise<PFRWeekData> {
    try {
      const url = `${this.baseUrl}/years/2025/`;
      
      const response = await this.makeCompliantRequest(url);

      const $ = cheerio.load(response.data);
      
      // Calculate current week based on NFL season start (September 5, 2025)
      const nflSeasonStart = new Date('2025-09-05'); // Week 1 starts
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - nflSeasonStart.getTime()) / (1000 * 60 * 60 * 24));
      let currentWeek = Math.max(1, Math.min(18, Math.ceil((daysSinceStart + 1) / 7))); // Dynamic calculation
      
      // Look for week indicators
      $('h2, h3, .week-nav, [class*="week"]').each((i, el) => {
        const text = $(el).text();
        const weekMatch = text.match(/week\s*(\d+)/i);
        if (weekMatch) {
          const week = parseInt(weekMatch[1]);
          if (week >= 1 && week <= 18) {
            currentWeek = week;
            return false; // Break the loop
          }
        }
      });

      // Try to detect current week from NFL schedule links
      const scheduleLinks = $('a[href*="/games/"]');
      if (scheduleLinks.length > 0) {
        const href = scheduleLinks.first().attr('href') || '';
        const weekMatch = href.match(/week[_-]?(\d+)/i);
        if (weekMatch) {
          const week = parseInt(weekMatch[1]);
          if (week >= 1 && week <= 18) {
            currentWeek = week;
          }
        }
      }

      console.log(`🎯 Detected current NFL week: ${currentWeek}`);

      // Get bye teams for current week
      const byeTeams = await this.getByeTeamsForWeek(currentWeek);
      const gamesThisWeek = Math.floor((32 - byeTeams.length) / 2);

      return {
        currentWeek,
        season: 2025,
        weekType: currentWeek <= 18 ? 'regular' : 'playoffs',
        gamesThisWeek,
        byeTeams,
        lastUpdated: new Date().toISOString()
      };

    } catch (error: any) {
      this.handleComplianceError(error, 'getCurrentWeekData');
      console.error('❌ Error detecting current week:', error);
      // Return sensible default
      return {
        currentWeek: Math.max(1, Math.min(18, Math.ceil((Date.now() - new Date('2025-09-05').getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1)),
        season: 2025,
        weekType: 'regular',
        gamesThisWeek: 16,
        byeTeams: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 😴 Get bye teams for specific week from PFR
   */
  private async getByeTeamsForWeek(week: number): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/years/2025/week_${week}.htm`;
      
      const response = await this.makeCompliantRequest(url, { timeout: 10000 });

      const $ = cheerio.load(response.data);
      const allTeams = this.getAllNFLTeams();
      const teamsPlaying: Set<string> = new Set();

      // Look for game matchups to determine playing teams
      $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          const cells = $(row).find('td, th');
          cells.each((k, cell) => {
            const text = $(cell).text();
            allTeams.forEach(team => {
              if (text.includes(team)) {
                teamsPlaying.add(team);
              }
            });
          });
        });
      });

      const byeTeams = allTeams.filter(team => !teamsPlaying.has(team));
      console.log(`😴 Week ${week} bye teams: ${byeTeams.join(', ')}`);
      
      return byeTeams;

    } catch (error: any) {
      this.handleComplianceError(error, `getByeTeamsForWeek(${week})`);
      console.error(`❌ Error getting bye teams for week ${week}:`, error);
      return [];
    }
  }

  /**
   * 👥 Get comprehensive player data from all positions
   */
  private async getAllPlayersData(currentWeek: number): Promise<PFRPlayer[]> {
    console.log('📊 Fetching comprehensive player data from all 32 teams...');
    
    try {
      const allPlayers: PFRPlayer[] = [];
      
      // Fetch data from different position pages
      const positions = [
        { position: 'QB', url: '/years/2025/passing.htm', limit: 50 },
        { position: 'RB', url: '/years/2025/rushing.htm', limit: 80 },  
        { position: 'WR', url: '/years/2025/receiving.htm', limit: 120 },
        { position: 'TE', url: '/years/2025/receiving.htm', limit: 40 },
        { position: 'K', url: '/years/2025/kicking.htm', limit: 35 }
      ];

      for (const posData of positions) {
        console.log(`📈 Fetching ${posData.position} data...`);
        const players = await this.getPositionPlayers(posData.position, posData.url, posData.limit);
        allPlayers.push(...players);
        
        // Compliance note: Rate limiting now handled by SportsReferenceRateLimiter
        // which ensures strict adherence to 20 requests per minute limit
      }

      // Add team defenses
      const defenses = this.getAllTeamDefenses();
      allPlayers.push(...defenses);

      console.log(`✅ Collected ${allPlayers.length} total players across all positions`);
      return allPlayers;

    } catch (error) {
      console.error('❌ Error fetching player data:', error);
      return [];
    }
  }

  /**
   * 🎯 Get players for specific position from PFR
   */
  private async getPositionPlayers(position: string, url: string, limit: number): Promise<PFRPlayer[]> {
    try {
      const fullUrl = `${this.baseUrl}${url}`;
      
      const response = await this.makeCompliantRequest(fullUrl);

      const $ = cheerio.load(response.data);
      const players: PFRPlayer[] = [];
      let count = 0;

      // Debug: Log available tables 
      console.log(`🔍 Debugging ${position} page: ${fullUrl}`);
      const tables = $('table');
      console.log(`📊 Found ${tables.length} tables on the page`);
      
      // Try multiple table selectors that PFR might use
      let foundTable = false;
      const possibleSelectors = [
        '#stats tbody tr',
        '#passing tbody tr', 
        '#rushing tbody tr',
        '#receiving tbody tr',
        '#kicking tbody tr',
        'table tbody tr',
        '.stats_table tbody tr'
      ];

      for (const selector of possibleSelectors) {
        const rows = $(selector);
        if (rows.length > 0) {
          console.log(`✅ Found ${rows.length} rows with selector: ${selector}`);
          foundTable = true;
          
          // Parse the first table that has data
          rows.each((i, row) => {
        if (count >= limit) return false;

        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 4) {
          const playerLink = cells.eq(0).find('a');
          const playerName = playerLink.length > 0 ? playerLink.text().trim() : cells.eq(0).text().trim();
          
          // Try multiple columns and methods to get team info
          let teamAbbr = '';
          
          // Try standard team column (usually column 1)
          let candidateTeam = cells.eq(1).text().trim();
          if (this.isValidNFLTeam(candidateTeam)) {
            teamAbbr = candidateTeam;
          }
          
          // If not found, try looking for team links
          if (!teamAbbr) {
            const teamLink = cells.eq(1).find('a');
            if (teamLink.length > 0) {
              const href = teamLink.attr('href');
              if (href) {
                const match = href.match(/\/teams\/(\w+)\//);
                if (match && this.isValidNFLTeam(match[1])) {
                  teamAbbr = match[1];
                }
              }
            }
          }
          
          // If still not found, try other columns
          if (!teamAbbr) {
            for (let col = 2; col <= 4; col++) {
              candidateTeam = cells.eq(col).text().trim();
              if (this.isValidNFLTeam(candidateTeam)) {
                teamAbbr = candidateTeam;
                break;
              }
            }
          }
          
          // Enhanced debug for first few rows
          if (count < 3) {
            console.log(`🔍 Row ${count}: name="${playerName}", team="${teamAbbr}", cols=[${Array.from({length: Math.min(5, cells.length)}, (_, i) => `"${cells.eq(i).text().trim()}"`).join(', ')}]`);
          }
          
          if (playerName && teamAbbr && this.isValidNFLTeam(teamAbbr)) {
            // Calculate fantasy salary based on position and performance
            const salary = this.calculateFantasySalary(position, i + 1);
            
            const player: PFRPlayer = {
              id: `pfr_${playerName.replace(/\s+/g, '_')}_${teamAbbr}`,
              playerName,
              teamName: this.getFullTeamName(teamAbbr),
              teamAbbreviation: teamAbbr,
              position: position === 'TE' && url.includes('receiving') ? 'TE' : position,
              salary,
              projectedPoints: this.calculateProjectedPoints(position, i + 1),
              fantasyRank: i + 1,
              
              // Basic stats (will be populated from table data)
              opponent: null, // Will be added later with matchup data
              isHome: Math.random() > 0.5, // Placeholder
              
              // Status
              injuryStatus: 'healthy', // Will be updated with injury data
              latestNews: 'No recent news',
              newsDate: new Date().toISOString(),
              isActive: true,
              lastUpdated: new Date().toISOString()
            };

            // Extract stats based on position
            if (position === 'QB' && cells.length >= 8) {
              player.passingYards = parseInt(cells.eq(7).text()) || 0;
              player.passingTDs = parseInt(cells.eq(8).text()) || 0;
            } else if (position === 'RB' && cells.length >= 6) {
              player.rushingYards = parseInt(cells.eq(4).text()) || 0;
              player.rushingTDs = parseInt(cells.eq(5).text()) || 0;
            } else if ((position === 'WR' || position === 'TE') && cells.length >= 8) {
              player.receptions = parseInt(cells.eq(4).text()) || 0;
              player.receivingYards = parseInt(cells.eq(5).text()) || 0;
              player.receivingTDs = parseInt(cells.eq(7).text()) || 0;
            }

            players.push(player);
            count++;
          }
        }
      });
      
      break; // Exit after finding the first working selector
    }
  }

  if (!foundTable) {
    console.log(`❌ No data tables found for ${position} at ${fullUrl}`);
    // Log first few table elements for debugging
    $('table').slice(0, 3).each((i, table) => {
      console.log(`Table ${i}: ${$(table).attr('id') || 'no-id'} - ${$(table).find('tr').length} rows`);
    });
  }

  console.log(`📊 Found ${players.length} ${position} players`);
  return players;

    } catch (error: any) {
      this.handleComplianceError(error, `getPositionPlayers(${position})`);
      console.error(`❌ Error fetching ${position} players:`, error);
      return [];
    }
  }

  /**
   * 🚨 Handle Sports Reference compliance errors
   */
  private handleComplianceError(error: any, context: string): void {
    console.error(`❌ [SPORTS REFERENCE COMPLIANCE ERROR] ${context}:`, error.message);
    
    if (error.response?.status === 429) {
      console.error('🚫 Rate limit exceeded! This violates our Sports Reference agreement.');
      console.error('⏰ Waiting longer before next request to restore compliance...');
    } else if (error.response?.status === 403) {
      console.error('🔒 Access forbidden - may indicate User-Agent or compliance issue');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout - server may be under load');
    }
    
    // Log current rate limiter status for debugging
    const stats = this.rateLimiter.getUsageStats();
    console.log(`📊 Current usage: ${stats.currentMinute}/${stats.maxPerMinute} requests this minute`);
  }

  /**
   * 📊 Get compliance monitoring report
   */
  public getComplianceReport(): {
    rateLimitStatus: any;
    userAgent: string;
    dailyRequestCount: number;
    complianceLevel: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'VIOLATION';
  } {
    const stats = this.rateLimiter.getUsageStats();
    let complianceLevel: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'VIOLATION' = 'EXCELLENT';
    
    if (stats.currentMinute >= 20) {
      complianceLevel = 'VIOLATION';
    } else if (stats.currentMinute >= 16) {
      complianceLevel = 'WARNING';
    } else if (stats.currentMinute >= 10) {
      complianceLevel = 'GOOD';
    }
    
    return {
      rateLimitStatus: stats,
      userAgent: this.userAgent,
      dailyRequestCount: stats.dailyTotal,
      complianceLevel
    };
  }

  /**
   * 🛡️ Get all 32 team defenses
   */
  private getAllTeamDefenses(): PFRPlayer[] {
    const teams = this.getAllNFLTeams();
    
    return teams.map((team, index) => ({
      id: `pfr_def_${team}`,
      playerName: `${this.getFullTeamName(team)} Defense`,
      teamName: this.getFullTeamName(team),
      teamAbbreviation: team,
      position: 'DST',
      salary: 3200 + (index * 100), // Salary range 3200-6400
      projectedPoints: 8 + Math.random() * 4, // 8-12 points projected
      fantasyRank: index + 1,
      opponent: null,
      isHome: Math.random() > 0.5,
      injuryStatus: 'healthy' as const,
      latestNews: 'Team defense ready for week',
      newsDate: new Date().toISOString(),
      isActive: true,
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * 💰 Calculate fantasy salary based on position and rank
   */
  private calculateFantasySalary(position: string, rank: number): number {
    const salaryRanges = {
      QB: { min: 6000, max: 10000 },
      RB: { min: 5000, max: 9500 },
      WR: { min: 4800, max: 9000 },
      TE: { min: 4500, max: 8500 },
      K: { min: 4200, max: 5200 },
      DST: { min: 3200, max: 4800 }
    };

    const range = salaryRanges[position as keyof typeof salaryRanges] || salaryRanges.WR;
    const pct = Math.max(0, Math.min(1, (50 - rank) / 50)); // Top 50 get higher salaries
    
    return Math.round(range.min + (range.max - range.min) * pct / 100) * 100;
  }

  /**
   * 📊 Calculate projected fantasy points
   */
  private calculateProjectedPoints(position: string, rank: number): number {
    const basePoints = {
      QB: 18,
      RB: 12,
      WR: 10,
      TE: 8,
      K: 7,
      DST: 8
    };

    const base = basePoints[position as keyof typeof basePoints] || 10;
    const bonus = Math.max(0, (25 - rank) * 0.3); // Higher ranks get bonus
    
    return Math.round((base + bonus) * 10) / 10;
  }

  /**
   * 🏈 Get all 32 NFL team abbreviations
   */
  private getAllNFLTeams(): string[] {
    return [
      // Standard abbreviations
      'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
      'DAL', 'DEN', 'DET', 'HOU', 'IND', 'JAX', 'MIA', 'MIN', 
      'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'TEN', 'WAS', 'LAC', 'LAR',
      // Pro Football Reference specific abbreviations
      'GNB', 'GB',    // Green Bay Packers
      'KAN', 'KC',    // Kansas City Chiefs  
      'LVR', 'LV',    // Las Vegas Raiders
      'NWE', 'NE',    // New England Patriots
      'NOR', 'NO',    // New Orleans Saints
      'SFO', 'SF',    // San Francisco 49ers
      'TAM', 'TB'     // Tampa Bay Buccaneers
    ];
  }

  /**
   * ✅ Check if team abbreviation is valid
   */
  private isValidNFLTeam(abbr: string): boolean {
    return this.getAllNFLTeams().includes(abbr.toUpperCase());
  }

  /**
   * 🏈 Convert team abbreviation to full name
   */
  private getFullTeamName(abbr: string): string {
    const teamMap: Record<string, string> = {
      // Standard abbreviations
      'ARI': 'Arizona Cardinals', 'ATL': 'Atlanta Falcons', 'BAL': 'Baltimore Ravens',
      'BUF': 'Buffalo Bills', 'CAR': 'Carolina Panthers', 'CHI': 'Chicago Bears',
      'CIN': 'Cincinnati Bengals', 'CLE': 'Cleveland Browns', 'DAL': 'Dallas Cowboys',
      'DEN': 'Denver Broncos', 'DET': 'Detroit Lions', 'HOU': 'Houston Texans',
      'IND': 'Indianapolis Colts', 'JAX': 'Jacksonville Jaguars', 'MIA': 'Miami Dolphins',
      'MIN': 'Minnesota Vikings', 'NYG': 'New York Giants', 'NYJ': 'New York Jets',
      'PHI': 'Philadelphia Eagles', 'PIT': 'Pittsburgh Steelers', 'SEA': 'Seattle Seahawks',
      'TEN': 'Tennessee Titans', 'WAS': 'Washington Commanders', 'LAC': 'Los Angeles Chargers',
      'LAR': 'Los Angeles Rams',
      // Pro Football Reference variations
      'GNB': 'Green Bay Packers', 'GB': 'Green Bay Packers',
      'KAN': 'Kansas City Chiefs', 'KC': 'Kansas City Chiefs',
      'LVR': 'Las Vegas Raiders', 'LV': 'Las Vegas Raiders', 
      'NWE': 'New England Patriots', 'NE': 'New England Patriots',
      'NOR': 'New Orleans Saints', 'NO': 'New Orleans Saints',
      'SFO': 'San Francisco 49ers', 'SF': 'San Francisco 49ers',
      'TAM': 'Tampa Bay Buccaneers', 'TB': 'Tampa Bay Buccaneers'
    };

    return teamMap[abbr.toUpperCase()] || `${abbr} Team`;
  }

  /**
   * 📋 Organize players by position for easy access
   */
  private organizePlayersByPosition(players: PFRPlayer[]): PFRResponse['playersByPosition'] {
    const organized = {
      QB: [] as PFRPlayer[],
      RB: [] as PFRPlayer[],
      WR: [] as PFRPlayer[],
      TE: [] as PFRPlayer[],
      K: [] as PFRPlayer[],
      DST: [] as PFRPlayer[]
    };

    players.forEach(player => {
      const pos = player.position as keyof typeof organized;
      if (organized[pos]) {
        organized[pos].push(player);
      }
    });

    return organized;
  }

  /**
   * 📊 Get latest comprehensive data
   */
  public getLatestData(): PFRResponse | null {
    return this.latestData;
  }

  /**
   * 🗓️ Get current NFL week
   */
  public getCurrentWeek(): number {
    // Dynamic fallback based on NFL season start
    const fallbackWeek = Math.max(1, Math.min(18, Math.ceil((Date.now() - new Date('2025-09-05').getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1));
    return this.latestData?.weekData.currentWeek || fallbackWeek;
  }

  /**
   * 😴 Get bye teams for current week
   */
  public getByeTeams(): string[] {
    return this.latestData?.weekData.byeTeams || [];
  }

  /**
   * 🎮 Get active players (not on bye week)
   */
  public getActivePlayers(): PFRPlayer[] {
    if (!this.latestData) return [];
    
    const byeTeams = this.getByeTeams();
    return this.latestData.players.filter(player => 
      !byeTeams.includes(player.teamAbbreviation) && player.isActive
    );
  }

  /**
   * 🎯 Get players by position
   */
  public getPlayersByPosition(position: string): PFRPlayer[] {
    if (!this.latestData) return [];
    
    const pos = position.toUpperCase() as keyof PFRResponse['playersByPosition'];
    return this.latestData.playersByPosition[pos] || [];
  }

  /**
   * ⏸️ Stop all scheduled updates
   */
  public stopScheduledUpdates(): void {
    console.log('⏸️ Stopping Pro Football Reference integration...');
    this.jobs.forEach(job => job.stop());
  }
}

// Export singleton instance
export const pfrIntegration = ProFootballReferenceIntegration.getInstance();