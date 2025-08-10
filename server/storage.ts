import { 
  type Tournament, type InsertTournament, type Match, type InsertMatch, type UpdateMatch,
  type SportOption, type InsertSportOption, type TournamentStructure, type InsertTournamentStructure,
  type TrackEvent, type InsertTrackEvent,
  tournaments, matches, sportOptions, tournamentStructures, trackEvents 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Tournament methods
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  // Match methods
  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: UpdateMatch): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  
  // Team methods
  updateTeamName(tournamentId: string, oldName: string, newName: string): Promise<void>;
  
  // Bubble data import methods
  createSportOption(sport: InsertSportOption): Promise<SportOption>;
  createTournamentStructure(structure: InsertTournamentStructure): Promise<TournamentStructure>;
  createTrackEvent(event: InsertTrackEvent): Promise<TrackEvent>;
  getSportOptions(): Promise<SportOption[]>;
  getTournamentStructures(): Promise<TournamentStructure[]>;
  getTrackEvents(): Promise<TrackEvent[]>;

  // Sport Events methods
  createSportEvent(event: any): Promise<any>;
  getSportEventsBySport(sportId: string): Promise<any[]>;
  getSportEvents(): Promise<any[]>;

  // Tournament Events methods
  createTournamentEvent(event: any): Promise<any>;
  getTournamentEventsByTournament(tournamentId: string): Promise<any[]>;

  // Participant Events methods
  createParticipantEvent(event: any): Promise<any>;
  getParticipantEventsByTournament(tournamentEventId: string): Promise<any[]>;
  
  // Leaderboard methods
  createLeaderboardEntry(entry: any): Promise<any>;
  getLeaderboardEntries(tournamentId: string): Promise<any[]>;
  updateLeaderboardEntry(id: string, updates: any): Promise<any>;
}

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async getTournaments(): Promise<Tournament[]> {
    try {
      return await this.db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch tournaments");
    }
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    try {
      const result = await this.db.select().from(tournaments).where(eq(tournaments.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    try {
      const result = await this.db.insert(tournaments).values(insertTournament).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create tournament");
    }
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    try {
      const result = await this.db
        .update(tournaments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tournaments.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteTournament(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(tournaments).where(eq(tournaments.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    try {
      return await this.db
        .select()
        .from(matches)
        .where(eq(matches.tournamentId, tournamentId))
        .orderBy(matches.round, matches.position);
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getMatch(id: string): Promise<Match | undefined> {
    try {
      const result = await this.db.select().from(matches).where(eq(matches.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    try {
      const result = await this.db.insert(matches).values(insertMatch).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create match");
    }
  }

  async updateMatch(id: string, updates: UpdateMatch): Promise<Match | undefined> {
    try {
      const result = await this.db
        .update(matches)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(matches.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteMatch(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(matches).where(eq(matches.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async updateTeamName(tournamentId: string, oldName: string, newName: string): Promise<void> {
    try {
      // Update all matches where team1, team2, or winner matches the oldName
      const tournamentMatches = await this.db
        .select()
        .from(matches)
        .where(eq(matches.tournamentId, tournamentId));

      for (const match of tournamentMatches) {
        const updates: any = {};
        if (match.team1 === oldName) {
          updates.team1 = newName;
        }
        if (match.team2 === oldName) {
          updates.team2 = newName;
        }
        if (match.winner === oldName) {
          updates.winner = newName;
        }

        if (Object.keys(updates).length > 0) {
          await this.db
            .update(matches)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(matches.id, match.id));
        }
      }
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update team name");
    }
  }

  async createSportOption(sport: InsertSportOption): Promise<SportOption> {
    try {
      const result = await this.db.insert(sportOptions).values(sport).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create sport option");
    }
  }

  async createTournamentStructure(structure: InsertTournamentStructure): Promise<TournamentStructure> {
    try {
      const result = await this.db.insert(tournamentStructures).values(structure).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create tournament structure");
    }
  }

  async createTrackEvent(event: InsertTrackEvent): Promise<TrackEvent> {
    try {
      const result = await this.db.insert(trackEvents).values(event).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create track event");
    }
  }

  async getSportOptions(): Promise<SportOption[]> {
    try {
      return await this.db.select().from(sportOptions).orderBy(sportOptions.sortOrder);
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getTournamentStructures(): Promise<TournamentStructure[]> {
    try {
      return await this.db.select().from(tournamentStructures).orderBy(tournamentStructures.sortOrder);
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getTrackEvents(): Promise<TrackEvent[]> {
    try {
      return await this.db.select().from(trackEvents).orderBy(trackEvents.sortOrder);
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }
  
  async createLeaderboardEntry(entry: any): Promise<any> {
    return { id: randomUUID(), ...entry };
  }
  
  async getLeaderboardEntries(tournamentId: string): Promise<any[]> {
    return [];
  }
  
  async updateLeaderboardEntry(id: string, updates: any): Promise<any> {
    return { id, ...updates };
  }
}

export class MemStorage implements IStorage {
  private tournaments: Map<string, Tournament>;
  private matches: Map<string, Match>;
  private sportOptions: Map<string, SportOption>;
  private tournamentStructures: Map<string, TournamentStructure>;
  private trackEvents: Map<string, TrackEvent>;

  constructor() {
    this.tournaments = new Map();
    this.matches = new Map();
    this.sportOptions = new Map();
    this.tournamentStructures = new Map();
    this.trackEvents = new Map();
  }

  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const now = new Date();
    const tournament: Tournament = {
      ...insertTournament,
      id,
      tournamentType: insertTournament.tournamentType || "single",
      competitionFormat: insertTournament.competitionFormat || "bracket",
      status: insertTournament.status || "upcoming",
      scoringMethod: insertTournament.scoringMethod || "wins",
      createdAt: now,
      updatedAt: now,
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const updatedTournament: Tournament = {
      ...tournament,
      ...updates,
      updatedAt: new Date(),
    };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const deleted = this.tournaments.delete(id);
    if (deleted) {
      // Also delete all matches for this tournament
      const matchEntries = Array.from(this.matches.entries());
      for (const [matchId, match] of matchEntries) {
        if (match.tournamentId === id) {
          this.matches.delete(matchId);
        }
      }
    }
    return deleted;
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    const matchArray = Array.from(this.matches.values());
    return matchArray
      .filter(match => match.tournamentId === tournamentId)
      .sort((a, b) => a.round - b.round || a.position - b.position);
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const now = new Date();
    const match: Match = {
      id,
      tournamentId: insertMatch.tournamentId,
      round: insertMatch.round,
      position: insertMatch.position,
      team1: insertMatch.team1 ?? null,
      team2: insertMatch.team2 ?? null,
      team1Score: insertMatch.team1Score ?? null,
      team2Score: insertMatch.team2Score ?? null,
      winner: insertMatch.winner ?? null,
      status: insertMatch.status || "upcoming",
      createdAt: now,
      updatedAt: now,
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, updates: UpdateMatch): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch: Match = {
      ...match,
      ...updates,
      updatedAt: new Date(),
    };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMatch(id: string): Promise<boolean> {
    return this.matches.delete(id);
  }

  async updateTeamName(tournamentId: string, oldName: string, newName: string): Promise<void> {
    // Update all matches for this tournament where team1, team2, or winner matches oldName
    const matchEntries = Array.from(this.matches.entries());
    for (const [matchId, match] of matchEntries) {
      if (match.tournamentId === tournamentId) {
        let needsUpdate = false;
        const updatedMatch = { ...match };
        
        if (match.team1 === oldName) {
          updatedMatch.team1 = newName;
          needsUpdate = true;
        }
        if (match.team2 === oldName) {
          updatedMatch.team2 = newName;
          needsUpdate = true;
        }
        if (match.winner === oldName) {
          updatedMatch.winner = newName;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          updatedMatch.updatedAt = new Date();
          this.matches.set(matchId, updatedMatch);
        }
      }
    }
  }

  async createSportOption(sport: InsertSportOption): Promise<SportOption> {
    const created: SportOption = {
      ...sport,
      createdAt: new Date(),
    };
    this.sportOptions.set(sport.id, created);
    return created;
  }

  async createTournamentStructure(structure: InsertTournamentStructure): Promise<TournamentStructure> {
    const created: TournamentStructure = {
      ...structure,
      createdAt: new Date(),
    };
    this.tournamentStructures.set(structure.id, created);
    return created;
  }

  async createTrackEvent(event: InsertTrackEvent): Promise<TrackEvent> {
    const created: TrackEvent = {
      ...event,
      createdAt: new Date(),
    };
    this.trackEvents.set(event.id, created);
    return created;
  }

  async getSportOptions(): Promise<SportOption[]> {
    return Array.from(this.sportOptions.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getTournamentStructures(): Promise<TournamentStructure[]> {
    return Array.from(this.tournamentStructures.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getTrackEvents(): Promise<TrackEvent[]> {
    return Array.from(this.trackEvents.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
}

// Try to use database storage, fallback to memory if database fails
let storage: IStorage;

async function initializeStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    try {
      const dbStorage = new DbStorage();
      // Test connection by attempting to fetch tournaments
      await dbStorage.getTournaments();
      console.log("✅ Database connection successful, using DbStorage");
      return dbStorage;
    } catch (error) {
      console.warn("⚠️  Database connection failed, falling back to MemStorage:", (error as Error).message);
    }
  }
  
  console.log("📝 Using in-memory storage");
  return new MemStorage();
}

// Initialize storage function
let storagePromise: Promise<IStorage>;

function getStorage(): Promise<IStorage> {
  if (!storagePromise) {
    storagePromise = initializeStorage();
  }
  return storagePromise;
}

export { getStorage };
