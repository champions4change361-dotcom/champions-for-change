/**
 * Comprehensive Tournament Registration Service
 * Handles team registration, eligibility verification, payment integration, and roster management
 * Integrates with existing RBAC system and payment processing
 */

import { randomUUID } from "crypto";
import { storage, type SecureUserContext } from "./storage";
import { stripe } from "./nonprofitStripeConfig";
import { emailService } from "./emailService";
import type {
  Tournament,
  Team,
  InsertTeam,
  TeamRegistration,
  InsertTeamRegistration,
  TournamentRegistrationForm,
  InsertTournamentRegistrationForm,
  RegistrationSubmission,
  InsertRegistrationSubmission,
  TeamPlayer,
  InsertTeamPlayer,
  User
} from "@shared/schema";

export interface RegistrationEligibility {
  isEligible: boolean;
  reasons: string[];
  requirements: {
    ageRequirement?: { min?: number; max?: number; met: boolean };
    genderRequirement?: { required?: string; met: boolean };
    skillLevelRequirement?: { required?: string; met: boolean };
    geographicRequirement?: { allowed?: string[]; met: boolean };
    membershipRequirement?: { required: boolean; met: boolean };
    medicalRequirement?: { required: boolean; met: boolean };
    insuranceRequirement?: { required: boolean; met: boolean };
  };
}

export interface RegistrationPayment {
  amount: number;
  currency: string;
  description: string;
  fees?: {
    entryFee: number;
    processingFee: number;
    platformFee: number;
    facilityFee?: number;
  };
  deadlines?: {
    earlyBird?: Date;
    regular: Date;
    late?: Date;
  };
  methods: Array<'stripe' | 'paypal' | 'check' | 'bank_transfer'>;
}

export interface TeamRoster {
  teamId: string;
  players: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth: Date;
    position?: string;
    jerseyNumber?: string;
    isStarter: boolean;
    eligibilityStatus: 'verified' | 'pending' | 'denied';
    medicalClearance?: boolean;
    guardianConsent?: boolean;
    documents?: Array<{
      type: string;
      url: string;
      verified: boolean;
    }>;
  }>;
  coaches: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'head_coach' | 'assistant_coach' | 'trainer';
    certifications?: string[];
    backgroundCheck?: boolean;
  }>;
}

export interface RegistrationFormTemplate {
  templateId: string;
  name: string;
  description: string;
  fields: Array<{
    fieldId: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'file';
    required: boolean;
    options?: string[];
    validation?: {
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
  }>;
  sportSpecific: boolean;
  ageGroupSpecific: boolean;
}

export interface RegistrationWorkflow {
  registrationId: string;
  currentStep: string;
  steps: Array<{
    stepId: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    required: boolean;
    data?: any;
  }>;
  approvals?: Array<{
    type: string;
    approver: string;
    status: 'pending' | 'approved' | 'denied';
    comments?: string;
    timestamp?: Date;
  }>;
}

export class TournamentRegistrationService {

