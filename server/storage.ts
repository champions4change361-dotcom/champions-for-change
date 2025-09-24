import { 
  type User, type UpsertUser, type WhitelabelConfigRecord as WhitelabelConfig, type InsertWhitelabelConfigRecord as InsertWhitelabelConfig,
  type Tournament, type InsertTournament, type Match, type InsertMatch, type UpdateMatch,
  type SportOption, type InsertSportOption, type TournamentStructure, type InsertTournamentStructure,
  type TrackEventRecord as TrackEvent, type InsertTrackEventRecord as InsertTrackEvent, type Page, type InsertPage,
  type TeamRegistration, type InsertTeamRegistration, type Organization, type InsertOrganization,
  type Team, type InsertTeam, type TeamPlayer, type InsertTeamPlayer,
  type MedicalHistory, type InsertMedicalHistory,
  type ScorekeeperAssignment, type InsertScorekeeperAssignment, type EventScore, type InsertEventScore,
  type SchoolEventAssignment, type InsertSchoolEventAssignment, type CoachEventAssignment, type InsertCoachEventAssignment,
  type Contact, type InsertContact, type EmailCampaign, type InsertEmailCampaign, type CampaignRecipient, type InsertCampaignRecipient,
  type Donor, type InsertDonor, type Donation, type InsertDonation, type RegistrationRequest, type InsertRegistrationRequest,
  type TaxExemptionDocument, type InsertTaxExemptionDocument, type NonprofitSubscription, type InsertNonprofitSubscription, type NonprofitInvoice, type InsertNonprofitInvoice,
  type SupportTeam, type InsertSupportTeam, type SupportTeamMember, type InsertSupportTeamMember, type SupportTeamInjury, type InsertSupportTeamInjury, type SupportTeamAiConsultation, type InsertSupportTeamAiConsultation,
  type TournamentSubscription, type InsertTournamentSubscription,
  type ClientConfiguration, type InsertClientConfiguration,
  type GuestParticipant, type InsertGuestParticipant, type PasswordResetToken, type InsertPasswordResetToken,
  type ShowdownContest, type InsertShowdownContest, type ShowdownEntry, type InsertShowdownEntry, type ShowdownLeaderboard, type InsertShowdownLeaderboard,
  type ProfessionalPlayer, type InsertProfessionalPlayer,
  type MerchandiseProduct, type InsertMerchandiseProduct, type MerchandiseOrder, type InsertMerchandiseOrder,
  type EventTicket, type InsertEventTicket, type TicketOrder, type InsertTicketOrder,
  type TournamentRegistrationForm, type InsertTournamentRegistrationForm, type RegistrationSubmission, type InsertRegistrationSubmission, type RegistrationAssignmentLog, type InsertRegistrationAssignmentLog,
  type FantasyProfile, type InsertFantasyProfile,
  users, whitelabelConfigs, tournaments, matches, sportOptions, sportCategories, sportEvents, tournamentStructures, trackEvents, pages, teamRegistrations, organizations, teams, teamPlayers, medicalHistory, scorekeeperAssignments, eventScores, schoolEventAssignments, coachEventAssignments, contacts, emailCampaigns, campaignRecipients, donors, donations, sportDivisionRules, registrationRequests, complianceAuditLog, taxExemptionDocuments, nonprofitSubscriptions, nonprofitInvoices, supportTeams, supportTeamMembers, supportTeamInjuries, supportTeamAiConsultations, jerseyTeamMembers, jerseyTeamPayments, tournamentSubscriptions, clientConfigurations, guestParticipants, passwordResetTokens, showdownContests, showdownEntries, showdownLeaderboards, professionalPlayers, merchandiseProducts, merchandiseOrders, eventTickets, ticketOrders, tournamentRegistrationForms, registrationSubmissions, registrationAssignmentLog, fantasyProfiles, athleticConfigs, academicConfigs, fineArtsConfigs
} from "@shared/schema";

type SportCategory = typeof sportCategories.$inferSelect;
type InsertSportCategory = typeof sportCategories.$inferInsert;
type SportDivisionRules = typeof sportDivisionRules.$inferSelect;
type InsertSportDivisionRules = typeof sportDivisionRules.$inferInsert;
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createCachedStorage } from "./cache";
import { createMonitoredStorage } from "./monitoring";
import { BracketGenerator } from "./utils/bracket-generator";

// Compliance-related types
export type ComplianceAuditLog = {
  id?: string;
  userId: string;
  actionType: 'data_access' | 'data_modification' | 'export' | 'view' | 'login' | 'permission_change';
  resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'administrative_data';
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  complianceNotes: string | null;
  createdAt?: Date | null;
};

export interface IStorage {
  // User authentication methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User | undefined>;
  
  // Fantasy profile methods
  getFantasyProfile(userId: string): Promise<FantasyProfile | undefined>;
  upsertFantasyProfile(profile: InsertFantasyProfile): Promise<FantasyProfile>;
  setFantasyAgeVerification(userId: string, verifiedAt: Date, expiresAt: Date): Promise<FantasyProfile | undefined>;
  acceptFantasyTOS(userId: string): Promise<FantasyProfile | undefined>;
  
  // Compliance operations
  createComplianceAuditLog(log: ComplianceAuditLog): Promise<ComplianceAuditLog>;
  getComplianceAuditLogs(userId?: string, limit?: number): Promise<ComplianceAuditLog[]>;

  // Profile picture operations (optional - may not be implemented by all storage types)
  createProfilePictureUpload?(upload: any): Promise<any>;
  getProfilePictureUpload?(uploadId: string): Promise<any>;
  updateProfilePictureUpload?(uploadId: string, updates: any): Promise<any>;
  updateUserProfile?(userId: string, updates: any): Promise<void>;
  getFlaggedProfilePictures?(): Promise<any[]>;
  getUserProfilePictureUploads?(userId: string): Promise<any[]>;
  createImageReport?(report: any): Promise<void>;

  // White-label methods
  createWhitelabelConfig(config: InsertWhitelabelConfig): Promise<WhitelabelConfig>;
  getWhitelabelConfig(id: string): Promise<WhitelabelConfig | undefined>;
  getWhitelabelConfigByDomain(domain: string): Promise<WhitelabelConfig | undefined>;
  getWhitelabelConfigByUserId(userId: string): Promise<WhitelabelConfig | undefined>;
  updateWhitelabelConfig(id: string, updates: Partial<WhitelabelConfig>): Promise<WhitelabelConfig | undefined>;

  // Client configuration methods
  createClientConfiguration(config: InsertClientConfiguration): Promise<ClientConfiguration>;
  getClientConfiguration(id: string): Promise<ClientConfiguration | undefined>;
  getClientConfigurationByDomain(domain: string): Promise<ClientConfiguration | undefined>;
  getClientConfigurationByUserId(userId: string): Promise<ClientConfiguration | undefined>;
  updateClientConfiguration(id: string, updates: Partial<ClientConfiguration>): Promise<ClientConfiguration | undefined>;
  deleteClientConfiguration(id: string): Promise<boolean>;

