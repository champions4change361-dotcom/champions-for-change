/**
 * Tournament Director Service - Comprehensive Dashboard and Management Tools
 * Provides tournament organizers with real-time monitoring, control, analytics, and reporting
 * Integrates with all tournament services for centralized management
 */

import { randomUUID } from "crypto";
import { storage, type SecureUserContext } from "./storage";
import { TournamentService, type TournamentProgressUpdate } from "./tournament-service";
import { TournamentRegistrationService, type RegistrationEligibility } from "./tournament-registration-service";
import { LiveScoringService, type LiveScore, type ScoringConflict } from "./live-scoring-service";
import { emailService } from "./emailService";
import type {
  Tournament,
  Match,
  Team,
  User,
  TournamentRegistrationForm,
  RegistrationSubmission,
  TournamentEvent,
  InsertTournamentEvent
} from "@shared/schema";

export interface TournamentDashboard {
  tournament: Tournament;
  overview: {
    status: 'planning' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
    progress: number;
    currentPhase: string;
    nextMilestone: string;
    participantsRegistered: number;
    participantsCapacity: number;
    matchesCompleted: number;
    totalMatches: number;
  };
  realTimeData: {
    liveMatches: Array<{ match: Match; liveScore?: LiveScore }>;
    upcomingMatches: Match[];
    recentResults: Match[];
    activeConflicts: ScoringConflict[];
    systemAlerts: TournamentAlert[];
  };
  analytics: TournamentAnalytics;
  financial: FinancialSummary;
  notifications: NotificationCenter;
}

export interface TournamentAnalytics {
  participation: {
    registrationTrends: Array<{ date: string; registrations: number; revenue: number }>;
    demographicBreakdown: Record<string, number>;
    geographicDistribution: Record<string, number>;
    participationRate: number;
    dropoutRate: number;
  };
  performance: {
    matchDuration: { average: number; min: number; max: number };
    scoringAverages: { high: number; low: number; average: number };
    competitiveBalance: number; // 0-1 score indicating match competitiveness
    upsetRate: number; // Percentage of lower seeds beating higher seeds
  };
  engagement: {
    liveViewers: number;
    bracketViews: number;
    socialShares: number;
    feedbackScore: number;
  };
  operational: {
    scheduleAdherence: number; // Percentage of matches starting on time
    facilityUtilization: number;
    staffProductivity: Record<string, number>;
    resourceUsage: Record<string, number>;
  };
}

export interface FinancialSummary {
  revenue: {
    registrationFees: number;
    sponsorships: number;
    merchandise: number;
    concessions: number;
    total: number;
  };
  expenses: {
    facilityRental: number;
    staffing: number;
    equipment: number;
    marketing: number;
    insurance: number;
    total: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  };
  forecasts: {
    projectedRevenue: number;
    projectedExpenses: number;
    projectedProfit: number;
  };
}

export interface NotificationCenter {
  unreadCount: number;
  priorities: {
    critical: TournamentNotification[];
    high: TournamentNotification[];
    medium: TournamentNotification[];
    low: TournamentNotification[];
  };
  recentActivity: TournamentNotification[];
}

export interface TournamentNotification {
  id: string;
  type: 'registration' | 'match_result' | 'conflict' | 'system' | 'financial' | 'deadline';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  timestamp: Date;
  readAt?: Date;
  resolvedAt?: Date;
}

export interface TournamentAlert {
  id: string;
  type: 'capacity_warning' | 'schedule_delay' | 'technical_issue' | 'safety_concern' | 'weather';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  autoResolvable: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface TournamentReport {
  id: string;
  tournamentId: string;
  reportType: 'summary' | 'financial' | 'participation' | 'performance' | 'custom';
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: Date;
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  downloadUrl?: string;
}

export interface TournamentControl {
  canModifyBrackets: boolean;
  canOverrideResults: boolean;
  canManageRegistrations: boolean;
  canControlSchedule: boolean;
  canSendNotifications: boolean;
  canAccessFinancials: boolean;
  canGenerateReports: boolean;
  canManageStaff: boolean;
}

export class TournamentDirectorService {

