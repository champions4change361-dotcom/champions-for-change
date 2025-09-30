import { eq, and, or, desc, asc, sql as drizzleSql, inArray } from "drizzle-orm";
import { tournamentDb } from "./tournament-db";
import {
  tournaments,
  matches,
  eventSchools,
  eventParticipants,
  eventAssignments,
  eventResults,
  liveScores,
  scorekeeperAssignments,
  scoreUpdateLog,
  liveScoreMessages,
  tournamentSubscriptions,
  tournamentCoordinationData,
  tournamentOrganizerNetwork,
  regionalTournamentCircuits,
  sportCategories,
  discountCodes,
  paymentPlans,
  paymentPlanEnrollments,
  paymentPlanInstallments,
  emailCampaigns,
  campaignRecipients,
  messages,
  messageRecipients,
  companies,
  corporateCompetitions,
  corporateParticipants,
  performanceMetrics,
  competitionLeaderboards,
  merchandiseProducts,
  merchandiseOrders,
  eventTickets,
  ticketOrders,
  leagues,
  guestParticipants,
  tournamentRegistrationForms,
  registrationSubmissions,
  registrationAssignmentLog,
  organizerPageViews,
  organizerContacts,
  organizerMetrics,
  registrationCodes,
  type Tournament,
  type EventSchool,
  type EventParticipant,
  type EventAssignment,
  type EventResult,
  type LiveScore,
  type ScorekeeperAssignment,
  type ScoreUpdateLog,
  type LiveScoreMessage,
  type TournamentSubscription,
  type TournamentCoordinationData,
  type TournamentOrganizerNetwork,
  type RegionalTournamentCircuit,
  type SportCategory,
  type DiscountCode,
  type PaymentPlan,
  type PaymentPlanEnrollment,
  type PaymentPlanInstallment,
  type EmailCampaign,
  type CampaignRecipient,
  type Message,
  type MessageRecipient,
  type Company,
  type CorporateCompetition,
  type CorporateParticipant,
  type PerformanceMetric,
  type CompetitionLeaderboard,
  type MerchandiseProduct,
  type MerchandiseOrder,
  type EventTicket,
  type TicketOrder,
  type League,
  type GuestParticipant,
  type TournamentRegistrationForm,
  type RegistrationSubmission,
  type RegistrationAssignmentLog,
  type OrganizerPageView,
  type OrganizerContact,
  type OrganizerMetric,
  type RegistrationCode,
  type Match,
  type InsertMatch,
  type UpdateMatch,
  type TournamentDivision,
  type InsertTournamentDivision,
  tournamentDivisions,
  type InsertTournament,
  type InsertEventSchool,
  type InsertEventParticipant,
  type InsertEventAssignment,
  type InsertEventResult,
  type InsertLiveScore,
  type InsertScorekeeperAssignment,
  type InsertScoreUpdateLog,
  type InsertLiveScoreMessage,
  type InsertTournamentSubscription,
  type InsertTournamentCoordinationData,
  type InsertTournamentOrganizerNetwork,
  type InsertRegionalTournamentCircuit,
  type InsertSportCategory,
  type InsertDiscountCode,
  type InsertPaymentPlan,
  type InsertPaymentPlanEnrollment,
  type InsertPaymentPlanInstallment,
  type InsertEmailCampaign,
  type InsertCampaignRecipient,
  type InsertMessage,
  type InsertMessageRecipient,
  type InsertCompany,
  type InsertCorporateCompetition,
  type InsertCorporateParticipant,
  type InsertPerformanceMetric,
  type InsertCompetitionLeaderboard,
  type InsertMerchandiseProduct,
  type InsertMerchandiseOrder,
  type InsertEventTicket,
  type InsertTicketOrder,
  type InsertLeague,
  type InsertGuestParticipant,
  type InsertTournamentRegistrationForm,
  type InsertRegistrationSubmission,
  type InsertRegistrationAssignmentLog,
  type InsertOrganizerPageView,
  type InsertOrganizerContact,
  type InsertOrganizerMetric,
  type InsertRegistrationCode,
} from "../shared/tournament-schema";

