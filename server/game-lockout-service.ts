import type { NFLGame } from '../shared/types/nfl.js';

/**
 * Centralized service for managing game lockout logic across all fantasy formats
 * Games are locked 30 minutes before kickoff to prevent integrity issues
 */
export class GameLockoutService {
  // Games lock 30 minutes before kickoff
  private static readonly LOCKOUT_BUFFER_MINUTES = 30;

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
    if (game.status === 'scheduled' || game.status === 'upcoming') {
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
   * Parse NFL.com game time formats into a Date object
   */
  private static parseGameTime(gameTime: string, gameDay?: string): Date | null {
    const now = new Date();
    
    // Handle "FINAL" status
    if (gameTime === 'FINAL') {
      return null; // Game is over
    }

    // Handle time formats like "8:15 PM ET", "1:00 PM ET"
    const timeMatch = gameTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*ET/i);
    if (timeMatch) {
      const [, hours, minutes, ampm] = timeMatch;
      let hour24 = parseInt(hours);
      
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      // Create date for today with the parsed time (assuming ET timezone)
      const gameDate = new Date();
      gameDate.setHours(hour24 + 5, parseInt(minutes), 0, 0); // Convert ET to UTC (rough approximation)
      
      // If the time has passed today, assume it's for this week
      if (gameDate < now && gameDay) {
        // Try to find the next occurrence of this day
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDayIndex = daysOfWeek.indexOf(gameDay);
        const currentDayIndex = now.getDay();
        
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0) {
          daysToAdd += 7; // Next week
        }
        
        gameDate.setDate(now.getDate() + daysToAdd);
      }
      
      return gameDate;
    }

    return null;
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

      if (!isLocked && (game.status === 'scheduled' || game.status === 'upcoming')) {
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