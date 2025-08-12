import { 
  type User, type UpsertUser, type WhitelabelConfig, type InsertWhitelabelConfig,
  type Tournament, type InsertTournament, type Match, type InsertMatch, type UpdateMatch,
  type SportOption, type InsertSportOption, type TournamentStructure, type InsertTournamentStructure,
  type TrackEvent, type InsertTrackEvent, type Page, type InsertPage,
  type TeamRegistration, type InsertTeamRegistration, type Organization, type InsertOrganization,
  type ScorekeeperAssignment, type InsertScorekeeperAssignment, type EventScore, type InsertEventScore,
  type SchoolEventAssignment, type InsertSchoolEventAssignment, type CoachEventAssignment, type InsertCoachEventAssignment,
  type Contact, type InsertContact, type EmailCampaign, type InsertEmailCampaign, type CampaignRecipient, type InsertCampaignRecipient,
  type Donor, type InsertDonor, type Donation, type InsertDonation, type RegistrationRequest, type InsertRegistrationRequest,
  users, whitelabelConfigs, tournaments, matches, sportOptions, sportCategories, sportEvents, tournamentStructures, trackEvents, pages, teamRegistrations, organizations, scorekeeperAssignments, eventScores, schoolEventAssignments, coachEventAssignments, contacts, emailCampaigns, campaignRecipients, donors, donations, sportDivisionRules, registrationRequests
} from "@shared/schema";

