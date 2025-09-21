/**
 * 📊 NFL REAL STATISTICS SCRAPER
 * Champions for Change Fantasy Platform
 * 
 * Scrapes actual player performance data from NFL.com for accurate fantasy calculations
 * Scheduled to run on Tuesdays after all weekend stats are compiled
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';

export interface NFLPlayerStats {
  playerId: string;
  name: string;
  team: string;
  position: string;
  
  // Passing stats (QB)
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  completions?: number;
  attempts?: number;
  
  // Rushing stats (RB, QB, WR)
  rushingYards?: number;
  rushingTDs?: number;
  rushingAttempts?: number;
  
  // Receiving stats (WR, TE, RB)
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  targets?: number;
  
  // Kicking stats (K)
  fieldGoalsMade?: number;
  fieldGoalAttempts?: number;
  extraPointsMade?: number;
  extraPointAttempts?: number;
  
  // Defense stats (DEF)
  sacks?: number;
  interceptions_def?: number;
  fumblesRecovered?: number;
  defensiveTDs?: number;
  safeties?: number;
  pointsAllowed?: number;
  
  // Calculated fields
  fantasyPoints?: number;
  lastUpdated: string;
  gamesPlayed: number;
  averagePerGame?: number;
}

export class NFLStatsScrapingService {
  private readonly baseUrl = 'https://www.nfl.com/stats/player-stats';
  
  constructor() {
    console.log('🏈 NFL Real Statistics Scraper initialized');
  }

  /**
   * 📊 Main function to scrape all player statistics
   */
  async scrapeAllStats(): Promise<NFLPlayerStats[]> {
    console.log('🔄 [NFL Stats] Starting comprehensive stats scraping...');
    
    try {
      const allStats: Map<string, NFLPlayerStats> = new Map();
      
      // Scrape different stat categories
      const [passingStats, rushingStats, receivingStats, kickingStats] = await Promise.all([
        this.scrapePassingStats(),
        this.scrapeRushingStats(), 
        this.scrapeReceivingStats(),
        this.scrapeKickingStats()
      ]);
      
      // Merge all stats by player
      [...passingStats, ...rushingStats, ...receivingStats, ...kickingStats].forEach(stat => {
        if (stat.name && stat.team && stat.playerId) {
          const key = `${stat.name}_${stat.team}`;
          if (allStats.has(key)) {
            // Merge with existing player stats
            const existing = allStats.get(key)!;
            allStats.set(key, { ...existing, ...stat } as NFLPlayerStats);
          } else {
            allStats.set(key, stat as NFLPlayerStats);
          }
        }
      });
      
      // Convert to array and calculate fantasy points
      const playerStats = Array.from(allStats.values()).map(stat => ({
        ...stat,
        fantasyPoints: this.calculateFantasyPoints(stat),
        averagePerGame: stat.gamesPlayed > 0 ? (stat.fantasyPoints || 0) / stat.gamesPlayed : 0
      }));
      
      console.log(`✅ [NFL Stats] Successfully scraped ${playerStats.length} player stat records`);
      return playerStats;
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error scraping statistics:', error);
      return [];
    }
  }

  /**
   * 🏈 Scrape passing statistics for QBs
   */
  private async scrapePassingStats(): Promise<Partial<NFLPlayerStats>[]> {
    console.log('🎯 [NFL Stats] Scraping passing statistics...');
    
    try {
      const url = `${this.baseUrl}/category/passing/2025/reg/all/passingyards/desc`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const stats: Partial<NFLPlayerStats>[] = [];
      
      // NFL.com uses table structure for stats
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 8) {
          const playerCell = cells.eq(0);
          const name = playerCell.find('a').text().trim() || playerCell.text().trim();
          const team = cells.eq(1).text().trim();
          
          stats.push({
            playerId: `${name}_${team}`.replace(/\s+/g, '_'),
            name,
            team,
            position: 'QB',
            passingYards: parseInt(cells.eq(3).text()) || 0,
            passingTDs: parseInt(cells.eq(4).text()) || 0,
            interceptions: parseInt(cells.eq(5).text()) || 0,
            completions: parseInt(cells.eq(6).text()) || 0,
            attempts: parseInt(cells.eq(7).text()) || 0,
            gamesPlayed: parseInt(cells.eq(2).text()) || 1,
            lastUpdated: new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 [NFL Stats] Found ${stats.length} QB passing records`);
      return stats;
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error scraping passing stats:', error);
      return [];
    }
  }

  /**
   * 🏃 Scrape rushing statistics for RBs/QBs/WRs
   */
  private async scrapeRushingStats(): Promise<Partial<NFLPlayerStats>[]> {
    console.log('🎯 [NFL Stats] Scraping rushing statistics...');
    
    try {
      const url = `${this.baseUrl}/category/rushing/2025/reg/all/rushingyards/desc`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const stats: Partial<NFLPlayerStats>[] = [];
      
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 7) {
          const playerCell = cells.eq(0);
          const name = playerCell.find('a').text().trim() || playerCell.text().trim();
          const team = cells.eq(1).text().trim();
          const position = cells.eq(2).text().trim() || 'RB'; // Default to RB
          
          stats.push({
            playerId: `${name}_${team}`.replace(/\s+/g, '_'),
            name,
            team,
            position,
            rushingYards: parseInt(cells.eq(4).text()) || 0,
            rushingTDs: parseInt(cells.eq(5).text()) || 0,
            rushingAttempts: parseInt(cells.eq(6).text()) || 0,
            gamesPlayed: parseInt(cells.eq(3).text()) || 1,
            lastUpdated: new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 [NFL Stats] Found ${stats.length} rushing records`);
      return stats;
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error scraping rushing stats:', error);
      return [];
    }
  }

  /**
   * 🎯 Scrape receiving statistics for WRs/TEs/RBs
   */
  private async scrapeReceivingStats(): Promise<Partial<NFLPlayerStats>[]> {
    console.log('🎯 [NFL Stats] Scraping receiving statistics...');
    
    try {
      const url = `${this.baseUrl}/category/receiving/2025/reg/all/receivingreceptions/desc`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const stats: Partial<NFLPlayerStats>[] = [];
      
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 8) {
          const playerCell = cells.eq(0);
          const name = playerCell.find('a').text().trim() || playerCell.text().trim();
          const team = cells.eq(1).text().trim();
          const position = cells.eq(2).text().trim() || 'WR'; // Default to WR
          
          stats.push({
            playerId: `${name}_${team}`.replace(/\s+/g, '_'),
            name,
            team,
            position,
            receptions: parseInt(cells.eq(4).text()) || 0,
            receivingYards: parseInt(cells.eq(5).text()) || 0,
            receivingTDs: parseInt(cells.eq(6).text()) || 0,
            targets: parseInt(cells.eq(7).text()) || 0,
            gamesPlayed: parseInt(cells.eq(3).text()) || 1,
            lastUpdated: new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 [NFL Stats] Found ${stats.length} receiving records`);
      return stats;
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error scraping receiving stats:', error);
      return [];
    }
  }

  /**
   * 🦵 Scrape kicking statistics for Ks
   */
  private async scrapeKickingStats(): Promise<Partial<NFLPlayerStats>[]> {
    console.log('🎯 [NFL Stats] Scraping kicking statistics...');
    
    try {
      const url = `${this.baseUrl}/category/field-goals/2025/reg/all/kickingfgmade/desc`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const stats: Partial<NFLPlayerStats>[] = [];
      
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 6) {
          const playerCell = cells.eq(0);
          const name = playerCell.find('a').text().trim() || playerCell.text().trim();
          const team = cells.eq(1).text().trim();
          
          stats.push({
            playerId: `${name}_${team}`.replace(/\s+/g, '_'),
            name,
            team,
            position: 'K',
            fieldGoalsMade: parseInt(cells.eq(3).text()) || 0,
            fieldGoalAttempts: parseInt(cells.eq(4).text()) || 0,
            extraPointsMade: parseInt(cells.eq(5).text()) || 0,
            gamesPlayed: parseInt(cells.eq(2).text()) || 1,
            lastUpdated: new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 [NFL Stats] Found ${stats.length} kicking records`);
      return stats;
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error scraping kicking stats:', error);
      return [];
    }
  }

  /**
   * 🧮 Calculate PPR fantasy points from real stats
   */
  private calculateFantasyPoints(stats: Partial<NFLPlayerStats>): number {
    let points = 0;
    
    // Passing points (0.04 per yard, 4 per TD, -2 per INT)
    if (stats.passingYards) points += stats.passingYards * 0.04;
    if (stats.passingTDs) points += stats.passingTDs * 4;
    if (stats.interceptions) points -= stats.interceptions * 2;
    
    // Rushing points (0.1 per yard, 6 per TD)
    if (stats.rushingYards) points += stats.rushingYards * 0.1;
    if (stats.rushingTDs) points += stats.rushingTDs * 6;
    
    // Receiving points (1 per reception, 0.1 per yard, 6 per TD)
    if (stats.receptions) points += stats.receptions * 1; // PPR
    if (stats.receivingYards) points += stats.receivingYards * 0.1;
    if (stats.receivingTDs) points += stats.receivingTDs * 6;
    
    // Kicking points (3 per FG, 1 per XP)
    if (stats.fieldGoalsMade) points += stats.fieldGoalsMade * 3;
    if (stats.extraPointsMade) points += stats.extraPointsMade * 1;
    
    return Math.round(points * 10) / 10;
  }

  /**
   * 💾 Save stats to database
   */
  async saveStatsToDatabase(stats: NFLPlayerStats[]): Promise<void> {
    try {
      console.log('💾 [NFL Stats] Saving player statistics to database...');
      
      // Store stats with timestamp
      await storage.storeNFLPlayerStats(stats);
      
      console.log(`✅ [NFL Stats] Successfully saved ${stats.length} player stat records`);
      
    } catch (error) {
      console.error('❌ [NFL Stats] Error saving stats to database:', error);
    }
  }

  /**
   * 🔄 Full stats update process
   */
  async updateAllStats(): Promise<void> {
    console.log('🔄 [NFL Stats] Starting Tuesday stats update process...');
    
    try {
      // Scrape all current stats
      const stats = await this.scrapeAllStats();
      
      if (stats.length > 0) {
        // Save to database
        await this.saveStatsToDatabase(stats);
        
        console.log(`✅ [NFL Stats] Tuesday update complete: ${stats.length} players updated`);
        console.log(`📊 Sample players: ${stats.slice(0, 3).map(p => `${p.name} (${p.team}) - ${p.fantasyPoints} pts`).join(', ')}`);
      } else {
        console.warn('⚠️ [NFL Stats] No stats scraped - check NFL.com connectivity');
      }
      
    } catch (error) {
      console.error('❌ [NFL Stats] Tuesday update failed:', error);
    }
  }
}

// Export singleton instance
export const nflStatsService = new NFLStatsScrapingService();