  // Page management methods
  createPage(page: InsertPage): Promise<Page>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string, userId?: string): Promise<Page | undefined>;
  getPagesByUserId(userId: string): Promise<Page[]>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;

  // Modular page management methods
  createModularPage(page: any): Promise<any>;
  getModularPage(id: string): Promise<any | undefined>;
  getModularPageBySlug(slug: string, userId?: string): Promise<any | undefined>;
  getModularPagesByUserId(userId: string): Promise<any[]>;
  updateModularPage(id: string, updates: any): Promise<any | undefined>;
  deleteModularPage(id: string): Promise<boolean>;

  // Team registration methods
  createTeamRegistration(registration: InsertTeamRegistration): Promise<TeamRegistration>;
  getTeamRegistration(id: string): Promise<TeamRegistration | undefined>;
  getTeamRegistrationsByTournament(tournamentId: string): Promise<TeamRegistration[]>;
  getTeamRegistrationsByCoach(coachId: string): Promise<TeamRegistration[]>;
  updateTeamRegistration(id: string, updates: Partial<TeamRegistration>): Promise<TeamRegistration | undefined>;
  deleteTeamRegistration(id: string): Promise<boolean>;
  getTeamByCode(teamCode: string): Promise<TeamRegistration | undefined>;
  
  // Team member methods
  createTeamMember(member: any): Promise<any>;
  getTeamMembers(teamRegistrationId: string): Promise<any[]>;
  updateTeamMember(id: string, updates: any): Promise<any>;
  deleteTeamMember(id: string): Promise<boolean>;
  
  // Team payment methods
  createTeamPayment(payment: any): Promise<any>;
  getTeamPayments(teamId: string): Promise<any[]>;
  updateTeamPayment(id: string, updates: any): Promise<any>;

  // Standalone team management methods (Jersey Watch-style)
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByCoach(coachId: string): Promise<Team[]>;
  getTeamsByOrganization(organizationName: string): Promise<Team[]>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  updateTeamSubscription(id: string, subscriptionData: { subscriptionStatus: string, subscriptionTier: string, stripeSubscriptionId?: string }): Promise<Team | undefined>;
  
  // Team player management methods
  createTeamPlayer(player: InsertTeamPlayer): Promise<TeamPlayer>;
  getTeamPlayer(id: string): Promise<TeamPlayer | undefined>;
  getTeamPlayersByTeam(teamId: string): Promise<TeamPlayer[]>;
  updateTeamPlayer(id: string, updates: Partial<TeamPlayer>): Promise<TeamPlayer | undefined>;
  deleteTeamPlayer(id: string): Promise<boolean>;
  bulkCreateTeamPlayers(players: InsertTeamPlayer[]): Promise<TeamPlayer[]>;

  // Medical history management methods
  createMedicalHistory(medicalHistory: InsertMedicalHistory): Promise<MedicalHistory>;
  getMedicalHistory(id: string): Promise<MedicalHistory | undefined>;
  getMedicalHistoryByPlayer(playerId: string): Promise<MedicalHistory | undefined>;
  updateMedicalHistory(id: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory | undefined>;
  deleteMedicalHistory(id: string): Promise<boolean>;

  // Guest participant methods - "Pay & Play or Join the Family" system
  createGuestParticipant(participant: InsertGuestParticipant): Promise<GuestParticipant>;
  getGuestParticipant(id: string): Promise<GuestParticipant | undefined>;
  getGuestParticipantsByTournament(tournamentId: string): Promise<GuestParticipant[]>;
  getGuestParticipantsByOrganizer(organizerId: string): Promise<GuestParticipant[]>;
  updateGuestParticipant(id: string, updates: Partial<GuestParticipant>): Promise<GuestParticipant | undefined>;
  deleteGuestParticipant(id: string): Promise<boolean>;
  linkGuestParticipantToUser(participantId: string, userId: string): Promise<GuestParticipant | undefined>;

  // Password reset methods for tournament organizers
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<boolean>;
  cleanupExpiredPasswordResetTokens(): Promise<number>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined>;

  // Registration request methods
  createRegistrationRequest(request: any): Promise<any>;
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
  
  // Tournament subscription operations
  createTournamentSubscription(subscription: InsertTournamentSubscription): Promise<TournamentSubscription>;
  getTournamentSubscriptions(): Promise<TournamentSubscription[]>;
  
  // Email campaign operations
  getEmailCampaigns(userId: string): Promise<EmailCampaign[]>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;
  deleteEmailCampaign(id: string): Promise<void>;

  // Tournament methods
  getTournaments(userId?: string): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  getDraftTournaments(userId: string): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  // FFA Tournament methods
  generateFFATournament(tournamentId: string, config: {
    tournamentType: 'multi-heat-racing' | 'battle-royale' | 'point-accumulation' | 'time-trials' | 'survival-elimination';
    participants: Array<{ id: string; name: string; email?: string; seedNumber?: number; skillLevel?: string; }>;
    formatConfig: Record<string, any>;
  }): Promise<Tournament | undefined>;
  updateFFAParticipants(tournamentId: string, participants: any[]): Promise<Tournament | undefined>;
  updateFFAHeatAssignments(tournamentId: string, heatAssignments: any[]): Promise<Tournament | undefined>;
  updateFFARoundResults(tournamentId: string, roundNumber: number, results: any[]): Promise<Tournament | undefined>;
  getFFALeaderboard(tournamentId: string): Promise<any[]>;
  getFFAParticipantPerformance(tournamentId: string, participantId: string): Promise<any | undefined>;
  
  // Tournament Registration Form methods - Smart linking system
  createTournamentRegistrationForm(form: InsertTournamentRegistrationForm): Promise<TournamentRegistrationForm>;
  getTournamentRegistrationForm(id: string): Promise<TournamentRegistrationForm | undefined>;
  getTournamentRegistrationFormsByTournament(tournamentId: string): Promise<TournamentRegistrationForm[]>;
  getTournamentRegistrationFormsByOrganizer(organizerId: string): Promise<TournamentRegistrationForm[]>;
  updateTournamentRegistrationForm(id: string, updates: Partial<TournamentRegistrationForm>): Promise<TournamentRegistrationForm | undefined>;
  deleteTournamentRegistrationForm(id: string): Promise<boolean>;
  
  // Registration Submission methods - Smart participant management
  createRegistrationSubmission(submission: InsertRegistrationSubmission): Promise<RegistrationSubmission>;
  getRegistrationSubmission(id: string): Promise<RegistrationSubmission | undefined>;
  getRegistrationSubmissionsByForm(formId: string): Promise<RegistrationSubmission[]>;
  getRegistrationSubmissionsByTournament(tournamentId: string): Promise<RegistrationSubmission[]>;
  updateRegistrationSubmission(id: string, updates: Partial<RegistrationSubmission>): Promise<RegistrationSubmission | undefined>;
  deleteRegistrationSubmission(id: string): Promise<boolean>;
  
  // Smart Assignment methods - Automatic participant placement
  assignSubmissionToTarget(submissionId: string, targetType: 'division' | 'event', targetId: string, reason: string): Promise<RegistrationSubmission | undefined>;
  getCapacityStatus(tournamentId: string): Promise<{
    divisions: Array<{ id: string; name: string; current: number; max: number; waitlist: number }>;
    events: Array<{ id: string; name: string; current: number; max: number; waitlist: number }>;
  }>;
  processSubmissionAssignment(submissionId: string): Promise<RegistrationSubmission | undefined>;
  
  // Atomic capacity management - Thread-safe capacity operations
  reserveCapacity(targetType: 'division' | 'event', targetId: string, count?: number): Promise<boolean>;
  releaseCapacity(targetType: 'division' | 'event', targetId: string, count?: number): Promise<boolean>;
  checkCapacityAvailable(targetType: 'division' | 'event', targetId: string, requiredCount?: number): Promise<boolean>;
  
  // Status transition helpers - Safe state management
  transitionSubmissionStatus(submissionId: string, newStatus: 'pending' | 'assigned' | 'confirmed' | 'waitlisted' | 'rejected'): Promise<RegistrationSubmission | undefined>;
  transitionAssignmentStatus(submissionId: string, newStatus: 'pending' | 'assigned' | 'confirmed' | 'waitlisted' | 'rejected'): Promise<RegistrationSubmission | undefined>;
  
  // Assignment Log methods - Track smart matching decisions
  createRegistrationAssignmentLog(log: InsertRegistrationAssignmentLog): Promise<RegistrationAssignmentLog>;
  getRegistrationAssignmentLogsBySubmission(submissionId: string): Promise<RegistrationAssignmentLog[]>;
  getRegistrationAssignmentLogsByTournament(tournamentId: string): Promise<RegistrationAssignmentLog[]>;
  
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
  // Track timing methods temporarily disabled due to schema updates
  // getTrackEventTiming(): Promise<TrackEventTiming[]>;
  // getTrackEventTimingByEventId(trackEventId: string): Promise<TrackEventTiming[]>;
  getSportDivisionRules(): Promise<SportDivisionRules[]>;
  getSportDivisionRulesBySport(sportId: string): Promise<SportDivisionRules[]>;
  createSportDivisionRules(rules: InsertSportDivisionRules): Promise<SportDivisionRules>;
  
  // Tournament Integration methods (temporarily disabled due to schema updates)
  // getTournamentFormatConfigs(): Promise<TournamentFormatConfig[]>;
  // getTournamentFormatConfigsByStructure(structureId: string): Promise<TournamentFormatConfig[]>;
  // getTournamentFormatConfigsBySport(sportCategory: string): Promise<TournamentFormatConfig[]>;
  // getBracketTemplates(): Promise<BracketTemplate[]>;
  // getBracketTemplatesByStructure(structureId: string): Promise<BracketTemplate[]>;
  // getBracketTemplateByParticipants(structureId: string, participantCount: number): Promise<BracketTemplate | undefined>;
  // createTournamentGenerationLog(log: InsertTournamentGenerationLog): Promise<TournamentGenerationLog>;
  // getTournamentGenerationLogsByTournament(tournamentId: string): Promise<TournamentGenerationLog[]>;

  // Competition Format Templates methods (temporarily disabled due to schema updates)
  // getCompetitionFormatTemplates(): Promise<CompetitionFormatTemplate[]>;
  // getCompetitionFormatTemplatesBySport(sportId: string): Promise<CompetitionFormatTemplate[]>;
  // getDefaultCompetitionFormatTemplate(sportId: string): Promise<CompetitionFormatTemplate | undefined>;
  // getSeriesTemplates(): Promise<SeriesTemplate[]>;
  // getSeriesTemplatesBySport(sportId: string): Promise<SeriesTemplate[]>;
  // getGameLengthTemplates(): Promise<GameLengthTemplate[]>;
  // getGameLengthTemplatesBySport(sportId: string): Promise<GameLengthTemplate[]>;

  // KRAKEN MULTI-DIVISION SYSTEM METHODS (temporarily disabled due to schema updates)
  // getDivisionTemplates(): Promise<DivisionTemplate[]>;
  // getDivisionTemplatesBySport(sportCategory: string): Promise<DivisionTemplate[]>;
  // getDivisionTemplate(id: string): Promise<DivisionTemplate | undefined>;
  // createDivisionTemplate(template: InsertDivisionTemplate): Promise<DivisionTemplate>;
  // getTournamentDivisions(): Promise<TournamentDivision[]>;
  // getTournamentDivisionsByTournament(tournamentId: string): Promise<TournamentDivision[]>;
  // getTournamentDivision(id: string): Promise<TournamentDivision | undefined>;
  // createTournamentDivision(division: InsertTournamentDivision): Promise<TournamentDivision>;
  // updateTournamentDivision(id: string, updates: Partial<TournamentDivision>): Promise<TournamentDivision | undefined>;
  // getDivisionParticipants(): Promise<DivisionParticipant[]>;
  // getDivisionParticipantsByDivision(divisionId: string): Promise<DivisionParticipant[]>;
  // getDivisionParticipant(id: string): Promise<DivisionParticipant | undefined>;
  // createDivisionParticipant(participant: InsertDivisionParticipant): Promise<DivisionParticipant>;
  // updateDivisionParticipant(id: string, updates: Partial<DivisionParticipant>): Promise<DivisionParticipant | undefined>;
  // getDivisionGenerationRules(): Promise<DivisionGenerationRule[]>;
  // getDivisionGenerationRulesByTournament(tournamentId: string): Promise<DivisionGenerationRule[]>;
  // createDivisionGenerationRule(rule: InsertDivisionGenerationRule): Promise<DivisionGenerationRule>;
  // generateDivisionsFromTemplate(tournamentId: string, templateId: string, config?: any): Promise<TournamentDivision[]>;
  // getDivisionScheduling(): Promise<DivisionScheduling[]>;
  // getDivisionSchedulingByTournament(tournamentId: string): Promise<DivisionScheduling[]>;
  // createDivisionScheduling(scheduling: InsertDivisionScheduling): Promise<DivisionScheduling>;
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

  // Nonprofit Tax Exemption and Billing methods
  createTaxExemptionDocument(document: InsertTaxExemptionDocument): Promise<TaxExemptionDocument>;
  getTaxExemptionDocument(id: string): Promise<TaxExemptionDocument | undefined>;
  getTaxExemptionDocumentsByOrganization(organizationId: string): Promise<TaxExemptionDocument[]>;
  updateTaxExemptionDocument(id: string, updates: Partial<TaxExemptionDocument>): Promise<TaxExemptionDocument | undefined>;
  verifyTaxExemptionDocument(id: string, verifiedBy: string, status: 'verified' | 'rejected', notes?: string): Promise<TaxExemptionDocument | undefined>;

  createNonprofitSubscription(subscription: InsertNonprofitSubscription): Promise<NonprofitSubscription>;
  getNonprofitSubscription(id: string): Promise<NonprofitSubscription | undefined>;
  getNonprofitSubscriptionByOrganization(organizationId: string): Promise<NonprofitSubscription | undefined>;
  updateNonprofitSubscription(id: string, updates: Partial<NonprofitSubscription>): Promise<NonprofitSubscription | undefined>;

  createNonprofitInvoice(invoice: InsertNonprofitInvoice): Promise<NonprofitInvoice>;
  getNonprofitInvoice(id: string): Promise<NonprofitInvoice | undefined>;
  getNonprofitInvoicesBySubscription(subscriptionId: string): Promise<NonprofitInvoice[]>;
  updateNonprofitInvoice(id: string, updates: Partial<NonprofitInvoice>): Promise<NonprofitInvoice | undefined>;
  markInvoiceAsPaid(id: string, paymentMethod: string, paymentReference?: string): Promise<NonprofitInvoice | undefined>;

  // Support Team methods
  createSupportTeam(team: InsertSupportTeam): Promise<SupportTeam>;
  getSupportTeam(id: string): Promise<SupportTeam | undefined>;
  getSupportTeamsByOrganization(organizationId: string): Promise<SupportTeam[]>;
  updateSupportTeam(id: string, updates: Partial<SupportTeam>): Promise<SupportTeam | undefined>;
  
  createSupportTeamMember(member: InsertSupportTeamMember): Promise<SupportTeamMember>;
  getSupportTeamMember(id: string): Promise<SupportTeamMember | undefined>;
  getSupportTeamMembersByTeam(teamId: string): Promise<SupportTeamMember[]>;
  updateSupportTeamMember(id: string, updates: Partial<SupportTeamMember>): Promise<SupportTeamMember | undefined>;
  
  createSupportTeamInjury(injury: InsertSupportTeamInjury): Promise<SupportTeamInjury>;
  getSupportTeamInjury(id: string): Promise<SupportTeamInjury | undefined>;
  getSupportTeamInjuriesByTeam(teamId: string): Promise<SupportTeamInjury[]>;
  updateSupportTeamInjury(id: string, updates: Partial<SupportTeamInjury>): Promise<SupportTeamInjury | undefined>;
  
  createSupportTeamAiConsultation(consultation: InsertSupportTeamAiConsultation): Promise<SupportTeamAiConsultation>;
  getSupportTeamAiConsultation(id: string): Promise<SupportTeamAiConsultation | undefined>;
  getSupportTeamAiConsultationsByTeam(teamId: string): Promise<SupportTeamAiConsultation[]>;
  updateSupportTeamAiConsultation(id: string, updates: Partial<SupportTeamAiConsultation>): Promise<SupportTeamAiConsultation | undefined>;

  // Fantasy Showdown Contest methods
  createShowdownContest(contest: InsertShowdownContest): Promise<ShowdownContest>;
  getShowdownContest(id: string): Promise<ShowdownContest | undefined>;
  getShowdownContests(): Promise<ShowdownContest[]>;
  getShowdownContestsByCommissioner(commissionerId: string): Promise<ShowdownContest[]>;
  updateShowdownContest(id: string, updates: Partial<ShowdownContest>): Promise<ShowdownContest | undefined>;

  // Fantasy Showdown Entry methods
  createShowdownEntry(entry: InsertShowdownEntry): Promise<ShowdownEntry>;
  getShowdownEntry(id: string): Promise<ShowdownEntry | undefined>;
  getShowdownEntriesByContest(contestId: string): Promise<ShowdownEntry[]>;
  getShowdownEntriesByUser(userId: string): Promise<ShowdownEntry[]>;
  updateShowdownEntry(id: string, updates: Partial<ShowdownEntry>): Promise<ShowdownEntry | undefined>;

  // Professional Player methods
  createProfessionalPlayer(player: InsertProfessionalPlayer): Promise<ProfessionalPlayer>;
  getProfessionalPlayer(id: string): Promise<ProfessionalPlayer | undefined>;
  getProfessionalPlayersBySport(sport: string): Promise<ProfessionalPlayer[]>;
  getProfessionalPlayersByTeam(teamAbbreviation: string): Promise<ProfessionalPlayer[]>;
  updateProfessionalPlayer(id: string, updates: Partial<ProfessionalPlayer>): Promise<ProfessionalPlayer | undefined>;

  // Merchandise Product methods
  createMerchandiseProduct(product: InsertMerchandiseProduct): Promise<MerchandiseProduct>;
  getMerchandiseProduct(id: string): Promise<MerchandiseProduct | undefined>;
  getMerchandiseProductsByOrganization(organizationId: string): Promise<MerchandiseProduct[]>;
  getMerchandiseProductsByTournament(tournamentId: string): Promise<MerchandiseProduct[]>;
  updateMerchandiseProduct(id: string, updates: Partial<MerchandiseProduct>): Promise<MerchandiseProduct | undefined>;
  deleteMerchandiseProduct(id: string): Promise<boolean>;

  // Merchandise Order methods
  createMerchandiseOrder(order: InsertMerchandiseOrder): Promise<MerchandiseOrder>;
  getMerchandiseOrder(id: string): Promise<MerchandiseOrder | undefined>;
  getMerchandiseOrdersByOrganization(organizationId: string): Promise<MerchandiseOrder[]>;
  getMerchandiseOrdersByCustomer(customerId: string): Promise<MerchandiseOrder[]>;
  updateMerchandiseOrder(id: string, updates: Partial<MerchandiseOrder>): Promise<MerchandiseOrder | undefined>;
  updateOrderFulfillmentStatus(id: string, status: string, trackingInfo?: any): Promise<MerchandiseOrder | undefined>;

  // Event Ticket methods
  createEventTicket(ticket: InsertEventTicket): Promise<EventTicket>;
  getEventTicket(id: string): Promise<EventTicket | undefined>;
  getEventTicketsByOrganization(organizationId: string): Promise<EventTicket[]>;
  getEventTicketsByTournament(tournamentId: string): Promise<EventTicket[]>;
  updateEventTicket(id: string, updates: Partial<EventTicket>): Promise<EventTicket | undefined>;
  deleteEventTicket(id: string): Promise<boolean>;

  // Ticket Order methods
  createTicketOrder(order: InsertTicketOrder): Promise<TicketOrder>;
  getTicketOrder(id: string): Promise<TicketOrder | undefined>;
  getTicketOrdersByOrganization(organizationId: string): Promise<TicketOrder[]>;
  getTicketOrdersByCustomer(customerId: string): Promise<TicketOrder[]>;
  updateTicketOrder(id: string, updates: Partial<TicketOrder>): Promise<TicketOrder | undefined>;
  updateTicketStatus(id: string, status: string): Promise<TicketOrder | undefined>;

  // Inventory management methods
  updateProductInventory(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<boolean>;
  updateTicketInventory(ticketId: string, quantity: number): Promise<boolean>;
  checkProductAvailability(productId: string, variantId?: string, quantity?: number): Promise<boolean>;
  checkTicketAvailability(ticketId: string, quantity?: number): Promise<boolean>;

  // Revenue calculation methods
  calculateMerchandiseRevenue(organizationId: string, startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    platformFee: number;
    organizationRevenue: number;
  }>;
  calculateTicketRevenue(organizationId: string, startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    platformFee: number;
    organizationRevenue: number;
  }>;

  // =============================================================================
  // TRANSACTION SUPPORT FOR COMPLEX OPERATIONS
  // Ensure data consistency for multi-table operations
  // =============================================================================
  
  // Complex tournament operations requiring atomicity
  createTournamentWithMatches(
    tournament: InsertTournament, 
    matchInputs: InsertMatch[]
  ): Promise<{ tournament: Tournament; matches: Match[] }>;
  
  // Team registration with member management
  createTeamRegistrationWithMembers(
    registration: InsertTeamRegistration,
    members: any[]
  ): Promise<{ registration: TeamRegistration; members: any[] }>;
  
  // Complete match with bracket progression
  completeMatchWithBracketUpdate(
    matchId: string,
    matchUpdate: UpdateMatch,
    nextMatches?: { matchId: string; updates: Partial<Match> }[]
  ): Promise<{ match: Match; updatedMatches: Match[] }>;
  
  // Generic transaction wrapper for custom operations
  executeTransaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T>;

  // Cache and monitoring methods (optional - may not be implemented by all storage types)
  getCacheStats?(): {
    totalEntries: number;
    hits: number;
    misses: number;
    hitRate: number;
    totalSize: number;
    evictions: number;
  };
  
  getMonitoringData?(): {
    health?: {
      connectionStatus: string;
    };
    performance: {
      averageResponseTime: number;
      totalQueries: number;
      slowQueries: number;
      errorRate: number;
      queriesPerMinute: number;
      healthStatus: string;
    };
  };

  // NFL data methods
  storeNFLSchedule(games: any[]): Promise<void>;
  getNFLSchedule(): Promise<any[]>;
  storeNFLInjuries(injuries: any[]): Promise<void>;
  getNFLInjuries(): Promise<any[]>;
  storeNFLPlayerStats(stats: any[]): Promise<void>;
  getNFLPlayerStats(): Promise<any[]>;
}

export class DbStorage implements IStorage {
  private db: typeof db;

  constructor() {
    // Use the transaction-capable database from db.ts
    this.db = db;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email.toLowerCase()));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.db.select().from(users);
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // First try to find existing user by email
      if (userData.email) {
        const existingUser = await this.db
          .select()
          .from(users)
          .where(eq(users.email, userData.email))
          .limit(1);
        
        if (existingUser.length > 0) {
          // Update existing user
          const result = await this.db
            .update(users)
            .set({
              ...userData,
              hybridSubscription: userData.hybridSubscription as any, // Type cast to handle schema mismatch
              updatedAt: new Date(),
            })
            .where(eq(users.email, userData.email))
            .returning();
          return result[0];
        }
      }
      
      // No existing user found, create new one
      const result = await this.db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            hybridSubscription: userData.hybridSubscription as any, // Type cast to handle schema mismatch
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

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await this.db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
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

  // Fantasy profile methods
  async getFantasyProfile(userId: string): Promise<FantasyProfile | undefined> {
    try {
      const result = await this.db.select().from(fantasyProfiles).where(eq(fantasyProfiles.userId, userId));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async upsertFantasyProfile(profile: InsertFantasyProfile): Promise<FantasyProfile> {
    try {
      // Check if profile exists
      const existing = await this.db
        .select()
        .from(fantasyProfiles)
        .where(eq(fantasyProfiles.userId, profile.userId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing profile
        const result = await this.db
          .update(fantasyProfiles)
          .set({ ...profile, updatedAt: new Date() })
          .where(eq(fantasyProfiles.userId, profile.userId))
          .returning();
        return result[0];
      } else {
        // Create new profile
        const result = await this.db.insert(fantasyProfiles).values(profile).returning();
        return result[0];
      }
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to upsert fantasy profile");
    }
  }

  async setFantasyAgeVerification(userId: string, verifiedAt: Date, expiresAt: Date): Promise<FantasyProfile | undefined> {
    try {
      // First ensure fantasy profile exists
      await this.upsertFantasyProfile({ userId, status: "active" });
      
      // Update age verification fields
      const result = await this.db
        .update(fantasyProfiles)
        .set({ 
          ageVerifiedAt: verifiedAt,
          ageVerificationExpiresAt: expiresAt,
          updatedAt: new Date()
        })
        .where(eq(fantasyProfiles.userId, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async acceptFantasyTOS(userId: string): Promise<FantasyProfile | undefined> {
    try {
      // First ensure fantasy profile exists
      await this.upsertFantasyProfile({ userId, status: "active" });
      
      // Update TOS acceptance
      const result = await this.db
        .update(fantasyProfiles)
        .set({ 
          tosAcceptedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fantasyProfiles.userId, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Compliance operations
  async createComplianceAuditLog(log: ComplianceAuditLog): Promise<ComplianceAuditLog> {
    try {
      const logWithId = {
        ...log,
        id: randomUUID()
      };
      const result = await this.db.insert(complianceAuditLog).values(logWithId).returning();
      return result[0];
    } catch (error) {
      console.error("Compliance audit log error:", error);
      throw new Error("Failed to create compliance audit log");
    }
  }

  async getComplianceAuditLogs(userId?: string, limit: number = 100): Promise<ComplianceAuditLog[]> {
    try {
      let query = this.db.select().from(complianceAuditLog).orderBy(desc(complianceAuditLog.createdAt)).limit(limit);
      
      if (userId) {
        query = query.where(eq(complianceAuditLog.userId, userId));
      }
      
      const result = await query;
      return result;
    } catch (error) {
      console.error("Compliance audit log retrieval error:", error);
      return [];
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

  // Client configuration methods
  async createClientConfiguration(config: InsertClientConfiguration): Promise<ClientConfiguration> {
    try {
      const result = await this.db.insert(clientConfigurations).values(config).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create client configuration");
    }
  }

  async getClientConfiguration(id: string): Promise<ClientConfiguration | undefined> {
    try {
      const result = await this.db.select().from(clientConfigurations).where(eq(clientConfigurations.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getClientConfigurationByDomain(domain: string): Promise<ClientConfiguration | undefined> {
    try {
      const result = await this.db.select().from(clientConfigurations).where(eq(clientConfigurations.domain, domain));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getClientConfigurationByUserId(userId: string): Promise<ClientConfiguration | undefined> {
    try {
      const result = await this.db.select().from(clientConfigurations).where(eq(clientConfigurations.userId, userId));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async updateClientConfiguration(id: string, updates: Partial<ClientConfiguration>): Promise<ClientConfiguration | undefined> {
    try {
      const result = await this.db
        .update(clientConfigurations)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(clientConfigurations.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteClientConfiguration(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(clientConfigurations).where(eq(clientConfigurations.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
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
      return (result.rowCount ?? 0) > 0;
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
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async getTeamByCode(teamCode: string): Promise<TeamRegistration | undefined> {
    try {
      const result = await this.db
        .select()
        .from(teamRegistrations)
        .where(eq(teamRegistrations.teamCode, teamCode));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Team member methods
  async createTeamMember(member: any): Promise<any> {
    try {
      const result = await this.db.insert(jerseyTeamMembers).values(member).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team member");
    }
  }

  async getTeamMembers(teamRegistrationId: string): Promise<any[]> {
    try {
      const result = await this.db
        .select()
        .from(jerseyTeamMembers)
        .where(eq(jerseyTeamMembers.teamRegistrationId, teamRegistrationId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateTeamMember(id: string, updates: any): Promise<any> {
    try {
      const result = await this.db
        .update(jerseyTeamMembers)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(jerseyTeamMembers.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(jerseyTeamMembers).where(eq(jerseyTeamMembers.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Team payment methods
  async createTeamPayment(payment: any): Promise<any> {
    try {
      const paymentData = {
        teamRegistrationId: payment.teamRegistrationId,
        payerName: payment.payerName,
        payerEmail: payment.payerEmail,
        paymentAmount: payment.amount.toString(),
        paymentType: payment.paymentType || 'team_captain',
        paymentMethod: 'stripe',
        stripePaymentIntentId: payment.stripePaymentIntentId,
        coversMembers: payment.playersIncluded || [],
        allocationNotes: `Payment for ${payment.paymentType}: ${payment.playersIncluded?.length || 0} players`
      };

      const result = await this.db.insert(jerseyTeamPayments).values(paymentData).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team payment");
    }
  }

  async getTeamPayments(teamRegistrationId: string): Promise<any[]> {
    try {
      const result = await this.db
        .select()
        .from(jerseyTeamPayments)
        .where(eq(jerseyTeamPayments.teamRegistrationId, teamRegistrationId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateTeamPayment(id: string, updates: any): Promise<any> {
    try {
      const result = await this.db
        .update(jerseyTeamPayments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(jerseyTeamPayments.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // STANDALONE TEAM MANAGEMENT METHODS (Jersey Watch-style)
  async createTeam(team: InsertTeam): Promise<Team> {
    try {
      const teamWithId = {
        id: randomUUID(),
        ...team,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.db.insert(teams).values(teamWithId).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team");
    }
  }

  async getTeam(id: string): Promise<Team | undefined> {
    try {
      const result = await this.db.select().from(teams).where(eq(teams.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get team");
    }
  }

  async getTeamsByCoach(coachId: string): Promise<Team[]> {
    try {
      const result = await this.db.select().from(teams).where(eq(teams.coachId, coachId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get teams by coach");
    }
  }

  async getTeamsByOrganization(organizationName: string): Promise<Team[]> {
    try {
      const result = await this.db.select().from(teams).where(eq(teams.organizationName, organizationName));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get teams by organization");
    }
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    try {
      // Filter out immutable fields to prevent accidental mutation
      const { id: _, createdAt: __, ...allowedUpdates } = updates;
      
      const result = await this.db
        .update(teams)
        .set({ ...allowedUpdates, updatedAt: new Date() })
        .where(eq(teams.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update team");
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    try {
      // First delete related team players to handle cascade
      await this.db.delete(teamPlayers).where(eq(teamPlayers.teamId, id));
      
      // Then delete the team
      const result = await this.db.delete(teams).where(eq(teams.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete team");
    }
  }

  async updateTeamSubscription(id: string, subscriptionData: { subscriptionStatus: string, subscriptionTier: string, stripeSubscriptionId?: string }): Promise<Team | undefined> {
    try {
      const result = await this.db
        .update(teams)
        .set({ 
          ...subscriptionData, 
          updatedAt: new Date() 
        })
        .where(eq(teams.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update team subscription");
    }
  }

  async createTeamPlayer(player: InsertTeamPlayer): Promise<TeamPlayer> {
    try {
      const playerWithId = {
        id: randomUUID(),
        ...player,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.db.insert(teamPlayers).values(playerWithId).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team player");
    }
  }

  async getTeamPlayer(id: string): Promise<TeamPlayer | undefined> {
    try {
      const result = await this.db.select().from(teamPlayers).where(eq(teamPlayers.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get team player");
    }
  }

  async getTeamPlayersByTeam(teamId: string): Promise<TeamPlayer[]> {
    try {
      const result = await this.db.select().from(teamPlayers).where(eq(teamPlayers.teamId, teamId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get team players");
    }
  }

  async updateTeamPlayer(id: string, updates: Partial<TeamPlayer>): Promise<TeamPlayer | undefined> {
    try {
      // Filter out immutable fields to prevent accidental mutation
      const { id: _, teamId: __, createdAt: ___, ...allowedUpdates } = updates;
      
      const result = await this.db
        .update(teamPlayers)
        .set({ ...allowedUpdates, updatedAt: new Date() })
        .where(eq(teamPlayers.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update team player");
    }
  }

  async deleteTeamPlayer(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(teamPlayers).where(eq(teamPlayers.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete team player");
    }
  }

  async bulkCreateTeamPlayers(players: InsertTeamPlayer[]): Promise<TeamPlayer[]> {
    try {
      const playersWithIds = players.map(player => ({
        id: randomUUID(),
        ...player,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      const result = await this.db.insert(teamPlayers).values(playersWithIds).returning();
      return result;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create team players");
    }
  }

  // Medical history methods
  async createMedicalHistory(medicalHistoryData: InsertMedicalHistory): Promise<MedicalHistory> {
    try {
      const medicalHistoryWithId = {
        id: randomUUID(),
        ...medicalHistoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.db.insert(medicalHistory).values([medicalHistoryWithId]).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create medical history");
    }
  }

  async getMedicalHistory(id: string): Promise<MedicalHistory | undefined> {
    try {
      const result = await this.db.select().from(medicalHistory).where(eq(medicalHistory.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getMedicalHistoryByPlayer(playerId: string): Promise<MedicalHistory | undefined> {
    try {
      const result = await this.db.select().from(medicalHistory).where(eq(medicalHistory.playerId, playerId));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async updateMedicalHistory(id: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory | undefined> {
    try {
      // Filter out immutable fields to prevent accidental mutation
      const { id: _, createdAt, ...allowedUpdates } = updates;
      const updatedData = {
        ...allowedUpdates,
        updatedAt: new Date()
      };
      
      const result = await this.db.update(medicalHistory)
        .set(updatedData)
        .where(eq(medicalHistory.id, id))
        .returning();
        
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteMedicalHistory(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(medicalHistory).where(eq(medicalHistory.id, id)).returning();
      return result.length > 0;
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
  async createRegistrationRequest(request: any): Promise<any> {
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
      return (result.rowCount ?? 0) > 0;
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
      return (result.rowCount ?? 0) > 0;
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
      return (result.rowCount ?? 0) > 0;
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
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async getTournaments(userId?: string): Promise<Tournament[]> {
    try {
      let query = this.db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
      if (userId) {
        query = query.where(eq(tournaments.userId, userId));
      }
      const tournamentResults = await query;
      
      // Join sport configs for ALL tournaments to maintain consistent shape
      const tournamentsWithConfigs = await Promise.all(
        tournamentResults.map(async (tournament) => {
          const sportConfig = await this.getSportConfig(tournament.id, tournament.sportCategory);
          return {
            ...tournament,
            ...sportConfig
          } as Tournament;
        })
      );
      
      return tournamentsWithConfigs;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch tournaments");
    }
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    try {
      // Get core tournament
      const [tournament] = await this.db.select().from(tournaments).where(eq(tournaments.id, id));
      if (!tournament) return undefined;

      // Join with sport-specific config for consistent shape
      const sportConfig = await this.getSportConfig(tournament.id, tournament.sportCategory);
      
      // Return merged response (consistent with createTournament)
      return {
        ...tournament,
        ...sportConfig
      } as Tournament;
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getDraftTournaments(userId: string): Promise<Tournament[]> {
    try {
      const result = await this.db
        .select()
        .from(tournaments)
        .where(and(eq(tournaments.status, 'draft'), eq(tournaments.userId, userId)))
        .orderBy(desc(tournaments.updatedAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    // TRANSACTIONAL APPROACH: Split incoming data into core + sport config, create both in single transaction
    return await this.db.transaction(async (tx) => {
      // Step 1: WHITELIST core tournament fields (safe approach) - ONLY include fields that exist in tournaments table
      const coreTournamentData: any = {};
      
      // Core tournament fields that exist in DB
      if (insertTournament.id !== undefined) coreTournamentData.id = insertTournament.id;
      if (insertTournament.name !== undefined) coreTournamentData.name = insertTournament.name;
      if (insertTournament.teamSize !== undefined) coreTournamentData.teamSize = insertTournament.teamSize;
      if (insertTournament.description !== undefined) coreTournamentData.description = insertTournament.description;
      if (insertTournament.userId !== undefined) coreTournamentData.userId = insertTournament.userId;
      if (insertTournament.status !== undefined) coreTournamentData.status = insertTournament.status;
      if (insertTournament.sport !== undefined) coreTournamentData.sport = insertTournament.sport;
      if (insertTournament.sportCategory !== undefined) coreTournamentData.sportCategory = insertTournament.sportCategory;
      if (insertTournament.ageGroup !== undefined) coreTournamentData.ageGroup = insertTournament.ageGroup;
      if (insertTournament.genderDivision !== undefined) coreTournamentData.genderDivision = insertTournament.genderDivision;
      if (insertTournament.location !== undefined) coreTournamentData.location = insertTournament.location;
      if (insertTournament.tournamentDate !== undefined) coreTournamentData.tournamentDate = insertTournament.tournamentDate;
      if (insertTournament.registrationDeadline !== undefined) coreTournamentData.registrationDeadline = insertTournament.registrationDeadline;
      // Handle numeric fields - convert empty strings to null, strings to numbers
      if (insertTournament.entryFee !== undefined) {
        coreTournamentData.entryFee = insertTournament.entryFee === '' || insertTournament.entryFee === null 
          ? null 
          : typeof insertTournament.entryFee === 'string' 
            ? parseFloat(insertTournament.entryFee) || null 
            : insertTournament.entryFee;
      }
      if (insertTournament.maxParticipants !== undefined) coreTournamentData.maxParticipants = insertTournament.maxParticipants;
      if (insertTournament.competitionFormat !== undefined) coreTournamentData.competitionFormat = insertTournament.competitionFormat;
      if (insertTournament.tournamentType !== undefined) coreTournamentData.tournamentType = insertTournament.tournamentType;
      if (insertTournament.tournamentStructure !== undefined) coreTournamentData.tournamentStructure = insertTournament.tournamentStructure;
      if (insertTournament.divisions !== undefined) coreTournamentData.divisions = insertTournament.divisions;
      if (insertTournament.teams !== undefined) coreTournamentData.teams = insertTournament.teams;
      if (insertTournament.bracket !== undefined) coreTournamentData.bracket = insertTournament.bracket;
      if (insertTournament.scoringMethod !== undefined) coreTournamentData.scoringMethod = insertTournament.scoringMethod;
      if (insertTournament.seriesLength !== undefined) coreTournamentData.seriesLength = insertTournament.seriesLength;
      if (insertTournament.currentStage !== undefined) coreTournamentData.currentStage = insertTournament.currentStage;
      if (insertTournament.totalStages !== undefined) coreTournamentData.totalStages = insertTournament.totalStages;
      if (insertTournament.stageConfiguration !== undefined) coreTournamentData.stageConfiguration = insertTournament.stageConfiguration;
      if (insertTournament.isPublic !== undefined) coreTournamentData.isPublic = insertTournament.isPublic;
      if (insertTournament.donationsEnabled !== undefined) coreTournamentData.donationsEnabled = insertTournament.donationsEnabled;
      // Handle donationGoal - convert empty string to null for numeric field
      if (insertTournament.donationGoal !== undefined) {
        coreTournamentData.donationGoal = insertTournament.donationGoal === '' || insertTournament.donationGoal === null 
          ? null 
          : typeof insertTournament.donationGoal === 'string' 
            ? parseFloat(insertTournament.donationGoal) || null 
            : insertTournament.donationGoal;
      }
      if (insertTournament.donationDescription !== undefined) coreTournamentData.donationDescription = insertTournament.donationDescription;

      // Step 2: Create core tournament record
      const [createdTournament] = await tx.insert(tournaments).values(coreTournamentData).returning();

      // Step 3: Create sport-specific config with CANONICAL detection
      const sportConfig = await this.createSportConfig(tx, createdTournament.id, insertTournament);

      // Step 4: Return MERGED response for backward compatibility
      return {
        ...createdTournament,
        ...sportConfig // Include sport-specific fields in response
      } as Tournament;
    });
  }

  // Helper method to create sport-specific configuration using FLEXIBLE JSON approach
  private async createSportConfig(tx: any, tournamentId: string, data: InsertTournament): Promise<any> {
    // CANONICAL sport detection using sportCategory field
    const sportCategory = data.sportCategory || this.getSportCategory(data.sport || '');
    const sportCode = this.getSportCode(data.sport || '');
    
    // Build flexible JSON config based on actual sport-specific data present
    const config: any = {};
    
    // Extract sport-specific configurations from data if present
    if (sportCode === 'basketball') {
      if ((data as any).basketballFormat) config.format = (data as any).basketballFormat;
      if ((data as any).basketballSkillsEvents) config.skillsEvents = (data as any).basketballSkillsEvents;
      if ((data as any).basketballOvertimeRules) config.overtimeRules = (data as any).basketballOvertimeRules;
      if ((data as any).basketballSeedingMethod) config.seedingMethod = (data as any).basketballSeedingMethod;
    } else if (sportCode === 'football') {
      if ((data as any).footballFormat) config.format = (data as any).footballFormat;
      if ((data as any).footballOvertimeRules) config.overtimeRules = (data as any).footballOvertimeRules;
    } else if (sportCode === 'soccer') {
      if ((data as any).soccerFormat) config.format = (data as any).soccerFormat;
      if ((data as any).soccerExtraTime) config.extraTime = (data as any).soccerExtraTime;
      if ((data as any).soccerPenaltyShootouts) config.penaltyShootouts = (data as any).soccerPenaltyShootouts;
    }
    
    // Add common configurations
    if (data.selectedEvents) config.events = data.selectedEvents;
    if (data.scoringMethod) config.scoringMethod = data.scoringMethod;
    
    // Insert into unified sport_configs table with JSONB
    const sportConfigData = {
      tournamentId,
      category: sportCategory.toLowerCase(),
      sportCode,
      config: JSON.stringify(config)
    };
    
    // Use direct SQL for sport_configs insertion (not in Drizzle schema yet)
    await tx.execute(sql`
      INSERT INTO sport_configs (tournament_id, category, sport_code, config)
      VALUES (${tournamentId}, ${sportCategory.toLowerCase()}, ${sportCode}, ${JSON.stringify(config)})
    `);
    
    // Return the config data for backward compatibility
    return config;
  }

  // Helper method to convert sport name to sport code
  private getSportCode(sport: string): string {
    const sportMapping: { [key: string]: string } = {
      'Basketball (Boys)': 'basketball',
      'Basketball (Girls)': 'basketball', 
      'Basketball': 'basketball',
      'Football (Boys)': 'football',
      'Football': 'football',
      'Soccer (Boys)': 'soccer',
      'Soccer (Girls)': 'soccer',
      'Soccer': 'soccer',
      'Tennis (Boys)': 'tennis',
      'Tennis (Girls)': 'tennis',
      'Tennis': 'tennis',
      'Golf (Boys)': 'golf',
      'Golf (Girls)': 'golf',
      'Golf': 'golf'
    };
    
    return sportMapping[sport] || sport.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Helper method to determine sport category from sport name (fallback)
  private getSportCategory(sport: string): 'Athletic' | 'Academic' | 'Fine Arts' {
    const athleticSports = ['basketball', 'soccer', 'tennis', 'golf', 'football', 'swimming', 'wrestling', 'track', 'volleyball', 'baseball'];
    const academicSports = ['academic', 'debate', 'math', 'science', 'history'];
    const fineArtsSports = ['band', 'choir', 'drama', 'art'];
    
    if (athleticSports.includes(sport?.toLowerCase())) return 'Athletic';
    if (academicSports.includes(sport?.toLowerCase())) return 'Academic';  
    if (fineArtsSports.includes(sport?.toLowerCase())) return 'Fine Arts';
    return 'Athletic'; // Default to athletic for unknown sports
  }

  // Helper method to get sport config for READ operations (from unified sport_configs table)
  private async getSportConfig(tournamentId: string, sportCategory?: string): Promise<any> {
    if (!sportCategory) return {};
    
    try {
      // Read from unified sport_configs table with JSONB
      const result = await this.db.execute(sql`
        SELECT config FROM sport_configs WHERE tournament_id = ${tournamentId}
      `);
      
      if (result.rows && result.rows.length > 0) {
        const configRow = result.rows[0] as any;
        // Handle both parsed objects (from JSONB) and JSON strings
        if (typeof configRow.config === 'object') {
          return configRow.config || {};
        } else {
          return JSON.parse(configRow.config) || {};
        }
      }
      
      return {};
    } catch (error) {
      console.error("Error fetching sport config:", error);
      return {};
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

  // FFA Tournament method implementations
  async generateFFATournament(tournamentId: string, config: {
    tournamentType: 'multi-heat-racing' | 'battle-royale' | 'point-accumulation' | 'time-trials' | 'survival-elimination';
    participants: Array<{ id: string; name: string; email?: string; seedNumber?: number; skillLevel?: string; }>;
    formatConfig: Record<string, any>;
  }): Promise<Tournament | undefined> {
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament) return undefined;

      // Extract participant names for BracketGenerator
      const participantNames = config.participants.map(p => p.name);

      // Generate FFA bracket structure using proper BracketGenerator
      const bracketStructure = BracketGenerator.generateBracket(
        participantNames,
        config.tournamentType,
        tournamentId,
        config.formatConfig
      );

      // Convert participants to FFA format with proper structure
      const ffaParticipants = config.participants.map((p, index) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        seedNumber: p.seedNumber || index + 1,
        skillLevel: p.skillLevel,
        currentStatus: 'registered' as const,
        performanceHistory: [],
        finalRanking: undefined,
        finalScore: undefined
      }));

      // Extract configuration from generated bracket structure
      let ffaConfig: Record<string, any> = {
        participantStructure: 'individual',
        maxParticipants: config.participants.length,
        minParticipants: Math.min(2, config.participants.length),
        scoringMethodology: this.getFFAScoringMethodology(config.tournamentType),
        rankingCriteria: this.getFFARankingCriteria(config.tournamentType),
        tieBreakingRules: ["best_performance", "head_to_head", "random"],
        performanceTracking: {
          trackIndividualStats: true,
          recordPersonalBests: true,
          performanceMetrics: this.getFFAPerformanceMetrics(config.tournamentType),
          allowMultipleAttempts: config.tournamentType === 'time-trials' || config.tournamentType === 'point-accumulation'
        }
      };

      // Extract heat assignments from bracket structure if available
      let heatAssignments: any[] = [];
      
      if (config.tournamentType === 'multi-heat-racing' && 'qualifyingRound' in bracketStructure) {
        const structure = bracketStructure as any;
        if (structure.qualifyingRound?.heats) {
          heatAssignments = structure.qualifyingRound.heats.map((heat: any) => ({
            heatNumber: heat.heatNumber,
            heatName: heat.heatName,
            participants: heat.participants,
            status: heat.status,
            results: heat.results || []
          }));
        }
      }

      // For other FFA formats, use the rounds/stages from the bracket structure
      if (config.tournamentType === 'battle-royale' && 'battleStages' in bracketStructure) {
        const structure = bracketStructure as any;
        ffaConfig.battleStages = structure.battleStages;
        ffaConfig.zoneShrinkage = structure.zoneShrinkage;
      }

      if (config.tournamentType === 'point-accumulation' && 'scoringRounds' in bracketStructure) {
        const structure = bracketStructure as any;
        ffaConfig.scoringRounds = structure.scoringRounds;
        ffaConfig.pointSystem = structure.pointSystem;
      }

      if (config.tournamentType === 'time-trials' && 'trialRounds' in bracketStructure) {
        const structure = bracketStructure as any;
        ffaConfig.trialRounds = structure.trialRounds;
        ffaConfig.timingCriteria = structure.timingCriteria;
      }

      if (config.tournamentType === 'survival-elimination' && 'eliminationRounds' in bracketStructure) {
        const structure = bracketStructure as any;
        ffaConfig.eliminationRounds = structure.eliminationRounds;
        ffaConfig.progressiveElimination = structure.progressiveElimination;
      }

      // Merge format-specific configuration
      ffaConfig = { ...ffaConfig, ...config.formatConfig };

      // Update tournament with generated FFA structure
      return await this.updateTournament(tournamentId, {
        tournamentType: config.tournamentType,
        competitionFormat: this.getFFACompetitionFormat(config.tournamentType),
        ffaConfig,
        participants: ffaParticipants,
        heatAssignments,
        bracketData: bracketStructure, // Store the full bracket structure for reference
        totalRounds: bracketStructure.totalRounds || 1,
        currentRound: 1,
        status: 'active'
      });
    } catch (error) {
      console.error("Error generating FFA tournament:", error);
      return undefined;
    }
  }

  async updateFFAParticipants(tournamentId: string, participants: any[]): Promise<Tournament | undefined> {
    try {
      return await this.updateTournament(tournamentId, { participants });
    } catch (error) {
      console.error("Error updating FFA participants:", error);
      return undefined;
    }
  }

  async updateFFAHeatAssignments(tournamentId: string, heatAssignments: any[]): Promise<Tournament | undefined> {
    try {
      return await this.updateTournament(tournamentId, { heatAssignments });
    } catch (error) {
      console.error("Error updating FFA heat assignments:", error);
      return undefined;
    }
  }

  async updateFFARoundResults(tournamentId: string, roundNumber: number, results: any[]): Promise<Tournament | undefined> {
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament || !tournament.participants) return undefined;

      // Update participant performance history
      const updatedParticipants = tournament.participants.map((participant: any) => {
        const result = results.find(r => r.participantId === participant.id);
        if (result) {
          const performanceHistory = participant.performanceHistory || [];
          performanceHistory.push({
            round: roundNumber,
            result: result.result,
            ranking: result.ranking,
            eliminated: result.eliminated,
            advancedToNextRound: result.advancedToNextRound,
            timestamp: new Date().toISOString()
          });
          
          return {
            ...participant,
            performanceHistory,
            currentStatus: result.eliminated ? 'eliminated' : 
                          result.advancedToNextRound ? 'advanced' : 'active'
          };
        }
        return participant;
      });

      return await this.updateTournament(tournamentId, { participants: updatedParticipants });
    } catch (error) {
      console.error("Error updating FFA round results:", error);
      return undefined;
    }
  }

  async getFFALeaderboard(tournamentId: string): Promise<any[]> {
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament || !tournament.participants) return [];

      // Generate leaderboard based on current performance
      return tournament.participants
        .map((participant: any) => ({
          participantId: participant.id,
          participantName: participant.name,
          currentRanking: this.calculateFFARanking(participant, tournament.tournamentType),
          score: this.calculateFFAScore(participant, tournament.tournamentType),
          status: participant.currentStatus,
          performance: participant.performanceHistory || []
        }))
        .sort((a: any, b: any) => a.currentRanking - b.currentRanking);
    } catch (error) {
      console.error("Error getting FFA leaderboard:", error);
      return [];
    }
  }

  async getFFAParticipantPerformance(tournamentId: string, participantId: string): Promise<any | undefined> {
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament || !tournament.participants) return undefined;

      const participant = tournament.participants.find((p: any) => p.id === participantId);
      if (!participant) return undefined;

      return {
        participant,
        ranking: this.calculateFFARanking(participant, tournament.tournamentType),
        score: this.calculateFFAScore(participant, tournament.tournamentType),
        performanceHistory: participant.performanceHistory || [],
        personalBests: this.calculatePersonalBests(participant)
      };
    } catch (error) {
      console.error("Error getting FFA participant performance:", error);
      return undefined;
    }
  }

  // Helper methods for FFA tournament generation
  private getFFAScoringMethodology(tournamentType: string): string {
    switch (tournamentType) {
      case 'time-trials': return 'time-based';
      case 'point-accumulation': return 'points-based';
      case 'battle-royale':
      case 'survival-elimination': return 'elimination-based';
      case 'multi-heat-racing': return 'ranking-based';
      default: return 'points-based';
    }
  }

  private getFFARankingCriteria(tournamentType: string): string[] {
    switch (tournamentType) {
      case 'time-trials': return ["time", "attempts"];
      case 'point-accumulation': return ["score", "consistency"];
      case 'battle-royale':
      case 'survival-elimination': return ["survival_time", "eliminations"];
      case 'multi-heat-racing': return ["placement", "time"];
      default: return ["score"];
    }
  }

  private getFFAPerformanceMetrics(tournamentType: string): string[] {
    switch (tournamentType) {
      case 'time-trials': return ["time", "distance", "accuracy"];
      case 'point-accumulation': return ["score", "points", "consistency"];
      case 'battle-royale':
      case 'survival-elimination': return ["eliminations", "survival_time"];
      case 'multi-heat-racing': return ["time", "placement", "speed"];
      default: return ["score"];
    }
  }

  private getFFACompetitionFormat(tournamentType: string): string {
    switch (tournamentType) {
      case 'time-trials': return 'time-based-ranking';
      case 'point-accumulation': return 'cumulative-scoring';
      case 'battle-royale':
      case 'survival-elimination': return 'elimination-rounds';
      case 'multi-heat-racing': return 'heat-progression';
      default: return 'individual-leaderboard';
    }
  }

  private generateHeatAssignments(participants: any[], config: any): any[] {
    const participantsPerHeat = config.heatConfiguration?.participantsPerHeat || 8;
    const heats = [];
    
    for (let i = 0; i < participants.length; i += participantsPerHeat) {
      const heatParticipants = participants.slice(i, i + participantsPerHeat);
      heats.push({
        heatNumber: Math.floor(i / participantsPerHeat) + 1,
        heatName: `Heat ${Math.floor(i / participantsPerHeat) + 1}`,
        participants: heatParticipants.map(p => p.id),
        status: 'upcoming' as const,
        results: []
      });
    }
    
    return heats;
  }

  private calculateFFARanking(participant: any, tournamentType: string): number {
    const history = participant.performanceHistory || [];
    if (history.length === 0) return 999;
    
    // For simplicity, use the most recent ranking
    return history[history.length - 1]?.ranking || 999;
  }

  private calculateFFAScore(participant: any, tournamentType: string): number {
    const history = participant.performanceHistory || [];
    if (history.length === 0) return 0;
    
    switch (tournamentType) {
      case 'point-accumulation':
        return history.reduce((sum: number, perf: any) => sum + (perf.result || 0), 0);
      case 'time-trials':
        return Math.min(...history.map((perf: any) => perf.result || Infinity));
      default:
        return history[history.length - 1]?.result || 0;
    }
  }

  private calculatePersonalBests(participant: any): any {
    const history = participant.performanceHistory || [];
    if (history.length === 0) return {};
    
    return {
      bestResult: Math.max(...history.map((perf: any) => perf.result || 0)),
      bestRanking: Math.min(...history.map((perf: any) => perf.ranking || Infinity)),
      totalAttempts: history.length
    };
  }

  async deleteTournament(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(tournaments).where(eq(tournaments.id, id));
      return (result.rowCount ?? 0) > 0;
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
      return (result.rowCount ?? 0) > 0;
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

  // Stub implementations for missing interface methods
  async createModularPage(page: any): Promise<any> { throw new Error("Method not implemented"); }
  async getModularPage(id: string): Promise<any | undefined> { throw new Error("Method not implemented"); }
  async getModularPageBySlug(slug: string, userId?: string): Promise<any | undefined> { throw new Error("Method not implemented"); }
  async getModularPagesByUserId(userId: string): Promise<any[]> { throw new Error("Method not implemented"); }
  async updateModularPage(id: string, updates: any): Promise<any | undefined> { throw new Error("Method not implemented"); }
  async deleteModularPage(id: string): Promise<boolean> { throw new Error("Method not implemented"); }
  
  async getTrackEventsByCategory(category: string): Promise<TrackEvent[]> { return []; }
  async getTrackEvent(id: string): Promise<TrackEvent | undefined> { return undefined; }
  async getSportDivisionRules(): Promise<SportDivisionRules[]> { return []; }
  async getSportDivisionRulesBySport(sportId: string): Promise<SportDivisionRules[]> { return []; }
  
  async getDonors(): Promise<Donor[]> { return []; }
  async getDonor(id: string): Promise<Donor | undefined> { return undefined; }
  async getDonorByEmail(email: string): Promise<Donor | undefined> { return undefined; }
  async createDonor(donor: InsertDonor): Promise<Donor> { throw new Error("Method not implemented"); }
  async updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> { throw new Error("Method not implemented"); }
  async deleteDonor(id: string): Promise<void> { throw new Error("Method not implemented"); }
  
  async getDonations(): Promise<Donation[]> { return []; }
  async getDonation(id: string): Promise<Donation | undefined> { return undefined; }
  async getDonationsByDonor(donorId: string): Promise<Donation[]> { return []; }
  async createDonation(donation: InsertDonation): Promise<Donation> { throw new Error("Method not implemented"); }
  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation> { throw new Error("Method not implemented"); }
  async deleteDonation(id: string): Promise<void> { throw new Error("Method not implemented"); }
  
  async createTournamentSubscription(subscription: InsertTournamentSubscription): Promise<TournamentSubscription> { throw new Error("Method not implemented"); }
  async getTournamentSubscriptions(): Promise<TournamentSubscription[]> { return []; }
  
  async getEmailCampaigns(userId: string): Promise<EmailCampaign[]> { return []; }
  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> { return undefined; }
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> { throw new Error("Method not implemented"); }
  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign> { throw new Error("Method not implemented"); }
  async deleteEmailCampaign(id: string): Promise<void> { throw new Error("Method not implemented"); }
  
  async createTaxExemptionDocument(document: InsertTaxExemptionDocument): Promise<TaxExemptionDocument> { throw new Error("Method not implemented"); }
  async getTaxExemptionDocument(id: string): Promise<TaxExemptionDocument | undefined> { return undefined; }
  async getTaxExemptionDocumentsByOrganization(organizationId: string): Promise<TaxExemptionDocument[]> { return []; }
  async updateTaxExemptionDocument(id: string, updates: Partial<TaxExemptionDocument>): Promise<TaxExemptionDocument | undefined> { return undefined; }
  async verifyTaxExemptionDocument(id: string, verifiedBy: string, status: 'verified' | 'rejected', notes?: string): Promise<TaxExemptionDocument | undefined> { return undefined; }
  
  async createNonprofitSubscription(subscription: InsertNonprofitSubscription): Promise<NonprofitSubscription> { throw new Error("Method not implemented"); }
  async getNonprofitSubscription(id: string): Promise<NonprofitSubscription | undefined> { return undefined; }
  async getNonprofitSubscriptionByOrganization(organizationId: string): Promise<NonprofitSubscription | undefined> { return undefined; }
  async updateNonprofitSubscription(id: string, updates: Partial<NonprofitSubscription>): Promise<NonprofitSubscription | undefined> { return undefined; }
  
  async createNonprofitInvoice(invoice: InsertNonprofitInvoice): Promise<NonprofitInvoice> { throw new Error("Method not implemented"); }
  async getNonprofitInvoice(id: string): Promise<NonprofitInvoice | undefined> { return undefined; }
  async getNonprofitInvoicesBySubscription(subscriptionId: string): Promise<NonprofitInvoice[]> { return []; }
  async updateNonprofitInvoice(id: string, updates: Partial<NonprofitInvoice>): Promise<NonprofitInvoice | undefined> { return undefined; }
  async markInvoiceAsPaid(id: string, paymentMethod: string, paymentReference?: string): Promise<NonprofitInvoice | undefined> { return undefined; }
  
  async createSupportTeam(team: InsertSupportTeam): Promise<SupportTeam> { throw new Error("Method not implemented"); }
  async getSupportTeam(id: string): Promise<SupportTeam | undefined> { return undefined; }
  async getSupportTeamsByOrganization(organizationId: string): Promise<SupportTeam[]> { return []; }
  async updateSupportTeam(id: string, updates: Partial<SupportTeam>): Promise<SupportTeam | undefined> { return undefined; }
  
  async createSupportTeamMember(member: InsertSupportTeamMember): Promise<SupportTeamMember> { throw new Error("Method not implemented"); }
  async getSupportTeamMember(id: string): Promise<SupportTeamMember | undefined> { return undefined; }
  async getSupportTeamMembersByTeam(teamId: string): Promise<SupportTeamMember[]> { return []; }
  async updateSupportTeamMember(id: string, updates: Partial<SupportTeamMember>): Promise<SupportTeamMember | undefined> { return undefined; }
  
  async createSupportTeamInjury(injury: InsertSupportTeamInjury): Promise<SupportTeamInjury> { throw new Error("Method not implemented"); }
  async getSupportTeamInjury(id: string): Promise<SupportTeamInjury | undefined> { return undefined; }
  async getSupportTeamInjuriesByTeam(teamId: string): Promise<SupportTeamInjury[]> { return []; }
  async updateSupportTeamInjury(id: string, updates: Partial<SupportTeamInjury>): Promise<SupportTeamInjury | undefined> { return undefined; }
  
  async createSupportTeamAiConsultation(consultation: InsertSupportTeamAiConsultation): Promise<SupportTeamAiConsultation> { throw new Error("Method not implemented"); }
  async getSupportTeamAiConsultation(id: string): Promise<SupportTeamAiConsultation | undefined> { return undefined; }
  async getSupportTeamAiConsultationsByTeam(teamId: string): Promise<SupportTeamAiConsultation[]> { return []; }
  async updateSupportTeamAiConsultation(id: string, updates: Partial<SupportTeamAiConsultation>): Promise<SupportTeamAiConsultation | undefined> { return undefined; }
  
  async createSportDivisionRules(rules: InsertSportDivisionRules): Promise<SportDivisionRules> {
    try {
      const result = await this.db.insert(sportDivisionRules).values(rules).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create sport division rules");
    }
  }

  // Contact operations for DbStorage
  async getContacts(userId: string): Promise<Contact[]> {
    try {
      return await this.db.select().from(contacts).where(eq(contacts.userId, userId));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getContact(id: string): Promise<Contact | undefined> {
    try {
      const result = await this.db.select().from(contacts).where(eq(contacts.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    try {
      const result = await this.db.insert(contacts).values(contact).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create contact");
    }
  }

  async updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact> {
    try {
      const result = await this.db
        .update(contacts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(contacts.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update contact");
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      await this.db.delete(contacts).where(eq(contacts.id, id));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete contact");
    }
  }

  async searchContacts(userId: string, query: string): Promise<Contact[]> {
    try {
      return await this.db.select().from(contacts).where(eq(contacts.userId, userId));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async importContacts(userId: string, contactsData: InsertContact[]): Promise<Contact[]> {
    try {
      const result = await this.db.insert(contacts).values(contactsData).returning();
      return result;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to import contacts");
    }
  }

  // Guest participant methods - "Pay & Play or Join the Family" system
  async createGuestParticipant(participant: InsertGuestParticipant): Promise<GuestParticipant> {
    try {
      const result = await this.db.insert(guestParticipants).values(participant).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create guest participant");
    }
  }

  async getGuestParticipant(id: string): Promise<GuestParticipant | undefined> {
    try {
      const result = await this.db.select().from(guestParticipants).where(eq(guestParticipants.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getGuestParticipantsByTournament(tournamentId: string): Promise<GuestParticipant[]> {
    try {
      return await this.db.select().from(guestParticipants).where(eq(guestParticipants.tournamentId, tournamentId));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getGuestParticipantsByOrganizer(organizerId: string): Promise<GuestParticipant[]> {
    try {
      return await this.db.select().from(guestParticipants).where(eq(guestParticipants.organizerId, organizerId));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateGuestParticipant(id: string, updates: Partial<GuestParticipant>): Promise<GuestParticipant | undefined> {
    try {
      const result = await this.db
        .update(guestParticipants)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(guestParticipants.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteGuestParticipant(id: string): Promise<boolean> {
    try {
      await this.db.delete(guestParticipants).where(eq(guestParticipants.id, id));
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async linkGuestParticipantToUser(participantId: string, userId: string): Promise<GuestParticipant | undefined> {
    try {
      const result = await this.db
        .update(guestParticipants)
        .set({ 
          linkedUserId: userId, 
          hasCreatedAccount: true, 
          accountCreatedAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(guestParticipants.id, participantId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Password reset methods for tournament organizers
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    try {
      const result = await this.db.insert(passwordResetTokens).values(token).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create password reset token");
    }
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    try {
      const result = await this.db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async markPasswordResetTokenUsed(id: string): Promise<boolean> {
    try {
      await this.db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, id));
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async cleanupExpiredPasswordResetTokens(): Promise<number> {
    try {
      const result = await this.db.delete(passwordResetTokens).where(sql`expires_at < NOW()`);
      return result.rowCount || 0;
    } catch (error) {
      console.error("Database error:", error);
      return 0;
    }
  }

  // =============================================================================
  // MERCHANDISE PRODUCT STORAGE METHODS
  // =============================================================================

  async createMerchandiseProduct(product: InsertMerchandiseProduct): Promise<MerchandiseProduct> {
    try {
      const result = await this.db.insert(merchandiseProducts).values(product).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create merchandise product");
    }
  }

  async getMerchandiseProduct(id: string): Promise<MerchandiseProduct | undefined> {
    try {
      const result = await this.db.select().from(merchandiseProducts).where(eq(merchandiseProducts.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getMerchandiseProductsByOrganization(organizationId: string): Promise<MerchandiseProduct[]> {
    try {
      const result = await this.db.select().from(merchandiseProducts)
        .where(eq(merchandiseProducts.organizationId, organizationId))
        .orderBy(desc(merchandiseProducts.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getMerchandiseProductsByTournament(tournamentId: string): Promise<MerchandiseProduct[]> {
    try {
      const result = await this.db.select().from(merchandiseProducts)
        .where(eq(merchandiseProducts.tournamentId, tournamentId))
        .orderBy(desc(merchandiseProducts.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateMerchandiseProduct(id: string, updates: Partial<MerchandiseProduct>): Promise<MerchandiseProduct | undefined> {
    try {
      const result = await this.db
        .update(merchandiseProducts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(merchandiseProducts.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteMerchandiseProduct(id: string): Promise<boolean> {
    try {
      await this.db.delete(merchandiseProducts).where(eq(merchandiseProducts.id, id));
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // =============================================================================
  // MERCHANDISE ORDER STORAGE METHODS
  // =============================================================================

  async createMerchandiseOrder(order: InsertMerchandiseOrder): Promise<MerchandiseOrder> {
    try {
      const result = await this.db.insert(merchandiseOrders).values(order).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create merchandise order");
    }
  }

  async getMerchandiseOrder(id: string): Promise<MerchandiseOrder | undefined> {
    try {
      const result = await this.db.select().from(merchandiseOrders).where(eq(merchandiseOrders.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getMerchandiseOrdersByOrganization(organizationId: string): Promise<MerchandiseOrder[]> {
    try {
      const result = await this.db.select().from(merchandiseOrders)
        .where(eq(merchandiseOrders.organizationId, organizationId))
        .orderBy(desc(merchandiseOrders.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getMerchandiseOrdersByCustomer(customerId: string): Promise<MerchandiseOrder[]> {
    try {
      const result = await this.db.select().from(merchandiseOrders)
        .where(eq(merchandiseOrders.customerId, customerId))
        .orderBy(desc(merchandiseOrders.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateMerchandiseOrder(id: string, updates: Partial<MerchandiseOrder>): Promise<MerchandiseOrder | undefined> {
    try {
      const result = await this.db
        .update(merchandiseOrders)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(merchandiseOrders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async updateOrderFulfillmentStatus(id: string, status: string, trackingInfo?: any): Promise<MerchandiseOrder | undefined> {
    try {
      const updateData: any = { 
        fulfillmentStatus: status, 
        updatedAt: new Date() 
      };
      if (trackingInfo) {
        updateData.trackingInfo = trackingInfo;
      }

      const result = await this.db
        .update(merchandiseOrders)
        .set(updateData)
        .where(eq(merchandiseOrders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // =============================================================================
  // EVENT TICKET STORAGE METHODS
  // =============================================================================

  async createEventTicket(ticket: InsertEventTicket): Promise<EventTicket> {
    try {
      const result = await this.db.insert(eventTickets).values(ticket).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create event ticket");
    }
  }

  async getEventTicket(id: string): Promise<EventTicket | undefined> {
    try {
      const result = await this.db.select().from(eventTickets).where(eq(eventTickets.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getEventTicketsByOrganization(organizationId: string): Promise<EventTicket[]> {
    try {
      const result = await this.db.select().from(eventTickets)
        .where(eq(eventTickets.organizationId, organizationId))
        .orderBy(desc(eventTickets.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getEventTicketsByTournament(tournamentId: string): Promise<EventTicket[]> {
    try {
      const result = await this.db.select().from(eventTickets)
        .where(eq(eventTickets.tournamentId, tournamentId))
        .orderBy(desc(eventTickets.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateEventTicket(id: string, updates: Partial<EventTicket>): Promise<EventTicket | undefined> {
    try {
      const result = await this.db
        .update(eventTickets)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(eventTickets.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteEventTicket(id: string): Promise<boolean> {
    try {
      await this.db.delete(eventTickets).where(eq(eventTickets.id, id));
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // =============================================================================
  // TICKET ORDER STORAGE METHODS
  // =============================================================================

  async createTicketOrder(order: InsertTicketOrder): Promise<TicketOrder> {
    try {
      const result = await this.db.insert(ticketOrders).values(order).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create ticket order");
    }
  }

  async getTicketOrder(id: string): Promise<TicketOrder | undefined> {
    try {
      const result = await this.db.select().from(ticketOrders).where(eq(ticketOrders.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getTicketOrdersByOrganization(organizationId: string): Promise<TicketOrder[]> {
    try {
      const result = await this.db.select().from(ticketOrders)
        .where(eq(ticketOrders.organizationId, organizationId))
        .orderBy(desc(ticketOrders.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getTicketOrdersByCustomer(customerId: string): Promise<TicketOrder[]> {
    try {
      const result = await this.db.select().from(ticketOrders)
        .where(eq(ticketOrders.customerId, customerId))
        .orderBy(desc(ticketOrders.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateTicketOrder(id: string, updates: Partial<TicketOrder>): Promise<TicketOrder | undefined> {
    try {
      const result = await this.db
        .update(ticketOrders)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(ticketOrders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async updateTicketStatus(id: string, status: string): Promise<TicketOrder | undefined> {
    try {
      const result = await this.db
        .update(ticketOrders)
        .set({ ticketStatus: status, updatedAt: new Date() })
        .where(eq(ticketOrders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // =============================================================================
  // INVENTORY MANAGEMENT METHODS
  // =============================================================================

  async updateProductInventory(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<boolean> {
    try {
      const product = await this.getMerchandiseProduct(productId);
      if (!product) return false;

      let newInventory: number;
      switch (operation) {
        case 'add':
          newInventory = product.inventory + quantity;
          break;
        case 'subtract':
          newInventory = Math.max(0, product.inventory - quantity);
          break;
        case 'set':
          newInventory = quantity;
          break;
        default:
          return false;
      }

      await this.updateMerchandiseProduct(productId, { inventory: newInventory });
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async updateTicketInventory(ticketId: string, quantity: number): Promise<boolean> {
    try {
      const ticket = await this.getEventTicket(ticketId);
      if (!ticket) return false;

      const newSold = ticket.sold + quantity;
      await this.updateEventTicket(ticketId, { sold: newSold });
      return true;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async checkProductAvailability(productId: string, variantId?: string, quantity: number = 1): Promise<boolean> {
    try {
      const product = await this.getMerchandiseProduct(productId);
      if (!product || !product.isActive) return false;

      if (variantId && product.variants.length > 0) {
        const variant = product.variants.find(v => v.id === variantId);
        return variant ? variant.inventory >= quantity : false;
      }

      return product.inventory >= quantity;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  async checkTicketAvailability(ticketId: string, quantity: number = 1): Promise<boolean> {
    try {
      const ticket = await this.getEventTicket(ticketId);
      if (!ticket || !ticket.isActive) return false;

      if (ticket.totalAvailable) {
        return (ticket.sold + quantity) <= ticket.totalAvailable;
      }

      return true; // No limit set
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // =============================================================================
  // REVENUE CALCULATION METHODS
  // =============================================================================

  async calculateMerchandiseRevenue(organizationId: string, startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    platformFee: number;
    organizationRevenue: number;
  }> {
    try {
      let query = this.db.select().from(merchandiseOrders)
        .where(eq(merchandiseOrders.organizationId, organizationId));

      if (startDate && endDate) {
        query = query.where(
          and(
            gte(merchandiseOrders.createdAt, startDate),
            lte(merchandiseOrders.createdAt, endDate)
          )
        );
      }

      const orders = await query;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
      
      // Platform takes 3% fee
      const platformFee = totalRevenue * 0.03;
      const organizationRevenue = totalRevenue - platformFee;

      return {
        totalOrders,
        totalRevenue,
        platformFee,
        organizationRevenue
      };
    } catch (error) {
      console.error("Database error:", error);
      return { totalOrders: 0, totalRevenue: 0, platformFee: 0, organizationRevenue: 0 };
    }
  }

  async calculateTicketRevenue(organizationId: string, startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    platformFee: number;
    organizationRevenue: number;
  }> {
    try {
      let query = this.db.select().from(ticketOrders)
        .where(eq(ticketOrders.organizationId, organizationId));

      if (startDate && endDate) {
        query = query.where(
          and(
            gte(ticketOrders.createdAt, startDate),
            lte(ticketOrders.createdAt, endDate)
          )
        );
      }

      const orders = await query;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
      
      // Platform takes 3% fee  
      const platformFee = totalRevenue * 0.03;
      const organizationRevenue = totalRevenue - platformFee;

      return {
        totalOrders,
        totalRevenue,
        platformFee,
        organizationRevenue
      };
    } catch (error) {
      console.error("Database error:", error);
      return { totalOrders: 0, totalRevenue: 0, platformFee: 0, organizationRevenue: 0 };
    }
  }

  // Fantasy Showdown Contest methods
  async createShowdownContest(contest: InsertShowdownContest): Promise<ShowdownContest> {
    try {
      const id = randomUUID();
      const now = new Date();
      const newContest = {
        id,
        ...contest,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.db.insert(showdownContests).values(newContest).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async getShowdownContest(id: string): Promise<ShowdownContest | undefined> {
    try {
      const result = await this.db.select().from(showdownContests).where(eq(showdownContests.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getShowdownContests(): Promise<ShowdownContest[]> {
    try {
      const result = await this.db.select().from(showdownContests).orderBy(desc(showdownContests.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getShowdownContestsByCommissioner(commissionerId: string): Promise<ShowdownContest[]> {
    try {
      const result = await this.db.select().from(showdownContests)
        .where(eq(showdownContests.commissionerId, commissionerId))
        .orderBy(desc(showdownContests.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateShowdownContest(id: string, updates: Partial<ShowdownContest>): Promise<ShowdownContest | undefined> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await this.db.update(showdownContests)
        .set(updatedData)
        .where(eq(showdownContests.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // Fantasy Showdown Entry methods
  async createShowdownEntry(entry: InsertShowdownEntry): Promise<ShowdownEntry> {
    try {
      const id = randomUUID();
      const now = new Date();
      const newEntry = {
        id,
        ...entry,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.db.insert(showdownEntries).values(newEntry).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async getShowdownEntry(id: string): Promise<ShowdownEntry | undefined> {
    try {
      const result = await this.db.select().from(showdownEntries).where(eq(showdownEntries.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getShowdownEntriesByContest(contestId: string): Promise<ShowdownEntry[]> {
    try {
      const result = await this.db.select().from(showdownEntries)
        .where(eq(showdownEntries.contestId, contestId))
        .orderBy(desc(showdownEntries.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getShowdownEntriesByUser(userId: string): Promise<ShowdownEntry[]> {
    try {
      const result = await this.db.select().from(showdownEntries)
        .where(eq(showdownEntries.userId, userId))
        .orderBy(desc(showdownEntries.createdAt));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateShowdownEntry(id: string, updates: Partial<ShowdownEntry>): Promise<ShowdownEntry | undefined> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await this.db.update(showdownEntries)
        .set(updatedData)
        .where(eq(showdownEntries.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  // =============================================================================
  // TRANSACTION SUPPORT FOR COMPLEX OPERATIONS
  // Comprehensive transaction methods for data consistency
  // =============================================================================

  async createTournamentWithMatches(
    tournament: InsertTournament, 
    matchInputs: InsertMatch[]
  ): Promise<{ tournament: Tournament; matches: Match[] }> {
    return await this.db.transaction(async (tx) => {
      try {
        // Create tournament first
        const createdTournament = await tx.insert(tournaments)
          .values(tournament)
          .returning()
          .then(rows => rows[0]);
        
        // Create matches with tournament ID
        const matchesWithTournamentId = matchInputs.map(match => ({
          ...match,
          tournamentId: createdTournament.id
        }));
        
        const createdMatches = await tx.insert(matches)
          .values(matchesWithTournamentId)
          .returning();
        
        console.log(`🏆 Tournament with matches created: ${createdTournament.name} (${createdMatches.length} matches)`);
        
        return { tournament: createdTournament, matches: createdMatches };
      } catch (error) {
        console.error("Transaction failed - createTournamentWithMatches:", error);
        throw error;
      }
    });
  }
  
  async createTeamRegistrationWithMembers(
    registration: InsertTeamRegistration,
    members: any[]
  ): Promise<{ registration: TeamRegistration; members: any[] }> {
    return await this.db.transaction(async (tx) => {
      try {
        // Create team registration
        const createdRegistration = await tx.insert(teamRegistrations)
          .values(registration)
          .returning()
          .then(rows => rows[0]);
        
        // Create team members with registration ID
        const membersWithRegistrationId = members.map(member => ({
          ...member,
          teamRegistrationId: createdRegistration.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        // Note: We'll need to create a teamMembers table for this to work properly
        // For now, return empty array
        const createdMembers: any[] = [];
        
        console.log(`👥 Team registration with members created: ${createdRegistration.teamName}`);
        
        return { registration: createdRegistration, members: createdMembers };
      } catch (error) {
        console.error("Transaction failed - createTeamRegistrationWithMembers:", error);
        throw error;
      }
    });
  }
  
  async completeMatchWithBracketUpdate(
    matchId: string,
    matchUpdate: UpdateMatch,
    nextMatches?: { matchId: string; updates: Partial<Match> }[]
  ): Promise<{ match: Match; updatedMatches: Match[] }> {
    return await this.db.transaction(async (tx) => {
      try {
        // Update the completed match
        const updatedMatch = await tx.update(matches)
          .set({
            ...matchUpdate,
            status: 'completed',
            updatedAt: new Date()
          })
          .where(eq(matches.id, matchId))
          .returning()
          .then(rows => rows[0]);
        
        if (!updatedMatch) {
          throw new Error(`Match not found: ${matchId}`);
        }
        
        // Update next matches if provided (bracket progression)
        const updatedMatches: Match[] = [];
        if (nextMatches && nextMatches.length > 0) {
          for (const nextMatch of nextMatches) {
            const updated = await tx.update(matches)
              .set({
                ...nextMatch.updates,
                updatedAt: new Date()
              })
              .where(eq(matches.id, nextMatch.matchId))
              .returning()
              .then(rows => rows[0]);
            
            if (updated) {
              updatedMatches.push(updated);
            }
          }
        }
        
        console.log(`🎯 Match completed with bracket update: ${matchId} (${updatedMatches.length} next matches updated)`);
        
        return { match: updatedMatch, updatedMatches };
      } catch (error) {
        console.error("Transaction failed - completeMatchWithBracketUpdate:", error);
        throw error;
      }
    });
  }
  
  async executeTransaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    return await this.db.transaction(async (tx) => {
      try {
        return await operation(tx);
      } catch (error) {
        console.error("Custom transaction failed:", error);
        throw error;
      }
    });
  }

  // NFL data methods - Store as JSON in simple key-value format
  private nflDataCache = new Map<string, any>();

  async storeNFLSchedule(games: any[]): Promise<void> {
    this.nflDataCache.set('nfl_schedule', {
      data: games,
      lastUpdated: new Date().toISOString()
    });
    console.log(`📅 [NFL Schedule] Stored ${games.length} games in database cache`);
  }

  async getNFLSchedule(): Promise<any[]> {
    const cached = this.nflDataCache.get('nfl_schedule');
    return cached ? cached.data : [];
  }

  async storeNFLInjuries(injuries: any[]): Promise<void> {
    this.nflDataCache.set('nfl_injuries', {
      data: injuries,
      lastUpdated: new Date().toISOString()
    });
    console.log(`🏥 [NFL Injuries] Stored ${injuries.length} injury reports in database cache`);
  }

  async getNFLInjuries(): Promise<any[]> {
    const cached = this.nflDataCache.get('nfl_injuries');
    return cached ? cached.data : [];
  }

  async storeNFLPlayerStats(stats: any[]): Promise<void> {
    this.nflDataCache.set('nfl_player_stats', {
      data: stats,
      lastUpdated: new Date().toISOString()
    });
    console.log(`📊 [NFL Stats] Stored ${stats.length} player statistics in database cache`);
  }

  async getNFLPlayerStats(): Promise<any[]> {
    const cached = this.nflDataCache.get('nfl_player_stats');
    return cached ? cached.data : [];
  }

  // Tournament Registration Form methods - Smart linking system
  async createTournamentRegistrationForm(form: InsertTournamentRegistrationForm): Promise<TournamentRegistrationForm> {
    try {
      const result = await this.db.insert(tournamentRegistrationForms).values(form).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create tournament registration form");
    }
  }

  async getTournamentRegistrationForm(id: string): Promise<TournamentRegistrationForm | undefined> {
    try {
      const result = await this.db.select().from(tournamentRegistrationForms).where(eq(tournamentRegistrationForms.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getTournamentRegistrationFormsByTournament(tournamentId: string): Promise<TournamentRegistrationForm[]> {
    try {
      const result = await this.db
        .select()
        .from(tournamentRegistrationForms)
        .where(eq(tournamentRegistrationForms.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getTournamentRegistrationFormsByOrganizer(organizerId: string): Promise<TournamentRegistrationForm[]> {
    try {
      const result = await this.db
        .select()
        .from(tournamentRegistrationForms)
        .where(eq(tournamentRegistrationForms.organizerId, organizerId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateTournamentRegistrationForm(id: string, updates: Partial<TournamentRegistrationForm>): Promise<TournamentRegistrationForm | undefined> {
    try {
      const result = await this.db
        .update(tournamentRegistrationForms)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tournamentRegistrationForms.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteTournamentRegistrationForm(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(tournamentRegistrationForms).where(eq(tournamentRegistrationForms.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Registration Submission methods - Smart participant management
  async createRegistrationSubmission(submission: InsertRegistrationSubmission): Promise<RegistrationSubmission> {
    try {
      const result = await this.db.insert(registrationSubmissions).values(submission).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create registration submission");
    }
  }

  async getRegistrationSubmission(id: string): Promise<RegistrationSubmission | undefined> {
    try {
      const result = await this.db.select().from(registrationSubmissions).where(eq(registrationSubmissions.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getRegistrationSubmissionsByForm(formId: string): Promise<RegistrationSubmission[]> {
    try {
      const result = await this.db
        .select()
        .from(registrationSubmissions)
        .where(eq(registrationSubmissions.formId, formId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getRegistrationSubmissionsByTournament(tournamentId: string): Promise<RegistrationSubmission[]> {
    try {
      const result = await this.db
        .select()
        .from(registrationSubmissions)
        .where(eq(registrationSubmissions.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateRegistrationSubmission(id: string, updates: Partial<RegistrationSubmission>): Promise<RegistrationSubmission | undefined> {
    try {
      const result = await this.db
        .update(registrationSubmissions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(registrationSubmissions.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async deleteRegistrationSubmission(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(registrationSubmissions).where(eq(registrationSubmissions.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
  }

  // Smart Assignment methods - Automatic participant placement (stub implementations)
  async assignSubmissionToTarget(submissionId: string, targetType: 'division' | 'event', targetId: string, reason: string): Promise<RegistrationSubmission | undefined> {
    try {
      const result = await this.db
        .update(registrationSubmissions)
        .set({ 
          assignedToType: targetType,
          assignedToId: targetId,
          status: 'assigned',
          updatedAt: new Date()
        })
        .where(eq(registrationSubmissions.id, submissionId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getCapacityStatus(tournamentId: string): Promise<{
    divisions: Array<{ id: string; name: string; current: number; max: number; waitlist: number }>;
    events: Array<{ id: string; name: string; current: number; max: number; waitlist: number }>;
  }> {
    // Stub implementation - in a real system this would query actual capacity data
    return { divisions: [], events: [] };
  }

  async processSubmissionAssignment(submissionId: string): Promise<RegistrationSubmission | undefined> {
    // Stub implementation - in a real system this would run assignment logic
    return this.getRegistrationSubmission(submissionId);
  }

  // Atomic capacity management - Thread-safe capacity operations (stub implementations)
  async reserveCapacity(targetType: 'division' | 'event', targetId: string, count?: number): Promise<boolean> {
    // Stub implementation - in a real system this would use database locks
    return true;
  }

  async releaseCapacity(targetType: 'division' | 'event', targetId: string, count?: number): Promise<boolean> {
    // Stub implementation
    return true;
  }

  async checkCapacityAvailable(targetType: 'division' | 'event', targetId: string, requiredCount?: number): Promise<boolean> {
    // Stub implementation
    return true;
  }

  // Status transition helpers - Safe state management
  async transitionSubmissionStatus(submissionId: string, newStatus: 'pending' | 'assigned' | 'confirmed' | 'waitlisted' | 'rejected'): Promise<RegistrationSubmission | undefined> {
    try {
      const result = await this.db
        .update(registrationSubmissions)
        .set({ 
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(registrationSubmissions.id, submissionId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async transitionAssignmentStatus(submissionId: string, newStatus: 'pending' | 'assigned' | 'confirmed' | 'waitlisted' | 'rejected'): Promise<RegistrationSubmission | undefined> {
    return this.transitionSubmissionStatus(submissionId, newStatus);
  }

  // Assignment Log methods - Track smart matching decisions
  async createRegistrationAssignmentLog(log: InsertRegistrationAssignmentLog): Promise<RegistrationAssignmentLog> {
    try {
      const result = await this.db.insert(registrationAssignmentLog).values(log).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create registration assignment log");
    }
  }

  async getRegistrationAssignmentLogsBySubmission(submissionId: string): Promise<RegistrationAssignmentLog[]> {
    try {
      const result = await this.db
        .select()
        .from(registrationAssignmentLog)
        .where(eq(registrationAssignmentLog.submissionId, submissionId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getRegistrationAssignmentLogsByTournament(tournamentId: string): Promise<RegistrationAssignmentLog[]> {
    try {
      const result = await this.db
        .select()
        .from(registrationAssignmentLog)
        .where(eq(registrationAssignmentLog.tournamentId, tournamentId));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  // Professional Player methods
  async createProfessionalPlayer(player: InsertProfessionalPlayer): Promise<ProfessionalPlayer> {
    try {
      const result = await this.db.insert(professionalPlayers).values(player).returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create professional player");
    }
  }

  async getProfessionalPlayer(id: string): Promise<ProfessionalPlayer | undefined> {
    try {
      const result = await this.db.select().from(professionalPlayers).where(eq(professionalPlayers.id, id));
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }

  async getProfessionalPlayersBySport(sport: string): Promise<ProfessionalPlayer[]> {
    try {
      const result = await this.db
        .select()
        .from(professionalPlayers)
        .where(eq(professionalPlayers.sport, sport));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async getProfessionalPlayersByTeam(teamAbbreviation: string): Promise<ProfessionalPlayer[]> {
    try {
      const result = await this.db
        .select()
        .from(professionalPlayers)
        .where(eq(professionalPlayers.teamAbbreviation, teamAbbreviation));
      return result;
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async updateProfessionalPlayer(id: string, updates: Partial<ProfessionalPlayer>): Promise<ProfessionalPlayer | undefined> {
    try {
      const result = await this.db
        .update(professionalPlayers)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(professionalPlayers.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database error:", error);
      return undefined;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private whitelabelConfigs: Map<string, WhitelabelConfig>;
  private tournaments: Map<string, Tournament>;
  private matches: Map<string, Match>;
  private sportCategories: Map<string, SportCategory>;
  private sportOptions: Map<string, SportOption>;
  private sportEvents: Map<string, any>; // For swimming/track sub-events
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
  
  // STANDALONE TEAM MANAGEMENT MAPS (Jersey Watch-style)
  private teams: Map<string, Team>;
  private teamPlayers: Map<string, TeamPlayer>;
  private medicalHistories: Map<string, MedicalHistory>;
  
  // FANTASY PROFILE MAPS
  private fantasyProfiles: Map<string, FantasyProfile>;
  private showdownContests: Map<string, ShowdownContest>;
  private showdownEntries: Map<string, ShowdownEntry>;

  constructor() {
    this.users = new Map();
    this.whitelabelConfigs = new Map();
    this.tournaments = new Map();
    this.matches = new Map();
    this.sportCategories = new Map();
    this.sportOptions = new Map();
    this.sportEvents = new Map();
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
    
    // STANDALONE TEAM MANAGEMENT INITIALIZATION 
    this.teams = new Map();
    this.teamPlayers = new Map();
    this.medicalHistories = new Map();
    
    // FANTASY PROFILE INITIALIZATION
    this.fantasyProfiles = new Map();
    
    // FANTASY SHOWDOWN INITIALIZATION
    this.showdownContests = new Map();
    this.showdownEntries = new Map();
    
    // Initialize with default tournament structures, sport division rules, track events, tournament integration, competition formats, and KRAKEN!
    this.initializeDefaultStructures();
    this.initializeSportDivisionRules();
    this.initializeUltimateTrackEvents();
    this.initializeSwimmingEvents();
    this.initializeCommunityRunningEvents();
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email?.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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

  // Fantasy profile methods
  async getFantasyProfile(userId: string): Promise<FantasyProfile | undefined> {
    for (const [id, profile] of this.fantasyProfiles) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async upsertFantasyProfile(profileData: InsertFantasyProfile): Promise<FantasyProfile> {
    // Check if profile exists
    let existingProfile: FantasyProfile | undefined;
    let existingId: string | undefined;
    
    for (const [id, profile] of this.fantasyProfiles) {
      if (profile.userId === profileData.userId) {
        existingProfile = profile;
        existingId = id;
        break;
      }
    }

    if (existingProfile && existingId) {
      // Update existing profile
      const updatedProfile = { 
        ...existingProfile, 
        ...profileData, 
        updatedAt: new Date() 
      };
      this.fantasyProfiles.set(existingId, updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile
      const newProfile: FantasyProfile = {
        ...profileData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.fantasyProfiles.set(newProfile.id, newProfile);
      return newProfile;
    }
  }

  async setFantasyAgeVerification(userId: string, verifiedAt: Date, expiresAt: Date): Promise<FantasyProfile | undefined> {
    // First ensure fantasy profile exists
    await this.upsertFantasyProfile({ userId, status: "active" });
    
    // Update age verification fields
    const existingProfile = await this.getFantasyProfile(userId);
    if (existingProfile) {
      const updatedProfile = {
        ...existingProfile,
        ageVerifiedAt: verifiedAt,
        ageVerificationExpiresAt: expiresAt,
        updatedAt: new Date()
      };
      this.fantasyProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    }
    return undefined;
  }

  async acceptFantasyTOS(userId: string): Promise<FantasyProfile | undefined> {
    // First ensure fantasy profile exists
    await this.upsertFantasyProfile({ userId, status: "active" });
    
    // Update TOS acceptance
    const existingProfile = await this.getFantasyProfile(userId);
    if (existingProfile) {
      const updatedProfile = {
        ...existingProfile,
        tosAcceptedAt: new Date(),
        updatedAt: new Date()
      };
      this.fantasyProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    }
    return undefined;
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

  // Client configuration methods (in-memory storage)
  async createClientConfiguration(config: InsertClientConfiguration): Promise<ClientConfiguration> {
    const id = randomUUID();
    const now = new Date();
    const clientConfig: ClientConfiguration = {
      ...config,
      id,
      isActive: config.isActive !== undefined ? config.isActive : true,
      lastUpdated: now,
      createdAt: now,
    };
    // Store in whitelabel configs map for now (could be separate map in future)
    (this as any).clientConfigs = (this as any).clientConfigs || new Map();
    (this as any).clientConfigs.set(id, clientConfig);
    return clientConfig;
  }

  async getClientConfiguration(id: string): Promise<ClientConfiguration | undefined> {
    const configs = (this as any).clientConfigs || new Map();
    return configs.get(id);
  }

  async getClientConfigurationByDomain(domain: string): Promise<ClientConfiguration | undefined> {
    const configs = (this as any).clientConfigs || new Map();
    for (const config of configs.values()) {
      if (config.domain === domain) {
        return config;
      }
    }
    return undefined;
  }

  async getClientConfigurationByUserId(userId: string): Promise<ClientConfiguration | undefined> {
    const configs = (this as any).clientConfigs || new Map();
    for (const config of configs.values()) {
      if (config.userId === userId) {
        return config;
      }
    }
    return undefined;
  }

  async updateClientConfiguration(id: string, updates: Partial<ClientConfiguration>): Promise<ClientConfiguration | undefined> {
    const configs = (this as any).clientConfigs || new Map();
    const config = configs.get(id);
    if (!config) return undefined;
    
    const updatedConfig: ClientConfiguration = {
      ...config,
      ...updates,
      lastUpdated: new Date(),
    };
    configs.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteClientConfiguration(id: string): Promise<boolean> {
    const configs = (this as any).clientConfigs || new Map();
    return configs.delete(id);
  }

  async getWhitelabelConfigByUserId(userId: string): Promise<WhitelabelConfig | undefined> {
    for (const config of this.whitelabelConfigs.values()) {
      if (config.userId === userId) {
        return config;
      }
    }
    return undefined;
  }

  async getTournaments(): Promise<Tournament[]> {
    // Mirror DbStorage: return tournaments with sport configs for consistency
    const tournaments = Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // In MemStorage, sport configs are already merged in tournaments
    return tournaments;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    // Mirror DbStorage: return tournament with sport config for consistency  
    const tournament = this.tournaments.get(id);
    // In MemStorage, sport configs are already merged in tournaments
    return tournament;
  }

  async getDraftTournaments(userId: string): Promise<Tournament[]> {
    return Array.from(this.tournaments.values())
      .filter(tournament => tournament.status === 'draft' && tournament.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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

  async getSportEvents(sportId: string): Promise<any[]> {
    return Array.from(this.sportEvents.values())
      .filter(event => event.sportId === sportId)
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  }

  async getAllSportEvents(): Promise<any[]> {
    return Array.from(this.sportEvents.values()).sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
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
  private initializeSwimmingEvents() {
    // First ensure we have swimming in sport options
    const swimmingAndDiving = {
      id: 'swimming-diving',
      sportName: 'Swimming & Diving',
      sportCategory: 'Aquatic',
      sportSubcategory: 'Pool Sports',
      sortOrder: 8,
      competitionType: 'leaderboard' as const,
      scoringMethod: 'time' as const,
      measurementUnit: 'seconds',
      hasSubEvents: true,
      createdAt: new Date()
    };
    this.sportOptions.set('swimming-diving', swimmingAndDiving);

    // Swimming Events - Standard pool events
    const swimmingEvents = [
      // Freestyle Events
      { id: 'swim-50-free', eventName: '50m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 1 },
      { id: 'swim-100-free', eventName: '100m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 2 },
      { id: 'swim-200-free', eventName: '200m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 3 },
      { id: 'swim-400-free', eventName: '400m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 4 },
      { id: 'swim-800-free', eventName: '800m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 5 },
      { id: 'swim-1500-free', eventName: '1500m Freestyle', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 6 },
      
      // Backstroke Events
      { id: 'swim-50-back', eventName: '50m Backstroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 7 },
      { id: 'swim-100-back', eventName: '100m Backstroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 8 },
      { id: 'swim-200-back', eventName: '200m Backstroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 9 },
      
      // Breaststroke Events
      { id: 'swim-50-breast', eventName: '50m Breaststroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 10 },
      { id: 'swim-100-breast', eventName: '100m Breaststroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 11 },
      { id: 'swim-200-breast', eventName: '200m Breaststroke', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 12 },
      
      // Butterfly Events
      { id: 'swim-50-fly', eventName: '50m Butterfly', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 13 },
      { id: 'swim-100-fly', eventName: '100m Butterfly', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 14 },
      { id: 'swim-200-fly', eventName: '200m Butterfly', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 15 },
      
      // Individual Medley Events
      { id: 'swim-200-im', eventName: '200m Individual Medley', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 16 },
      { id: 'swim-400-im', eventName: '400m Individual Medley', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 17 },
      
      // Relay Events
      { id: 'swim-4x50-free-relay', eventName: '4x50m Freestyle Relay', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 18 },
      { id: 'swim-4x100-free-relay', eventName: '4x100m Freestyle Relay', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 19 },
      { id: 'swim-4x200-free-relay', eventName: '4x200m Freestyle Relay', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 20 },
      { id: 'swim-4x100-medley-relay', eventName: '4x100m Medley Relay', eventType: 'swimming', scoringMethod: 'time', measurementUnit: 'seconds', sortOrder: 21 },
      
      // Diving Events
      { id: 'dive-1m-springboard', eventName: '1m Springboard', eventType: 'diving', scoringMethod: 'points', measurementUnit: 'points', sortOrder: 22 },
      { id: 'dive-3m-springboard', eventName: '3m Springboard', eventType: 'diving', scoringMethod: 'points', measurementUnit: 'points', sortOrder: 23 },
      { id: 'dive-platform', eventName: '10m Platform', eventType: 'diving', scoringMethod: 'points', measurementUnit: 'points', sortOrder: 24 },
    ];

    swimmingEvents.forEach(event => {
      const sportEvent = {
        ...event,
        sportId: 'swimming-diving',
        supportsMetric: true,
        supportsImperial: false, // Swimming is typically metric only
        gender: 'mixed' as const,
        ageGroup: undefined,
        createdAt: new Date()
      };
      this.sportEvents.set(event.id, sportEvent);
    });
  }

  private initializeCommunityRunningEvents() {
    // First create the Community Running Events category if it doesn't exist
    const communityRunningCategoryId = 'community-running-events';
    const communityRunningCategory = {
      id: communityRunningCategoryId,
      categoryName: 'Community Running Events',
      categoryDescription: 'Charity runs, fun runs, and community walking events for fundraising and health awareness',
      sortOrder: 50,
      createdAt: new Date()
    };
    this.sportCategories.set(communityRunningCategoryId, communityRunningCategory);

    // Add Community Running Sports Options
    const communityRunningOptions = [
      {
        id: 'charity-5k-run',
        sportName: '5K Charity Run',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Charity Events',
        sortOrder: 1,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'time' as const,
        measurementUnit: 'minutes:seconds',
        hasSubEvents: false,
        createdAt: new Date()
      },
      {
        id: 'charity-10k-run',
        sportName: '10K Community Run',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Charity Events',
        sortOrder: 2,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'time' as const,
        measurementUnit: 'minutes:seconds',
        hasSubEvents: false,
        createdAt: new Date()
      },
      {
        id: 'charity-walk',
        sportName: 'Charity Walk/Walk-a-thon',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Fundraising Events',
        sortOrder: 3,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'distance' as const,
        measurementUnit: 'miles',
        hasSubEvents: false,
        createdAt: new Date()
      },
      {
        id: 'fun-run',
        sportName: 'Fun Run (Color Run/Theme Run)',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Community Events',
        sortOrder: 4,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'time' as const,
        measurementUnit: 'minutes:seconds',
        hasSubEvents: false,
        createdAt: new Date()
      },
      {
        id: 'memorial-run',
        sportName: 'Memorial/Awareness Run',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Awareness Events',
        sortOrder: 5,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'time' as const,
        measurementUnit: 'minutes:seconds',
        hasSubEvents: false,
        createdAt: new Date()
      },
      {
        id: 'corporate-challenge',
        sportName: 'Corporate Fitness Challenge',
        sportCategory: communityRunningCategoryId,
        sportSubcategory: 'Corporate Events',
        sortOrder: 6,
        competitionType: 'leaderboard' as const,
        scoringMethod: 'time' as const,
        measurementUnit: 'minutes:seconds',
        hasSubEvents: false,
        createdAt: new Date()
      }
    ];

    // Add each sport option to our storage
    communityRunningOptions.forEach(sport => {
      this.sportOptions.set(sport.id, sport);
    });

    console.log(`🏃‍♂️ Community Running Events initialized: ${communityRunningOptions.length} event types loaded for charity and community fundraising!`);
  }

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

  // Track Events methods are already defined above

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

  // Fantasy Showdown Contest methods
  async createShowdownContest(contest: InsertShowdownContest): Promise<ShowdownContest> {
    const id = randomUUID();
    const now = new Date();
    const newContest = {
      id,
      ...contest,
      createdAt: now,
      updatedAt: now
    };
    
    this.showdownContests.set(id, newContest);
    return newContest;
  }

  async getShowdownContest(id: string): Promise<ShowdownContest | undefined> {
    return this.showdownContests.get(id);
  }

  async getShowdownContests(): Promise<ShowdownContest[]> {
    return Array.from(this.showdownContests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getShowdownContestsByCommissioner(commissionerId: string): Promise<ShowdownContest[]> {
    return Array.from(this.showdownContests.values())
      .filter(contest => contest.commissionerId === commissionerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateShowdownContest(id: string, updates: Partial<ShowdownContest>): Promise<ShowdownContest | undefined> {
    const existing = this.showdownContests.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.showdownContests.set(id, updated);
    return updated;
  }

  // Fantasy Showdown Entry methods
  async createShowdownEntry(entry: InsertShowdownEntry): Promise<ShowdownEntry> {
    const id = randomUUID();
    const now = new Date();
    const newEntry = {
      id,
      ...entry,
      createdAt: now,
      updatedAt: now
    };
    
    this.showdownEntries.set(id, newEntry);
    return newEntry;
  }

  async getShowdownEntry(id: string): Promise<ShowdownEntry | undefined> {
    return this.showdownEntries.get(id);
  }

  async getShowdownEntriesByContest(contestId: string): Promise<ShowdownEntry[]> {
    return Array.from(this.showdownEntries.values())
      .filter(entry => entry.contestId === contestId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getShowdownEntriesByUser(userId: string): Promise<ShowdownEntry[]> {
    return Array.from(this.showdownEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateShowdownEntry(id: string, updates: Partial<ShowdownEntry>): Promise<ShowdownEntry | undefined> {
    const existing = this.showdownEntries.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.showdownEntries.set(id, updated);
    return updated;
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

  // Guest participant methods - "Pay & Play or Join the Family" system (in-memory implementation)
  private guestParticipants: Map<string, GuestParticipant> = new Map();

  async createGuestParticipant(participant: InsertGuestParticipant): Promise<GuestParticipant> {
    const id = randomUUID();
    const now = new Date();
    const created: GuestParticipant = {
      ...participant,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.guestParticipants.set(id, created);
    return created;
  }

  async getGuestParticipant(id: string): Promise<GuestParticipant | undefined> {
    return this.guestParticipants.get(id);
  }

  async getGuestParticipantsByTournament(tournamentId: string): Promise<GuestParticipant[]> {
    return Array.from(this.guestParticipants.values()).filter(p => p.tournamentId === tournamentId);
  }

  async getGuestParticipantsByOrganizer(organizerId: string): Promise<GuestParticipant[]> {
    return Array.from(this.guestParticipants.values()).filter(p => p.organizerId === organizerId);
  }

  async updateGuestParticipant(id: string, updates: Partial<GuestParticipant>): Promise<GuestParticipant | undefined> {
    const participant = this.guestParticipants.get(id);
    if (!participant) return undefined;
    
    const updated: GuestParticipant = {
      ...participant,
      ...updates,
      updatedAt: new Date(),
    };
    this.guestParticipants.set(id, updated);
    return updated;
  }

  async deleteGuestParticipant(id: string): Promise<boolean> {
    return this.guestParticipants.delete(id);
  }

  async linkGuestParticipantToUser(participantId: string, userId: string): Promise<GuestParticipant | undefined> {
    const participant = this.guestParticipants.get(participantId);
    if (!participant) return undefined;
    
    const updated: GuestParticipant = {
      ...participant,
      linkedUserId: userId,
      hasCreatedAccount: true,
      accountCreatedAt: new Date(),
      updatedAt: new Date(),
    };
    this.guestParticipants.set(participantId, updated);
    return updated;
  }

  // Password reset methods for tournament organizers (in-memory implementation)
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const id = randomUUID();
    const now = new Date();
    const created: PasswordResetToken = {
      ...token,
      id,
      createdAt: now,
    };
    this.passwordResetTokens.set(id, created);
    return created;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return Array.from(this.passwordResetTokens.values()).find(t => t.token === token);
  }

  async markPasswordResetTokenUsed(id: string): Promise<boolean> {
    const token = this.passwordResetTokens.get(id);
    if (!token) return false;
    
    const updated: PasswordResetToken = {
      ...token,
      used: true,
    };
    this.passwordResetTokens.set(id, updated);
    return true;
  }

  async cleanupExpiredPasswordResetTokens(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [id, token] of this.passwordResetTokens.entries()) {
      if (token.expiresAt < now) {
        this.passwordResetTokens.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // STANDALONE TEAM MANAGEMENT METHODS (Jersey Watch-style)
  async createTeam(team: InsertTeam): Promise<Team> {
    const teamWithId = {
      id: randomUUID(),
      ...team,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Team;
    
    this.teams.set(teamWithId.id, teamWithId);
    return teamWithId;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsByCoach(coachId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.coachId === coachId);
  }

  async getTeamsByOrganization(organizationName: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.organizationName === organizationName);
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const existingTeam = this.teams.get(id);
    if (!existingTeam) return undefined;
    
    // Filter out immutable fields to prevent accidental mutation
    const { id: _, createdAt: __, ...allowedUpdates } = updates;
    
    const updatedTeam = { 
      ...existingTeam, 
      ...allowedUpdates, 
      updatedAt: new Date() 
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    // First delete related team players to handle cascade
    const playersToDelete = Array.from(this.teamPlayers.values()).filter(player => player.teamId === id);
    playersToDelete.forEach(player => this.teamPlayers.delete(player.id));
    
    // Then delete the team
    return this.teams.delete(id);
  }

  async updateTeamSubscription(id: string, subscriptionData: { subscriptionStatus: string, subscriptionTier: string, stripeSubscriptionId?: string }): Promise<Team | undefined> {
    return this.updateTeam(id, subscriptionData);
  }

  async createTeamPlayer(player: InsertTeamPlayer): Promise<TeamPlayer> {
    const playerWithId = {
      id: randomUUID(),
      ...player,
      createdAt: new Date(),
      updatedAt: new Date()
    } as TeamPlayer;
    
    this.teamPlayers.set(playerWithId.id, playerWithId);
    return playerWithId;
  }

  async getTeamPlayer(id: string): Promise<TeamPlayer | undefined> {
    return this.teamPlayers.get(id);
  }

  async getTeamPlayersByTeam(teamId: string): Promise<TeamPlayer[]> {
    return Array.from(this.teamPlayers.values()).filter(player => player.teamId === teamId);
  }

  async updateTeamPlayer(id: string, updates: Partial<TeamPlayer>): Promise<TeamPlayer | undefined> {
    const existingPlayer = this.teamPlayers.get(id);
    if (!existingPlayer) return undefined;
    
    // Filter out immutable fields to prevent accidental mutation
    const { id: _, teamId: __, createdAt: ___, ...allowedUpdates } = updates;
    
    const updatedPlayer = { 
      ...existingPlayer, 
      ...allowedUpdates, 
      updatedAt: new Date() 
    };
    this.teamPlayers.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deleteTeamPlayer(id: string): Promise<boolean> {
    return this.teamPlayers.delete(id);
  }

  async bulkCreateTeamPlayers(players: InsertTeamPlayer[]): Promise<TeamPlayer[]> {
    const createdPlayers: TeamPlayer[] = [];
    for (const player of players) {
      const createdPlayer = await this.createTeamPlayer(player);
      createdPlayers.push(createdPlayer);
    }
    return createdPlayers;
  }

  // Medical history methods
  async createMedicalHistory(medicalHistoryData: InsertMedicalHistory): Promise<MedicalHistory> {
    const medicalHistoryWithId = {
      id: randomUUID(),
      ...medicalHistoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as MedicalHistory;
    
    this.medicalHistories.set(medicalHistoryWithId.id, medicalHistoryWithId);
    return medicalHistoryWithId;
  }

  async getMedicalHistory(id: string): Promise<MedicalHistory | undefined> {
    return this.medicalHistories.get(id);
  }

  async getMedicalHistoryByPlayer(playerId: string): Promise<MedicalHistory | undefined> {
    return Array.from(this.medicalHistories.values()).find(history => history.playerId === playerId);
  }

  async updateMedicalHistory(id: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory | undefined> {
    const existingHistory = this.medicalHistories.get(id);
    if (!existingHistory) return undefined;
    
    const updatedHistory = {
      ...existingHistory,
      ...updates,
      id: existingHistory.id, // Preserve original ID
      createdAt: existingHistory.createdAt, // Preserve creation date
      updatedAt: new Date()
    };
    
    this.medicalHistories.set(id, updatedHistory);
    return updatedHistory;
  }

  async deleteMedicalHistory(id: string): Promise<boolean> {
    return this.medicalHistories.delete(id);
  }

  // Cache stats method for compatibility with cached storage interface
  getCacheStats() {
    return {
      totalEntries: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      evictions: 0
    };
  }

  // NFL data methods (simple in-memory implementation)
  private nflSchedule: any[] = [];
  private nflInjuries: any[] = [];
  private nflPlayerStats: any[] = [];

  async storeNFLSchedule(games: any[]): Promise<void> {
    this.nflSchedule = games;
  }

  async getNFLSchedule(): Promise<any[]> {
    return this.nflSchedule;
  }

  async storeNFLInjuries(injuries: any[]): Promise<void> {
    this.nflInjuries = injuries;
  }

  async getNFLInjuries(): Promise<any[]> {
    return this.nflInjuries;
  }

  async storeNFLPlayerStats(stats: any[]): Promise<void> {
    this.nflPlayerStats = stats;
    console.log(`📊 [NFL Stats] Stored ${stats.length} player statistics in memory`);
  }

  async getNFLPlayerStats(): Promise<any[]> {
    return this.nflPlayerStats;
  }
}

// Try to use database storage with caching, fallback to memory if database fails
async function initializeStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    try {
      const dbStorage = new DbStorage();
      // Test both connection and table existence
      await dbStorage.db.execute(sql`SELECT 1`);
      
      // Check if required tables exist
      await dbStorage.db.execute(sql`SELECT 1 FROM users LIMIT 1`);
      await dbStorage.db.execute(sql`SELECT 1 FROM sessions LIMIT 1`);
      
      console.log("✅ Database connection successful, using DbStorage with caching and monitoring layers");
      
      // Wrap with caching layer (5 minute default TTL)
      const cachedStorage = createCachedStorage(dbStorage, 5 * 60 * 1000);
      
      // Wrap with performance monitoring
      const monitoredStorage = createMonitoredStorage(cachedStorage);
      
      console.log("📊 Performance monitoring enabled - tracking query performance and database health");
      return monitoredStorage;
    } catch (error) {
      console.warn("⚠️  Database connection failed or tables missing, falling back to MemStorage:", (error as Error).message);
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
