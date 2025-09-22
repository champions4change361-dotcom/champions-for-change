import type { NFLGame } from './nfl-schedule-scraper.js';

/**
 * Centralized service for managing game lockout logic across all fantasy formats
 * Games are locked 10 minutes before kickoff to prevent integrity issues
 */
export class GameLockoutService {
  // Games lock 10 minutes before kickoff (simplified per user request)
  private static readonly LOCKOUT_BUFFER_MINUTES = 10;

  /**
   * Determines if a game is locked for fantasy play
   */
  static isGameLocked(game: NFLGame): boolean {
    const now = new Date();
    
    // Games with status 'live' or 'final' are always locked
    if (game.status === 'live' || game.status === 'final') {
      return true;
    }

    // For scheduled games, check if we're within the lockout buffer
    if (game.status === 'scheduled') {
      try {
        // Parse game time - handle different formats from NFL.com
        const gameTime = this.parseGameTime(game.gameTime, game.gameDay);
        if (!gameTime) {
          // If we can't parse the time, err on the side of caution and lock it
          return true;
        }

        const timeDiffMs = gameTime.getTime() - now.getTime();
        const timeDiffMinutes = timeDiffMs / (1000 * 60);
        
        // Lock if game starts within the buffer window
        return timeDiffMinutes <= this.LOCKOUT_BUFFER_MINUTES;
      } catch (error) {
        console.warn('Error parsing game time for lockout check:', error);
        // If there's an error parsing, lock the game for safety
        return true;
      }
    }

    // Default to locked for unknown status
    return true;
  }

  /**
   * Parse NFL.com game time formats into a Date object - SIMPLIFIED VERSION
   */
  private static parseGameTime(gameTime: string, gameDay?: string): Date | null {
    // Handle "FINAL" status - game is over
    if (gameTime === 'FINAL') {
      return new Date(0); // Very old date = definitely locked
    }

    // Handle time formats like "8:15 PM ET", "1:00 PM ET"
    const timeMatch = gameTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*ET/i);
    if (!timeMatch) {
      return null; // Can't parse, treat as locked
    }

    const [, hours, minutes, ampm] = timeMatch;
    let hour24 = parseInt(hours);
    
    // Convert to 24-hour format
    if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    // Create date object for the game time
    const now = new Date();
    const gameDate = new Date();
    
    // Set the time in ET (convert to UTC by adding 5 hours for ET)
    gameDate.setUTCHours(hour24 + 5, parseInt(minutes), 0, 0);
    
    // Handle day logic - if it's Monday and we're on Sunday night, add a day
    if (gameDay === 'Monday' && now.getDay() === 0) { // Sunday = 0
      gameDate.setUTCDate(gameDate.getUTCDate() + 1);
    }
    
    // If game time has already passed today, it's likely for next week
    // But for simplicity, if it's in the past, consider it locked
    
    return gameDate;
  }

  /**
   * Filter games to only include those available for fantasy play
   */
  static getAvailableGames(games: NFLGame[]): NFLGame[] {
    return games.filter(game => !this.isGameLocked(game));
  }

  /**
   * Get enhanced game data with lock status
   */
  static getGamesWithLockStatus(games: NFLGame[]): Array<NFLGame & { 
    isLocked: boolean; 
    minutesUntilLock?: number; 
    lockReason?: string;
  }> {
    const now = new Date();
    
    return games.map(game => {
      const isLocked = this.isGameLocked(game);
      let minutesUntilLock: number | undefined;
      let lockReason: string | undefined;

      if (!isLocked && game.status === 'scheduled') {
        const gameTime = this.parseGameTime(game.gameTime, game.gameDay);
        if (gameTime) {
          const timeDiffMs = gameTime.getTime() - now.getTime();
          const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
          minutesUntilLock = Math.max(0, timeDiffMinutes - this.LOCKOUT_BUFFER_MINUTES);
        }
      }

      if (isLocked) {
        if (game.status === 'final') {
          lockReason = 'Game completed';
        } else if (game.status === 'live') {
          lockReason = 'Game in progress';
        } else {
          lockReason = 'Too close to kickoff';
        }
      }

      return {
        ...game,
        isLocked,
        minutesUntilLock,
        lockReason
      };
    });
  }

  /**
   * Filter players to only include those from available games
   */
  static filterAvailablePlayers<T extends { team: string }>(
    players: T[], 
    availableGames: NFLGame[]
  ): T[] {
    // Get teams that have available games
    const availableTeams = new Set<string>();
    availableGames.forEach(game => {
      availableTeams.add(game.homeTeam);
      availableTeams.add(game.awayTeam);
    });

    return players.filter(player => availableTeams.has(player.team));
  }

  /**
   * Get lockout buffer in minutes (for display purposes)
   */
  static getLockoutBufferMinutes(): number {
    return this.LOCKOUT_BUFFER_MINUTES;
  }
}