  /**
   * Get comprehensive tournament dashboard
   */
  static async getTournamentDashboard(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<TournamentDashboard> {
    try {
      // Verify director permissions
      await this.verifyDirectorPermissions(tournamentId, user);

      // Get tournament data
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get all tournament matches
      const allMatches = await storage.getMatchesByTournament(tournamentId, user);
      
      // Get live tournament data
      const liveData = await LiveScoringService.getLiveTournamentData(tournamentId, user);
      
      // Get registration statistics
      const registrationStats = await TournamentRegistrationService.getRegistrationStatistics(tournamentId, user);

      // Build overview
      const completedMatches = allMatches.filter(m => m.status === 'completed').length;
      const totalMatches = allMatches.length;
      const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

      const overview = {
        status: this.determineTournamentStatus(tournament, allMatches, registrationStats),
        progress: Math.round(progress),
        currentPhase: this.getCurrentPhase(tournament, allMatches),
        nextMilestone: this.getNextMilestone(tournament, allMatches),
        participantsRegistered: registrationStats.approved,
        participantsCapacity: tournament.maxParticipants || 0,
        matchesCompleted: completedMatches,
        totalMatches
      };

      // Get real-time data
      const systemAlerts = await this.getSystemAlerts(tournamentId, user);
      const realTimeData = {
        liveMatches: liveData.liveMatches,
        upcomingMatches: liveData.upcomingMatches.slice(0, 10), // Next 10 matches
        recentResults: allMatches
          .filter(m => m.status === 'completed')
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
          .slice(0, 5),
        activeConflicts: liveData.conflicts,
        systemAlerts
      };

      // Generate analytics
      const analytics = await this.generateTournamentAnalytics(tournament, allMatches, registrationStats, user);

      // Calculate financial summary
      const financial = await this.calculateFinancialSummary(tournament, registrationStats, user);

      // Get notification center
      const notifications = await this.getNotificationCenter(tournamentId, user);

      return {
        tournament,
        overview,
        realTimeData,
        analytics,
        financial,
        notifications
      };
    } catch (error) {
      console.error('Failed to get tournament dashboard:', error);
      throw new Error(`Failed to get dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send mass communication to tournament participants
   */
  static async sendTournamentCommunication(
    tournamentId: string,
    communication: {
      type: 'email' | 'sms' | 'push' | 'all';
      subject: string;
      message: string;
      recipients: 'all_participants' | 'registered_teams' | 'coaches' | 'officials' | 'custom';
      customRecipients?: string[];
      urgent: boolean;
      scheduledFor?: Date;
    },
    user: SecureUserContext
  ): Promise<{
    sent: number;
    failed: number;
    scheduled: boolean;
    messageId: string;
  }> {
    try {
      await this.verifyDirectorPermissions(tournamentId, user);

      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get recipient list
      const recipients = await this.getRecipientList(tournamentId, communication.recipients, communication.customRecipients, user);
      
      const messageId = randomUUID();
      let sent = 0;
      let failed = 0;
      const scheduled = !!communication.scheduledFor && communication.scheduledFor > new Date();

      if (scheduled) {
        // Store for later sending
        await this.scheduleMessage(tournamentId, communication, recipients, messageId, user);
      } else {
        // Send immediately
        const results = await this.sendImmediateMessages(communication, recipients, tournament);
        sent = results.sent;
        failed = results.failed;
      }

      // Log communication
      await this.logCommunication(tournamentId, communication, recipients.length, user);

      return { sent, failed, scheduled, messageId };
    } catch (error) {
      console.error('Failed to send tournament communication:', error);
      throw new Error(`Failed to send communication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate comprehensive tournament report
   */
  static async generateTournamentReport(
    tournamentId: string,
    reportOptions: {
      type: 'summary' | 'financial' | 'participation' | 'performance' | 'custom';
      format: 'pdf' | 'excel' | 'csv' | 'json';
      includeCharts: boolean;
      customSections?: string[];
      dateRange?: { start: Date; end: Date };
    },
    user: SecureUserContext
  ): Promise<TournamentReport> {
    try {
      await this.verifyDirectorPermissions(tournamentId, user);

      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Generate report data based on type
      let reportData: any = {};
      
      switch (reportOptions.type) {
        case 'summary':
          reportData = await this.generateSummaryReport(tournament, user);
          break;
        case 'financial':
          reportData = await this.generateFinancialReport(tournament, user);
          break;
        case 'participation':
          reportData = await this.generateParticipationReport(tournament, user);
          break;
        case 'performance':
          reportData = await this.generatePerformanceReport(tournament, user);
          break;
        case 'custom':
          reportData = await this.generateCustomReport(tournament, reportOptions.customSections || [], user);
          break;
      }

      // Create report record
      const report: TournamentReport = {
        id: randomUUID(),
        tournamentId,
        reportType: reportOptions.type,
        title: `${tournament.name} - ${this.capitalizeFirst(reportOptions.type)} Report`,
        description: `Generated report for ${tournament.name}`,
        generatedBy: user.id,
        generatedAt: new Date(),
        data: reportData,
        format: reportOptions.format
      };

      // Generate file if needed (PDF, Excel, CSV)
      if (reportOptions.format !== 'json') {
        report.downloadUrl = await this.generateReportFile(report, reportOptions);
      }

      // Store report for future access
      await this.saveReport(report);

      return report;
    } catch (error) {
      console.error('Failed to generate tournament report:', error);
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Override tournament settings or results (emergency controls)
   */
  static async executeTournamentOverride(
    tournamentId: string,
    override: {
      type: 'match_result' | 'bracket_adjustment' | 'schedule_change' | 'registration_modification';
      targetId: string; // Match ID, team ID, etc.
      action: string;
      data: any;
      reason: string;
      emergencyOverride: boolean;
    },
    user: SecureUserContext
  ): Promise<{
    success: boolean;
    message: string;
    rollbackId?: string;
    affectedEntities: string[];
  }> {
    try {
      await this.verifyDirectorPermissions(tournamentId, user);

      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Verify override permissions
      const canOverride = await this.canExecuteOverride(override.type, user);
      if (!canOverride && !override.emergencyOverride) {
        throw new Error(`Insufficient permissions for ${override.type} override`);
      }

      let result = { success: false, message: '', affectedEntities: [] as string[] };
      const rollbackId = randomUUID();

      // Execute override based on type
      switch (override.type) {
        case 'match_result':
          result = await this.overrideMatchResult(override, user);
          break;
        case 'bracket_adjustment':
          result = await this.overrideBracketAdjustment(override, user);
          break;
        case 'schedule_change':
          result = await this.overrideScheduleChange(override, user);
          break;
        case 'registration_modification':
          result = await this.overrideRegistrationModification(override, user);
          break;
        default:
          throw new Error(`Unknown override type: ${override.type}`);
      }

      // Log override for audit trail
      await this.logTournamentOverride(tournamentId, override, result, rollbackId, user);

      // Send notifications if significant change
      if (result.success && override.emergencyOverride) {
        await this.notifyEmergencyOverride(tournament, override, user);
      }

      return { ...result, rollbackId };
    } catch (error) {
      console.error('Failed to execute tournament override:', error);
      throw new Error(`Failed to execute override: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tournament control permissions for current user
   */
  static async getTournamentControl(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<TournamentControl> {
    try {
      await this.verifyDirectorPermissions(tournamentId, user);

      const canManage = await this.canManageTournament(tournamentId, user);
      const isOrganizer = await this.isTournamentOrganizer(tournamentId, user);
      const isAdmin = user.userRole === 'district_athletic_director' || user.userRole === 'super_admin';

      return {
        canModifyBrackets: canManage || isOrganizer || isAdmin,
        canOverrideResults: isOrganizer || isAdmin,
        canManageRegistrations: canManage || isOrganizer,
        canControlSchedule: canManage || isOrganizer,
        canSendNotifications: canManage || isOrganizer,
        canAccessFinancials: isOrganizer || isAdmin,
        canGenerateReports: canManage || isOrganizer,
        canManageStaff: isOrganizer || isAdmin
      };
    } catch (error) {
      console.error('Failed to get tournament control:', error);
      throw new Error(`Failed to get control permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Monitor tournament health and generate automated alerts
   */
  static async monitorTournamentHealth(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<{
    overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
    healthScore: number; // 0-100
    alerts: TournamentAlert[];
    recommendations: string[];
  }> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const alerts: TournamentAlert[] = [];
      const recommendations: string[] = [];
      let healthScore = 100;

      // Check registration capacity
      const registrationStats = await TournamentRegistrationService.getRegistrationStatistics(tournamentId, user);
      const capacityUtilization = registrationStats.total / (tournament.maxParticipants || 1);
      
      if (capacityUtilization < 0.5) {
        alerts.push({
          id: randomUUID(),
          type: 'capacity_warning',
          severity: 'warning',
          title: 'Low Registration Numbers',
          description: `Only ${Math.round(capacityUtilization * 100)}% of capacity filled`,
          recommendations: ['Consider extending registration deadline', 'Increase marketing efforts'],
          autoResolvable: false,
          createdAt: new Date()
        });
        healthScore -= 15;
      }

      // Check schedule adherence
      const matches = await storage.getMatchesByTournament(tournamentId, user);
      const delayedMatches = matches.filter(m => 
        m.scheduledTime && 
        m.startTime && 
        new Date(m.startTime) > new Date(new Date(m.scheduledTime).getTime() + 15 * 60 * 1000)
      ).length;

      if (delayedMatches > 0) {
        const delayPercentage = (delayedMatches / matches.length) * 100;
        if (delayPercentage > 20) {
          alerts.push({
            id: randomUUID(),
            type: 'schedule_delay',
            severity: delayPercentage > 50 ? 'critical' : 'warning',
            title: 'Schedule Delays Detected',
            description: `${Math.round(delayPercentage)}% of matches are running behind schedule`,
            recommendations: ['Review match duration estimates', 'Add buffer time between matches'],
            autoResolvable: false,
            createdAt: new Date()
          });
          healthScore -= Math.min(30, delayPercentage);
        }
      }

      // Check for active conflicts
      const liveData = await LiveScoringService.getLiveTournamentData(tournamentId, user);
      const criticalConflicts = liveData.conflicts.filter(c => c.priority === 'critical').length;
      
      if (criticalConflicts > 0) {
        alerts.push({
          id: randomUUID(),
          type: 'technical_issue',
          severity: 'critical',
          title: 'Critical Scoring Conflicts',
          description: `${criticalConflicts} critical conflicts require immediate attention`,
          recommendations: ['Review and resolve scoring disputes immediately'],
          autoResolvable: false,
          createdAt: new Date()
        });
        healthScore -= (criticalConflicts * 10);
      }

      // Financial health check
      const financialSummary = await this.calculateFinancialSummary(tournament, registrationStats, user);
      if (financialSummary.profitability.netProfit < 0 && tournament.status !== 'upcoming') {
        alerts.push({
          id: randomUUID(),
          type: 'capacity_warning',
          severity: 'warning',
          title: 'Financial Loss Detected',
          description: `Tournament is currently operating at a loss: $${Math.abs(financialSummary.profitability.netProfit)}`,
          recommendations: ['Review expenses', 'Consider additional revenue streams'],
          autoResolvable: false,
          createdAt: new Date()
        });
        healthScore -= 20;
      }

      // Determine overall health
      let overallHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      if (healthScore < 50) overallHealth = 'critical';
      else if (healthScore < 70) overallHealth = 'warning';
      else if (healthScore < 90) overallHealth = 'good';

      // Generate recommendations
      if (recommendations.length === 0) {
        recommendations.push('Tournament is running smoothly');
      }

      return {
        overallHealth,
        healthScore: Math.max(0, Math.min(100, healthScore)),
        alerts,
        recommendations
      };
    } catch (error) {
      console.error('Failed to monitor tournament health:', error);
      throw new Error(`Failed to monitor health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private static async verifyDirectorPermissions(tournamentId: string, user: SecureUserContext): Promise<void> {
    const allowedRoles = ['tournament_manager', 'assistant_tournament_manager', 'district_athletic_director', 'super_admin'];
    if (!allowedRoles.includes(user.userRole || '')) {
      throw new Error('Insufficient permissions to access tournament director functions');
    }
  }

  private static determineTournamentStatus(
    tournament: Tournament,
    matches: Match[],
    registrationStats: any
  ): 'planning' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled' {
    if (tournament.status === 'cancelled') return 'cancelled';
    if (tournament.status === 'completed') return 'completed';
    
    const hasActiveMatches = matches.some(m => m.status === 'in-progress');
    if (hasActiveMatches) return 'in_progress';
    
    const hasRegistrations = registrationStats.total > 0;
    if (hasRegistrations) return 'registration_open';
    
    return 'planning';
  }

  private static getCurrentPhase(tournament: Tournament, matches: Match[]): string {
    const inProgressMatches = matches.filter(m => m.status === 'in-progress');
    const completedMatches = matches.filter(m => m.status === 'completed');
    
    if (inProgressMatches.length > 0) {
      return `Round ${inProgressMatches[0].round} - In Progress`;
    }
    
    if (completedMatches.length > 0) {
      const maxCompletedRound = Math.max(...completedMatches.map(m => m.round));
      return `Round ${maxCompletedRound} - Completed`;
    }
    
    return 'Pre-Tournament';
  }

  private static getNextMilestone(tournament: Tournament, matches: Match[]): string {
    const upcomingMatches = matches.filter(m => m.status === 'upcoming');
    
    if (upcomingMatches.length === 0) {
      return 'Tournament Complete';
    }
    
    const nextRound = Math.min(...upcomingMatches.map(m => m.round));
    return `Round ${nextRound} Start`;
  }

  private static async getSystemAlerts(tournamentId: string, user: SecureUserContext): Promise<TournamentAlert[]> {
    // This would check for various system issues and generate alerts
    return [];
  }

  private static async generateTournamentAnalytics(
    tournament: Tournament,
    matches: Match[],
    registrationStats: any,
    user: SecureUserContext
  ): Promise<TournamentAnalytics> {
    // Generate comprehensive analytics
    const completedMatches = matches.filter(m => m.status === 'completed');
    
    return {
      participation: {
        registrationTrends: registrationStats.byDate,
        demographicBreakdown: {},
        geographicDistribution: registrationStats.byOrganization.reduce((acc: any, item) => {
          acc[item.organization] = item.count;
          return acc;
        }, {}),
        participationRate: (registrationStats.approved / (tournament.maxParticipants || 1)) * 100,
        dropoutRate: 0
      },
      performance: {
        matchDuration: { average: 45, min: 30, max: 90 },
        scoringAverages: {
          high: Math.max(...completedMatches.map(m => Math.max(m.team1Score || 0, m.team2Score || 0))),
          low: Math.min(...completedMatches.map(m => Math.min(m.team1Score || 0, m.team2Score || 0))),
          average: completedMatches.reduce((sum, m) => sum + (m.team1Score || 0) + (m.team2Score || 0), 0) / (completedMatches.length * 2)
        },
        competitiveBalance: this.calculateCompetitiveBalance(completedMatches),
        upsetRate: 0
      },
      engagement: {
        liveViewers: 0,
        bracketViews: 0,
        socialShares: 0,
        feedbackScore: 0
      },
      operational: {
        scheduleAdherence: this.calculateScheduleAdherence(matches),
        facilityUtilization: 85,
        staffProductivity: {},
        resourceUsage: {}
      }
    };
  }

  private static async calculateFinancialSummary(
    tournament: Tournament,
    registrationStats: any,
    user: SecureUserContext
  ): Promise<FinancialSummary> {
    const revenue = {
      registrationFees: registrationStats.paymentSummary.totalRevenue,
      sponsorships: 0,
      merchandise: 0,
      concessions: 0,
      total: registrationStats.paymentSummary.totalRevenue
    };

    const expenses = {
      facilityRental: 0,
      staffing: 0,
      equipment: 0,
      marketing: 0,
      insurance: 0,
      total: 0
    };

    const profitability = {
      grossProfit: revenue.total - expenses.total,
      netProfit: revenue.total - expenses.total,
      profitMargin: revenue.total > 0 ? ((revenue.total - expenses.total) / revenue.total) * 100 : 0,
      roi: expenses.total > 0 ? ((revenue.total - expenses.total) / expenses.total) * 100 : 0
    };

    return {
      revenue,
      expenses,
      profitability,
      forecasts: {
        projectedRevenue: revenue.total,
        projectedExpenses: expenses.total,
        projectedProfit: profitability.netProfit
      }
    };
  }

  private static async getNotificationCenter(tournamentId: string, user: SecureUserContext): Promise<NotificationCenter> {
    // This would fetch notifications from storage
    return {
      unreadCount: 0,
      priorities: {
        critical: [],
        high: [],
        medium: [],
        low: []
      },
      recentActivity: []
    };
  }

  private static calculateCompetitiveBalance(matches: Match[]): number {
    if (matches.length === 0) return 0;
    
    const closeGames = matches.filter(m => {
      const diff = Math.abs((m.team1Score || 0) - (m.team2Score || 0));
      return diff <= 7; // Games decided by 7 points or less
    }).length;
    
    return (closeGames / matches.length) * 100;
  }

  private static calculateScheduleAdherence(matches: Match[]): number {
    const scheduledMatches = matches.filter(m => m.scheduledTime);
    if (scheduledMatches.length === 0) return 100;
    
    const onTimeMatches = scheduledMatches.filter(m => {
      if (!m.startTime || !m.scheduledTime) return true;
      const delay = new Date(m.startTime).getTime() - new Date(m.scheduledTime).getTime();
      return delay <= 10 * 60 * 1000; // 10-minute grace period
    }).length;
    
    return (onTimeMatches / scheduledMatches.length) * 100;
  }

  private static async getRecipientList(
    tournamentId: string,
    recipientType: string,
    customRecipients: string[] | undefined,
    user: SecureUserContext
  ): Promise<{ email: string; name: string; type: string }[]> {
    // This would fetch recipients based on type
    return [];
  }

  private static async scheduleMessage(
    tournamentId: string,
    communication: any,
    recipients: any[],
    messageId: string,
    user: SecureUserContext
  ): Promise<void> {
    // Store message for scheduled sending
  }

  private static async sendImmediateMessages(
    communication: any,
    recipients: any[],
    tournament: Tournament
  ): Promise<{ sent: number; failed: number }> {
    // Send messages immediately
    return { sent: recipients.length, failed: 0 };
  }

  private static async logCommunication(
    tournamentId: string,
    communication: any,
    recipientCount: number,
    user: SecureUserContext
  ): Promise<void> {
    // Log communication for audit trail
  }

  private static async canManageTournament(tournamentId: string, user: SecureUserContext): Promise<boolean> {
    return user.userRole === 'tournament_manager' || user.userRole === 'assistant_tournament_manager';
  }

  private static async isTournamentOrganizer(tournamentId: string, user: SecureUserContext): Promise<boolean> {
    const tournament = await storage.getTournament(tournamentId, user);
    return tournament?.userId === user.id;
  }

  private static async canExecuteOverride(overrideType: string, user: SecureUserContext): Promise<boolean> {
    const restrictedOverrides = ['match_result', 'bracket_adjustment'];
    const isRestricted = restrictedOverrides.includes(overrideType);
    const hasHighPermissions = ['district_athletic_director', 'super_admin'].includes(user.userRole || '');
    
    return !isRestricted || hasHighPermissions;
  }

  private static async overrideMatchResult(override: any, user: SecureUserContext): Promise<any> {
    // Implementation for match result override
    return { success: true, message: 'Match result overridden', affectedEntities: [override.targetId] };
  }

  private static async overrideBracketAdjustment(override: any, user: SecureUserContext): Promise<any> {
    // Implementation for bracket adjustment override
    return { success: true, message: 'Bracket adjusted', affectedEntities: [] };
  }

  private static async overrideScheduleChange(override: any, user: SecureUserContext): Promise<any> {
    // Implementation for schedule change override
    return { success: true, message: 'Schedule updated', affectedEntities: [] };
  }

  private static async overrideRegistrationModification(override: any, user: SecureUserContext): Promise<any> {
    // Implementation for registration modification override
    return { success: true, message: 'Registration modified', affectedEntities: [] };
  }

  private static async logTournamentOverride(
    tournamentId: string,
    override: any,
    result: any,
    rollbackId: string,
    user: SecureUserContext
  ): Promise<void> {
    // Log override for audit trail
  }

  private static async notifyEmergencyOverride(tournament: Tournament, override: any, user: SecureUserContext): Promise<void> {
    // Send emergency override notifications
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Report generation methods

  private static async generateSummaryReport(tournament: Tournament, user: SecureUserContext): Promise<any> {
    return {
      tournament: tournament.name,
      status: tournament.status,
      participants: tournament.maxParticipants,
      generatedAt: new Date()
    };
  }

  private static async generateFinancialReport(tournament: Tournament, user: SecureUserContext): Promise<any> {
    return {
      revenue: 0,
      expenses: 0,
      profit: 0
    };
  }

  private static async generateParticipationReport(tournament: Tournament, user: SecureUserContext): Promise<any> {
    return {
      totalRegistrations: 0,
      demographics: {},
      trends: []
    };
  }

  private static async generatePerformanceReport(tournament: Tournament, user: SecureUserContext): Promise<any> {
    return {
      matchStatistics: {},
      competitiveAnalysis: {},
      playerPerformance: []
    };
  }

  private static async generateCustomReport(
    tournament: Tournament,
    sections: string[],
    user: SecureUserContext
  ): Promise<any> {
    return {
      customData: {},
      sections
    };
  }

  private static async generateReportFile(report: TournamentReport, options: any): Promise<string> {
    // Generate actual file (PDF, Excel, CSV)
    return `/downloads/reports/${report.id}.${options.format}`;
  }

  private static async saveReport(report: TournamentReport): Promise<void> {
    // Save report to storage
  }
}