  /**
   * Create a comprehensive registration form for a tournament
   */
  static async createRegistrationForm(
    tournamentId: string,
    formData: {
      title: string;
      description?: string;
      template?: RegistrationFormTemplate;
      customFields?: any[];
      eligibilityRules?: any;
      paymentSettings?: RegistrationPayment;
      deadlines?: {
        registrationOpen: Date;
        registrationClose: Date;
        rosterLock?: Date;
        paymentDue?: Date;
      };
    },
    user: SecureUserContext
  ): Promise<TournamentRegistrationForm> {
    try {
      // Verify tournament exists and user has permission
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Create registration form
      const formFields = formData.template?.fields || formData.customFields || [];
      
      const registrationForm: InsertTournamentRegistrationForm = {
        tournamentId,
        organizerId: user.id,
        title: formData.title,
        description: formData.description || '',
        formFields: formFields,
        eligibilityRules: formData.eligibilityRules || {},
        paymentSettings: formData.paymentSettings || null,
        deadlines: formData.deadlines || null,
        isActive: true,
        maxRegistrations: tournament.maxParticipants || null,
        currentRegistrations: 0,
        autoApproval: false, // Require manual approval by default
        notificationSettings: {
          notifyOnRegistration: true,
          notifyOnApproval: true,
          notifyOnPayment: true,
          sendConfirmationEmail: true
        }
      };

      const form = await storage.createTournamentRegistrationForm(registrationForm);

      // Send notification to tournament organizers
      await this.notifyFormCreated(form, tournament, user);

      return form;
    } catch (error) {
      console.error('Registration form creation failed:', error);
      throw new Error(`Failed to create registration form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit team registration with comprehensive validation
   */
  static async submitTeamRegistration(
    formId: string,
    registrationData: {
      teamName: string;
      organizationName?: string;
      contactInfo: {
        primaryContact: string;
        email: string;
        phone: string;
      };
      roster?: TeamRoster;
      customResponses?: Record<string, any>;
      waiverSigned?: boolean;
      agreementAccepted?: boolean;
    },
    user?: SecureUserContext
  ): Promise<{
    submission: RegistrationSubmission;
    workflow: RegistrationWorkflow;
    paymentRequired: boolean;
    paymentAmount?: number;
    eligibilityCheck: RegistrationEligibility;
  }> {
    try {
      // Get registration form
      const form = await storage.getTournamentRegistrationForm(formId);
      if (!form) {
        throw new Error('Registration form not found');
      }

      const tournament = await storage.getTournament(form.tournamentId, user || { id: 'guest' } as SecureUserContext);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Validate registration is still open
      await this.validateRegistrationDeadlines(form);

      // Check registration capacity
      if (form.maxRegistrations && form.currentRegistrations >= form.maxRegistrations) {
        throw new Error('Registration is full');
      }

      // Validate form data
      await this.validateRegistrationData(form, registrationData);

      // Perform eligibility check
      const eligibilityCheck = await this.checkEligibility(form, registrationData, tournament);
      
      if (!eligibilityCheck.isEligible && !form.allowConditionalRegistration) {
        throw new Error(`Registration denied: ${eligibilityCheck.reasons.join(', ')}`);
      }

      // Create registration submission
      const submissionData: InsertRegistrationSubmission = {
        formId,
        tournamentId: form.tournamentId,
        participantName: registrationData.teamName,
        contactEmail: registrationData.contactInfo.email,
        contactPhone: registrationData.contactInfo.phone,
        organizationName: registrationData.organizationName,
        submissionData: {
          teamName: registrationData.teamName,
          contactInfo: registrationData.contactInfo,
          roster: registrationData.roster,
          customResponses: registrationData.customResponses,
          waiverSigned: registrationData.waiverSigned,
          agreementAccepted: registrationData.agreementAccepted
        },
        eligibilityStatus: eligibilityCheck.isEligible ? 'verified' : 'pending',
        approvalStatus: form.autoApproval && eligibilityCheck.isEligible ? 'approved' : 'pending',
        paymentStatus: 'pending',
        userId: user?.id || null
      };

      const submission = await storage.createRegistrationSubmission(submissionData);

      // Create registration workflow
      const workflow = await this.createRegistrationWorkflow(submission, form, eligibilityCheck);

      // Handle payment processing if required
      const paymentRequired = !!form.paymentSettings && form.paymentSettings.amount > 0;
      const paymentAmount = paymentRequired ? form.paymentSettings.amount : undefined;

      // Send confirmation email
      await this.sendRegistrationConfirmation(submission, form, tournament, user);

      // Update registration count
      await storage.updateTournamentRegistrationForm(formId, {
        currentRegistrations: (form.currentRegistrations || 0) + 1
      });

      // Notify organizers if manual approval required
      if (!form.autoApproval) {
        await this.notifyOrganizersOfRegistration(submission, form, tournament);
      }

      return {
        submission,
        workflow,
        paymentRequired,
        paymentAmount,
        eligibilityCheck
      };
    } catch (error) {
      console.error('Team registration submission failed:', error);
      throw new Error(`Failed to submit registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process registration payment
   */
  static async processRegistrationPayment(
    submissionId: string,
    paymentData: {
      method: 'stripe' | 'paypal' | 'check' | 'bank_transfer';
      stripePaymentMethodId?: string;
      amount: number;
      currency?: string;
    },
    user?: SecureUserContext
  ): Promise<{
    paymentId: string;
    status: 'succeeded' | 'pending' | 'failed';
    receiptUrl?: string;
  }> {
    try {
      const submission = await storage.getRegistrationSubmission(submissionId);
      if (!submission) {
        throw new Error('Registration submission not found');
      }

      const form = await storage.getTournamentRegistrationForm(submission.formId);
      if (!form || !form.paymentSettings) {
        throw new Error('Payment not required for this registration');
      }

      // Validate payment amount
      if (paymentData.amount !== form.paymentSettings.amount) {
        throw new Error('Invalid payment amount');
      }

      let paymentResult;
      let receiptUrl: string | undefined;

      // Process payment based on method
      switch (paymentData.method) {
        case 'stripe':
          if (!paymentData.stripePaymentMethodId) {
            throw new Error('Stripe payment method ID required');
          }

          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(paymentData.amount * 100), // Stripe expects cents
            currency: paymentData.currency || 'usd',
            payment_method: paymentData.stripePaymentMethodId,
            confirm: true,
            description: `Tournament Registration: ${form.title}`,
            metadata: {
              submissionId,
              tournamentId: submission.tournamentId,
              userId: user?.id || 'guest'
            }
          });

          paymentResult = {
            paymentId: paymentIntent.id,
            status: paymentIntent.status as 'succeeded' | 'pending' | 'failed',
          };

          if (paymentIntent.charges?.data[0]?.receipt_url) {
            receiptUrl = paymentIntent.charges.data[0].receipt_url;
          }
          break;

        case 'check':
        case 'bank_transfer':
          // Manual payment - mark as pending
          paymentResult = {
            paymentId: `manual_${randomUUID()}`,
            status: 'pending' as const
          };
          break;

        default:
          throw new Error(`Payment method ${paymentData.method} not supported`);
      }

      // Update submission with payment info
      await storage.updateRegistrationSubmission(submissionId, {
        paymentStatus: paymentResult.status === 'succeeded' ? 'paid' : 'pending',
        paymentMethod: paymentData.method,
        paymentId: paymentResult.paymentId,
        paymentAmount: paymentData.amount,
        paidAt: paymentResult.status === 'succeeded' ? new Date() : null
      });

      // If payment succeeded and registration was approved, finalize registration
      if (paymentResult.status === 'succeeded' && submission.approvalStatus === 'approved') {
        await this.finalizeRegistration(submissionId, user);
      }

      // Send payment confirmation
      await this.sendPaymentConfirmation(submission, paymentResult, receiptUrl);

      return {
        ...paymentResult,
        receiptUrl
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve or deny registration submission
   */
  static async updateRegistrationApproval(
    submissionId: string,
    decision: {
      status: 'approved' | 'denied' | 'conditional';
      comments?: string;
      conditions?: string[];
      approvedBy: string;
    },
    user: SecureUserContext
  ): Promise<RegistrationSubmission> {
    try {
      const submission = await storage.getRegistrationSubmission(submissionId);
      if (!submission) {
        throw new Error('Registration submission not found');
      }

      const updateData = {
        approvalStatus: decision.status,
        approvalComments: decision.comments,
        approvalConditions: decision.conditions,
        approvedBy: decision.approvedBy,
        approvedAt: decision.status === 'approved' ? new Date() : null
      };

      const updatedSubmission = await storage.updateRegistrationSubmission(submissionId, updateData);
      if (!updatedSubmission) {
        throw new Error('Failed to update registration');
      }

      // If approved and payment is complete, finalize registration
      if (decision.status === 'approved' && submission.paymentStatus === 'paid') {
        await this.finalizeRegistration(submissionId, user);
      }

      // Send approval notification
      await this.sendApprovalNotification(updatedSubmission, decision);

      return updatedSubmission;
    } catch (error) {
      console.error('Registration approval update failed:', error);
      throw new Error(`Failed to update registration approval: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Manage team roster for registered teams
   */
  static async updateTeamRoster(
    submissionId: string,
    roster: TeamRoster,
    user: SecureUserContext
  ): Promise<{ roster: TeamRoster; eligibilityUpdated: boolean }> {
    try {
      const submission = await storage.getRegistrationSubmission(submissionId);
      if (!submission) {
        throw new Error('Registration submission not found');
      }

      // Verify user has permission to update roster
      if (submission.userId !== user.id && !await this.canManageRegistration(submission, user)) {
        throw new Error('Permission denied to update roster');
      }

      const form = await storage.getTournamentRegistrationForm(submission.formId);
      if (!form) {
        throw new Error('Registration form not found');
      }

      // Validate roster rules (team size, positions, etc.)
      await this.validateRosterRules(roster, form);

      // Update submission with new roster
      const updatedData = {
        ...submission.submissionData,
        roster
      };

      await storage.updateRegistrationSubmission(submissionId, {
        submissionData: updatedData
      });

      // Re-check eligibility with new roster
      const tournament = await storage.getTournament(form.tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const newEligibilityCheck = await this.checkEligibility(
        form, 
        { ...submission.submissionData, roster }, 
        tournament
      );

      const eligibilityUpdated = newEligibilityCheck.isEligible !== 
        (submission.eligibilityStatus === 'verified');

      if (eligibilityUpdated) {
        await storage.updateRegistrationSubmission(submissionId, {
          eligibilityStatus: newEligibilityCheck.isEligible ? 'verified' : 'pending'
        });

        // Notify if eligibility status changed
        await this.sendEligibilityUpdateNotification(submission, newEligibilityCheck);
      }

      return { roster, eligibilityUpdated };
    } catch (error) {
      console.error('Roster update failed:', error);
      throw new Error(`Failed to update team roster: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive registration statistics
   */
  static async getRegistrationStatistics(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<{
    total: number;
    approved: number;
    pending: number;
    denied: number;
    paid: number;
    unpaid: number;
    byDate: Array<{ date: string; count: number }>;
    byOrganization: Array<{ organization: string; count: number }>;
    paymentSummary: {
      totalRevenue: number;
      pendingPayments: number;
      refunds: number;
    };
  }> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const submissions = await storage.getRegistrationSubmissionsByTournament(tournamentId);

      const stats = {
        total: submissions.length,
        approved: submissions.filter(s => s.approvalStatus === 'approved').length,
        pending: submissions.filter(s => s.approvalStatus === 'pending').length,
        denied: submissions.filter(s => s.approvalStatus === 'denied').length,
        paid: submissions.filter(s => s.paymentStatus === 'paid').length,
        unpaid: submissions.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'failed').length,
        byDate: this.calculateRegistrationsByDate(submissions),
        byOrganization: this.calculateRegistrationsByOrganization(submissions),
        paymentSummary: this.calculatePaymentSummary(submissions)
      };

      return stats;
    } catch (error) {
      console.error('Registration statistics calculation failed:', error);
      throw new Error(`Failed to get registration statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private static async validateRegistrationDeadlines(form: TournamentRegistrationForm): Promise<void> {
    const now = new Date();
    
    if (form.deadlines?.registrationOpen && now < new Date(form.deadlines.registrationOpen)) {
      throw new Error('Registration has not opened yet');
    }
    
    if (form.deadlines?.registrationClose && now > new Date(form.deadlines.registrationClose)) {
      throw new Error('Registration deadline has passed');
    }
  }

  private static async validateRegistrationData(
    form: TournamentRegistrationForm,
    data: any
  ): Promise<void> {
    // Validate required fields
    for (const field of form.formFields || []) {
      if (field.required && !data.customResponses?.[field.fieldId]) {
        throw new Error(`Required field missing: ${field.label}`);
      }
    }

    // Validate team name
    if (!data.teamName || data.teamName.trim().length === 0) {
      throw new Error('Team name is required');
    }

    // Validate contact information
    if (!data.contactInfo?.email) {
      throw new Error('Contact email is required');
    }

    if (!data.contactInfo?.phone) {
      throw new Error('Contact phone is required');
    }

    // Validate waivers and agreements
    if (form.requireWaiverSignature && !data.waiverSigned) {
      throw new Error('Waiver signature is required');
    }

    if (form.requireAgreementAcceptance && !data.agreementAccepted) {
      throw new Error('Terms agreement acceptance is required');
    }
  }

  private static async checkEligibility(
    form: TournamentRegistrationForm,
    registrationData: any,
    tournament: Tournament
  ): Promise<RegistrationEligibility> {
    const eligibility: RegistrationEligibility = {
      isEligible: true,
      reasons: [],
      requirements: {}
    };

    const rules = form.eligibilityRules || {};

    // Age requirement check
    if (rules.ageRequirement) {
      const ageCheck = this.checkAgeRequirement(registrationData.roster, rules.ageRequirement);
      eligibility.requirements.ageRequirement = ageCheck;
      if (!ageCheck.met) {
        eligibility.isEligible = false;
        eligibility.reasons.push('Age requirement not met');
      }
    }

    // Gender requirement check
    if (rules.genderRequirement) {
      const genderCheck = this.checkGenderRequirement(registrationData.roster, rules.genderRequirement);
      eligibility.requirements.genderRequirement = genderCheck;
      if (!genderCheck.met) {
        eligibility.isEligible = false;
        eligibility.reasons.push('Gender requirement not met');
      }
    }

    // Geographic requirement check
    if (rules.geographicRequirement) {
      const geoCheck = this.checkGeographicRequirement(registrationData, rules.geographicRequirement);
      eligibility.requirements.geographicRequirement = geoCheck;
      if (!geoCheck.met) {
        eligibility.isEligible = false;
        eligibility.reasons.push('Geographic requirement not met');
      }
    }

    // Medical clearance check
    if (rules.medicalRequirement) {
      const medicalCheck = this.checkMedicalRequirement(registrationData.roster);
      eligibility.requirements.medicalRequirement = medicalCheck;
      if (!medicalCheck.met) {
        eligibility.isEligible = false;
        eligibility.reasons.push('Medical clearance required');
      }
    }

    return eligibility;
  }

  private static checkAgeRequirement(roster: TeamRoster | undefined, requirement: any): { met: boolean; min?: number; max?: number } {
    if (!roster || !roster.players.length) {
      return { met: false, ...requirement };
    }

    const now = new Date();
    const playerAges = roster.players.map(player => {
      const birthDate = new Date(player.dateOfBirth);
      return Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    });

    const meetsMin = !requirement.min || Math.min(...playerAges) >= requirement.min;
    const meetsMax = !requirement.max || Math.max(...playerAges) <= requirement.max;

    return {
      met: meetsMin && meetsMax,
      min: requirement.min,
      max: requirement.max
    };
  }

  private static checkGenderRequirement(roster: TeamRoster | undefined, requirement: any): { met: boolean; required?: string } {
    if (!roster || !roster.players.length) {
      return { met: false, required: requirement.required };
    }

    // Implementation would check gender requirements based on tournament rules
    return { met: true, required: requirement.required };
  }

  private static checkGeographicRequirement(registrationData: any, requirement: any): { met: boolean; allowed?: string[] } {
    // Implementation would check geographic restrictions
    return { met: true, allowed: requirement.allowed };
  }

  private static checkMedicalRequirement(roster: TeamRoster | undefined): { met: boolean; required: boolean } {
    if (!roster || !roster.players.length) {
      return { met: false, required: true };
    }

    const allPlayersCleared = roster.players.every(player => player.medicalClearance === true);
    return { met: allPlayersCleared, required: true };
  }

  private static async createRegistrationWorkflow(
    submission: RegistrationSubmission,
    form: TournamentRegistrationForm,
    eligibilityCheck: RegistrationEligibility
  ): Promise<RegistrationWorkflow> {
    const workflow: RegistrationWorkflow = {
      registrationId: submission.id,
      currentStep: 'submitted',
      steps: [
        {
          stepId: 'submitted',
          name: 'Registration Submitted',
          status: 'completed',
          required: true
        },
        {
          stepId: 'eligibility',
          name: 'Eligibility Check',
          status: eligibilityCheck.isEligible ? 'completed' : 'pending',
          required: true
        },
        {
          stepId: 'approval',
          name: 'Registration Approval',
          status: form.autoApproval && eligibilityCheck.isEligible ? 'completed' : 'pending',
          required: true
        }
      ]
    };

    if (form.paymentSettings && form.paymentSettings.amount > 0) {
      workflow.steps.push({
        stepId: 'payment',
        name: 'Payment Processing',
        status: 'pending',
        required: true
      });
    }

    workflow.steps.push({
      stepId: 'finalized',
      name: 'Registration Complete',
      status: 'pending',
      required: true
    });

    return workflow;
  }

  private static async validateRosterRules(roster: TeamRoster, form: TournamentRegistrationForm): Promise<void> {
    const rules = form.rosterRules || {};

    // Check team size
    if (rules.minPlayers && roster.players.length < rules.minPlayers) {
      throw new Error(`Minimum ${rules.minPlayers} players required`);
    }

    if (rules.maxPlayers && roster.players.length > rules.maxPlayers) {
      throw new Error(`Maximum ${rules.maxPlayers} players allowed`);
    }

    // Check required positions
    if (rules.requiredPositions) {
      for (const position of rules.requiredPositions) {
        const playersInPosition = roster.players.filter(p => p.position === position).length;
        if (playersInPosition === 0) {
          throw new Error(`At least one ${position} is required`);
        }
      }
    }

    // Check jersey numbers are unique
    const jerseyNumbers = roster.players
      .map(p => p.jerseyNumber)
      .filter(num => num !== undefined && num !== '');
    
    const uniqueNumbers = new Set(jerseyNumbers);
    if (jerseyNumbers.length !== uniqueNumbers.size) {
      throw new Error('Jersey numbers must be unique');
    }
  }

  private static async canManageRegistration(submission: RegistrationSubmission, user: SecureUserContext): Promise<boolean> {
    // Check if user is tournament organizer or has admin permissions
    // This would integrate with the existing RBAC system
    return user.userRole === 'tournament_manager' || 
           user.userRole === 'district_athletic_director';
  }

  private static async finalizeRegistration(submissionId: string, user?: SecureUserContext): Promise<void> {
    // Finalize the registration - create team record, assign to brackets, etc.
    await storage.updateRegistrationSubmission(submissionId, {
      registrationStatus: 'confirmed',
      confirmedAt: new Date()
    });
  }

  private static calculateRegistrationsByDate(submissions: RegistrationSubmission[]): Array<{ date: string; count: number }> {
    const dateGroups: Record<string, number> = {};
    
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt || new Date()).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({ date, count }));
  }

  private static calculateRegistrationsByOrganization(submissions: RegistrationSubmission[]): Array<{ organization: string; count: number }> {
    const orgGroups: Record<string, number> = {};
    
    submissions.forEach(submission => {
      const org = submission.organizationName || 'Independent';
      orgGroups[org] = (orgGroups[org] || 0) + 1;
    });

    return Object.entries(orgGroups).map(([organization, count]) => ({ organization, count }));
  }

  private static calculatePaymentSummary(submissions: RegistrationSubmission[]): {
    totalRevenue: number;
    pendingPayments: number;
    refunds: number;
  } {
    let totalRevenue = 0;
    let pendingPayments = 0;
    let refunds = 0;

    submissions.forEach(submission => {
      const amount = submission.paymentAmount || 0;
      
      if (submission.paymentStatus === 'paid') {
        totalRevenue += amount;
      } else if (submission.paymentStatus === 'pending') {
        pendingPayments += amount;
      } else if (submission.paymentStatus === 'refunded') {
        refunds += amount;
      }
    });

    return { totalRevenue, pendingPayments, refunds };
  }

  // Notification methods

  private static async notifyFormCreated(form: TournamentRegistrationForm, tournament: Tournament, user: SecureUserContext): Promise<void> {
    // Send notification about form creation
  }

  private static async sendRegistrationConfirmation(
    submission: RegistrationSubmission,
    form: TournamentRegistrationForm,
    tournament: Tournament,
    user?: SecureUserContext
  ): Promise<void> {
    // Send registration confirmation email
  }

  private static async notifyOrganizersOfRegistration(
    submission: RegistrationSubmission,
    form: TournamentRegistrationForm,
    tournament: Tournament
  ): Promise<void> {
    // Notify tournament organizers of new registration
  }

  private static async sendPaymentConfirmation(
    submission: RegistrationSubmission,
    paymentResult: any,
    receiptUrl?: string
  ): Promise<void> {
    // Send payment confirmation email
  }

  private static async sendApprovalNotification(
    submission: RegistrationSubmission,
    decision: any
  ): Promise<void> {
    // Send approval/denial notification email
  }

  private static async sendEligibilityUpdateNotification(
    submission: RegistrationSubmission,
    eligibilityCheck: RegistrationEligibility
  ): Promise<void> {
    // Send eligibility status update notification
  }
}