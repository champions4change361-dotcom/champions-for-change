import { 
  type User, type UpsertUser, type WhitelabelConfig, type InsertWhitelabelConfig,
  type Tournament, type InsertTournament, type Match, type InsertMatch, type UpdateMatch,
  type SportOption, type InsertSportOption, type TournamentStructure, type InsertTournamentStructure,
  type TrackEvent, type InsertTrackEvent, type Page, type InsertPage,
  type TeamRegistration, type InsertTeamRegistration, type Organization, type InsertOrganization,
  users, whitelabelConfigs, tournaments, matches, sportOptions, sportCategories, sportEvents, tournamentStructures, trackEvents, pages, teamRegistrations, organizations 
} from "@shared/schema";

type SportCategory = typeof sportCategories.$inferSelect;
type InsertSportCategory = typeof sportCategories.$inferInsert;
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User authentication methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User | undefined>;

  // White-label methods
  createWhitelabelConfig(config: InsertWhitelabelConfig): Promise<WhitelabelConfig>;
  getWhitelabelConfig(id: string): Promise<WhitelabelConfig | undefined>;
  getWhitelabelConfigByDomain(domain: string): Promise<WhitelabelConfig | undefined>;
  getWhitelabelConfigByUserId(userId: string): Promise<WhitelabelConfig | undefined>;
  updateWhitelabelConfig(id: string, updates: Partial<WhitelabelConfig>): Promise<WhitelabelConfig | undefined>;

  // Page management methods
  createPage(page: InsertPage): Promise<Page>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string, userId?: string): Promise<Page | undefined>;
  getPagesByUserId(userId: string): Promise<Page[]>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;

  // Team registration methods
  createTeamRegistration(registration: InsertTeamRegistration): Promise<TeamRegistration>;
  getTeamRegistration(id: string): Promise<TeamRegistration | undefined>;
  getTeamRegistrationsByTournament(tournamentId: string): Promise<TeamRegistration[]>;
  getTeamRegistrationsByCoach(coachId: string): Promise<TeamRegistration[]>;
  updateTeamRegistration(id: string, updates: Partial<TeamRegistration>): Promise<TeamRegistration | undefined>;
  deleteTeamRegistration(id: string): Promise<boolean>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined>;

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
  createSportCategory(category: InsertSportCategory): Promise<SportCategory>;
  createSportOption(sport: InsertSportOption): Promise<SportOption>;
  createTournamentStructure(structure: InsertTournamentStructure): Promise<TournamentStructure>;
  createTrackEvent(event: InsertTrackEvent): Promise<TrackEvent>;
  getSportCategories(): Promise<SportCategory[]>;
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
    // Always use the Replit Database components to build proper PostgreSQL URL
    const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    
    if (!databaseUrl || databaseUrl.includes('undefined')) {
      throw new Error("Database connection parameters are not properly configured");
    }
    
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  // User authentication methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const result = await this.db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to upsert user");
    }
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .update(users)
        .set({ 
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date() 
        })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // White-label methods
  async createWhitelabelConfig(config: InsertWhitelabelConfig): Promise<WhitelabelConfig> {
    try {
      const result = await this.db.insert(whitelabelConfigs).values(config).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create white-label config");
    }
  }

  async getWhitelabelConfig(id: string): Promise<WhitelabelConfig | undefined> {
    try {
      const result = await this.db.select().from(whitelabelConfigs).where(eq(whitelabelConfigs.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getWhitelabelConfigByDomain(domain: string): Promise<WhitelabelConfig | undefined> {
    try {
      const result = await this.db.select().from(whitelabelConfigs).where(eq(whitelabelConfigs.domain, domain));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async updateWhitelabelConfig(id: string, updates: Partial<WhitelabelConfig>): Promise<WhitelabelConfig | undefined> {
    try {
      const result = await this.db
        .update(whitelabelConfigs)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(whitelabelConfigs.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getWhitelabelConfigByUserId(userId: string): Promise<WhitelabelConfig | undefined> {
    try {
      const result = await this.db.select().from(whitelabelConfigs).where(eq(whitelabelConfigs.userId, userId));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Page management methods
  async createPage(page: InsertPage): Promise<Page> {
    try {
      const result = await this.db.insert(pages).values(page).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create page");
    }
  }

  async getPage(id: string): Promise<Page | undefined> {
    try {
      const result = await this.db.select().from(pages).where(eq(pages.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getPageBySlug(slug: string, userId?: string): Promise<Page | undefined> {
    try {
      let query = this.db.select().from(pages).where(eq(pages.slug, slug));
      if (userId) {
        query = query.where(eq(pages.userId, userId));
      }
      const result = await query;
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getPagesByUserId(userId: string): Promise<Page[]> {
    try {
      const result = await this.db.select().from(pages).where(eq(pages.userId, userId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined> {
    try {
      const result = await this.db
        .update(pages)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(pages.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deletePage(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(pages).where(eq(pages.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Team registration methods
  async createTeamRegistration(registration: InsertTeamRegistration): Promise<TeamRegistration> {
    try {
      const result = await this.db.insert(teamRegistrations).values(registration).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team registration");
    }
  }

  async getTeamRegistration(id: string): Promise<TeamRegistration | undefined> {
    try {
      const result = await this.db.select().from(teamRegistrations).where(eq(teamRegistrations.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getTeamRegistrationsByTournament(tournamentId: string): Promise<TeamRegistration[]> {
    try {
      const result = await this.db
        .select()
        .from(teamRegistrations)
        .where(eq(teamRegistrations.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getTeamRegistrationsByCoach(coachId: string): Promise<TeamRegistration[]> {
    try {
      const result = await this.db
        .select()
        .from(teamRegistrations)
        .where(eq(teamRegistrations.coachId, coachId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateTeamRegistration(id: string, updates: Partial<TeamRegistration>): Promise<TeamRegistration | undefined> {
    try {
      const result = await this.db
        .update(teamRegistrations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(teamRegistrations.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteTeamRegistration(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(teamRegistrations).where(eq(teamRegistrations.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    try {
      const result = await this.db.insert(organizations).values(organization).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create organization");
    }
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    try {
      const result = await this.db.select().from(organizations).where(eq(organizations.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const result = await this.db.select().from(organizations);
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    try {
      const result = await this.db
        .update(organizations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
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

  async createSportCategory(category: InsertSportCategory): Promise<SportCategory> {
    try {
      const result = await this.db.insert(sportCategories).values(category).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create sport category");
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

  async getSportCategories(): Promise<SportCategory[]> {
    try {
      return await this.db.select().from(sportCategories).orderBy(sportCategories.sortOrder);
    } catch (error) {
      console.error("Database error:", error);
      return [];
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
  
  async createSportEvent(event: any): Promise<any> {
    try {
      const result = await this.db.insert(sportEvents).values(event).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create sport event");
    }
  }

  async getSportEventsBySport(sportId: string): Promise<any[]> {
    try {
      return await this.db.select().from(sportEvents).where(eq(sportEvents.sportId, sportId));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getSportEvents(): Promise<any[]> {
    try {
      return await this.db.select().from(sportEvents);
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async createTournamentEvent(event: any): Promise<any> {
    // Tournament events would need to be implemented with proper schema
    return { id: randomUUID(), ...event };
  }

  async getTournamentEventsByTournament(tournamentId: string): Promise<any[]> {
    return [];
  }

  async createParticipantEvent(event: any): Promise<any> {
    // Participant events would need to be implemented with proper schema
    return { id: randomUUID(), ...event };
  }

  async getParticipantEventsByTournament(tournamentEventId: string): Promise<any[]> {
    return [];
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
  private users: Map<string, User>;
  private whitelabelConfigs: Map<string, WhitelabelConfig>;
  private tournaments: Map<string, Tournament>;
  private matches: Map<string, Match>;
  private sportCategories: Map<string, SportCategory>;
  private sportOptions: Map<string, SportOption>;
  private tournamentStructures: Map<string, TournamentStructure>;
  private trackEvents: Map<string, TrackEvent>;

  constructor() {
    this.users = new Map();
    this.whitelabelConfigs = new Map();
    this.tournaments = new Map();
    this.matches = new Map();
    this.sportCategories = new Map();
    this.sportOptions = new Map();
    this.tournamentStructures = new Map();
    this.trackEvents = new Map();
  }

  // User authentication methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      ...userData,
      createdAt: userData.createdAt || now,
      updatedAt: now,
      subscriptionStatus: userData.subscriptionStatus || "inactive",
      subscriptionPlan: userData.subscriptionPlan || "free",
      isWhitelabelClient: userData.isWhitelabelClient || false,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // White-label methods
  async createWhitelabelConfig(config: InsertWhitelabelConfig): Promise<WhitelabelConfig> {
    const id = randomUUID();
    const now = new Date();
    const whitelabelConfig: WhitelabelConfig = {
      ...config,
      id,
      primaryColor: config.primaryColor || "#3b82f6",
      secondaryColor: config.secondaryColor || "#1e40af",
      revenueSharePercentage: config.revenueSharePercentage || "0",
      isActive: config.isActive !== undefined ? config.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    this.whitelabelConfigs.set(id, whitelabelConfig);
    return whitelabelConfig;
  }

  async getWhitelabelConfig(id: string): Promise<WhitelabelConfig | undefined> {
    return this.whitelabelConfigs.get(id);
  }

  async getWhitelabelConfigByDomain(domain: string): Promise<WhitelabelConfig | undefined> {
    for (const config of this.whitelabelConfigs.values()) {
      if (config.domain === domain) {
        return config;
      }
    }
    return undefined;
  }

  async updateWhitelabelConfig(id: string, updates: Partial<WhitelabelConfig>): Promise<WhitelabelConfig | undefined> {
    const config = this.whitelabelConfigs.get(id);
    if (!config) return undefined;
    
    const updatedConfig: WhitelabelConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };
    this.whitelabelConfigs.set(id, updatedConfig);
    return updatedConfig;
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

  async createSportCategory(category: InsertSportCategory): Promise<SportCategory> {
    const created: SportCategory = {
      ...category,
      createdAt: new Date(),
    };
    this.sportCategories.set(category.id, created);
    return created;
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

  async getSportCategories(): Promise<SportCategory[]> {
    return Array.from(this.sportCategories.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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

  // Sport Events methods
  private sportEvents: Map<string, any> = new Map();
  private tournamentEvents: Map<string, any> = new Map();
  private participantEvents: Map<string, any> = new Map();

  async createSportEvent(event: any): Promise<any> {
    const created = { ...event, createdAt: new Date() };
    this.sportEvents.set(event.id, created);
    return created;
  }

  async getSportEventsBySport(sportId: string): Promise<any[]> {
    return Array.from(this.sportEvents.values()).filter(e => e.sportId === sportId);
  }

  async getSportEvents(): Promise<any[]> {
    return Array.from(this.sportEvents.values());
  }

  async createTournamentEvent(event: any): Promise<any> {
    const id = randomUUID();
    const created = { ...event, id, createdAt: new Date() };
    this.tournamentEvents.set(id, created);
    return created;
  }

  async getTournamentEventsByTournament(tournamentId: string): Promise<any[]> {
    return Array.from(this.tournamentEvents.values()).filter(e => e.tournamentId === tournamentId);
  }

  async createParticipantEvent(event: any): Promise<any> {
    const id = randomUUID();
    const created = { ...event, id, createdAt: new Date() };
    this.participantEvents.set(id, created);
    return created;
  }

  async getParticipantEventsByTournament(tournamentEventId: string): Promise<any[]> {
    return Array.from(this.participantEvents.values()).filter(e => e.tournamentEventId === tournamentEventId);
  }

  // Leaderboard methods
  private leaderboardEntries: Map<string, any> = new Map();

  async createLeaderboardEntry(entry: any): Promise<any> {
    const id = randomUUID();
    const created = { ...entry, id, createdAt: new Date() };
    this.leaderboardEntries.set(id, created);
    return created;
  }
  
  async getLeaderboardEntries(tournamentId: string): Promise<any[]> {
    return Array.from(this.leaderboardEntries.values()).filter(e => e.tournamentId === tournamentId);
  }
  
  async updateLeaderboardEntry(id: string, updates: any): Promise<any> {
    const entry = this.leaderboardEntries.get(id);
    if (!entry) return null;
    const updated = { ...entry, ...updates, updatedAt: new Date() };
    this.leaderboardEntries.set(id, updated);
    return updated;
  }
}

// Try to use database storage, fallback to memory if database fails
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

// Initialize storage 
let storagePromise: Promise<IStorage> | null = null;

async function getStorage(): Promise<IStorage> {
  if (!storagePromise) {
    storagePromise = initializeStorage();
  }
  return storagePromise;
}

// Export synchronous storage instance for middleware
export const storage = await getStorage();
export { getStorage };
