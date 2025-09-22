import type { NFLGame } from './nfl-schedule-scraper.js';
import type { InsertShowdownContest } from '@shared/schema';

/**
 * Service for auto-generating prime time showdown contests
 * Creates standard contests for Monday Night, Thursday Night, and Sunday Night Football
 */
export class PrimeTimeContestsService {
  
  /**
   * Generate standard prime time showdown contests from NFL schedule
   */
  static generatePrimeTimeContests(games: NFLGame[]): InsertShowdownContest[] {
    const primeTimeContests: InsertShowdownContest[] = [];
    
    // Find prime time games and create standard contests
    for (const game of games) {
      if (this.isPrimeTimeGame(game)) {
        const contest = this.createStandardContest(game);
        if (contest) {
          primeTimeContests.push(contest);
        }
      }
    }
    
    return primeTimeContests;
  }
  
  /**
   * Check if a game qualifies as prime time (Monday/Thursday/Sunday night)
   */
  private static isPrimeTimeGame(game: NFLGame): boolean {
    // Monday Night Football
    if (game.gameDay === 'Monday') {
      return true;
    }
    
    // Thursday Night Football  
    if (game.gameDay === 'Thursday') {
      return true;
    }
    
    // Sunday Night Football (typically 8:20 PM ET)
    if (game.gameDay === 'Sunday' && game.gameTime.includes('8:')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Create a standard showdown contest with proper naming convention
   */
  private static createStandardContest(game: NFLGame): InsertShowdownContest | null {
    try {
      // Standard naming convention
      let contestName: string;
      if (game.gameDay === 'Monday') {
        contestName = 'Monday Night Showdown';
      } else if (game.gameDay === 'Thursday') {
        contestName = 'Thursday Night Showdown';
      } else if (game.gameDay === 'Sunday') {
        contestName = 'Sunday Night Showdown';
      } else {
        return null;
      }
      
      // Parse game time to get proper date
      const gameDate = this.parseGameDateTime(game.gameTime, game.gameDay);
      if (!gameDate) {
        console.warn(`Could not parse game time for ${game.awayTeam}@${game.homeTeam}: ${game.gameTime}`);
        return null;
      }
      
      // Create standard contest
      const contest: InsertShowdownContest = {
        contestName,
        commissionerId: 'system', // System-generated, will be claimed by commissioner
        sport: 'nfl',
        gameDate: gameDate,
        team1: game.awayTeam,
        team2: game.homeTeam,
        gameDescription: `${game.awayTeam} @ ${game.homeTeam}`,
        maxEntries: 20,
        currentEntries: 0,
        entryFee: 0,
        prizePool: 'Bragging Rights',
        captainMultiplier: '1.5',
        flexPositions: 5,
        totalLineupSize: 6,
        salaryCapEnabled: false,
        status: 'available', // New status for unclaimed system contests
        lineupLockTime: new Date(gameDate.getTime() - 30 * 60 * 1000), // 30 min before game
        contestStartTime: gameDate,
        contestEndTime: new Date(gameDate.getTime() + 4 * 60 * 60 * 1000), // 4 hours after start
      };
      
      return contest;
    } catch (error) {
      console.error('Error creating standard contest:', error);
      return null;
    }
  }
  
  /**
   * Parse game time into proper Date object (simplified version of lockout service logic)
   */
  private static parseGameDateTime(gameTime: string, gameDay: string): Date | null {
    // Handle time formats like "8:15 PM ET", "1:00 PM ET"
    const timeMatch = gameTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*ET/i);
    if (!timeMatch) {
      return null;
    }

    const [, hours, minutes, ampm] = timeMatch;
    let hour24 = parseInt(hours);
    
    // Convert to 24-hour format
    if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    // Create game time in UTC
    const gameDate = new Date();
    gameDate.setUTCHours(hour24 + 4, parseInt(minutes), 0, 0); // Convert ET to UTC
    
    // Adjust date based on game day
    const currentDayOfWeek = new Date().getDay();
    
    if (gameDay === 'Monday' && currentDayOfWeek === 0) {
      // Sunday -> Monday game is tomorrow
      gameDate.setDate(gameDate.getDate() + 1);
    } else if (gameDay === 'Sunday' && currentDayOfWeek === 1) {
      // Monday -> Sunday game was yesterday  
      gameDate.setDate(gameDate.getDate() - 1);
    }
    
    return gameDate;
  }
  
  /**
   * Get available prime time contests (not yet claimed by commissioners)
   */
  static getAvailablePrimeTimeContests(allContests: any[]): any[] {
    return allContests.filter(contest => 
      contest.status === 'available' && 
      contest.commissionerId === 'system'
    );
  }
}