/**
 * Tournament Storage Layer
 * 
 * Handles all tournament operations using the dedicated DATABASE_URL_TOURNAMENT database.
 * This separation isolates public cross-district tournaments from HIPAA/FERPA protected
 * district health data, enabling independent coaches and select teams to operate freely.
 */
export class TournamentStorage {
  private db = tournamentDb;

  // =============================================================================
  // TOURNAMENTS - Core tournament management
  // =============================================================================

  async createTournament(data: InsertTournament): Promise<Tournament> {
    const [result] = await this.db.insert(tournaments).values(data).returning();
    return result;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [result] = await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id));
    return result;
  }

  async getTournamentsByOrganizer(organizerId: string): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.userId, organizerId))
      .orderBy(desc(tournaments.createdAt));
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [result] = await this.db
      .update(tournaments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return result;
  }

  async deleteTournament(id: string): Promise<void> {
    await this.db.delete(tournaments).where(eq(tournaments.id, id));
  }

  // =============================================================================
  // TOURNAMENT EVENTS - Track & field, swimming, multi-event tournaments
  // =============================================================================

  async createEventParticipant(data: InsertEventParticipant): Promise<EventParticipant> {
    const [result] = await this.db.insert(eventParticipants).values(data).returning();
    return result;
  }

  async getEventParticipantsByTournamentEvent(tournamentEventId: string): Promise<EventParticipant[]> {
    return await this.db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.tournamentEventId, tournamentEventId));
  }

  async createEventResult(data: InsertEventResult): Promise<EventResult> {
    const [result] = await this.db.insert(eventResults).values(data).returning();
    return result;
  }

  // =============================================================================
  // GUEST PARTICIPANTS - Cross-district and independent athletes
  // =============================================================================

  async createGuestParticipant(data: InsertGuestParticipant): Promise<GuestParticipant> {
    const [result] = await this.db.insert(guestParticipants).values(data).returning();
    return result;
  }

  async getGuestParticipantsByTournament(tournamentId: string): Promise<GuestParticipant[]> {
    return await this.db
      .select()
      .from(guestParticipants)
      .where(eq(guestParticipants.tournamentId, tournamentId));
  }

  // =============================================================================
  // LIVE SCORING - Real-time tournament scoring
  // =============================================================================

  async createLiveScore(data: InsertLiveScore): Promise<LiveScore> {
    const [result] = await this.db.insert(liveScores).values(data).returning();
    return result;
  }

  async getLiveScoresByTournament(tournamentId: string): Promise<LiveScore[]> {
    return await this.db
      .select()
      .from(liveScores)
      .where(eq(liveScores.tournamentId, tournamentId))
      .orderBy(desc(liveScores.updatedAt));
  }

  async updateLiveScore(id: string, updates: Partial<LiveScore>): Promise<LiveScore | undefined> {
    const [result] = await this.db
      .update(liveScores)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(liveScores.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // SCOREKEEPER ASSIGNMENTS
  // =============================================================================

  async createScorekeeperAssignment(data: InsertScorekeeperAssignment): Promise<ScorekeeperAssignment> {
    const [result] = await this.db.insert(scorekeeperAssignments).values(data).returning();
    return result;
  }

  async getScorekeeperAssignmentsByScorekeeper(scorekeeperId: string): Promise<ScorekeeperAssignment[]> {
    return await this.db
      .select()
      .from(scorekeeperAssignments)
      .where(eq(scorekeeperAssignments.scorekeeperId, scorekeeperId));
  }

  // =============================================================================
  // MERCHANDISE & WEBSTORE
  // =============================================================================

  async createMerchandiseProduct(data: InsertMerchandiseProduct): Promise<MerchandiseProduct> {
    const [result] = await this.db.insert(merchandiseProducts).values(data).returning();
    return result;
  }

  async getMerchandiseProductsByTournament(tournamentId: string): Promise<MerchandiseProduct[]> {
    return await this.db
      .select()
      .from(merchandiseProducts)
      .where(eq(merchandiseProducts.tournamentId, tournamentId));
  }

  async createMerchandiseOrder(data: InsertMerchandiseOrder): Promise<MerchandiseOrder> {
    const [result] = await this.db.insert(merchandiseOrders).values(data).returning();
    return result;
  }

  // =============================================================================
  // EVENT TICKETS
  // =============================================================================

  async createEventTicket(data: InsertEventTicket): Promise<EventTicket> {
    const [result] = await this.db.insert(eventTickets).values(data).returning();
    return result;
  }

  async getEventTicketsByTournament(tournamentId: string): Promise<EventTicket[]> {
    return await this.db
      .select()
      .from(eventTickets)
      .where(eq(eventTickets.tournamentId, tournamentId));
  }

  async createTicketOrder(data: InsertTicketOrder): Promise<TicketOrder> {
    const [result] = await this.db.insert(ticketOrders).values(data).returning();
    return result;
  }

  // =============================================================================
  // CORPORATE COMPETITIONS
  // =============================================================================

  async createCompany(data: InsertCompany): Promise<Company> {
    const [result] = await this.db.insert(companies).values(data).returning();
    return result;
  }

  async createCorporateCompetition(data: InsertCorporateCompetition): Promise<CorporateCompetition> {
    const [result] = await this.db.insert(corporateCompetitions).values(data).returning();
    return result;
  }

  async getCorporateCompetitionsByCompany(companyId: string): Promise<CorporateCompetition[]> {
    return await this.db
      .select()
      .from(corporateCompetitions)
      .where(eq(corporateCompetitions.companyId, companyId));
  }

  // =============================================================================
  // LEAGUES - Coaches Lounge leagues system
  // =============================================================================

  async createLeague(data: InsertLeague): Promise<League> {
    const [result] = await this.db.insert(leagues).values(data).returning();
    return result;
  }

  async getLeague(id: string): Promise<League | undefined> {
    const [result] = await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.id, id));
    return result;
  }

  async getLeaguesByOrganizer(organizerId: string): Promise<League[]> {
    return await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.commissionerId, organizerId));
  }

  // =============================================================================
  // TOURNAMENT REGISTRATION
  // =============================================================================

  async createTournamentRegistrationForm(data: InsertTournamentRegistrationForm): Promise<TournamentRegistrationForm> {
    const [result] = await this.db.insert(tournamentRegistrationForms).values(data).returning();
    return result;
  }

  async createRegistrationSubmission(data: InsertRegistrationSubmission): Promise<RegistrationSubmission> {
    const [result] = await this.db.insert(registrationSubmissions).values(data).returning();
    return result;
  }

  async getRegistrationSubmissionsByTournament(tournamentId: string): Promise<RegistrationSubmission[]> {
    return await this.db
      .select()
      .from(registrationSubmissions)
      .where(eq(registrationSubmissions.tournamentId, tournamentId));
  }

  // =============================================================================
  // PAYMENT & FINANCIAL
  // =============================================================================

  async createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode> {
    const [result] = await this.db.insert(discountCodes).values(data).returning();
    return result;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const [result] = await this.db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code));
    return result;
  }

  async createPaymentPlan(data: InsertPaymentPlan): Promise<PaymentPlan> {
    const [result] = await this.db.insert(paymentPlans).values(data).returning();
    return result;
  }

  // =============================================================================
  // MESSAGING & COMMUNICATION
  // =============================================================================

  async createMessage(data: InsertMessage): Promise<Message> {
    const [result] = await this.db.insert(messages).values(data).returning();
    return result;
  }

  async getMessagesByTournament(tournamentId: string): Promise<Message[]> {
    return await this.db
      .select()
      .from(messages)
      .where(eq(messages.tournamentId, tournamentId))
      .orderBy(desc(messages.createdAt));
  }

  async createEmailCampaign(data: InsertEmailCampaign): Promise<EmailCampaign> {
    const [result] = await this.db.insert(emailCampaigns).values(data).returning();
    return result;
  }

  // =============================================================================
  // ANALYTICS & METRICS
  // =============================================================================

  async createOrganizerPageView(data: InsertOrganizerPageView): Promise<OrganizerPageView> {
    const [result] = await this.db.insert(organizerPageViews).values(data).returning();
    return result;
  }

  async createOrganizerContact(data: InsertOrganizerContact): Promise<OrganizerContact> {
    const [result] = await this.db.insert(organizerContacts).values(data).returning();
    return result;
  }

  async getOrganizerMetrics(organizerId: string): Promise<OrganizerMetric[]> {
    return await this.db
      .select()
      .from(organizerMetrics)
      .where(eq(organizerMetrics.organizerId, organizerId))
      .orderBy(desc(organizerMetrics.metricDate));
  }

  // =============================================================================
  // SPORT CATEGORIES
  // =============================================================================

  async createSportCategory(data: InsertSportCategory): Promise<SportCategory> {
    const [result] = await this.db.insert(sportCategories).values(data).returning();
    return result;
  }

  async getAllSportCategories(): Promise<SportCategory[]> {
    return await this.db.select().from(sportCategories);
  }

  // =============================================================================
  // REGISTRATION CODES
  // =============================================================================

  async createRegistrationCode(data: InsertRegistrationCode): Promise<RegistrationCode> {
    const [result] = await this.db.insert(registrationCodes).values(data).returning();
    return result;
  }

  async getRegistrationCodeByCode(code: string): Promise<RegistrationCode | undefined> {
    const [result] = await this.db
      .select()
      .from(registrationCodes)
      .where(eq(registrationCodes.code, code));
    return result;
  }

  // =============================================================================
  // ADDITIONAL TOURNAMENT METHODS (for route compatibility)
  // =============================================================================

  async getTournaments(): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt));
  }

  async getDraftTournaments(userId: string): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(and(eq(tournaments.userId, userId), eq(tournaments.status, 'draft')))
      .orderBy(desc(tournaments.createdAt));
  }

  async getTournamentPublic(id: string): Promise<Tournament | undefined> {
    // Public access - same as getTournament but explicitly for public routes
    const [result] = await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id));
    return result;
  }

  async getTournamentRegistrationForm(id: string): Promise<TournamentRegistrationForm | undefined> {
    const [result] = await this.db
      .select()
      .from(tournamentRegistrationForms)
      .where(eq(tournamentRegistrationForms.id, id));
    return result;
  }

  async getTournamentRegistrationFormsByTournament(tournamentId: string): Promise<TournamentRegistrationForm[]> {
    return await this.db
      .select()
      .from(tournamentRegistrationForms)
      .where(eq(tournamentRegistrationForms.tournamentId, tournamentId));
  }

  async updateTournamentRegistrationForm(id: string, updates: Partial<TournamentRegistrationForm>): Promise<TournamentRegistrationForm | undefined> {
    const [result] = await this.db
      .update(tournamentRegistrationForms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tournamentRegistrationForms.id, id))
      .returning();
    return result;
  }

  async getRegistrationSubmission(id: string): Promise<RegistrationSubmission | undefined> {
    const [result] = await this.db
      .select()
      .from(registrationSubmissions)
      .where(eq(registrationSubmissions.id, id));
    return result;
  }

  async updateRegistrationSubmission(id: string, updates: Partial<RegistrationSubmission>): Promise<RegistrationSubmission | undefined> {
    const [result] = await this.db
      .update(registrationSubmissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(registrationSubmissions.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // MATCH MANAGEMENT
  // =============================================================================

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return await this.db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(asc(matches.round), asc(matches.position));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [result] = await this.db
      .select()
      .from(matches)
      .where(eq(matches.id, id));
    return result;
  }

  async createMatch(data: InsertMatch): Promise<Match> {
    const [result] = await this.db.insert(matches).values(data).returning();
    return result;
  }

  async updateMatch(id: string, updates: UpdateMatch): Promise<Match | undefined> {
    const [result] = await this.db
      .update(matches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // TOURNAMENT DIVISIONS/EVENTS
  // =============================================================================

  async getTournamentEventsByTournament(tournamentId: string): Promise<TournamentDivision[]> {
    return await this.db
      .select()
      .from(tournamentDivisions)
      .where(eq(tournamentDivisions.tournamentId, tournamentId));
  }

  async createTournamentDivision(data: InsertTournamentDivision): Promise<TournamentDivision> {
    const [result] = await this.db.insert(tournamentDivisions).values(data).returning();
    return result;
  }
}

// Export singleton instance
export const tournamentStorage = new TournamentStorage();
