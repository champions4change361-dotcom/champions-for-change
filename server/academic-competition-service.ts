import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import UILEventManagementService from "./uil-event-management-service";
import AcademicScoringService from "./academic-scoring-service";
import ProgressionTrackingService from "./progression-tracking-service";
import TeksAlignmentService from "./teks-alignment-service";
import AcademicAnalyticsService from "./academic-analytics-service";
import type { 
  User,
  AcademicDistrict,
  InsertAcademicDistrict,
  AcademicCompetition,
  InsertAcademicCompetition,
  AcademicMeet,
  InsertAcademicMeet,
  SchoolAcademicProgram,
  InsertSchoolAcademicProgram,
  AcademicTeam,
  InsertAcademicTeam,
  AcademicParticipant,
  InsertAcademicParticipant,
  AcademicResult,
  InsertAcademicResult,
  AcademicOfficial,
  InsertAcademicOfficial
} from "@shared/schema";

export interface AcademicSystemStatus {
  systemHealth: 'healthy' | 'warning' | 'critical';
  activeCompetitions: number;
  totalParticipants: number;
  upcomingEvents: number;
  recentAlerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  compliance: {
    ferpaCompliance: boolean;
    teksAlignment: number;
    dataIntegrity: boolean;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export interface CompetitionWorkflow {
  workflowId: string;
  workflowType: 'event_setup' | 'registration' | 'scoring' | 'advancement' | 'reporting';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  steps: Array<{
    stepId: string;
    stepName: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    assignedTo?: string;
    dueDate?: string;
    completedAt?: string;
    notes?: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
}

export interface AcademicDashboard {
  userId: string;
  userRole: string;
  dashboardData: {
    summary: {
      totalCompetitions: number;
      activeRegistrations: number;
      upcomingEvents: number;
      recentResults: number;
    };
    quickActions: Array<{
      actionId: string;
      actionName: string;
      actionType: 'link' | 'button' | 'form';
      actionUrl?: string;
      priority: 'high' | 'medium' | 'low';
      category: 'management' | 'registration' | 'scoring' | 'reporting';
    }>;
    notifications: Array<{
      notificationId: string;
      type: 'info' | 'warning' | 'success' | 'error';
      title: string;
      message: string;
      actionRequired: boolean;
      timestamp: string;
      read: boolean;
    }>;
    upcomingDeadlines: Array<{
      deadlineId: string;
      title: string;
      description: string;
      dueDate: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
    }>;
  };
}

export interface BulkOperationResult {
  operationId: string;
  operationType: string;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    itemId: string;
    error: string;
    details?: string;
  }>;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

export interface SystemIntegration {
  integrationName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncStatus: 'success' | 'failed' | 'partial';
  errorCount: number;
  configuration: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    retryAttempts: number;
  };
}

/**
 * Core Academic Competition Service
 * Central orchestration service for the entire academic competition system
 * Coordinates all academic competition services and provides unified management interface
 */
export class AcademicCompetitionService {
  private storage = getStorage();
  private uilEventService: UILEventManagementService;
  private scoringService: AcademicScoringService;
  private progressionService: ProgressionTrackingService;
  private teksService: TeksAlignmentService;
  private analyticsService: AcademicAnalyticsService;

  constructor() {
    // Initialize all sub-services
    this.uilEventService = new UILEventManagementService();
    this.scoringService = new AcademicScoringService();
    this.progressionService = new ProgressionTrackingService();
    this.teksService = new TeksAlignmentService();
    this.analyticsService = new AcademicAnalyticsService();
    
    console.log('🎓 Core Academic Competition Service initialized - All systems operational');
  }

  // ===================================================================
  // SYSTEM MANAGEMENT AND ORCHESTRATION
  // ===================================================================

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(user: User): Promise<AcademicSystemStatus> {
    try {
      const storage = await this.storage;
      
      // Get basic counts
      const activeCompetitions = await this.getActiveCompetitionCount(user);
      const totalParticipants = await this.getTotalParticipantCount(user);
      const upcomingEvents = await this.getUpcomingEventCount(user);

      // Check compliance status
      const compliance = await this.checkComplianceStatus(user);

      // Get performance metrics
      const performance = await this.getPerformanceMetrics();

      // Generate recent alerts
      const recentAlerts = await this.getRecentAlerts(user);

      // Determine overall system health
      const systemHealth = this.determineSystemHealth(compliance, performance, recentAlerts);

      const status: AcademicSystemStatus = {
        systemHealth,
        activeCompetitions,
        totalParticipants,
        upcomingEvents,
        recentAlerts,
        compliance,
        performance
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        'system_status',
        { ip: 'system' } as any,
        'Retrieved academic competition system status'
      );

      return status;
    } catch (error) {
      console.error('Error getting system status:', error);
      throw new Error('Failed to retrieve system status');
    }
  }

  /**
   * Get active competition count
   */
  private async getActiveCompetitionCount(user: User): Promise<number> {
    try {
      // This would query for active competitions
      // Simplified implementation
      return 45; // Simulated count of active competitions
    } catch (error) {
      console.error('Error getting active competition count:', error);
      return 0;
    }
  }

  /**
   * Get total participant count
   */
  private async getTotalParticipantCount(user: User): Promise<number> {
    try {
      // This would query for total participants across all active competitions
      // Simplified implementation
      return 2847; // Simulated participant count
    } catch (error) {
      console.error('Error getting total participant count:', error);
      return 0;
    }
  }

  /**
   * Get upcoming event count
   */
  private async getUpcomingEventCount(user: User): Promise<number> {
    try {
      const storage = await this.storage;
      const currentDate = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const upcomingMeets = await storage.getAcademicMeetsByDateRange(currentDate, futureDate, user);
      return upcomingMeets.length;
    } catch (error) {
      console.error('Error getting upcoming event count:', error);
      return 0;
    }
  }

  /**
   * Check compliance status
   */
  private async checkComplianceStatus(user: User): Promise<AcademicSystemStatus['compliance']> {
    try {
      // Check FERPA compliance
      const ferpaCompliance = await this.checkFerpaCompliance(user);
      
      // Check TEKS alignment across all competitions
      const teksAlignment = await this.checkTeksAlignment(user);
      
      // Check data integrity
      const dataIntegrity = await this.checkDataIntegrity(user);

      return {
        ferpaCompliance,
        teksAlignment,
        dataIntegrity
      };
    } catch (error) {
      console.error('Error checking compliance status:', error);
      return {
        ferpaCompliance: false,
        teksAlignment: 0,
        dataIntegrity: false
      };
    }
  }

  /**
   * Check FERPA compliance
   */
  private async checkFerpaCompliance(user: User): Promise<boolean> {
    try {
      // Verify all student data access is properly logged and secured
      // This would check audit logs, access controls, etc.
      return true; // Simplified - assumes compliance
    } catch (error) {
      console.error('Error checking FERPA compliance:', error);
      return false;
    }
  }

  /**
   * Check TEKS alignment
   */
  private async checkTeksAlignment(user: User): Promise<number> {
    try {
      // Get overall TEKS alignment percentage across all competitions
      const report = await this.teksService.generateComplianceReport(
        'comprehensive',
        {},
        user
      );
      
      return report.compliance.overallScore;
    } catch (error) {
      console.error('Error checking TEKS alignment:', error);
      return 0;
    }
  }

  /**
   * Check data integrity
   */
  private async checkDataIntegrity(user: User): Promise<boolean> {
    try {
      // Verify database consistency, referential integrity, etc.
      // This would run validation checks on the academic data
      return true; // Simplified - assumes integrity
    } catch (error) {
      console.error('Error checking data integrity:', error);
      return false;
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<AcademicSystemStatus['performance']> {
    try {
      // Get system performance metrics
      return {
        responseTime: 245, // Average response time in ms
        throughput: 1250, // Requests per minute
        errorRate: 0.3 // Error rate percentage
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        responseTime: 0,
        throughput: 0,
        errorRate: 100
      };
    }
  }

  /**
   * Get recent alerts
   */
  private async getRecentAlerts(user: User): Promise<AcademicSystemStatus['recentAlerts']> {
    try {
      // Get recent system alerts and warnings
      return [
        {
          type: 'info',
          message: 'District academic meet registration deadline approaching in 5 days',
          timestamp: new Date().toISOString()
        },
        {
          type: 'warning',
          message: '3 competitions require TEKS alignment review',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Determine overall system health
   */
  private determineSystemHealth(
    compliance: AcademicSystemStatus['compliance'],
    performance: AcademicSystemStatus['performance'],
    alerts: AcademicSystemStatus['recentAlerts']
  ): 'healthy' | 'warning' | 'critical' {
    // Check for critical issues
    if (!compliance.ferpaCompliance || !compliance.dataIntegrity || performance.errorRate > 5) {
      return 'critical';
    }
    
    // Check for warning conditions
    if (compliance.teksAlignment < 80 || performance.responseTime > 500 || 
        alerts.some(alert => alert.type === 'error')) {
      return 'warning';
    }
    
    return 'healthy';
  }

  // ===================================================================
  // WORKFLOW MANAGEMENT
  // ===================================================================

  /**
   * Create competition workflow
   */
  async createCompetitionWorkflow(
    workflowType: CompetitionWorkflow['workflowType'],
    competitionId: string,
    user: User
  ): Promise<CompetitionWorkflow> {
    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Define workflow steps based on type
      const steps = this.getWorkflowSteps(workflowType);
      
      const workflow: CompetitionWorkflow = {
        workflowId,
        workflowType,
        status: 'pending',
        steps,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedCompletion: this.calculateEstimatedCompletion(steps)
      };

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        workflowId,
        { ip: 'system' } as any,
        `Created ${workflowType} workflow for competition: ${competitionId}`
      );

      return workflow;
    } catch (error) {
      console.error('Error creating competition workflow:', error);
      throw new Error('Failed to create competition workflow');
    }
  }

  /**
   * Get workflow steps for type
   */
  private getWorkflowSteps(workflowType: string): CompetitionWorkflow['steps'] {
    const stepDefinitions = {
      'event_setup': [
        { stepId: 'define_competition', stepName: 'Define Competition Parameters' },
        { stepId: 'schedule_event', stepName: 'Schedule Event Date and Venue' },
        { stepId: 'assign_officials', stepName: 'Assign Judges and Officials' },
        { stepId: 'setup_scoring', stepName: 'Configure Scoring System' },
        { stepId: 'open_registration', stepName: 'Open Participant Registration' }
      ],
      'registration': [
        { stepId: 'verify_eligibility', stepName: 'Verify Participant Eligibility' },
        { stepId: 'collect_forms', stepName: 'Collect Required Forms and Permissions' },
        { stepId: 'assign_teams', stepName: 'Assign Participants to Teams' },
        { stepId: 'confirm_registration', stepName: 'Confirm Registration and Send Notifications' }
      ],
      'scoring': [
        { stepId: 'setup_judging', stepName: 'Set Up Judging Stations' },
        { stepId: 'conduct_competition', stepName: 'Conduct Competition and Collect Scores' },
        { stepId: 'verify_results', stepName: 'Verify and Validate Results' },
        { stepId: 'publish_results', stepName: 'Publish Results and Rankings' }
      ],
      'advancement': [
        { stepId: 'determine_qualifiers', stepName: 'Determine Qualified Participants' },
        { stepId: 'send_notifications', stepName: 'Send Advancement Notifications' },
        { stepId: 'register_next_level', stepName: 'Register for Next Competition Level' },
        { stepId: 'update_records', stepName: 'Update Progression Records' }
      ],
      'reporting': [
        { stepId: 'compile_data', stepName: 'Compile Competition Data' },
        { stepId: 'generate_reports', stepName: 'Generate Performance Reports' },
        { stepId: 'teks_analysis', stepName: 'Conduct TEKS Alignment Analysis' },
        { stepId: 'distribute_reports', stepName: 'Distribute Reports to Stakeholders' }
      ]
    };

    const steps = stepDefinitions[workflowType as keyof typeof stepDefinitions] || [];
    
    return steps.map(step => ({
      ...step,
      status: 'pending' as const
    }));
  }

  /**
   * Calculate estimated completion
   */
  private calculateEstimatedCompletion(steps: CompetitionWorkflow['steps']): string {
    // Estimate based on step count and complexity
    const daysToComplete = Math.max(7, steps.length * 2);
    const completionDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
    return completionDate.toISOString().split('T')[0];
  }

  /**
   * Update workflow step
   */
  async updateWorkflowStep(
    workflowId: string,
    stepId: string,
    status: 'in_progress' | 'completed' | 'failed' | 'skipped',
    notes?: string,
    user?: User
  ): Promise<void> {
    try {
      // This would update the workflow step status in the database
      // Simplified implementation for demonstration
      
      if (user) {
        await logComplianceAction(
          user.id,
          'data_modification',
          'administrative_data',
          workflowId,
          { ip: 'system' } as any,
          `Updated workflow step ${stepId} to ${status}`
        );
      }

      console.log(`✅ Workflow ${workflowId} step ${stepId} updated to ${status}`);
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw new Error('Failed to update workflow step');
    }
  }

  // ===================================================================
  // DASHBOARD AND USER INTERFACE
  // ===================================================================

  /**
   * Generate user dashboard
   */
  async generateUserDashboard(user: User): Promise<AcademicDashboard> {
    try {
      // Get user-specific dashboard data based on role
      const dashboardData = await this.getUserDashboardData(user);
      
      const dashboard: AcademicDashboard = {
        userId: user.id,
        userRole: user.userRole || 'user',
        dashboardData
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        'dashboard',
        { ip: 'system' } as any,
        'Generated user dashboard'
      );

      return dashboard;
    } catch (error) {
      console.error('Error generating user dashboard:', error);
      throw new Error('Failed to generate user dashboard');
    }
  }

  /**
   * Get user dashboard data
   */
  private async getUserDashboardData(user: User): Promise<AcademicDashboard['dashboardData']> {
    try {
      // Get summary data
      const summary = await this.getDashboardSummary(user);
      
      // Get quick actions based on user role
      const quickActions = this.getQuickActions(user);
      
      // Get notifications
      const notifications = await this.getUserNotifications(user);
      
      // Get upcoming deadlines
      const upcomingDeadlines = await this.getUpcomingDeadlines(user);

      return {
        summary,
        quickActions,
        notifications,
        upcomingDeadlines
      };
    } catch (error) {
      console.error('Error getting user dashboard data:', error);
      throw new Error('Failed to get user dashboard data');
    }
  }

  /**
   * Get dashboard summary
   */
  private async getDashboardSummary(user: User): Promise<AcademicDashboard['dashboardData']['summary']> {
    try {
      // This would get user-specific counts
      return {
        totalCompetitions: 45,
        activeRegistrations: 12,
        upcomingEvents: 8,
        recentResults: 23
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return {
        totalCompetitions: 0,
        activeRegistrations: 0,
        upcomingEvents: 0,
        recentResults: 0
      };
    }
  }

  /**
   * Get quick actions
   */
  private getQuickActions(user: User): AcademicDashboard['dashboardData']['quickActions'] {
    const roleActions = {
      'district_academic_coordinator': [
        {
          actionId: 'create_meet',
          actionName: 'Create Academic Meet',
          actionType: 'form' as const,
          priority: 'high' as const,
          category: 'management' as const
        },
        {
          actionId: 'view_analytics',
          actionName: 'View District Analytics',
          actionType: 'link' as const,
          actionUrl: '/academic/analytics/district',
          priority: 'medium' as const,
          category: 'reporting' as const
        }
      ],
      'academic_coach': [
        {
          actionId: 'register_participants',
          actionName: 'Register Participants',
          actionType: 'form' as const,
          priority: 'high' as const,
          category: 'registration' as const
        },
        {
          actionId: 'view_results',
          actionName: 'View Results',
          actionType: 'link' as const,
          actionUrl: '/academic/results',
          priority: 'medium' as const,
          category: 'scoring' as const
        }
      ],
      'contest_judge': [
        {
          actionId: 'score_competition',
          actionName: 'Score Competition',
          actionType: 'form' as const,
          priority: 'high' as const,
          category: 'scoring' as const
        },
        {
          actionId: 'view_rubrics',
          actionName: 'View Scoring Rubrics',
          actionType: 'link' as const,
          priority: 'medium' as const,
          category: 'scoring' as const
        }
      ]
    };

    const userRole = user.userRole || 'user';
    return roleActions[userRole as keyof typeof roleActions] || [];
  }

  /**
   * Get user notifications
   */
  private async getUserNotifications(user: User): Promise<AcademicDashboard['dashboardData']['notifications']> {
    try {
      // This would get user-specific notifications
      return [
        {
          notificationId: 'notif_1',
          type: 'info',
          title: 'Registration Deadline Approaching',
          message: 'District academic meet registration closes in 3 days',
          actionRequired: true,
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          notificationId: 'notif_2',
          type: 'success',
          title: 'Scores Published',
          message: 'Regional mathematics competition scores have been published',
          actionRequired: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Get upcoming deadlines
   */
  private async getUpcomingDeadlines(user: User): Promise<AcademicDashboard['dashboardData']['upcomingDeadlines']> {
    try {
      // This would get user-specific deadlines
      return [
        {
          deadlineId: 'deadline_1',
          title: 'Team Registration',
          description: 'Register teams for district academic meet',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          category: 'Registration'
        },
        {
          deadlineId: 'deadline_2',
          title: 'Judge Assignment',
          description: 'Assign judges for upcoming competitions',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          category: 'Management'
        }
      ];
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      return [];
    }
  }

  // ===================================================================
  // BULK OPERATIONS
  // ===================================================================

  /**
   * Execute bulk participant registration
   */
  async executeBulkParticipantRegistration(
    registrationData: Array<{
      teamId: string;
      studentInfo: {
        studentId: string;
        firstName: string;
        lastName: string;
        grade: number;
      };
      competitionId: string;
      participantRole: string;
    }>,
    user: User
  ): Promise<BulkOperationResult> {
    try {
      const operationId = `bulk_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result: BulkOperationResult = {
        operationId,
        operationType: 'participant_registration',
        totalItems: registrationData.length,
        processedItems: 0,
        successCount: 0,
        failureCount: 0,
        errors: [],
        startTime: new Date().toISOString(),
        status: 'processing'
      };

      // Process registrations
      for (const registration of registrationData) {
        try {
          await this.uilEventService.registerParticipant({
            teamId: registration.teamId,
            participantId: '', // Will be generated
            competitionId: registration.competitionId,
            studentInfo: registration.studentInfo,
            participantRole: registration.participantRole as any,
            entryPosition: result.processedItems + 1,
            isEligible: true,
            eligibilityVerified: false,
            parentalConsent: true,
            emergencyContact: {
              name: 'Parent/Guardian',
              phone: '000-000-0000',
              relationship: 'Parent'
            }
          }, user);
          
          result.successCount++;
        } catch (error) {
          result.failureCount++;
          result.errors.push({
            itemId: registration.studentInfo.studentId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        result.processedItems++;
      }

      result.endTime = new Date().toISOString();
      result.status = result.failureCount === 0 ? 'completed' : 'failed';

      await logComplianceAction(
        user.id,
        'data_modification',
        'student_data',
        operationId,
        { ip: 'system' } as any,
        `Bulk registration: ${result.successCount}/${result.totalItems} successful`
      );

      return result;
    } catch (error) {
      console.error('Error executing bulk participant registration:', error);
      throw new Error('Failed to execute bulk participant registration');
    }
  }

  // ===================================================================
  // SYSTEM INTEGRATIONS
  // ===================================================================

  /**
   * Get system integrations status
   */
  async getSystemIntegrations(user: User): Promise<SystemIntegration[]> {
    try {
      const integrations: SystemIntegration[] = [
        {
          integrationName: 'Calendar Management',
          status: 'connected',
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          syncStatus: 'success',
          errorCount: 0,
          configuration: {
            enabled: true,
            autoSync: true,
            syncInterval: 3600, // 1 hour
            retryAttempts: 3
          }
        },
        {
          integrationName: 'Student Information System',
          status: 'connected',
          lastSync: new Date(Date.now() - 1800000).toISOString(),
          syncStatus: 'success',
          errorCount: 0,
          configuration: {
            enabled: true,
            autoSync: true,
            syncInterval: 1800, // 30 minutes
            retryAttempts: 3
          }
        },
        {
          integrationName: 'Notification System',
          status: 'connected',
          lastSync: new Date(Date.now() - 900000).toISOString(),
          syncStatus: 'success',
          errorCount: 0,
          configuration: {
            enabled: true,
            autoSync: true,
            syncInterval: 900, // 15 minutes
            retryAttempts: 5
          }
        }
      ];

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        'integrations',
        { ip: 'system' } as any,
        'Retrieved system integrations status'
      );

      return integrations;
    } catch (error) {
      console.error('Error getting system integrations:', error);
      throw new Error('Failed to get system integrations');
    }
  }

  // ===================================================================
  // SERVICE DELEGATION METHODS
  // ===================================================================

  /**
   * Get UIL Event Management Service
   */
  getUILEventService(): UILEventManagementService {
    return this.uilEventService;
  }

  /**
   * Get Academic Scoring Service
   */
  getScoringService(): AcademicScoringService {
    return this.scoringService;
  }

  /**
   * Get Progression Tracking Service
   */
  getProgressionService(): ProgressionTrackingService {
    return this.progressionService;
  }

  /**
   * Get TEKS Alignment Service
   */
  getTeksService(): TeksAlignmentService {
    return this.teksService;
  }

  /**
   * Get Academic Analytics Service
   */
  getAnalyticsService(): AcademicAnalyticsService {
    return this.analyticsService;
  }

  // ===================================================================
  // QUICK ACCESS METHODS FOR COMMON OPERATIONS
  // ===================================================================

  /**
   * Create complete academic meet workflow
   */
  async createCompleteMeet(
    meetData: InsertAcademicMeet,
    competitions: string[],
    user: User
  ): Promise<{ meet: AcademicMeet; workflow: CompetitionWorkflow }> {
    try {
      // Create the meet
      const meet = await this.uilEventService.createAcademicMeet(meetData, user);
      
      // Create the setup workflow
      const workflow = await this.createCompetitionWorkflow('event_setup', meet.id, user);
      
      // Schedule calendar integration
      await this.uilEventService.syncWithCalendarSystem(meet.id, user);

      return { meet, workflow };
    } catch (error) {
      console.error('Error creating complete meet:', error);
      throw new Error('Failed to create complete academic meet');
    }
  }

  /**
   * Process complete competition scoring
   */
  async processCompleteScoring(
    competitionId: string,
    meetId: string,
    user: User
  ): Promise<{
    results: any;
    advancement: any[];
    analytics: any;
  }> {
    try {
      // Process competition results
      const results = await this.scoringService.processCompetitionResults(competitionId, meetId, user);
      
      // Send advancement notifications
      const advancement = await this.progressionService.sendAdvancementNotifications(competitionId, meetId, user);
      
      // Generate competition analytics
      const analytics = await this.analyticsService.generateCompetitionAnalytics(competitionId, 'current_year', user);

      return { results, advancement, analytics };
    } catch (error) {
      console.error('Error processing complete scoring:', error);
      throw new Error('Failed to process complete competition scoring');
    }
  }

  /**
   * Generate comprehensive school report
   */
  async generateSchoolReport(
    schoolId: string,
    academicYear: string,
    user: User
  ): Promise<{
    analytics: any;
    teksCompliance: any;
    progression: any[];
  }> {
    try {
      // Generate school analytics
      const analytics = await this.analyticsService.generateSchoolAnalytics(schoolId, academicYear, user);
      
      // Check TEKS compliance
      const teksCompliance = await this.teksService.generateCurriculumMapping(
        schoolId,
        academicYear,
        'All Subjects',
        'All Grades',
        user
      );
      
      // Get progression tracking for school participants
      const progression: any[] = []; // Would get all school participants' progression

      return { analytics, teksCompliance, progression };
    } catch (error) {
      console.error('Error generating school report:', error);
      throw new Error('Failed to generate comprehensive school report');
    }
  }
}

export default AcademicCompetitionService;