type SportCategory = typeof sportCategories.$inferSelect;
type InsertSportCategory = typeof sportCategories.$inferInsert;
type SportDivisionRules = typeof sportDivisionRules.$inferSelect;
type InsertSportDivisionRules = typeof sportDivisionRules.$inferInsert;
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

  // Registration request methods
  createRegistrationRequest(request: InsertRegistrationRequest): Promise<RegistrationRequest>;
  getRegistrationRequests(): Promise<RegistrationRequest[]>;
  updateRegistrationRequest(id: string, updates: Partial<RegistrationRequest>): Promise<RegistrationRequest | undefined>;

  // Scorekeeper assignment methods
  createScorekeeperAssignment(assignment: InsertScorekeeperAssignment): Promise<ScorekeeperAssignment>;
  getScorekeeperAssignment(id: string): Promise<ScorekeeperAssignment | undefined>;
  getScorekeeperAssignmentsByTournament(tournamentId: string): Promise<ScorekeeperAssignment[]>;
  getScorekeeperAssignmentsByUser(scorekeeperId: string): Promise<ScorekeeperAssignment[]>;
  updateScorekeeperAssignment(id: string, updates: Partial<ScorekeeperAssignment>): Promise<ScorekeeperAssignment | undefined>;
  deleteScorekeeperAssignment(id: string): Promise<boolean>;

  // Event score methods
  createEventScore(score: InsertEventScore): Promise<EventScore>;
  getEventScore(id: string): Promise<EventScore | undefined>;
  getEventScoresByTournament(tournamentId: string): Promise<EventScore[]>;
  getEventScoresByAssignment(assignmentId: string): Promise<EventScore[]>;
  updateEventScore(id: string, updates: Partial<EventScore>): Promise<EventScore | undefined>;
  deleteEventScore(id: string): Promise<boolean>;

  // School event assignment methods (District AD assigns schools to events)
  createSchoolEventAssignment(assignment: InsertSchoolEventAssignment): Promise<SchoolEventAssignment>;
  getSchoolEventAssignment(id: string): Promise<SchoolEventAssignment | undefined>;
  getSchoolEventAssignmentsByTournament(tournamentId: string): Promise<SchoolEventAssignment[]>;
  getSchoolEventAssignmentsBySchool(schoolId: string): Promise<SchoolEventAssignment[]>;
  updateSchoolEventAssignment(id: string, updates: Partial<SchoolEventAssignment>): Promise<SchoolEventAssignment | undefined>;
  deleteSchoolEventAssignment(id: string): Promise<boolean>;

  // Coach event assignment methods (School AD assigns coaches to events)
  createCoachEventAssignment(assignment: InsertCoachEventAssignment): Promise<CoachEventAssignment>;
  getCoachEventAssignment(id: string): Promise<CoachEventAssignment | undefined>;
  getCoachEventAssignmentsBySchoolAssignment(schoolAssignmentId: string): Promise<CoachEventAssignment[]>;
  getCoachEventAssignmentsByCoach(coachId: string): Promise<CoachEventAssignment[]>;
  updateCoachEventAssignment(id: string, updates: Partial<CoachEventAssignment>): Promise<CoachEventAssignment | undefined>;
  deleteCoachEventAssignment(id: string): Promise<boolean>;

  // Contact operations
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  searchContacts(userId: string, query: string): Promise<Contact[]>;
  importContacts(userId: string, contacts: InsertContact[]): Promise<Contact[]>;

  // Donor operations
  getDonors(): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, updates: Partial<Donor>): Promise<Donor>;
  deleteDonor(id: string): Promise<void>;

  // Donation operations
  getDonations(): Promise<Donation[]>;
  getDonation(id: string): Promise<Donation | undefined>;
  getDonationsByDonor(donorId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, updates: Partial<Donation>): Promise<Donation>;
  deleteDonation(id: string): Promise<void>;
  
  // Email campaign operations
  getEmailCampaigns(userId: string): Promise<EmailCampaign[]>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;
  deleteEmailCampaign(id: string): Promise<void>;

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
  getTrackEventsByCategory(category: string): Promise<TrackEvent[]>;
  getTrackEvent(id: string): Promise<TrackEvent | undefined>;
  getTrackEventTiming(): Promise<TrackEventTiming[]>;
  getTrackEventTimingByEventId(trackEventId: string): Promise<TrackEventTiming[]>;
  getSportDivisionRules(): Promise<SportDivisionRules[]>;
  getSportDivisionRulesBySport(sportId: string): Promise<SportDivisionRules[]>;
  createSportDivisionRules(rules: InsertSportDivisionRules): Promise<SportDivisionRules>;
  
  // Tournament Integration methods
  getTournamentFormatConfigs(): Promise<TournamentFormatConfig[]>;
  getTournamentFormatConfigsByStructure(structureId: string): Promise<TournamentFormatConfig[]>;
  getTournamentFormatConfigsBySport(sportCategory: string): Promise<TournamentFormatConfig[]>;
  getBracketTemplates(): Promise<BracketTemplate[]>;
  getBracketTemplatesByStructure(structureId: string): Promise<BracketTemplate[]>;
  getBracketTemplateByParticipants(structureId: string, participantCount: number): Promise<BracketTemplate | undefined>;
  createTournamentGenerationLog(log: InsertTournamentGenerationLog): Promise<TournamentGenerationLog>;
  getTournamentGenerationLogsByTournament(tournamentId: string): Promise<TournamentGenerationLog[]>;

  // Competition Format Templates methods
  getCompetitionFormatTemplates(): Promise<CompetitionFormatTemplate[]>;
  getCompetitionFormatTemplatesBySport(sportId: string): Promise<CompetitionFormatTemplate[]>;
  getDefaultCompetitionFormatTemplate(sportId: string): Promise<CompetitionFormatTemplate | undefined>;
  getSeriesTemplates(): Promise<SeriesTemplate[]>;
  getSeriesTemplatesBySport(sportId: string): Promise<SeriesTemplate[]>;
  getGameLengthTemplates(): Promise<GameLengthTemplate[]>;
  getGameLengthTemplatesBySport(sportId: string): Promise<GameLengthTemplate[]>;

  // KRAKEN MULTI-DIVISION SYSTEM METHODS 🐙💥
  getDivisionTemplates(): Promise<DivisionTemplate[]>;
  getDivisionTemplatesBySport(sportCategory: string): Promise<DivisionTemplate[]>;
  getDivisionTemplate(id: string): Promise<DivisionTemplate | undefined>;
  createDivisionTemplate(template: InsertDivisionTemplate): Promise<DivisionTemplate>;
  getTournamentDivisions(): Promise<TournamentDivision[]>;
  getTournamentDivisionsByTournament(tournamentId: string): Promise<TournamentDivision[]>;
  getTournamentDivision(id: string): Promise<TournamentDivision | undefined>;
  createTournamentDivision(division: InsertTournamentDivision): Promise<TournamentDivision>;
  updateTournamentDivision(id: string, updates: Partial<TournamentDivision>): Promise<TournamentDivision | undefined>;
  getDivisionParticipants(): Promise<DivisionParticipant[]>;
  getDivisionParticipantsByDivision(divisionId: string): Promise<DivisionParticipant[]>;
  getDivisionParticipant(id: string): Promise<DivisionParticipant | undefined>;
  createDivisionParticipant(participant: InsertDivisionParticipant): Promise<DivisionParticipant>;
  updateDivisionParticipant(id: string, updates: Partial<DivisionParticipant>): Promise<DivisionParticipant | undefined>;
  getDivisionGenerationRules(): Promise<DivisionGenerationRule[]>;
  getDivisionGenerationRulesByTournament(tournamentId: string): Promise<DivisionGenerationRule[]>;
  createDivisionGenerationRule(rule: InsertDivisionGenerationRule): Promise<DivisionGenerationRule>;
  generateDivisionsFromTemplate(tournamentId: string, templateId: string, config?: any): Promise<TournamentDivision[]>;
  getDivisionScheduling(): Promise<DivisionScheduling[]>;
  getDivisionSchedulingByTournament(tournamentId: string): Promise<DivisionScheduling[]>;
  createDivisionScheduling(scheduling: InsertDivisionScheduling): Promise<DivisionScheduling>;
  createSportDivisionRules(rules: InsertSportDivisionRules): Promise<SportDivisionRules>;

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

  // Registration request methods
  async createRegistrationRequest(request: InsertRegistrationRequest): Promise<RegistrationRequest> {
    try {
      const result = await this.db.insert(registrationRequests).values(request).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create registration request");
    }
  }

  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    try {
      const result = await this.db.select().from(registrationRequests);
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateRegistrationRequest(id: string, updates: Partial<RegistrationRequest>): Promise<RegistrationRequest | undefined> {
    try {
      const result = await this.db
        .update(registrationRequests)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(registrationRequests.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Scorekeeper assignment methods
  async createScorekeeperAssignment(assignment: InsertScorekeeperAssignment): Promise<ScorekeeperAssignment> {
    try {
      const result = await this.db.insert(scorekeeperAssignments).values(assignment).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create scorekeeper assignment");
    }
  }

  async getScorekeeperAssignment(id: string): Promise<ScorekeeperAssignment | undefined> {
    try {
      const result = await this.db.select().from(scorekeeperAssignments).where(eq(scorekeeperAssignments.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getScorekeeperAssignmentsByTournament(tournamentId: string): Promise<ScorekeeperAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(scorekeeperAssignments)
        .where(eq(scorekeeperAssignments.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getScorekeeperAssignmentsByUser(scorekeeperId: string): Promise<ScorekeeperAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(scorekeeperAssignments)
        .where(eq(scorekeeperAssignments.scorekeeperId, scorekeeperId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateScorekeeperAssignment(id: string, updates: Partial<ScorekeeperAssignment>): Promise<ScorekeeperAssignment | undefined> {
    try {
      const result = await this.db
        .update(scorekeeperAssignments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(scorekeeperAssignments.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteScorekeeperAssignment(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(scorekeeperAssignments).where(eq(scorekeeperAssignments.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Event score methods
  async createEventScore(score: InsertEventScore): Promise<EventScore> {
    try {
      const result = await this.db.insert(eventScores).values(score).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create event score");
    }
  }

  async getEventScore(id: string): Promise<EventScore | undefined> {
    try {
      const result = await this.db.select().from(eventScores).where(eq(eventScores.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getEventScoresByTournament(tournamentId: string): Promise<EventScore[]> {
    try {
      const result = await this.db
        .select()
        .from(eventScores)
        .where(eq(eventScores.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getEventScoresByAssignment(assignmentId: string): Promise<EventScore[]> {
    try {
      const result = await this.db
        .select()
        .from(eventScores)
        .where(eq(eventScores.assignmentId, assignmentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateEventScore(id: string, updates: Partial<EventScore>): Promise<EventScore | undefined> {
    try {
      const result = await this.db
        .update(eventScores)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(eventScores.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteEventScore(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(eventScores).where(eq(eventScores.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // School event assignment methods
  async createSchoolEventAssignment(assignment: InsertSchoolEventAssignment): Promise<SchoolEventAssignment> {
    try {
      const result = await this.db.insert(schoolEventAssignments).values(assignment).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create school event assignment");
    }
  }

  async getSchoolEventAssignment(id: string): Promise<SchoolEventAssignment | undefined> {
    try {
      const result = await this.db.select().from(schoolEventAssignments).where(eq(schoolEventAssignments.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getSchoolEventAssignmentsByTournament(tournamentId: string): Promise<SchoolEventAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(schoolEventAssignments)
        .where(eq(schoolEventAssignments.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getSchoolEventAssignmentsBySchool(schoolId: string): Promise<SchoolEventAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(schoolEventAssignments)
        .where(eq(schoolEventAssignments.schoolId, schoolId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateSchoolEventAssignment(id: string, updates: Partial<SchoolEventAssignment>): Promise<SchoolEventAssignment | undefined> {
    try {
      const result = await this.db
        .update(schoolEventAssignments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schoolEventAssignments.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteSchoolEventAssignment(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(schoolEventAssignments).where(eq(schoolEventAssignments.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Coach event assignment methods
  async createCoachEventAssignment(assignment: InsertCoachEventAssignment): Promise<CoachEventAssignment> {
    try {
      const result = await this.db.insert(coachEventAssignments).values(assignment).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create coach event assignment");
    }
  }

  async getCoachEventAssignment(id: string): Promise<CoachEventAssignment | undefined> {
    try {
      const result = await this.db.select().from(coachEventAssignments).where(eq(coachEventAssignments.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getCoachEventAssignmentsBySchoolAssignment(schoolAssignmentId: string): Promise<CoachEventAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(coachEventAssignments)
        .where(eq(coachEventAssignments.schoolAssignmentId, schoolAssignmentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getCoachEventAssignmentsByCoach(coachId: string): Promise<CoachEventAssignment[]> {
    try {
      const result = await this.db
        .select()
        .from(coachEventAssignments)
        .where(eq(coachEventAssignments.coachId, coachId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateCoachEventAssignment(id: string, updates: Partial<CoachEventAssignment>): Promise<CoachEventAssignment | undefined> {
    try {
      const result = await this.db
        .update(coachEventAssignments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(coachEventAssignments.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteCoachEventAssignment(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(coachEventAssignments).where(eq(coachEventAssignments.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
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
  private trackEventTiming: Map<string, TrackEventTiming>;
  private sportDivisionRules: Map<string, SportDivisionRules>;
  private tournamentFormatConfigs: Map<string, TournamentFormatConfig>;
  private bracketTemplates: Map<string, BracketTemplate>;
  private tournamentGenerationLog: Map<string, TournamentGenerationLog>;
  private competitionFormatTemplates: Map<string, CompetitionFormatTemplate>;
  private gameLengthTemplates: Map<string, GameLengthTemplate>;
  private seriesTemplates: Map<string, SeriesTemplate>;
  
  // KRAKEN MULTI-DIVISION SYSTEM - THE TENTACLES OF POWER! 🐙💥
  private tournamentDivisions: Map<string, TournamentDivision>;
  private divisionParticipants: Map<string, DivisionParticipant>;
  private divisionTemplates: Map<string, DivisionTemplate>;
  private divisionGenerationRules: Map<string, DivisionGenerationRule>;
  private divisionScheduling: Map<string, DivisionScheduling>;
  
  // TOURNAMENT EMPIRE ROLE-BASED SYSTEM! 👑⚡
  private dashboardConfigs: Map<string, any>;
  private organizations: Map<string, any>;
  private permissionTemplates: Map<string, any>;
  private donors: Map<string, Donor>;
  private donations: Map<string, Donation>;
  private contacts: Map<string, Contact>;
  private emailCampaigns: Map<string, EmailCampaign>;
  private registrationRequests: Map<string, RegistrationRequest>;

  constructor() {
    this.users = new Map();
    this.whitelabelConfigs = new Map();
    this.tournaments = new Map();
    this.matches = new Map();
    this.sportCategories = new Map();
    this.sportOptions = new Map();
    this.tournamentStructures = new Map();
    this.trackEvents = new Map();
    this.trackEventTiming = new Map();
    this.sportDivisionRules = new Map();
    this.tournamentFormatConfigs = new Map();
    this.bracketTemplates = new Map();
    this.tournamentGenerationLog = new Map();
    this.competitionFormatTemplates = new Map();
    this.gameLengthTemplates = new Map();
    this.seriesTemplates = new Map();
    
    // KRAKEN MULTI-DIVISION SYSTEM INITIALIZATION 🐙
    this.tournamentDivisions = new Map();
    this.divisionParticipants = new Map();
    this.divisionTemplates = new Map();
    this.divisionGenerationRules = new Map();
    this.divisionScheduling = new Map();
    
    // TOURNAMENT EMPIRE INITIALIZATION 👑
    this.dashboardConfigs = new Map();
    this.organizations = new Map();
    this.permissionTemplates = new Map();
    this.donors = new Map();
    this.donations = new Map();
    this.contacts = new Map();
    this.emailCampaigns = new Map();
    this.registrationRequests = new Map();
    
    // Initialize with default tournament structures, sport division rules, track events, tournament integration, competition formats, and KRAKEN!
    this.initializeDefaultStructures();
    this.initializeSportDivisionRules();
    this.initializeUltimateTrackEvents();
    this.initializeTournamentIntegration();
    this.initializeCompetitionFormatTemplates();
    this.initializeKrakenDivisionSystem();
    this.initializeTournamentEmpire();
  }

  private initializeDefaultStructures() {
    const defaultStructures = [
      { id: '1', formatName: 'Single Elimination', formatDescription: 'Traditional bracket where one loss eliminates team/player. Fast, decisive tournament format perfect for time-constrained events.', formatType: 'Universal', applicableSports: 'all', sortOrder: 1, createdAt: new Date() },
      { id: '2', formatName: 'Double Elimination', formatDescription: 'Bracket with winners and losers brackets - teams get second chance after first loss. More games, fairer outcomes.', formatType: 'Universal', applicableSports: 'all', sortOrder: 2, createdAt: new Date() },
      { id: '3', formatName: 'Round Robin', formatDescription: 'Every team/player competes against every other participant - comprehensive competition format. Best for determining true rankings.', formatType: 'Universal', applicableSports: 'all', sortOrder: 3, createdAt: new Date() },
      { id: '4', formatName: 'Pool Play → Single Elimination', formatDescription: 'Groups compete in round robin pools, then top teams advance to single elimination bracket. Balances fairness with efficiency.', formatType: 'Hybrid', applicableSports: 'all', sortOrder: 4, createdAt: new Date() },
      { id: '5', formatName: 'Pool Play → Double Elimination', formatDescription: 'Pool play followed by double elimination bracket for advanced teams. Maximum fairness with second chances.', formatType: 'Hybrid', applicableSports: 'all', sortOrder: 5, createdAt: new Date() },
      { id: '6', formatName: 'Swiss System → Single Elimination', formatDescription: 'Swiss rounds to determine seeding, followed by single elimination playoffs. Popular in chess and esports.', formatType: 'Hybrid', applicableSports: 'chess,esports,academic', sortOrder: 6, createdAt: new Date() },
      { id: '7', formatName: 'Swiss System', formatDescription: 'Teams paired based on similar records. No elimination, predetermined number of rounds. Excellent for skill-based matching.', formatType: 'League', applicableSports: 'chess,esports,academic', sortOrder: 7, createdAt: new Date() },
      { id: '8', formatName: 'Round Robin League', formatDescription: 'Extended round robin with multiple rounds against same opponents. Season-style format.', formatType: 'League', applicableSports: 'team_sports', sortOrder: 8, createdAt: new Date() },
      { id: '9', formatName: 'Divisional League', formatDescription: 'Teams divided into skill-based divisions, round robin within divisions, playoffs between division winners.', formatType: 'League', applicableSports: 'team_sports', sortOrder: 9, createdAt: new Date() },
      { id: '10', formatName: 'Seeded Bracket', formatDescription: 'Single or double elimination with teams ranked and positioned based on skill/ranking. Prevents early matchups of top teams.', formatType: 'Elimination', applicableSports: 'all', sortOrder: 10, createdAt: new Date() },
      { id: '11', formatName: 'Step Ladder', formatDescription: 'Lower-seeded teams must climb the ladder by defeating higher seeds sequentially. Creates dramatic progression.', formatType: 'Elimination', applicableSports: 'individual_sports,combat_sports', sortOrder: 11, createdAt: new Date() },
      { id: '12', formatName: 'King of the Hill', formatDescription: 'One champion faces all challengers sequentially. Champion retains position until defeated. Classic format for continuous challenge.', formatType: 'Elimination', applicableSports: 'individual_sports,combat_sports', sortOrder: 12, createdAt: new Date() },
      { id: '13', formatName: 'Progressive Elimination', formatDescription: 'Participants eliminated based on cumulative performance across multiple rounds. Gradual elimination based on consistency.', formatType: 'Elimination', applicableSports: 'track_field,swimming,individual_sports', sortOrder: 13, createdAt: new Date() },
      { id: '14', formatName: 'Gauntlet', formatDescription: 'One team/player faces a series of increasingly difficult opponents. Ultimate endurance test.', formatType: 'Specialized', applicableSports: 'combat_sports,esports', sortOrder: 14, createdAt: new Date() },
      { id: '15', formatName: 'Survivor', formatDescription: 'Teams eliminated one by one based on performance in challenges. Reality TV style competition.', formatType: 'Specialized', applicableSports: 'multi_sport,team_building', sortOrder: 15, createdAt: new Date() },
      { id: '16', formatName: 'Battle Royale', formatDescription: 'Large field starts together, participants eliminated until one remains. Popular in gaming tournaments.', formatType: 'Specialized', applicableSports: 'esports,individual_sports', sortOrder: 16, createdAt: new Date() },
      { id: '17', formatName: 'Multi-Event Competition', formatDescription: 'Participants compete in multiple events with cumulative scoring. Decathlon/heptathlon style.', formatType: 'Specialized', applicableSports: 'track_field,multi_sport', sortOrder: 17, createdAt: new Date() },
      { id: '18', formatName: 'Relay Championship', formatDescription: 'Team-based relay events with specialized handoff rules and timing.', formatType: 'Specialized', applicableSports: 'track_field,swimming', sortOrder: 18, createdAt: new Date() },
      { id: '19', formatName: 'Field Event Meet', formatDescription: 'Distance/height based competition with multiple attempts and progressive standards.', formatType: 'Specialized', applicableSports: 'track_field', sortOrder: 19, createdAt: new Date() },
      { id: '20', formatName: 'Best of Series', formatDescription: 'Teams play multiple games, first to win majority advances. Baseball/basketball playoff style.', formatType: 'Series', applicableSports: 'team_sports', sortOrder: 20, createdAt: new Date() },
      { id: '21', formatName: 'Aggregate Score', formatDescription: 'Teams play multiple games, total score across all games determines winner. Soccer home/away legs.', formatType: 'Series', applicableSports: 'team_sports', sortOrder: 21, createdAt: new Date() },
      { id: '22', formatName: 'Sudden Death', formatDescription: 'Tied games continue until someone scores. High drama elimination format.', formatType: 'Elimination', applicableSports: 'team_sports', sortOrder: 22, createdAt: new Date() },
      { id: '23', formatName: 'Qualification → Championship', formatDescription: 'Initial qualification round determines championship bracket seeding. Two distinct phases.', formatType: 'Multi-Stage', applicableSports: 'all', sortOrder: 23, createdAt: new Date() },
      { id: '24', formatName: 'Group Stage → Knockout', formatDescription: 'Round robin groups followed by single elimination knockout rounds. World Cup style.', formatType: 'Multi-Stage', applicableSports: 'team_sports', sortOrder: 24, createdAt: new Date() },
      { id: '25', formatName: 'Regular Season → Playoffs', formatDescription: 'Extended regular season determines playoff seeding, then elimination rounds.', formatType: 'Multi-Stage', applicableSports: 'team_sports,league', sortOrder: 25, createdAt: new Date() },
      { id: '26', formatName: 'Draft Tournament', formatDescription: 'Teams/players drafted by captains, then compete in chosen format. Fantasy sports style.', formatType: 'Specialty', applicableSports: 'all', sortOrder: 26, createdAt: new Date() },
      { id: '27', formatName: 'Handicap System', formatDescription: 'Players receive advantages/disadvantages based on skill level to level playing field.', formatType: 'Specialty', applicableSports: 'individual_sports,golf', sortOrder: 27, createdAt: new Date() },
      { id: '28', formatName: 'Time Trial Championship', formatDescription: 'Individual time-based competition with qualifying and final rounds.', formatType: 'Specialty', applicableSports: 'individual_sports,racing', sortOrder: 28, createdAt: new Date() },
      { id: '29', formatName: 'Quiz Bowl', formatDescription: 'Team-based question/answer format with specialized scoring and timing rules.', formatType: 'Specialized', applicableSports: 'academic', sortOrder: 29, createdAt: new Date() },
      { id: '30', formatName: 'Debate Tournament', formatDescription: 'Structured argumentative competition with judge scoring and advancement rules.', formatType: 'Specialized', applicableSports: 'academic', sortOrder: 30, createdAt: new Date() }
    ];

    defaultStructures.forEach(structure => {
      this.tournamentStructures.set(structure.id, structure as TournamentStructure);
    });
  }

  private initializeSportDivisionRules() {
    // Initialize sport division rules from your migration data
    const defaultRules = [
      {
        id: randomUUID(),
        sportId: 'basketball',
        requiredDivisions: {"min_divisions": 1, "max_divisions": 8, "default_type": "age_gender"},
        allowedCombinations: {"age_gender": true, "skill_only": true, "mixed_age": false},
        ageGroupRules: {"youth": {"U10": {"max_age": 10, "min_players": 5}, "U12": {"max_age": 12, "min_players": 5}, "U14": {"max_age": 14, "min_players": 5}, "U16": {"max_age": 16, "min_players": 5}, "U18": {"max_age": 18, "min_players": 5}}, "adult": {"Open": {"min_age": 18, "min_players": 5}, "Masters": {"min_age": 35, "min_players": 5}}},
        genderRules: {"mens": {"required": false, "min_players": 5}, "womens": {"required": false, "min_players": 5}, "mixed": {"required": false, "min_players": 5, "gender_ratio": "flexible"}},
        performanceStandards: {"recreational": {"skill_level": 1, "description": "Beginner to intermediate players"}, "competitive": {"skill_level": 2, "description": "Advanced recreational and former high school players"}, "elite": {"skill_level": 3, "description": "College and professional level players"}},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: 'soccer',
        requiredDivisions: {"min_divisions": 1, "max_divisions": 12, "default_type": "age_gender"},
        allowedCombinations: {"age_gender": true, "skill_only": true, "mixed_age": true},
        ageGroupRules: {"youth": {"U8": {"max_age": 8, "min_players": 7, "field_size": "small"}, "U10": {"max_age": 10, "min_players": 9, "field_size": "small"}, "U12": {"max_age": 12, "min_players": 11, "field_size": "full"}, "U14": {"max_age": 14, "min_players": 11}, "U16": {"max_age": 16, "min_players": 11}, "U18": {"max_age": 18, "min_players": 11}}, "adult": {"Open": {"min_age": 18, "min_players": 11}, "Over30": {"min_age": 30, "min_players": 11}, "Over40": {"min_age": 40, "min_players": 11}}},
        genderRules: {"mens": {"required": false, "min_players": 11}, "womens": {"required": false, "min_players": 11}, "mixed": {"required": false, "min_players": 11, "gender_ratio": "flexible"}},
        performanceStandards: {"division_4": {"skill_level": 1, "description": "Recreational, new players welcome"}, "division_3": {"skill_level": 2, "description": "Intermediate recreational"}, "division_2": {"skill_level": 3, "description": "Competitive recreational"}, "division_1": {"skill_level": 4, "description": "Highly competitive, club level"}},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: 'tennis',
        requiredDivisions: {"min_divisions": 1, "max_divisions": 16, "default_type": "age_gender_skill"},
        allowedCombinations: {"age_gender": true, "skill_only": true, "mixed_doubles": true},
        ageGroupRules: {"junior": {"U10": {"max_age": 10, "court_size": "36ft"}, "U12": {"max_age": 12, "court_size": "60ft"}, "U14": {"max_age": 14, "court_size": "full"}, "U16": {"max_age": 16}, "U18": {"max_age": 18}}, "adult": {"Open": {"min_age": 18}, "35+": {"min_age": 35}, "45+": {"min_age": 45}, "55+": {"min_age": 55}, "65+": {"min_age": 65}}},
        genderRules: {"mens_singles": {"required": false}, "womens_singles": {"required": false}, "mens_doubles": {"required": false}, "womens_doubles": {"required": false}, "mixed_doubles": {"required": false, "gender_ratio": "1:1"}},
        performanceStandards: {"beginner": {"skill_level": 1, "ntrp_range": "1.0-2.5", "description": "New to tennis"}, "intermediate": {"skill_level": 2, "ntrp_range": "3.0-3.5", "description": "Regular recreational player"}, "advanced": {"skill_level": 3, "ntrp_range": "4.0-4.5", "description": "Tournament experienced"}, "open": {"skill_level": 4, "ntrp_range": "5.0+", "description": "Highly competitive"}},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: 'golf',
        requiredDivisions: {"min_divisions": 1, "max_divisions": 20, "default_type": "age_gender_handicap"},
        allowedCombinations: {"age_gender": true, "handicap_flights": true, "mixed_age": true},
        ageGroupRules: {"junior": {"U12": {"max_age": 12, "tee_color": "red"}, "U15": {"max_age": 15, "tee_color": "red"}, "U18": {"max_age": 18, "tee_color": "white"}}, "adult": {"Open": {"min_age": 18, "tee_color": "white"}, "Senior": {"min_age": 50, "tee_color": "white"}, "Super_Senior": {"min_age": 65, "tee_color": "gold"}}},
        genderRules: {"mens": {"required": false, "tee_color": "white"}, "womens": {"required": false, "tee_color": "red"}, "mixed": {"required": false, "tee_color": "flexible"}},
        performanceStandards: {"championship": {"handicap_range": "0-5", "description": "Scratch to low handicap"}, "A_flight": {"handicap_range": "6-12", "description": "Low to mid handicap"}, "B_flight": {"handicap_range": "13-20", "description": "Mid to high handicap"}, "C_flight": {"handicap_range": "21-36", "description": "High handicap and beginners"}},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: 'wrestling',
        requiredDivisions: {"min_divisions": 1, "max_divisions": 30, "default_type": "weight_age_experience"},
        allowedCombinations: {"weight_classes": true, "age_groups": true, "experience_level": true},
        ageGroupRules: {"youth": {"U8": {"max_age": 8, "weight_classes": "modified"}, "U10": {"max_age": 10, "weight_classes": "youth"}, "U12": {"max_age": 12, "weight_classes": "youth"}, "U14": {"max_age": 14, "weight_classes": "cadet"}, "U16": {"max_age": 16, "weight_classes": "junior"}, "U18": {"max_age": 18, "weight_classes": "junior"}}, "adult": {"Open": {"min_age": 18, "weight_classes": "senior"}, "Masters": {"age_groups": ["35-39", "40-44", "45-49", "50+"]}}},
        genderRules: {"mens": {"required": true, "separate_divisions": true}, "womens": {"required": true, "separate_divisions": true}},
        performanceStandards: {"novice": {"experience": "0-1_years", "description": "New wrestlers"}, "intermediate": {"experience": "2-4_years", "description": "Developing wrestlers"}, "advanced": {"experience": "5+_years", "description": "Experienced competitive wrestlers"}},
        createdAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.sportDivisionRules.set(rule.id, rule as SportDivisionRules);
    });
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

  // Contact management methods
  private contacts: Map<string, Contact> = new Map();
  private emailCampaigns: Map<string, EmailCampaign> = new Map();
  private campaignRecipients: Map<string, CampaignRecipient> = new Map();

  async getContacts(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(c => c.userId === userId);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const created: Contact = {
      ...contact,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.set(id, created);
    return created;
  }

  async updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact> {
    const existing = this.contacts.get(id);
    if (!existing) {
      throw new Error("Contact not found");
    }
    const updated: Contact = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<void> {
    this.contacts.delete(id);
  }

  async searchContacts(userId: string, query: string): Promise<Contact[]> {
    const userContacts = Array.from(this.contacts.values()).filter(c => c.userId === userId);
    const searchLower = query.toLowerCase();
    
    return userContacts.filter(contact =>
      contact.firstName?.toLowerCase().includes(searchLower) ||
      contact.lastName?.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.organization?.toLowerCase().includes(searchLower)
    );
  }

  async importContacts(userId: string, contacts: InsertContact[]): Promise<Contact[]> {
    const importedContacts: Contact[] = [];
    
    for (const contactData of contacts) {
      const contact = await this.createContact(contactData);
      importedContacts.push(contact);
    }
    
    return importedContacts;
  }

  // Email campaign methods
  async getEmailCampaigns(userId: string): Promise<EmailCampaign[]> {
    return Array.from(this.emailCampaigns.values()).filter(c => c.userId === userId);
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    return this.emailCampaigns.get(id);
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const id = randomUUID();
    const created: EmailCampaign = {
      ...campaign,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.emailCampaigns.set(id, created);
    return created;
  }

  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    const existing = this.emailCampaigns.get(id);
    if (!existing) {
      throw new Error("Email campaign not found");
    }
    const updated: EmailCampaign = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.emailCampaigns.set(id, updated);
    return updated;
  }

  async deleteEmailCampaign(id: string): Promise<void> {
    this.emailCampaigns.delete(id);
  }

  // Registration request methods
  async createRegistrationRequest(request: InsertRegistrationRequest): Promise<RegistrationRequest> {
    const id = randomUUID();
    const created: RegistrationRequest = {
      ...request,
      id,
      status: request.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.registrationRequests.set(id, created);
    return created;
  }

  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    return Array.from(this.registrationRequests.values());
  }

  async updateRegistrationRequest(id: string, updates: Partial<RegistrationRequest>): Promise<RegistrationRequest | undefined> {
    const existing = this.registrationRequests.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.registrationRequests.set(id, updated);
    return updated;
  }

  // Donor methods
  async getDonors(): Promise<Donor[]> {
    return Array.from(this.donors.values());
  }

  async getDonor(id: string): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(d => d.email === email);
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
    const id = randomUUID();
    const created: Donor = {
      ...donor,
      id,
      totalDonated: donor.totalDonated || "0",
      donationCount: donor.donationCount || 0,
      preferredContactMethod: donor.preferredContactMethod || "email",
      source: donor.source || "landing_page",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.donors.set(id, created);
    return created;
  }

  async updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> {
    const existing = this.donors.get(id);
    if (!existing) {
      throw new Error("Donor not found");
    }
    const updated: Donor = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.donors.set(id, updated);
    return updated;
  }

  async deleteDonor(id: string): Promise<void> {
    this.donors.delete(id);
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(d => d.donorId === donorId);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const created: Donation = {
      ...donation,
      id,
      paymentStatus: donation.paymentStatus || "pending",
      donationPurpose: donation.donationPurpose || "general_education",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.donations.set(id, created);
    return created;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation> {
    const existing = this.donations.get(id);
    if (!existing) {
      throw new Error("Donation not found");
    }
    const updated: Donation = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.donations.set(id, updated);
    return updated;
  }

  async deleteDonation(id: string): Promise<void> {
    this.donations.delete(id);
  }

  // Sport Division Rules methods
  async getSportDivisionRules(): Promise<SportDivisionRules[]> {
    return Array.from(this.sportDivisionRules.values());
  }

  async getSportDivisionRulesBySport(sportId: string): Promise<SportDivisionRules[]> {
    return Array.from(this.sportDivisionRules.values()).filter(r => r.sportId === sportId);
  }

  async createSportDivisionRules(rules: InsertSportDivisionRules): Promise<SportDivisionRules> {
    const id = randomUUID();
    const created: SportDivisionRules = {
      ...rules,
      id,
      createdAt: new Date(),
    };
    this.sportDivisionRules.set(id, created);
    return created;
  }

  // Ultimate Track Events initialization
  private initializeUltimateTrackEvents() {
    const ultimateTrackEvents = [
      // SPRINTS (100m family) 
      {
        id: "tf-100m",
        eventName: "100 Meter Dash",
        eventCategory: "Track",
        distanceMeters: 100,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: [],
        windLegalDistance: 100,
        qualifyingStandards: {
          "high_school_boys": "11.50",
          "high_school_girls": "13.00",
          "college_men": "10.80",
          "college_women": "12.30",
          "open_men": "10.50",
          "open_women": "12.00"
        },
        equipmentSpecs: {
          "lanes": 8,
          "blocks": "required",
          "wind_gauge": "required"
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 8 },
        genderSpecific: false,
        sortOrder: 1,
        createdAt: new Date()
      },
      {
        id: "tf-200m",
        eventName: "200 Meter Dash",
        eventCategory: "Track",
        distanceMeters: 200,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: true,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: [],
        windLegalDistance: 200,
        qualifyingStandards: {
          "high_school_boys": "23.50",
          "high_school_girls": "26.50",
          "college_men": "22.00",
          "college_women": "24.50",
          "open_men": "21.50",
          "open_women": "24.00"
        },
        equipmentSpecs: {
          "lanes": 8,
          "blocks": "required",
          "stagger": "calculated",
          "wind_gauge": "required"
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 10 },
        genderSpecific: false,
        sortOrder: 2,
        createdAt: new Date()
      },
      {
        id: "tf-400m",
        eventName: "400 Meter Dash",
        eventCategory: "Track",
        distanceMeters: 400,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: true,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: [],
        windLegalDistance: null,
        qualifyingStandards: {
          "high_school_boys": "52.00",
          "high_school_girls": "60.00",
          "college_men": "48.50",
          "college_women": "55.00",
          "open_men": "47.00",
          "open_women": "53.00"
        },
        equipmentSpecs: {
          "lanes": 8,
          "blocks": "required",
          "stagger": "calculated"
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 12 },
        genderSpecific: false,
        sortOrder: 3,
        createdAt: new Date()
      },
      // HURDLES
      {
        id: "tf-110h",
        eventName: "110 Meter Hurdles",
        eventCategory: "Track",
        distanceMeters: 110,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: false,
        usesHurdles: true,
        hurdleHeightMen: "1.067",
        hurdleHeightWomen: null,
        hurdleCount: 10,
        implementsUsed: [],
        windLegalDistance: 110,
        qualifyingStandards: {
          "high_school_boys": "16.00",
          "college_men": "14.50",
          "open_men": "14.00"
        },
        equipmentSpecs: {
          "lanes": 8,
          "hurdle_height": "42_inches",
          "hurdle_spacing": "9.14m",
          "blocks": "required",
          "wind_gauge": "required"
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 13 },
        genderSpecific: true,
        sortOrder: 4,
        createdAt: new Date()
      },
      {
        id: "tf-100h",
        eventName: "100 Meter Hurdles",
        eventCategory: "Track",
        distanceMeters: 100,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: false,
        usesHurdles: true,
        hurdleHeightMen: null,
        hurdleHeightWomen: "0.838",
        hurdleCount: 10,
        implementsUsed: [],
        windLegalDistance: 100,
        qualifyingStandards: {
          "high_school_girls": "16.50",
          "college_women": "14.00",
          "open_women": "13.50"
        },
        equipmentSpecs: {
          "lanes": 8,
          "hurdle_height": "33_inches",
          "hurdle_spacing": "8.5m",
          "blocks": "required",
          "wind_gauge": "required"
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 13 },
        genderSpecific: true,
        sortOrder: 5,
        createdAt: new Date()
      },
      // FIELD EVENTS - Shot Put
      {
        id: "tf-shot-put",
        eventName: "Shot Put",
        eventCategory: "Field",
        distanceMeters: null,
        measurementType: "distance",
        maxAttempts: 3,
        usesLanes: false,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["shot_16lb_men", "shot_12lb_women", "shot_8.8lb_youth"],
        windLegalDistance: null,
        qualifyingStandards: {
          "high_school_boys": "45_feet",
          "high_school_girls": "35_feet",
          "college_men": "55_feet",
          "college_women": "45_feet",
          "open_men": "60_feet",
          "open_women": "50_feet"
        },
        equipmentSpecs: {
          "circle_diameter": "7_feet",
          "toe_board": "required",
          "sector_angle": "34.92_degrees",
          "implements": "certified_weights"
        },
        scoringMethod: "distance_descending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 8 },
        genderSpecific: false,
        sortOrder: 10,
        createdAt: new Date()
      },
      // HIGH JUMP
      {
        id: "tf-high-jump",
        eventName: "High Jump",
        eventCategory: "Field",
        distanceMeters: null,
        measurementType: "height",
        maxAttempts: 3,
        usesLanes: false,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["crossbar", "standards", "landing_mat"],
        windLegalDistance: null,
        qualifyingStandards: {
          "high_school_boys": "6_feet",
          "high_school_girls": "5_feet",
          "college_men": "6_feet_8_inches",
          "college_women": "5_feet_6_inches",
          "open_men": "7_feet",
          "open_women": "6_feet"
        },
        equipmentSpecs: {
          "approach_unlimited": true,
          "bar_progression": "standard",
          "landing_mat": "required",
          "standards": "IAAF_certified"
        },
        scoringMethod: "height_descending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 8 },
        genderSpecific: false,
        sortOrder: 15,
        createdAt: new Date()
      },
      // LONG JUMP
      {
        id: "tf-long-jump",
        eventName: "Long Jump",
        eventCategory: "Field",
        distanceMeters: null,
        measurementType: "distance",
        maxAttempts: 3,
        usesLanes: false,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["takeoff_board", "sand_pit"],
        windLegalDistance: null,
        qualifyingStandards: {
          "high_school_boys": "20_feet",
          "high_school_girls": "16_feet",
          "college_men": "23_feet",
          "college_women": "19_feet",
          "open_men": "25_feet",
          "open_women": "21_feet"
        },
        equipmentSpecs: {
          "runway_length": "130_feet",
          "runway_width": "4_feet",
          "takeoff_board": "required",
          "sand_pit": "minimum_9_meters"
        },
        scoringMethod: "distance_descending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 8 },
        genderSpecific: false,
        sortOrder: 16,
        createdAt: new Date()
      },
      // RELAYS
      {
        id: "tf-4x100",
        eventName: "4x100 Meter Relay",
        eventCategory: "Relay",
        distanceMeters: 400,
        measurementType: "time",
        maxAttempts: 1,
        usesLanes: true,
        usesStagger: true,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["baton"],
        windLegalDistance: 400,
        qualifyingStandards: {
          "high_school_boys": "44.00",
          "high_school_girls": "50.00",
          "college_men": "40.50",
          "college_women": "45.00",
          "open_men": "39.50",
          "open_women": "43.50"
        },
        equipmentSpecs: {
          "exchange_zones": 4,
          "zone_length": "20m",
          "baton_required": true,
          "team_size": 4
        },
        scoringMethod: "time_ascending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 10 },
        genderSpecific: false,
        sortOrder: 20,
        createdAt: new Date()
      },
      // COMBINED EVENTS
      {
        id: "tf-decathlon",
        eventName: "Decathlon",
        eventCategory: "Combined",
        distanceMeters: null,
        measurementType: "points",
        maxAttempts: 10,
        usesLanes: false,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["various"],
        windLegalDistance: null,
        qualifyingStandards: {
          "college_men": "6000_points",
          "open_men": "7000_points"
        },
        equipmentSpecs: {
          "events": ["100m", "long_jump", "shot_put", "high_jump", "400m", "110m_hurdles", "discus", "pole_vault", "javelin", "1500m"],
          "scoring": "IAAF_tables",
          "days": 2
        },
        scoringMethod: "points_descending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 16 },
        genderSpecific: true,
        sortOrder: 25,
        createdAt: new Date()
      },
      {
        id: "tf-heptathlon",
        eventName: "Heptathlon",
        eventCategory: "Combined",
        distanceMeters: null,
        measurementType: "points",
        maxAttempts: 7,
        usesLanes: false,
        usesStagger: false,
        usesHurdles: false,
        hurdleHeightMen: null,
        hurdleHeightWomen: null,
        hurdleCount: 0,
        implementsUsed: ["various"],
        windLegalDistance: null,
        qualifyingStandards: {
          "high_school_girls": "4000_points",
          "college_women": "4500_points",
          "open_women": "5500_points"
        },
        equipmentSpecs: {
          "events": ["100m_hurdles", "high_jump", "shot_put", "200m", "long_jump", "javelin", "800m"],
          "scoring": "IAAF_tables",
          "days": 2
        },
        scoringMethod: "points_descending",
        ribbonPlaces: 8,
        ageRestrictions: { "youth_minimum": 16 },
        genderSpecific: true,
        sortOrder: 26,
        createdAt: new Date()
      }
    ];

    // Load all ultimate track events
    ultimateTrackEvents.forEach(event => {
      this.trackEvents.set(event.id, event);
    });

    // Create timing configurations for each event
    ultimateTrackEvents.forEach(event => {
      const timingConfig = {
        id: randomUUID(),
        trackEventId: event.id,
        timingMethod: event.distanceMeters && event.distanceMeters <= 400 ? 'FAT' : 
                     event.distanceMeters && event.distanceMeters <= 1600 ? 'electronic' : 'manual',
        precisionLevel: event.distanceMeters && event.distanceMeters <= 800 ? 'hundredth' : 'tenth',
        windMeasurement: event.windLegalDistance !== null,
        photoFinish: event.distanceMeters && event.distanceMeters <= 800,
        reactionTimeTracking: event.distanceMeters && event.distanceMeters <= 400,
        intermediateSplits: event.distanceMeters === 800 ? { "splits": ["400m"] } :
                           event.distanceMeters === 1500 || event.distanceMeters === 1600 ? { "splits": ["400m", "800m", "1200m"] } :
                           event.distanceMeters && event.distanceMeters >= 3000 ? { "splits": ["1000m", "2000m"] } : {},
        createdAt: new Date()
      };
      this.trackEventTiming.set(timingConfig.id, timingConfig);
    });

    console.log(`🏃‍♂️ Ultimate Track Events initialized: ${ultimateTrackEvents.length} events loaded`);
  }

  // Track Events methods
  async getTrackEvents(): Promise<TrackEvent[]> {
    return Array.from(this.trackEvents.values());
  }

  async getTrackEventsByCategory(category: string): Promise<TrackEvent[]> {
    return Array.from(this.trackEvents.values()).filter(e => e.eventCategory === category);
  }

  async getTrackEvent(id: string): Promise<TrackEvent | undefined> {
    return this.trackEvents.get(id);
  }

  async createTrackEvent(event: InsertTrackEvent): Promise<TrackEvent> {
    const id = randomUUID();
    const created: TrackEvent = {
      ...event,
      id,
      createdAt: new Date(),
    };
    this.trackEvents.set(id, created);
    return created;
  }

  async getTrackEventTiming(): Promise<TrackEventTiming[]> {
    return Array.from(this.trackEventTiming.values());
  }

  async getTrackEventTimingByEventId(trackEventId: string): Promise<TrackEventTiming[]> {
    return Array.from(this.trackEventTiming.values()).filter(t => t.trackEventId === trackEventId);
  }

  // Tournament Integration initialization
  private initializeTournamentIntegration() {
    const tournamentFormatConfigs = [
      // SINGLE ELIMINATION CONFIGURATIONS
      {
        id: randomUUID(),
        tournamentStructureId: "1", // Single Elimination
        sportCategory: "team-sports",
        minParticipants: 4,
        maxParticipants: 128,
        idealParticipants: 16,
        bracketGenerationRules: {
          "bracket_type": "standard",
          "seeding": "optional",
          "byes": "auto_calculate",
          "consolation": "optional"
        },
        advancementRules: {
          "elimination": "single_loss",
          "advancement": "winner_only",
          "finals": "single_game"
        },
        tiebreakerRules: {
          "overtime": "sudden_death",
          "tied_series": "extra_game",
          "equal_records": "head_to_head"
        },
        schedulingRequirements: {
          "games_per_day": 4,
          "rest_between_games": "30_minutes",
          "championship_rest": "1_hour"
        },
        venueRequirements: {
          "courts_needed": "calculated",
          "simultaneous_games": true,
          "championship_court": "preferred"
        },
        officiatingRequirements: {
          "referees_per_game": 2,
          "tournament_director": 1,
          "scorekeeper": 1
        },
        createdAt: new Date()
      },
      // DOUBLE ELIMINATION CONFIGURATIONS
      {
        id: randomUUID(),
        tournamentStructureId: "2", // Double Elimination
        sportCategory: "team-sports",
        minParticipants: 4,
        maxParticipants: 64,
        idealParticipants: 12,
        bracketGenerationRules: {
          "bracket_type": "double",
          "winners_bracket": true,
          "losers_bracket": true,
          "grand_finals": "winners_advantage"
        },
        advancementRules: {
          "elimination": "two_losses",
          "losers_bracket_advancement": "complex",
          "grand_finals_rule": "double_elimination"
        },
        tiebreakerRules: {
          "overtime": "sudden_death",
          "losers_bracket_tiebreak": "run_differential",
          "winners_bracket_tiebreak": "head_to_head"
        },
        schedulingRequirements: {
          "games_per_day": 6,
          "rest_between_games": "45_minutes",
          "elimination_rest": "1_hour"
        },
        venueRequirements: {
          "courts_needed": "double_calculated",
          "losers_bracket_court": "secondary",
          "finals_court": "primary"
        },
        officiatingRequirements: {
          "referees_per_game": 2,
          "bracket_coordinator": 1,
          "scorekeeper": 2
        },
        createdAt: new Date()
      },
      // ROUND ROBIN CONFIGURATIONS
      {
        id: randomUUID(),
        tournamentStructureId: "3", // Round Robin
        sportCategory: "individual-sports",
        minParticipants: 3,
        maxParticipants: 20,
        idealParticipants: 8,
        bracketGenerationRules: {
          "format": "everyone_plays_everyone",
          "rounds": "calculated",
          "courts": "rotation"
        },
        advancementRules: {
          "ranking": "win_percentage",
          "playoff": "optional",
          "tiebreakers": "multiple_criteria"
        },
        tiebreakerRules: {
          "primary": "head_to_head",
          "secondary": "point_differential",
          "tertiary": "points_for"
        },
        schedulingRequirements: {
          "rounds_per_day": 3,
          "matches_per_round": "calculated",
          "rest_between_rounds": "15_minutes"
        },
        venueRequirements: {
          "courts_needed": "half_participants",
          "rotation_system": true,
          "scoreboard": "central"
        },
        officiatingRequirements: {
          "referees_per_match": 1,
          "round_coordinator": 1,
          "central_scoring": 1
        },
        createdAt: new Date()
      },
      // TRACK & FIELD MULTI-EVENT CONFIGURATION
      {
        id: randomUUID(),
        tournamentStructureId: "17", // Multi-Event Competition
        sportCategory: "individual-sports",
        minParticipants: 5,
        maxParticipants: 50,
        idealParticipants: 20,
        bracketGenerationRules: {
          "event_count": "variable",
          "scoring": "IAAF_tables",
          "event_order": "standard",
          "qualifying": "optional"
        },
        advancementRules: {
          "advancement": "cumulative_points",
          "event_completion": "required",
          "final_ranking": "total_points"
        },
        tiebreakerRules: {
          "primary": "total_points",
          "secondary": "head_to_head_events",
          "tertiary": "best_individual_event"
        },
        schedulingRequirements: {
          "days": "2_day_format",
          "events_per_day": "5",
          "rest_between_events": "45_minutes"
        },
        venueRequirements: {
          "track_required": true,
          "field_areas": "multiple",
          "warm_up_areas": "required",
          "timing_system": "FAT"
        },
        officiatingRequirements: {
          "meet_director": 1,
          "event_judges": "per_event",
          "timing_crew": 3,
          "results_crew": 2
        },
        createdAt: new Date()
      }
    ];

    // Load tournament format configurations
    tournamentFormatConfigs.forEach(config => {
      this.tournamentFormatConfigs.set(config.id, config);
    });

    // Create bracket templates for common sizes
    const bracketTemplates = [
      // Single Elimination 4 teams
      {
        id: randomUUID(),
        tournamentStructureId: "1",
        participantCount: 4,
        bracketStructure: {
          "rounds": 2,
          "total_matches": 3,
          "structure": "linear"
        },
        matchSequence: {
          "round_1": [
            {"match_1": {"team_a": "seed_1", "team_b": "seed_4"}},
            {"match_2": {"team_a": "seed_2", "team_b": "seed_3"}}
          ],
          "round_2": [
            {"championship": {"team_a": "winner_match_1", "team_b": "winner_match_2"}}
          ]
        },
        advancementMap: {
          "round_1_winners": ["championship"],
          "championship_winner": ["tournament_winner"]
        },
        createdAt: new Date()
      },
      // Single Elimination 8 teams
      {
        id: randomUUID(),
        tournamentStructureId: "1",
        participantCount: 8,
        bracketStructure: {
          "rounds": 3,
          "total_matches": 7,
          "structure": "tree"
        },
        matchSequence: {
          "round_1": [
            {"match_1": {"team_a": "seed_1", "team_b": "seed_8"}},
            {"match_2": {"team_a": "seed_4", "team_b": "seed_5"}},
            {"match_3": {"team_a": "seed_2", "team_b": "seed_7"}},
            {"match_4": {"team_a": "seed_3", "team_b": "seed_6"}}
          ],
          "round_2": [
            {"semifinal_1": {"team_a": "winner_match_1", "team_b": "winner_match_2"}},
            {"semifinal_2": {"team_a": "winner_match_3", "team_b": "winner_match_4"}}
          ],
          "round_3": [
            {"championship": {"team_a": "winner_semifinal_1", "team_b": "winner_semifinal_2"}}
          ]
        },
        advancementMap: {
          "round_1_winners": ["semifinals"],
          "semifinal_winners": ["championship"],
          "championship_winner": ["tournament_winner"]
        },
        createdAt: new Date()
      },
      // Round Robin 6 teams
      {
        id: randomUUID(),
        tournamentStructureId: "3",
        participantCount: 6,
        bracketStructure: {
          "rounds": 5,
          "total_matches": 15,
          "structure": "matrix"
        },
        matchSequence: {
          "all_matches": [
            {
              "round_1": [
                {"match_1": {"team_a": "team_1", "team_b": "team_2"}},
                {"match_2": {"team_a": "team_3", "team_b": "team_4"}},
                {"match_3": {"team_a": "team_5", "team_b": "team_6"}}
              ]
            },
            {
              "round_2": [
                {"match_4": {"team_a": "team_1", "team_b": "team_3"}},
                {"match_5": {"team_a": "team_2", "team_b": "team_5"}},
                {"match_6": {"team_a": "team_4", "team_b": "team_6"}}
              ]
            }
          ]
        },
        advancementMap: {
          "final_ranking": "win_loss_record",
          "tiebreakers": ["head_to_head", "point_differential"]
        },
        createdAt: new Date()
      }
    ];

    // Load bracket templates
    bracketTemplates.forEach(template => {
      this.bracketTemplates.set(template.id, template);
    });

    console.log(`⚡ Tournament Integration initialized: ${tournamentFormatConfigs.length} format configs, ${bracketTemplates.length} bracket templates loaded`);
  }

  // Tournament Integration methods
  async getTournamentFormatConfigs(): Promise<TournamentFormatConfig[]> {
    return Array.from(this.tournamentFormatConfigs.values());
  }

  async getTournamentFormatConfigsByStructure(structureId: string): Promise<TournamentFormatConfig[]> {
    return Array.from(this.tournamentFormatConfigs.values()).filter(c => c.tournamentStructureId === structureId);
  }

  async getTournamentFormatConfigsBySport(sportCategory: string): Promise<TournamentFormatConfig[]> {
    return Array.from(this.tournamentFormatConfigs.values()).filter(c => c.sportCategory === sportCategory);
  }

  async getBracketTemplates(): Promise<BracketTemplate[]> {
    return Array.from(this.bracketTemplates.values());
  }

  async getBracketTemplatesByStructure(structureId: string): Promise<BracketTemplate[]> {
    return Array.from(this.bracketTemplates.values()).filter(t => t.tournamentStructureId === structureId);
  }

  async getBracketTemplateByParticipants(structureId: string, participantCount: number): Promise<BracketTemplate | undefined> {
    return Array.from(this.bracketTemplates.values()).find(t => 
      t.tournamentStructureId === structureId && t.participantCount === participantCount
    );
  }

  async createTournamentGenerationLog(log: InsertTournamentGenerationLog): Promise<TournamentGenerationLog> {
    const id = randomUUID();
    const created: TournamentGenerationLog = {
      ...log,
      id,
      createdAt: new Date(),
    };
    this.tournamentGenerationLog.set(id, created);
    return created;
  }

  async getTournamentGenerationLogsByTournament(tournamentId: string): Promise<TournamentGenerationLog[]> {
    return Array.from(this.tournamentGenerationLog.values()).filter(l => l.tournamentId === tournamentId);
  }

  // Competition Format Templates initialization and methods
  private initializeCompetitionFormatTemplates() {
    const basketballSportId = "basketball"; // Assuming we have basketball sport
    const soccerSportId = "soccer"; // Assuming we have soccer sport
    const tennisSportId = "tennis"; // Assuming we have tennis sport
    const golfSportId = "golf"; // Assuming we have golf sport
    const trackFieldSportId = "track-field"; // Assuming we have track & field sport

    const competitionFormatTemplates = [
      // BASKETBALL TEMPLATE
      {
        id: randomUUID(),
        sportId: basketballSportId,
        templateName: "Standard Basketball Tournament",
        templateDescription: "Professional basketball tournament configuration with flexible age groups and divisions",
        isDefault: true,
        ageGroupConfig: {
          "youth": {
            "U10": {"game_length": "4x6_minutes", "ball_size": "27.5_inch", "basket_height": "8_feet"},
            "U12": {"game_length": "4x6_minutes", "ball_size": "27.5_inch", "basket_height": "9_feet"},
            "U14": {"game_length": "4x8_minutes", "ball_size": "28.5_inch", "basket_height": "10_feet"},
            "U16": {"game_length": "4x8_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"},
            "U18": {"game_length": "4x8_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}
          },
          "adult": {"Open": {"game_length": "4x12_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}}
        },
        genderDivisionConfig: {
          "mens": {"allowed": true, "ball_size": "29.5_inch"},
          "womens": {"allowed": true, "ball_size": "28.5_inch"},
          "mixed": {"allowed": true, "ball_size": "28.5_inch", "special_rules": "alternating_possession"}
        },
        teamSizeConfig: {
          "minimum": 5, "maximum": 12, "on_court": 5, "substitutions": "unlimited", "roster_limit": 15
        },
        equipmentSpecifications: {
          "court": "94x50_feet", "baskets": "regulation_10_feet", "balls": "certified_leather", 
          "uniforms": "contrasting_colors", "scoreboard": "electronic_preferred"
        },
        gameFormatConfig: {
          "game_length": "regulation_32_minutes", "periods": 4, "overtime": "5_minutes", 
          "shot_clock": "24_seconds", "timeouts": "5_per_team"
        },
        scoringSystemConfig: {
          "field_goals": 2, "three_pointers": 3, "free_throws": 1, 
          "technical_fouls": "ejection_after_2", "flagrant_fouls": "automatic_ejection"
        },
        seriesConfig: {
          "best_of": [1, 3, 5, 7], "default": 1, "championship": "best_of_3", 
          "elimination": "single_game", "round_robin": "single_game"
        },
        venueRequirements: {
          "court_size": "full_regulation", "seating": "tournament_capacity", 
          "warm_up_area": "required", "locker_rooms": "both_teams"
        },
        officiatingConfig: {
          "referees": 2, "scorekeeper": 1, "timekeeper": 1, "shot_clock_operator": 1, "statistics": "optional"
        },
        timingConfig: {
          "game_clock": "stop_time", "shot_clock": "24_seconds", "timeout_length": "60_seconds", "halftime": "15_minutes"
        },
        createdAt: new Date()
      },

      // SOCCER TEMPLATE
      {
        id: randomUUID(),
        sportId: soccerSportId,
        templateName: "FIFA Standard Soccer Tournament",
        templateDescription: "Professional soccer tournament with age-appropriate modifications",
        isDefault: true,
        ageGroupConfig: {
          "youth": {
            "U8": {"game_length": "2x20_minutes", "field_size": "small", "ball_size": "3", "players": 7},
            "U10": {"game_length": "2x25_minutes", "field_size": "small", "ball_size": "3", "players": 9},
            "U12": {"game_length": "2x30_minutes", "field_size": "medium", "ball_size": "4", "players": 11},
            "U14": {"game_length": "2x35_minutes", "field_size": "full", "ball_size": "5", "players": 11},
            "U16": {"game_length": "2x40_minutes", "field_size": "full", "ball_size": "5", "players": 11}
          },
          "adult": {"Open": {"game_length": "2x45_minutes", "field_size": "full", "ball_size": "5", "players": 11}}
        },
        genderDivisionConfig: {
          "mens": {"allowed": true},
          "womens": {"allowed": true},
          "mixed": {"allowed": true, "special_rules": "minimum_female_players"}
        },
        teamSizeConfig: {
          "minimum": 11, "maximum": 18, "on_field": 11, "substitutions": 3, "roster_limit": 23
        },
        equipmentSpecifications: {
          "field": "100-130x50-100_yards", "goals": "8x24_feet", "balls": "FIFA_approved", 
          "uniforms": "contrasting_jerseys", "corner_flags": "required"
        },
        gameFormatConfig: {
          "game_length": "90_minutes", "periods": 2, "halftime": "15_minutes", 
          "stoppage_time": "referee_discretion", "extra_time": "2x15_minutes"
        },
        scoringSystemConfig: {
          "goals": 1, "yellow_cards": "caution", "red_cards": "ejection", 
          "penalty_kicks": "shootout_tiebreaker", "offside": "active"
        },
        seriesConfig: {
          "best_of": [1, 3], "default": 1, "championship": "single_game", 
          "group_stage": "single_round_robin", "penalties": "if_tied"
        },
        venueRequirements: {
          "field_size": "regulation", "goals": "regulation", "seating": "spectator_area", "parking": "adequate"
        },
        officiatingConfig: {
          "referee": 1, "assistant_referees": 2, "fourth_official": "championship_only", "var": "optional"
        },
        timingConfig: {
          "match_clock": "continuous", "halftime": "15_minutes", "injury_time": "referee_adds", "extra_time": "knockout_only"
        },
        createdAt: new Date()
      },

      // TENNIS TEMPLATE
      {
        id: randomUUID(),
        sportId: tennisSportId,
        templateName: "Professional Tennis Tournament",
        templateDescription: "USTA-standard tennis tournament with skill-based divisions",
        isDefault: true,
        ageGroupConfig: {
          "junior": {
            "U10": {"court_size": "36_feet", "ball_type": "red", "sets": "best_of_3_short"},
            "U12": {"court_size": "60_feet", "ball_type": "orange", "sets": "best_of_3_short"},
            "U14": {"court_size": "full", "ball_type": "green", "sets": "best_of_3"},
            "U16": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"},
            "U18": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"}
          },
          "adult": {"Open": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"}}
        },
        genderDivisionConfig: {
          "mens_singles": {"allowed": true},
          "womens_singles": {"allowed": true},
          "mens_doubles": {"allowed": true},
          "womens_doubles": {"allowed": true},
          "mixed_doubles": {"allowed": true}
        },
        teamSizeConfig: {
          "singles": {"players": 1},
          "doubles": {"players": 2, "team_composition": "flexible"}
        },
        equipmentSpecifications: {
          "court": "78x36_feet", "net": "3_feet_center", "balls": "tournament_grade", "rackets": "player_provided"
        },
        gameFormatConfig: {
          "match_format": "best_of_sets", "set_format": "first_to_6_games", 
          "tiebreak": "7_points", "deuce": "advantage_system"
        },
        scoringSystemConfig: {
          "games": 1, "sets": 1, "matches": 1, "tiebreak_points": 1, "double_faults": "point_loss"
        },
        seriesConfig: {
          "best_of": [1, 3, 5], "default": 3, "championship": "best_of_3", 
          "round_robin": "best_of_3_sets", "consolation": "best_of_1"
        },
        venueRequirements: {
          "courts": "hard_surface_preferred", "seating": "courtside", "water_stations": "required", "shade": "preferred"
        },
        officiatingConfig: {
          "chair_umpire": "championship", "line_judges": "optional", "ball_persons": "4_minimum"
        },
        timingConfig: {
          "warm_up": "5_minutes", "changeover": "90_seconds", "set_break": "120_seconds", "medical_timeout": "3_minutes"
        },
        createdAt: new Date()
      },

      // TRACK & FIELD TEMPLATE
      {
        id: randomUUID(),
        sportId: trackFieldSportId,
        templateName: "IAAF Standard Track Meet",
        templateDescription: "Professional track and field meet with all event categories",
        isDefault: true,
        ageGroupConfig: {
          "youth": {
            "U10": {"events": "modified", "distances": "shortened", "implements": "youth_weight"},
            "U12": {"events": "standard", "distances": "youth", "implements": "youth_weight"},
            "U14": {"events": "full", "distances": "standard", "implements": "intermediate"},
            "U16": {"events": "full", "distances": "standard", "implements": "standard"},
            "U18": {"events": "full", "distances": "standard", "implements": "standard"}
          },
          "adult": {
            "Open": {"events": "full", "distances": "standard", "implements": "standard"},
            "Masters": {"age_groups": ["35-39", "40-44", "45-49", "50-54", "55-59", "60+"], "implements": "age_adjusted"}
          }
        },
        genderDivisionConfig: {
          "mens": {"required": true, "separate_events": true, "implements": "standard_weight"},
          "womens": {"required": true, "separate_events": true, "implements": "standard_weight"},
          "mixed": {"relay_events_only": true}
        },
        teamSizeConfig: {
          "individual": {"athletes": 1},
          "relay": {"athletes": 4, "team_composition": "same_gender"},
          "team": {"unlimited_entries": true}
        },
        equipmentSpecifications: {
          "track": "400m_oval", "field_areas": "regulation", "implements": "certified_weights", 
          "timing_system": "FAT", "wind_gauge": "required"
        },
        gameFormatConfig: {
          "meet_format": "multi_event", "sessions": "multiple", 
          "event_schedule": "standard_order", "warm_up_time": "45_minutes"
        },
        scoringSystemConfig: {
          "time": "faster_wins", "distance": "longer_wins", "height": "higher_wins", 
          "points": "IAAF_scoring_tables", "placing": "1st_through_8th"
        },
        seriesConfig: {
          "sessions": [1, 2, 3], "default": 1, "championship": 2, 
          "combined_events": 2, "relays": "final_session"
        },
        venueRequirements: {
          "track": "regulation_400m", "field_events": "infield_and_adjacent", 
          "warm_up_track": "preferred", "timing_tower": "required"
        },
        officiatingConfig: {
          "meet_director": 1, "track_referee": 1, "field_referees": "per_event", 
          "timing_crew": 3, "announcer": 1
        },
        timingConfig: {
          "event_intervals": "15_minutes", "field_event_time": "1.5_hours", 
          "awards": "after_each_event", "cool_down": "15_minutes"
        },
        createdAt: new Date()
      }
    ];

    // Load competition format templates
    competitionFormatTemplates.forEach(template => {
      this.competitionFormatTemplates.set(template.id, template);
    });

    // Initialize series templates
    const seriesTemplates = [
      // Basketball series
      {
        id: randomUUID(),
        sportId: basketballSportId,
        seriesName: "Single Game",
        gamesToWin: 1,
        maximumGames: 1,
        homeFieldAdvantage: false,
        gameIntervals: {"rest_days": 0},
        tiebreakerRules: {"overtime": "5_minute_periods"},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: basketballSportId,
        seriesName: "Best of 3",
        gamesToWin: 2,
        maximumGames: 3,
        homeFieldAdvantage: true,
        gameIntervals: {"rest_days": 1, "travel_days": 2},
        tiebreakerRules: {"game_3_neutral": false},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: basketballSportId,
        seriesName: "Best of 7",
        gamesToWin: 4,
        maximumGames: 7,
        homeFieldAdvantage: true,
        gameIntervals: {"rest_days": 1, "travel_days": 2},
        tiebreakerRules: {"2-3-2_format": true},
        createdAt: new Date()
      },

      // Soccer series
      {
        id: randomUUID(),
        sportId: soccerSportId,
        seriesName: "Single Match",
        gamesToWin: 1,
        maximumGames: 1,
        homeFieldAdvantage: false,
        gameIntervals: {"rest_days": 0},
        tiebreakerRules: {"extra_time": "2x15_minutes", "penalties": "if_tied"},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: soccerSportId,
        seriesName: "Home and Away",
        gamesToWin: 1,
        maximumGames: 2,
        homeFieldAdvantage: true,
        gameIntervals: {"leg_interval": 7},
        tiebreakerRules: {"away_goals_rule": true, "extra_time": "second_leg_only"},
        createdAt: new Date()
      },

      // Tennis series
      {
        id: randomUUID(),
        sportId: tennisSportId,
        seriesName: "Single Match",
        gamesToWin: 1,
        maximumGames: 1,
        homeFieldAdvantage: false,
        gameIntervals: {"rest_days": 0},
        tiebreakerRules: {"tiebreak": "7_points", "final_set": "advantage"},
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        sportId: tennisSportId,
        seriesName: "Best of 3 Sets",
        gamesToWin: 2,
        maximumGames: 3,
        homeFieldAdvantage: false,
        gameIntervals: {"set_break": 2},
        tiebreakerRules: {"final_set_tiebreak": "10_points"},
        createdAt: new Date()
      }
    ];

    // Load series templates
    seriesTemplates.forEach(template => {
      this.seriesTemplates.set(template.id, template);
    });

    console.log(`🐋 Competition Format Templates initialized: ${competitionFormatTemplates.length} templates, ${seriesTemplates.length} series templates loaded`);
  }

  // Competition Format Templates methods
  async getCompetitionFormatTemplates(): Promise<CompetitionFormatTemplate[]> {
    return Array.from(this.competitionFormatTemplates.values());
  }

  async getCompetitionFormatTemplatesBySport(sportId: string): Promise<CompetitionFormatTemplate[]> {
    return Array.from(this.competitionFormatTemplates.values()).filter(t => t.sportId === sportId);
  }

  async getDefaultCompetitionFormatTemplate(sportId: string): Promise<CompetitionFormatTemplate | undefined> {
    return Array.from(this.competitionFormatTemplates.values()).find(t => t.sportId === sportId && t.isDefault);
  }

  async getSeriesTemplates(): Promise<SeriesTemplate[]> {
    return Array.from(this.seriesTemplates.values());
  }

  async getSeriesTemplatesBySport(sportId: string): Promise<SeriesTemplate[]> {
    return Array.from(this.seriesTemplates.values()).filter(t => t.sportId === sportId);
  }

  async getGameLengthTemplates(): Promise<GameLengthTemplate[]> {
    return Array.from(this.gameLengthTemplates.values());
  }

  async getGameLengthTemplatesBySport(sportId: string): Promise<GameLengthTemplate[]> {
    return Array.from(this.gameLengthTemplates.values()).filter(t => t.sportId === sportId);
  }

  // ===================================================================
  // KRAKEN DIVISION SYSTEM - RELEASE THE TENTACLES! 🐙💥
  // ===================================================================

  private initializeKrakenDivisionSystem() {
    // First, let's find sport categories for our templates
    const teamSportsCategoryId = Array.from(this.sportCategories.values()).find(c => c.categoryName === "Team Sports")?.id || "team-sports";
    const individualSportsCategoryId = Array.from(this.sportCategories.values()).find(c => c.categoryName === "Individual Sports")?.id || "individual-sports";
    const academicCategoryId = Array.from(this.sportCategories.values()).find(c => c.categoryName === "Academic Competitions")?.id || "academic";
    const esportsCategoryId = Array.from(this.sportCategories.values()).find(c => c.categoryName === "Esports")?.id || "esports";

    const divisionTemplates = [
      // BASKETBALL KRAKEN: Age and Gender Divisions Simultaneously
      {
        id: randomUUID(),
        templateName: "Basketball Age/Gender Matrix",
        templateDescription: "Complete basketball tournament with all age groups and gender divisions",
        sportCategory: teamSportsCategoryId,
        divisionStructure: {
          "divisions": [
            {"name": "Boys U12", "type": "age_gender", "config": {"age_max": 12, "gender": "male", "team_size": 5}},
            {"name": "Girls U12", "type": "age_gender", "config": {"age_max": 12, "gender": "female", "team_size": 5}},
            {"name": "Boys U14", "type": "age_gender", "config": {"age_max": 14, "gender": "male", "team_size": 5}},
            {"name": "Girls U14", "type": "age_gender", "config": {"age_max": 14, "gender": "female", "team_size": 5}},
            {"name": "Boys U16", "type": "age_gender", "config": {"age_max": 16, "gender": "male", "team_size": 5}},
            {"name": "Girls U16", "type": "age_gender", "config": {"age_max": 16, "gender": "female", "team_size": 5}},
            {"name": "Boys U18", "type": "age_gender", "config": {"age_max": 18, "gender": "male", "team_size": 5}},
            {"name": "Girls U18", "type": "age_gender", "config": {"age_max": 18, "gender": "female", "team_size": 5}},
            {"name": "Mens Open", "type": "age_gender", "config": {"age_min": 18, "gender": "male", "team_size": 5}},
            {"name": "Womens Open", "type": "age_gender", "config": {"age_min": 18, "gender": "female", "team_size": 5}}
          ]
        },
        autoGenerationRules: {"auto_create": true, "min_participants_per_division": 4, "merge_small_divisions": true, "bracket_type": "single_elimination"},
        isActive: true,
        createdAt: new Date()
      },

      // SOCCER KRAKEN: Regional + Age + Skill Divisions
      {
        id: randomUUID(),
        templateName: "Soccer Regional Championship",
        templateDescription: "Multi-regional soccer tournament with age and skill divisions",
        sportCategory: teamSportsCategoryId,
        divisionStructure: {
          "divisions": [
            {"name": "North Region U16 Elite", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "elite"}},
            {"name": "North Region U16 Competitive", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "competitive"}},
            {"name": "North Region U16 Recreational", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "recreational"}},
            {"name": "South Region U16 Elite", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "elite"}},
            {"name": "South Region U16 Competitive", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "competitive"}},
            {"name": "South Region U16 Recreational", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "recreational"}},
            {"name": "East Region U16 Elite", "type": "regional_age_skill", "config": {"region": "east", "age_max": 16, "skill": "elite"}},
            {"name": "West Region U16 Elite", "type": "regional_age_skill", "config": {"region": "west", "age_max": 16, "skill": "elite"}}
          ]
        },
        autoGenerationRules: {"regional_winners_advance": true, "inter_regional_playoff": true, "skill_level_requirements": {"elite": "club_level", "competitive": "school_level", "recreational": "open"}},
        isActive: true,
        createdAt: new Date()
      },

      // TRACK & FIELD KRAKEN: The Ultimate Multi-Division Beast!
      {
        id: randomUUID(),
        templateName: "Track & Field Championship Meet",
        templateDescription: "Complete track meet with all age groups, genders, and event categories",
        sportCategory: individualSportsCategoryId,
        divisionStructure: {
          "divisions": [
            {"name": "Boys U12 Track", "type": "age_gender_event", "config": {"age_max": 12, "gender": "male", "events": "track_only"}},
            {"name": "Girls U12 Track", "type": "age_gender_event", "config": {"age_max": 12, "gender": "female", "events": "track_only"}},
            {"name": "Boys U12 Field", "type": "age_gender_event", "config": {"age_max": 12, "gender": "male", "events": "field_only"}},
            {"name": "Girls U12 Field", "type": "age_gender_event", "config": {"age_max": 12, "gender": "female", "events": "field_only"}},
            {"name": "Boys U14 Track", "type": "age_gender_event", "config": {"age_max": 14, "gender": "male", "events": "track_full"}},
            {"name": "Girls U14 Track", "type": "age_gender_event", "config": {"age_max": 14, "gender": "female", "events": "track_full"}},
            {"name": "Boys U14 Field", "type": "age_gender_event", "config": {"age_max": 14, "gender": "male", "events": "field_full"}},
            {"name": "Girls U14 Field", "type": "age_gender_event", "config": {"age_max": 14, "gender": "female", "events": "field_full"}},
            {"name": "Boys U16 All Events", "type": "age_gender_event", "config": {"age_max": 16, "gender": "male", "events": "all"}},
            {"name": "Girls U16 All Events", "type": "age_gender_event", "config": {"age_max": 16, "gender": "female", "events": "all"}},
            {"name": "Boys U18 All Events", "type": "age_gender_event", "config": {"age_max": 18, "gender": "male", "events": "all"}},
            {"name": "Girls U18 All Events", "type": "age_gender_event", "config": {"age_max": 18, "gender": "female", "events": "all"}},
            {"name": "Mens Open", "type": "age_gender_event", "config": {"age_min": 18, "gender": "male", "events": "all"}},
            {"name": "Womens Open", "type": "age_gender_event", "config": {"age_min": 18, "gender": "female", "events": "all"}},
            {"name": "Mixed Relay Events", "type": "mixed_special", "config": {"gender": "mixed", "events": "relay_only"}}
          ]
        },
        autoGenerationRules: {"event_scheduling": "optimize_conflicts", "field_event_rotations": true, "relay_team_composition": "verify_eligibility"},
        isActive: true,
        createdAt: new Date()
      },

      // ACADEMIC KRAKEN: School District Championship
      {
        id: randomUUID(),
        templateName: "Academic District Championship",
        templateDescription: "Multi-school academic competition with grade-level divisions",
        sportCategory: academicCategoryId,
        divisionStructure: {
          "divisions": [
            {"name": "Elementary Math Bowl", "type": "grade_subject", "config": {"grades": "K-5", "subject": "mathematics"}},
            {"name": "Elementary Spelling Bee", "type": "grade_subject", "config": {"grades": "K-5", "subject": "spelling"}},
            {"name": "Middle School Math Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "mathematics"}},
            {"name": "Middle School Science Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "science"}},
            {"name": "Middle School Quiz Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "general_knowledge"}},
            {"name": "High School Math Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "mathematics"}},
            {"name": "High School Science Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "science"}},
            {"name": "High School Quiz Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "general_knowledge"}},
            {"name": "High School Debate", "type": "grade_subject", "config": {"grades": "9-12", "subject": "debate"}}
          ]
        },
        autoGenerationRules: {"school_representation": "multiple_teams_allowed", "individual_and_team": true, "advancement_to_regional": true},
        isActive: true,
        createdAt: new Date()
      },

      // ESPORTS KRAKEN: Multi-Game Tournament
      {
        id: randomUUID(),
        templateName: "Esports Championship Series",
        templateDescription: "Multi-game esports tournament with rank-based divisions",
        sportCategory: esportsCategoryId,
        divisionStructure: {
          "divisions": [
            {"name": "League of Legends Bronze/Silver", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Bronze", "Silver"]}},
            {"name": "League of Legends Gold/Platinum", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Gold", "Platinum"]}},
            {"name": "League of Legends Diamond+", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Diamond", "Master", "Grandmaster", "Challenger"]}},
            {"name": "Valorant Iron/Bronze", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Iron", "Bronze"]}},
            {"name": "Valorant Silver/Gold", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Silver", "Gold"]}},
            {"name": "Valorant Platinum+", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Platinum", "Diamond", "Immortal", "Radiant"]}},
            {"name": "CS:GO Open Division", "type": "game_skill", "config": {"game": "csgo", "skill": "open"}},
            {"name": "CS:GO Premier Division", "type": "game_skill", "config": {"game": "csgo", "skill": "premier"}}
          ]
        },
        autoGenerationRules: {"rank_verification": "required", "team_composition": "locked_after_registration", "cross_game_participation": "allowed"},
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Load division templates
    divisionTemplates.forEach(template => {
      this.divisionTemplates.set(template.id, template);
    });

    console.log(`🐙 THE KRAKEN HAS BEEN RELEASED! TENTACLES OF TOURNAMENT TERROR DEPLOYED!`);
    console.log(`🐙 Division Templates initialized: ${divisionTemplates.length} multi-division templates loaded`);
  }

  // KRAKEN DIVISION TEMPLATE METHODS
  async getDivisionTemplates(): Promise<DivisionTemplate[]> {
    return Array.from(this.divisionTemplates.values());
  }

  async getDivisionTemplatesBySport(sportCategory: string): Promise<DivisionTemplate[]> {
    return Array.from(this.divisionTemplates.values()).filter(t => t.sportCategory === sportCategory);
  }

  async getDivisionTemplate(id: string): Promise<DivisionTemplate | undefined> {
    return this.divisionTemplates.get(id);
  }

  async createDivisionTemplate(template: InsertDivisionTemplate): Promise<DivisionTemplate> {
    const id = randomUUID();
    const created = { ...template, id, createdAt: new Date() };
    this.divisionTemplates.set(id, created);
    return created;
  }

  // KRAKEN TOURNAMENT DIVISION METHODS
  async getTournamentDivisions(): Promise<TournamentDivision[]> {
    return Array.from(this.tournamentDivisions.values());
  }

  async getTournamentDivisionsByTournament(tournamentId: string): Promise<TournamentDivision[]> {
    return Array.from(this.tournamentDivisions.values()).filter(d => d.tournamentId === tournamentId);
  }

  async getTournamentDivision(id: string): Promise<TournamentDivision | undefined> {
    return this.tournamentDivisions.get(id);
  }

  async createTournamentDivision(division: InsertTournamentDivision): Promise<TournamentDivision> {
    const id = randomUUID();
    const created = { ...division, id, createdAt: new Date() };
    this.tournamentDivisions.set(id, created);
    return created;
  }

  async updateTournamentDivision(id: string, updates: Partial<TournamentDivision>): Promise<TournamentDivision | undefined> {
    const existing = this.tournamentDivisions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.tournamentDivisions.set(id, updated);
    return updated;
  }

  // KRAKEN DIVISION PARTICIPANT METHODS
  async getDivisionParticipants(): Promise<DivisionParticipant[]> {
    return Array.from(this.divisionParticipants.values());
  }

  async getDivisionParticipantsByDivision(divisionId: string): Promise<DivisionParticipant[]> {
    return Array.from(this.divisionParticipants.values()).filter(p => p.divisionId === divisionId);
  }

  async getDivisionParticipant(id: string): Promise<DivisionParticipant | undefined> {
    return this.divisionParticipants.get(id);
  }

  async createDivisionParticipant(participant: InsertDivisionParticipant): Promise<DivisionParticipant> {
    const id = randomUUID();
    const created = { ...participant, id, registrationTime: new Date() };
    this.divisionParticipants.set(id, created);
    
    // Update division participant count
    const division = await this.getTournamentDivision(participant.divisionId!);
    if (division) {
      await this.updateTournamentDivision(division.id, { 
        participantCount: (division.participantCount || 0) + 1 
      });
    }
    
    return created;
  }

  async updateDivisionParticipant(id: string, updates: Partial<DivisionParticipant>): Promise<DivisionParticipant | undefined> {
    const existing = this.divisionParticipants.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.divisionParticipants.set(id, updated);
    return updated;
  }

  // KRAKEN DIVISION GENERATION METHODS
  async getDivisionGenerationRules(): Promise<DivisionGenerationRule[]> {
    return Array.from(this.divisionGenerationRules.values());
  }

  async getDivisionGenerationRulesByTournament(tournamentId: string): Promise<DivisionGenerationRule[]> {
    return Array.from(this.divisionGenerationRules.values()).filter(r => r.tournamentId === tournamentId);
  }

  async createDivisionGenerationRule(rule: InsertDivisionGenerationRule): Promise<DivisionGenerationRule> {
    const id = randomUUID();
    const created = { ...rule, id, createdAt: new Date() };
    this.divisionGenerationRules.set(id, created);
    return created;
  }

  // KRAKEN AUTOMATIC DIVISION GENERATION - THE TENTACLES MOVE!
  async generateDivisionsFromTemplate(tournamentId: string, templateId: string, config: any = {}): Promise<TournamentDivision[]> {
    const template = await this.getDivisionTemplate(templateId);
    if (!template) {
      throw new Error("Division template not found");
    }

    const divisions = template.divisionStructure.divisions as any[];
    const createdDivisions: TournamentDivision[] = [];

    for (const divisionData of divisions) {
      const division = await this.createTournamentDivision({
        tournamentId,
        divisionName: divisionData.name,
        divisionType: divisionData.type,
        divisionConfig: divisionData.config,
        maxParticipants: config.maxParticipants || 64,
        divisionStatus: "open"
      });
      createdDivisions.push(division);
    }

    // Create generation rule record
    await this.createDivisionGenerationRule({
      tournamentId,
      templateId,
      generationConfig: config,
      status: "generated",
      generatedDivisions: createdDivisions.map(d => ({ id: d.id, name: d.divisionName }))
    });

    console.log(`🐙 KRAKEN STRIKE! Generated ${createdDivisions.length} divisions from template: ${template.templateName}`);
    return createdDivisions;
  }

  // KRAKEN DIVISION SCHEDULING METHODS
  async getDivisionScheduling(): Promise<DivisionScheduling[]> {
    return Array.from(this.divisionScheduling.values());
  }

  async getDivisionSchedulingByTournament(tournamentId: string): Promise<DivisionScheduling[]> {
    return Array.from(this.divisionScheduling.values()).filter(s => s.tournamentId === tournamentId);
  }

  async createDivisionScheduling(scheduling: InsertDivisionScheduling): Promise<DivisionScheduling> {
    const id = randomUUID();
    const created = { ...scheduling, id, createdAt: new Date() };
    this.divisionScheduling.set(id, created);
    return created;
  }

  // ===================================================================
  // TOURNAMENT EMPIRE COMPLETION SYSTEM! 👑⚡
  // ===================================================================

  // Initialize Tournament Empire role-based dashboard and organization system
  initializeTournamentEmpire() {
    console.log("👑 Initializing Tournament Empire completion system...");
    
    // Initialize role-based dashboard configurations
    this.initializeDashboardConfigs();
    
    // Initialize organization templates
    this.initializeOrganizations();
    
    // Initialize permission templates
    this.initializePermissionTemplates();
    
    // Initialize adult fantasy system
    this.initializeAdultFantasySystem();
    
    console.log("👑 TOURNAMENT EMPIRE DEPLOYED! Role-based dashboards, organization hierarchy, and granular permissions ready!");
  }

  // Initialize dashboard configurations for all roles and subscription tiers
  initializeDashboardConfigs() {
    const dashboardConfigs = [
      // TOURNAMENT MANAGER DASHBOARDS
      {
        userRole: "tournament_manager",
        subscriptionTier: "district_enterprise",
        dashboardLayout: JSON.stringify({
          layout: "enterprise_command_center",
          panels: ["tournament_overview", "multi_division_management", "ai_tournament_builder", "analytics_dashboard", "white_label_admin", "revenue_tracking"]
        }),
        availableFeatures: JSON.stringify({
          tournament_creation: "unlimited",
          ai_assistance: "advanced",
          white_label: true,
          custom_branding: true,
          multi_division: true,
          coach_communication: true,
          judge_assignment: true,
          analytics: "advanced",
          api_access: true
        }),
        uiPermissions: JSON.stringify({
          can_create_tournaments: true,
          can_manage_all_tournaments: true,
          can_assign_roles: true,
          can_configure_white_label: true,
          can_access_ai_builder: true,
          can_view_revenue: true,
          can_manage_subscriptions: true
        }),
        navigationConfig: JSON.stringify({
          main_nav: ["Dashboard", "Tournaments", "AI Builder", "Organizations", "Users", "Analytics", "Billing", "Settings"],
          quick_actions: ["Create Tournament", "AI Tournament", "Assign Roles", "View Reports"]
        })
      }
    ];

    dashboardConfigs.forEach(config => {
      this.dashboardConfigs.set(`${config.userRole}-${config.subscriptionTier}`, config);
    });
  }

  // Initialize sample organizations
  initializeOrganizations() {
    const organizations = [
      {
        id: "ccisd-athletics",
        organizationName: "CCISD Athletics",
        organizationType: "district",
        subscriptionTier: "district_enterprise",
        whiteLabelConfig: JSON.stringify({
          enabled: true,
          custom_logo: true,
          custom_colors: true,
          custom_domain: true,
          remove_branding: true
        }),
        brandingConfig: JSON.stringify({
          primary_color: "#1f4e79",
          secondary_color: "#f4d03f",
          logo_url: "/assets/ccisd-logo.png",
          district_name: "Corpus Christi ISD",
          mascot: "Rays"
        }),
        customDomain: "ccisd-athletics.com"
      }
    ];

    organizations.forEach(org => {
      this.organizations.set(org.id, org);
    });
  }

  // Initialize permission templates
  initializePermissionTemplates() {
    const permissionTemplates = [
      {
        id: "track-field-judge",
        templateName: "Track Field Event Judge",
        roleType: "scorekeeper",
        subscriptionTier: "district_enterprise",
        permissions: JSON.stringify({
          can_score_assigned_events: true,
          can_update_field_measurements: true,
          can_record_attempts: true,
          can_submit_final_results: true,
          can_view_event_schedule: true
        }),
        restrictions: JSON.stringify({
          event_scope: "field_events_only",
          specific_events: ["shot_put", "discus", "javelin", "hammer", "long_jump", "triple_jump", "high_jump", "pole_vault"],
          cannot_access: "track_events"
        })
      }
    ];

    permissionTemplates.forEach(template => {
      this.permissionTemplates.set(template.id, template);
    });
  }

  // Tournament Empire API Methods
  async getDashboardConfigByRole(userRole: string, subscriptionTier: string): Promise<any> {
    const key = `${userRole}-${subscriptionTier}`;
    return this.dashboardConfigs.get(key);
  }

  async getOrganizations(): Promise<any[]> {
    return Array.from(this.organizations.values());
  }

  async getOrganization(id: string): Promise<any> {
    return this.organizations.get(id);
  }

  async getPermissionTemplates(): Promise<any[]> {
    return Array.from(this.permissionTemplates.values());
  }

  async getPermissionTemplate(id: string): Promise<any> {
    return this.permissionTemplates.get(id);
  }

  // ===================================================================
  // ADULT-ONLY FANTASY SYSTEM METHODS! 🎮⚡
  // DRAFTKINGS/FANDUEL COMPETITOR STORAGE OPERATIONS
  // ===================================================================

  // Fantasy league storage operations
  private fantasyLeagues: Map<string, any> = new Map();
  private fantasyParticipants: Map<string, any> = new Map();
  private professionalPlayers: Map<string, any> = new Map();
  private fantasyPicks: Map<string, any> = new Map();
  private fantasyLineups: Map<string, any> = new Map();
  private playerPerformances: Map<string, any> = new Map();
  private ageVerifications: Map<string, any> = new Map();
  private fantasySafetyRules: Map<string, any> = new Map();
  private apiConfigurations: Map<string, any> = new Map();

  // Initialize adult fantasy system with age-gated leagues and professional players
  initializeAdultFantasySystem() {
    console.log("🎮 Initializing Adult-Only Fantasy System...");
    
    // Initialize fantasy leagues with age restrictions
    this.initializeFantasyLeagues();
    
    // Initialize professional player database
    this.initializeProfessionalPlayers();
    
    // Initialize safety rules and age verification
    this.initializeFantasySafetyRules();
    
    // Initialize API configurations
    this.initializeApiConfigurations();
    
    console.log("🎮 ADULT FANTASY EMPIRE DEPLOYED! Age-verified leagues, professional players, and API integrations ready!");
  }

  // Initialize fantasy leagues with comprehensive adult-only formats
  initializeFantasyLeagues() {
    const fantasyLeagues = [
      {
        id: "nfl-survivor-2025",
        leagueName: "NFL Survivor Challenge 2025",
        commissionerId: "sample_commissioner_id",
        sportType: "nfl",
        leagueFormat: "survivor",
        dataSource: "espn_api",
        ageRestriction: 18,
        requiresAgeVerification: true,
        maxParticipants: 100,
        scoringConfig: {
          type: "survivor",
          elimination_rule: "wrong_pick",
          weekly_picks: 1,
          no_reuse_teams: true
        },
        leagueSettings: {
          max_participants: 100,
          entry_deadline: "2025-09-05T00:00:00Z",
          season_length: 18,
          tiebreaker: "last_elimination",
          late_entry: false
        },
        status: "open"
      },
      {
        id: "nba-dfs-championship",
        leagueName: "NBA DFS Championship",
        commissionerId: "sample_commissioner_id",
        sportType: "nba",
        leagueFormat: "daily",
        dataSource: "espn_api",
        ageRestriction: 18,
        requiresAgeVerification: true,
        maxParticipants: 1000,
        scoringConfig: {
          type: "daily_fantasy",
          salary_cap: 50000,
          scoring: {
            points: 1,
            rebounds: 1.2,
            assists: 1.5,
            steals: 3,
            blocks: 3,
            turnovers: -1,
            double_double: 1.5,
            triple_double: 3
          }
        },
        leagueSettings: {
          lineup_requirements: {
            PG: 1, SG: 1, SF: 1, PF: 1, C: 1, G: 1, F: 1, UTIL: 1
          },
          late_swap: true,
          multi_entry: true
        },
        status: "open"
      },
      {
        id: "lol-pro-fantasy",
        leagueName: "League of Legends Pro Fantasy",
        commissionerId: "sample_commissioner_id",
        sportType: "esports",
        leagueFormat: "season",
        dataSource: "riot_api",
        ageRestriction: 18,
        requiresAgeVerification: true,
        maxParticipants: 50,
        scoringConfig: {
          type: "season_long",
          scoring: {
            kills: 2,
            deaths: -0.5,
            assists: 1.5,
            cs: 0.01,
            vision_score: 0.02,
            game_win: 2
          }
        },
        leagueSettings: {
          roster_size: 6,
          lineup_size: 5,
          trades_allowed: true,
          waiver_claims: true,
          playoff_weeks: 3
        },
        status: "open"
      },
      {
        id: "college-football-pickem",
        leagueName: "College Football Pick Em",
        commissionerId: "sample_commissioner_id",
        sportType: "college_football",
        leagueFormat: "weekly",
        dataSource: "espn_api",
        ageRestriction: 21,
        requiresAgeVerification: true,
        maxParticipants: 200,
        scoringConfig: {
          type: "pick_confidence",
          weekly_games: 10,
          confidence_points: true,
          spread_picks: false
        },
        leagueSettings: {
          season_length: 15,
          playoff_included: true,
          tiebreaker: "total_points",
          age_verification_required: true
        },
        status: "open"
      }
    ];

    fantasyLeagues.forEach(league => {
      this.fantasyLeagues.set(league.id, league);
    });
  }

  // Initialize professional player database with real sports data structure
  initializeProfessionalPlayers() {
    const professionalPlayers = [
      // NFL Players
      {
        id: "dak-prescott-dal",
        externalPlayerId: "espn_123456",
        dataSource: "espn_api",
        playerName: "Dak Prescott",
        teamName: "Dallas Cowboys",
        teamAbbreviation: "DAL",
        position: "QB",
        sport: "nfl",
        jerseyNumber: 4,
        salary: 8500,
        injuryStatus: "healthy",
        byeWeek: 9,
        isActive: true
      },
      {
        id: "ceedee-lamb-dal",
        externalPlayerId: "espn_123457",
        dataSource: "espn_api",
        playerName: "CeeDee Lamb",
        teamName: "Dallas Cowboys",
        teamAbbreviation: "DAL",
        position: "WR",
        sport: "nfl",
        jerseyNumber: 88,
        salary: 7200,
        injuryStatus: "healthy",
        byeWeek: 9,
        isActive: true
      },
      {
        id: "jalen-hurts-phi",
        externalPlayerId: "espn_123458",
        dataSource: "espn_api",
        playerName: "Jalen Hurts",
        teamName: "Philadelphia Eagles",
        teamAbbreviation: "PHI",
        position: "QB",
        sport: "nfl",
        jerseyNumber: 1,
        salary: 8200,
        injuryStatus: "healthy",
        byeWeek: 5,
        isActive: true
      },
      {
        id: "aj-brown-phi",
        externalPlayerId: "espn_123459",
        dataSource: "espn_api",
        playerName: "A.J. Brown",
        teamName: "Philadelphia Eagles",
        teamAbbreviation: "PHI",
        position: "WR",
        sport: "nfl",
        jerseyNumber: 11,
        salary: 6800,
        injuryStatus: "healthy",
        byeWeek: 5,
        isActive: true
      },
      // NBA Players
      {
        id: "luka-doncic-dal",
        externalPlayerId: "espn_nba_001",
        dataSource: "espn_api",
        playerName: "Luka Doncic",
        teamName: "Dallas Mavericks",
        teamAbbreviation: "DAL",
        position: "PG",
        sport: "nba",
        jerseyNumber: 77,
        salary: 11500,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "kyrie-irving-dal",
        externalPlayerId: "espn_nba_002",
        dataSource: "espn_api",
        playerName: "Kyrie Irving",
        teamName: "Dallas Mavericks",
        teamAbbreviation: "DAL",
        position: "PG",
        sport: "nba",
        jerseyNumber: 11,
        salary: 8900,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "jayson-tatum-bos",
        externalPlayerId: "espn_nba_003",
        dataSource: "espn_api",
        playerName: "Jayson Tatum",
        teamName: "Boston Celtics",
        teamAbbreviation: "BOS",
        position: "SF",
        sport: "nba",
        jerseyNumber: 0,
        salary: 10800,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "jaylen-brown-bos",
        externalPlayerId: "espn_nba_004",
        dataSource: "espn_api",
        playerName: "Jaylen Brown",
        teamName: "Boston Celtics",
        teamAbbreviation: "BOS",
        position: "SG",
        sport: "nba",
        jerseyNumber: 7,
        salary: 9200,
        injuryStatus: "healthy",
        isActive: true
      },
      // Esports Players
      {
        id: "faker-t1",
        externalPlayerId: "riot_001",
        dataSource: "riot_api",
        playerName: "Faker",
        teamName: "T1",
        teamAbbreviation: "T1",
        position: "Mid",
        sport: "lol",
        salary: 9500,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "gumayusi-t1",
        externalPlayerId: "riot_002",
        dataSource: "riot_api",
        playerName: "Gumayusi",
        teamName: "T1",
        teamAbbreviation: "T1",
        position: "ADC",
        sport: "lol",
        salary: 8200,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "jankos-g2",
        externalPlayerId: "riot_003",
        dataSource: "riot_api",
        playerName: "Jankos",
        teamName: "G2 Esports",
        teamAbbreviation: "G2",
        position: "Jungle",
        sport: "lol",
        salary: 7800,
        injuryStatus: "healthy",
        isActive: true
      },
      {
        id: "caps-g2",
        externalPlayerId: "riot_004",
        dataSource: "riot_api",
        playerName: "Caps",
        teamName: "G2 Esports",
        teamAbbreviation: "G2",
        position: "Mid",
        sport: "lol",
        salary: 8500,
        injuryStatus: "healthy",
        isActive: true
      }
    ];

    professionalPlayers.forEach(player => {
      this.professionalPlayers.set(player.id, player);
    });
  }

  // Initialize safety rules with age verification requirements
  initializeFantasySafetyRules() {
    const safetyRules = [
      {
        id: "nfl-survivor-safety",
        sportType: "nfl",
        leagueFormat: "survivor",
        minAgeRequirement: 18,
        requiresIdentityVerification: true,
        additionalRestrictions: {
          no_youth_players: true,
          professional_only: true
        }
      },
      {
        id: "nba-daily-safety",
        sportType: "nba",
        leagueFormat: "daily",
        minAgeRequirement: 18,
        requiresIdentityVerification: true,
        additionalRestrictions: {
          no_college_players: false,
          salary_cap_required: true
        }
      },
      {
        id: "esports-season-safety",
        sportType: "esports",
        leagueFormat: "season",
        minAgeRequirement: 18,
        requiresIdentityVerification: true,
        additionalRestrictions: {
          game_rating_check: "T_for_Teen_minimum",
          professional_leagues_only: true
        }
      },
      {
        id: "college-weekly-safety",
        sportType: "college_football",
        leagueFormat: "weekly",
        minAgeRequirement: 21,
        requiresIdentityVerification: true,
        additionalRestrictions: {
          college_players_allowed: true,
          no_high_school: true
        }
      }
    ];

    safetyRules.forEach(rule => {
      this.fantasySafetyRules.set(rule.id, rule);
    });
  }

  // Initialize API configurations for external data sources
  initializeApiConfigurations() {
    const apiConfigs = [
      {
        id: "espn-nfl-api",
        apiName: "ESPN API",
        sportType: "nfl",
        apiEndpoint: "https://site.api.espn.com/apis/site/v2/sports/football/nfl",
        rateLimitPerHour: 1000,
        syncFrequencyMinutes: 60,
        isActive: true,
        dataMapping: {
          player_name: "displayName",
          team: "team.displayName",
          position: "position.abbreviation",
          jersey: "jersey"
        }
      },
      {
        id: "espn-nba-api",
        apiName: "ESPN API",
        sportType: "nba",
        apiEndpoint: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba",
        rateLimitPerHour: 1000,
        syncFrequencyMinutes: 60,
        isActive: true,
        dataMapping: {
          player_name: "displayName",
          team: "team.displayName",
          position: "position.abbreviation",
          jersey: "jersey"
        }
      },
      {
        id: "riot-lol-api",
        apiName: "Riot Games API",
        sportType: "lol",
        apiEndpoint: "https://americas.api.riotgames.com/lol",
        rateLimitPerHour: 100,
        syncFrequencyMinutes: 120,
        isActive: true,
        dataMapping: {
          player_name: "summonerName",
          team: "teamName",
          position: "position",
          champion: "championName"
        }
      }
    ];

    apiConfigs.forEach(config => {
      this.apiConfigurations.set(config.id, config);
    });
  }

  // Fantasy system API methods
  async getFantasyLeagues(): Promise<any[]> {
    return Array.from(this.fantasyLeagues.values());
  }

  async getFantasyLeague(id: string): Promise<any> {
    return this.fantasyLeagues.get(id);
  }

  async getFantasyLeaguesBySport(sportType: string): Promise<any[]> {
    return Array.from(this.fantasyLeagues.values()).filter(league => league.sportType === sportType);
  }

  async getFantasyLeaguesByFormat(leagueFormat: string): Promise<any[]> {
    return Array.from(this.fantasyLeagues.values()).filter(league => league.leagueFormat === leagueFormat);
  }

  async getProfessionalPlayers(): Promise<any[]> {
    return Array.from(this.professionalPlayers.values());
  }

  async getProfessionalPlayer(id: string): Promise<any> {
    return this.professionalPlayers.get(id);
  }

  async getProfessionalPlayersBySport(sport: string): Promise<any[]> {
    return Array.from(this.professionalPlayers.values()).filter(player => player.sport === sport);
  }

  async getProfessionalPlayersByTeam(teamAbbreviation: string): Promise<any[]> {
    return Array.from(this.professionalPlayers.values()).filter(player => player.teamAbbreviation === teamAbbreviation);
  }

  async getFantasySafetyRules(): Promise<any[]> {
    return Array.from(this.fantasySafetyRules.values());
  }

  async getFantasySafetyRule(id: string): Promise<any> {
    return this.fantasySafetyRules.get(id);
  }

  async getApiConfigurations(): Promise<any[]> {
    return Array.from(this.apiConfigurations.values());
  }

  async getApiConfiguration(id: string): Promise<any> {
    return this.apiConfigurations.get(id);
  }

  async createFantasyLeague(league: any): Promise<any> {
    const id = randomUUID();
    const created = { ...league, id, createdAt: new Date() };
    this.fantasyLeagues.set(id, created);
    return created;
  }

  async createFantasyParticipant(participant: any): Promise<any> {
    const id = randomUUID();
    const created = { ...participant, id, entryDate: new Date() };
    this.fantasyParticipants.set(id, created);
    return created;
  }

  async createProfessionalPlayer(player: any): Promise<any> {
    const id = randomUUID();
    const created = { ...player, id, lastUpdated: new Date() };
    this.professionalPlayers.set(id, created);
    return created;
  }

  async createFantasyPick(pick: any): Promise<any> {
    const id = randomUUID();
    const created = { ...pick, id, pickTimestamp: new Date() };
    this.fantasyPicks.set(id, created);
    return created;
  }

  async createFantasyLineup(lineup: any): Promise<any> {
    const id = randomUUID();
    const created = { ...lineup, id, submissionTimestamp: new Date() };
    this.fantasyLineups.set(id, created);
    return created;
  }

  async createAgeVerification(verification: any): Promise<any> {
    const id = randomUUID();
    const created = { ...verification, id, verificationDate: new Date() };
    this.ageVerifications.set(id, created);
    return created;
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
