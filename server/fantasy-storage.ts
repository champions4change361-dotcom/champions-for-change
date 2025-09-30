import { eq, and, or, desc, asc, sql as drizzleSql } from "drizzle-orm";
import { fantasyDb } from "./fantasy-db";
import {
  fantasyProfiles,
  fantasyLeagues,
  fantasyTeams,
  fantasyRosters,
  fantasyDrafts,
  fantasyMatchups,
  fantasyWaiverClaims,
  fantasyTrades,
  fantasyLeagueMessages,
  fantasyParticipants,
  fantasyPicks,
  fantasyLineups,
  showdownContests,
  showdownEntries,
  showdownLeaderboards,
  professionalPlayers,
  playerPerformances,
  ageVerifications,
  fantasyEligibilityChecks,
  fantasySafetyRules,
  type FantasyProfile,
  type FantasyLeague,
  type FantasyTeam,
  type FantasyRoster,
  type FantasyDraft,
  type FantasyMatchup,
  type FantasyWaiverClaim,
  type FantasyTrade,
  type FantasyLeagueMessage,
  type FantasyParticipant,
  type FantasyPick,
  type FantasyLineup,
  type ShowdownContest,
  type ShowdownEntry,
  type ShowdownLeaderboard,
  type ProfessionalPlayer,
  type PlayerPerformance,
  type AgeVerification,
  type FantasyEligibilityCheck,
  type FantasySafetyRule,
  type InsertFantasyProfile,
  type InsertFantasyLeague,
  type InsertFantasyTeam,
  type InsertFantasyRoster,
  type InsertFantasyDraft,
  type InsertFantasyMatchup,
  type InsertFantasyWaiverClaim,
  type InsertFantasyTrade,
  type InsertFantasyLeagueMessage,
  type InsertFantasyParticipant,
  type InsertFantasyPick,
  type InsertFantasyLineup,
  type InsertShowdownContest,
  type InsertShowdownEntry,
  type InsertShowdownLeaderboard,
  type InsertProfessionalPlayer,
  type InsertPlayerPerformance,
  type InsertAgeVerification,
  type InsertFantasyEligibilityCheck,
  type InsertFantasySafetyRule,
} from "../shared/fantasy-schema";

/**
 * Fantasy Storage Layer
 * 
 * Handles all fantasy sports data operations using the dedicated fantasy_sports database.
 * This separation isolates high-volume ESPN/PFR data ingestion from HIPAA/FERPA protected
 * school district data for better performance and compliance.
 */
export class FantasyStorage {
  private db = fantasyDb;

  // =============================================================================
  // FANTASY PROFILES
  // =============================================================================

  async createFantasyProfile(data: InsertFantasyProfile): Promise<FantasyProfile> {
    const [result] = await this.db.insert(fantasyProfiles).values(data).returning();
    return result;
  }

  async getFantasyProfileByUserId(userId: string): Promise<FantasyProfile | undefined> {
    const [result] = await this.db
      .select()
      .from(fantasyProfiles)
      .where(eq(fantasyProfiles.userId, userId));
    return result;
  }

  async updateFantasyProfile(id: string, updates: Partial<FantasyProfile>): Promise<FantasyProfile | undefined> {
    const [result] = await this.db
      .update(fantasyProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyProfiles.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY LEAGUES
  // =============================================================================

  async createFantasyLeague(data: InsertFantasyLeague): Promise<FantasyLeague> {
    const [result] = await this.db.insert(fantasyLeagues).values(data).returning();
    return result;
  }

  async getFantasyLeague(id: string): Promise<FantasyLeague | undefined> {
    const [result] = await this.db
      .select()
      .from(fantasyLeagues)
      .where(eq(fantasyLeagues.id, id));
    return result;
  }

  async getUserFantasyLeagues(userId: string): Promise<FantasyLeague[]> {
    // Get leagues where user is commissioner or has a team
    const ownedLeagues = await this.db
      .select()
      .from(fantasyLeagues)
      .where(eq(fantasyLeagues.commissionerId, userId));

    const participantLeagues = await this.db
      .select({
        league: fantasyLeagues,
      })
      .from(fantasyTeams)
      .innerJoin(fantasyLeagues, eq(fantasyTeams.leagueId, fantasyLeagues.id))
      .where(eq(fantasyTeams.ownerId, userId));

    const allLeagues = [
      ...ownedLeagues,
      ...participantLeagues.map(pl => pl.league),
    ];

    // Deduplicate by ID
    const uniqueLeagues = Array.from(
      new Map(allLeagues.map(league => [league.id, league])).values()
    );

    return uniqueLeagues;
  }

  async getFantasyLeaguesBySport(sport: string): Promise<FantasyLeague[]> {
    return await this.db
      .select()
      .from(fantasyLeagues)
      .where(eq(fantasyLeagues.sport, sport as any));
  }

  async updateFantasyLeague(id: string, updates: Partial<FantasyLeague>): Promise<FantasyLeague | undefined> {
    const [result] = await this.db
      .update(fantasyLeagues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyLeagues.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY TEAMS
  // =============================================================================

  async createFantasyTeam(data: InsertFantasyTeam): Promise<FantasyTeam> {
    const [result] = await this.db.insert(fantasyTeams).values(data).returning();
    return result;
  }

  async getFantasyTeam(id: string): Promise<FantasyTeam | undefined> {
    const [result] = await this.db
      .select()
      .from(fantasyTeams)
      .where(eq(fantasyTeams.id, id));
    return result;
  }

  async getFantasyTeamsByLeague(leagueId: string): Promise<FantasyTeam[]> {
    return await this.db
      .select()
      .from(fantasyTeams)
      .where(eq(fantasyTeams.leagueId, leagueId));
  }

  async getUserFantasyTeams(userId: string): Promise<FantasyTeam[]> {
    return await this.db
      .select()
      .from(fantasyTeams)
      .where(eq(fantasyTeams.ownerId, userId));
  }

  async updateFantasyTeam(id: string, updates: Partial<FantasyTeam>): Promise<FantasyTeam | undefined> {
    const [result] = await this.db
      .update(fantasyTeams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyTeams.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // PROFESSIONAL PLAYERS
  // =============================================================================

  async createProfessionalPlayer(data: InsertProfessionalPlayer): Promise<ProfessionalPlayer> {
    const [result] = await this.db.insert(professionalPlayers).values(data).returning();
    return result;
  }

  async getProfessionalPlayer(id: string): Promise<ProfessionalPlayer | undefined> {
    const [result] = await this.db
      .select()
      .from(professionalPlayers)
      .where(eq(professionalPlayers.id, id));
    return result;
  }

  async getProfessionalPlayerByExternalId(externalId: string, dataSource: string): Promise<ProfessionalPlayer | undefined> {
    const [result] = await this.db
      .select()
      .from(professionalPlayers)
      .where(
        and(
          eq(professionalPlayers.externalPlayerId, externalId),
          eq(professionalPlayers.dataSource, dataSource)
        )
      );
    return result;
  }

  async getProfessionalPlayersBySport(sport: string): Promise<ProfessionalPlayer[]> {
    return await this.db
      .select()
      .from(professionalPlayers)
      .where(eq(professionalPlayers.sport, sport));
  }

  async getProfessionalPlayersByTeam(teamAbbreviation: string): Promise<ProfessionalPlayer[]> {
    return await this.db
      .select()
      .from(professionalPlayers)
      .where(eq(professionalPlayers.teamAbbreviation, teamAbbreviation));
  }

  async getAllProfessionalPlayers(): Promise<ProfessionalPlayer[]> {
    return await this.db.select().from(professionalPlayers);
  }

  async updateProfessionalPlayer(id: string, updates: Partial<ProfessionalPlayer>): Promise<ProfessionalPlayer | undefined> {
    const [result] = await this.db
      .update(professionalPlayers)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(professionalPlayers.id, id))
      .returning();
    return result;
  }

  async upsertProfessionalPlayer(data: InsertProfessionalPlayer): Promise<ProfessionalPlayer> {
    // Try to find existing player by external ID
    const existing = await this.getProfessionalPlayerByExternalId(
      data.externalPlayerId,
      data.dataSource
    );

    if (existing) {
      const updated = await this.updateProfessionalPlayer(existing.id, data);
      return updated!;
    } else {
      return await this.createProfessionalPlayer(data);
    }
  }

  // =============================================================================
  // FANTASY ROSTERS
  // =============================================================================

  async createFantasyRoster(data: InsertFantasyRoster): Promise<FantasyRoster> {
    const [result] = await this.db.insert(fantasyRosters).values(data).returning();
    return result;
  }

  async getFantasyRostersByTeam(teamId: string): Promise<FantasyRoster[]> {
    return await this.db
      .select()
      .from(fantasyRosters)
      .where(eq(fantasyRosters.teamId, teamId));
  }

  async deleteFantasyRoster(id: string): Promise<void> {
    await this.db.delete(fantasyRosters).where(eq(fantasyRosters.id, id));
  }

  async updateFantasyRoster(id: string, updates: Partial<FantasyRoster>): Promise<FantasyRoster | undefined> {
    const [result] = await this.db
      .update(fantasyRosters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyRosters.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY DRAFTS
  // =============================================================================

  async createFantasyDraft(data: InsertFantasyDraft): Promise<FantasyDraft> {
    const [result] = await this.db.insert(fantasyDrafts).values(data).returning();
    return result;
  }

  async getFantasyDraft(id: string): Promise<FantasyDraft | undefined> {
    const [result] = await this.db
      .select()
      .from(fantasyDrafts)
      .where(eq(fantasyDrafts.id, id));
    return result;
  }

  async getFantasyDraftByLeague(leagueId: string): Promise<FantasyDraft | undefined> {
    const [result] = await this.db
      .select()
      .from(fantasyDrafts)
      .where(eq(fantasyDrafts.leagueId, leagueId));
    return result;
  }

  async updateFantasyDraft(id: string, updates: Partial<FantasyDraft>): Promise<FantasyDraft | undefined> {
    const [result] = await this.db
      .update(fantasyDrafts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyDrafts.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY MATCHUPS
  // =============================================================================

  async createFantasyMatchup(data: InsertFantasyMatchup): Promise<FantasyMatchup> {
    const [result] = await this.db.insert(fantasyMatchups).values(data).returning();
    return result;
  }

  async getFantasyMatchupsByLeagueAndWeek(leagueId: string, week: number): Promise<FantasyMatchup[]> {
    return await this.db
      .select()
      .from(fantasyMatchups)
      .where(
        and(
          eq(fantasyMatchups.leagueId, leagueId),
          eq(fantasyMatchups.week, week)
        )
      );
  }

  async updateFantasyMatchup(id: string, updates: Partial<FantasyMatchup>): Promise<FantasyMatchup | undefined> {
    const [result] = await this.db
      .update(fantasyMatchups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyMatchups.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY TRADES
  // =============================================================================

  async createFantasyTrade(data: InsertFantasyTrade): Promise<FantasyTrade> {
    const [result] = await this.db.insert(fantasyTrades).values(data).returning();
    return result;
  }

  async getFantasyTradesByLeague(leagueId: string): Promise<FantasyTrade[]> {
    return await this.db
      .select()
      .from(fantasyTrades)
      .where(eq(fantasyTrades.leagueId, leagueId))
      .orderBy(desc(fantasyTrades.proposedAt));
  }

  async updateFantasyTrade(id: string, updates: Partial<FantasyTrade>): Promise<FantasyTrade | undefined> {
    const [result] = await this.db
      .update(fantasyTrades)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fantasyTrades.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // PLAYER PERFORMANCES
  // =============================================================================

  async createPlayerPerformance(data: InsertPlayerPerformance): Promise<PlayerPerformance> {
    const [result] = await this.db.insert(playerPerformances).values(data).returning();
    return result;
  }

  async getPlayerPerformancesByWeek(weekNumber: number, season: string): Promise<PlayerPerformance[]> {
    return await this.db
      .select()
      .from(playerPerformances)
      .where(
        and(
          eq(playerPerformances.weekNumber, weekNumber),
          eq(playerPerformances.season, season)
        )
      );
  }

  async getPlayerPerformancesByPlayerId(playerId: string): Promise<PlayerPerformance[]> {
    return await this.db
      .select()
      .from(playerPerformances)
      .where(eq(playerPerformances.playerId, playerId))
      .orderBy(desc(playerPerformances.weekNumber));
  }

  async upsertPlayerPerformance(data: InsertPlayerPerformance): Promise<PlayerPerformance> {
    // Check if performance already exists for this player/week/season
    const [existing] = await this.db
      .select()
      .from(playerPerformances)
      .where(
        and(
          eq(playerPerformances.playerId, data.playerId!),
          eq(playerPerformances.weekNumber, data.weekNumber!),
          eq(playerPerformances.season, data.season!)
        )
      );

    if (existing) {
      const [updated] = await this.db
        .update(playerPerformances)
        .set({ ...data, lastUpdated: new Date() })
        .where(eq(playerPerformances.id, existing.id))
        .returning();
      return updated;
    } else {
      return await this.createPlayerPerformance(data);
    }
  }

  // =============================================================================
  // SHOWDOWN CONTESTS
  // =============================================================================

  async createShowdownContest(data: InsertShowdownContest): Promise<ShowdownContest> {
    const [result] = await this.db.insert(showdownContests).values(data).returning();
    return result;
  }

  async getShowdownContest(id: string): Promise<ShowdownContest | undefined> {
    const [result] = await this.db
      .select()
      .from(showdownContests)
      .where(eq(showdownContests.id, id));
    return result;
  }

  async getActiveShowdownContests(): Promise<ShowdownContest[]> {
    return await this.db
      .select()
      .from(showdownContests)
      .where(eq(showdownContests.status, "open"))
      .orderBy(asc(showdownContests.gameDate));
  }

  async updateShowdownContest(id: string, updates: Partial<ShowdownContest>): Promise<ShowdownContest | undefined> {
    const [result] = await this.db
      .update(showdownContests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(showdownContests.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // SHOWDOWN ENTRIES
  // =============================================================================

  async createShowdownEntry(data: InsertShowdownEntry): Promise<ShowdownEntry> {
    const [result] = await this.db.insert(showdownEntries).values(data).returning();
    return result;
  }

  async getShowdownEntriesByContest(contestId: string): Promise<ShowdownEntry[]> {
    return await this.db
      .select()
      .from(showdownEntries)
      .where(eq(showdownEntries.contestId, contestId));
  }

  async getUserShowdownEntries(userId: string): Promise<ShowdownEntry[]> {
    return await this.db
      .select()
      .from(showdownEntries)
      .where(eq(showdownEntries.userId, userId));
  }

  async updateShowdownEntry(id: string, updates: Partial<ShowdownEntry>): Promise<ShowdownEntry | undefined> {
    const [result] = await this.db
      .update(showdownEntries)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(showdownEntries.id, id))
      .returning();
    return result;
  }

  // =============================================================================
  // FANTASY LINEUPS
  // =============================================================================

  async createFantasyLineup(data: InsertFantasyLineup): Promise<FantasyLineup> {
    const [result] = await this.db.insert(fantasyLineups).values(data).returning();
    return result;
  }

  async getFantasyLineupsByParticipant(participantId: string): Promise<FantasyLineup[]> {
    return await this.db
      .select()
      .from(fantasyLineups)
      .where(eq(fantasyLineups.participantId, participantId));
  }

  async updateFantasyLineup(id: string, updates: Partial<FantasyLineup>): Promise<FantasyLineup | undefined> {
    const [result] = await this.db
      .update(fantasyLineups)
      .set(updates)
      .where(eq(fantasyLineups.id, id))
      .returning();
    return result;
  }

  async getActiveFantasyLineups(): Promise<FantasyLineup[]> {
    return await this.db
      .select()
      .from(fantasyLineups)
      .where(eq(fantasyLineups.lineupStatus, "set"));
  }

  // =============================================================================
  // AGE VERIFICATIONS
  // =============================================================================

  async createAgeVerification(data: InsertAgeVerification): Promise<AgeVerification> {
    const [result] = await this.db.insert(ageVerifications).values(data).returning();
    return result;
  }

  async getAgeVerificationByUserId(userId: string): Promise<AgeVerification | undefined> {
    const [result] = await this.db
      .select()
      .from(ageVerifications)
      .where(eq(ageVerifications.userId, userId))
      .orderBy(desc(ageVerifications.verificationDate));
    return result;
  }
}

// Export singleton instance
export const fantasyStorage = new FantasyStorage();
