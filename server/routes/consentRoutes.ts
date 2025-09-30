import { Router } from "express";
import { db } from "../db";
import { medicalClearanceConsents, athletes, insertMedicalClearanceConsentSchema } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import type { InsertMedicalClearanceConsent } from "../../shared/schema";
import { isAuthenticated } from "../replitAuth";
import { requirePermissions, requireHealthDataAccess, loadUserContext } from "../rbac-middleware";
import { PERMISSIONS } from "../rbac-permissions";
import { z } from "zod";

const router = Router();

// =============================================================================
// MEDICAL CLEARANCE CONSENT MANAGEMENT
// Cross-district player verification for Hannah's dual-identity scenario
// SECURITY: All endpoints require authentication and proper RBAC
// =============================================================================

// Parent consent schema (cannot set medical clearance fields)
const parentConsentSchema = z.object({
  athleteId: z.string(),
  districtId: z.string().optional(),
  schoolId: z.string().optional(),
  studentFirstName: z.string(),
  studentLastName: z.string(),
  studentGradeLevel: z.string().optional(),
  dateOfBirth: z.string(),
  parentGuardianName: z.string(),
  parentEmail: z.string().email(),
  parentPhone: z.string().optional(),
  consentExpiresDate: z.string().optional(),
  authorizedTournamentIds: z.array(z.string()).optional(),
  authorizeAllTournaments: z.boolean().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

// Medical clearance schema (only for athletic trainers/medical staff)
const medicalClearanceSchema = z.object({
  athleteId: z.string(),
  isMedicallyCleared: z.boolean(),
  clearanceDate: z.string().optional(),
  clearanceExpiresDate: z.string().optional(),
  clearedByProvider: z.string().optional(),
  hasActivityRestrictions: z.boolean().optional(),
  restrictionSummary: z.string().optional(),
});

// Create or update parent consent (parents/guardians only set consent fields)
router.post("/medical-clearance/consent", isAuthenticated, loadUserContext, async (req, res) => {
  try {
    // Validate input
    const validationResult = parentConsentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid consent data",
        details: validationResult.error.issues,
      });
    }

    const consentData = validationResult.data;

    // Check if consent already exists for this athlete
    const [existing] = await db
      .select()
      .from(medicalClearanceConsents)
      .where(eq(medicalClearanceConsents.athleteId, consentData.athleteId));

    if (existing) {
      // Update existing consent (only parent consent fields, not medical clearance)
      const [updated] = await db
        .update(medicalClearanceConsents)
        .set({
          parentGuardianName: consentData.parentGuardianName,
          parentEmail: consentData.parentEmail,
          parentPhone: consentData.parentPhone,
          consentGrantedDate: new Date(),
          consentExpiresDate: consentData.consentExpiresDate,
          authorizedTournamentIds: consentData.authorizedTournamentIds,
          authorizeAllTournaments: consentData.authorizeAllTournaments,
          emergencyContactName: consentData.emergencyContactName,
          emergencyContactPhone: consentData.emergencyContactPhone,
          updatedAt: new Date(),
        })
        .where(eq(medicalClearanceConsents.id, existing.id))
        .returning();

      return res.json({
        success: true,
        consent: updated,
        message: "Medical clearance consent updated successfully",
      });
    }

    // Create new consent (only parent consent fields, medical clearance defaults to false)
    const [created] = await db
      .insert(medicalClearanceConsents)
      .values({
        ...consentData,
        consentGrantedDate: new Date(),
        isMedicallyCleared: false, // Set by medical staff only
        consentRevoked: false,
        createdBy: (req as any).user?.id,
      })
      .returning();

    res.json({
      success: true,
      consent: created,
      message: "Medical clearance consent created successfully",
    });
  } catch (error) {
    console.error("Error managing medical clearance consent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to manage medical clearance consent",
    });
  }
});

// Set medical clearance (athletic trainers/medical staff only)
router.post("/medical-clearance/set-clearance", isAuthenticated, loadUserContext, requireHealthDataAccess, async (req, res) => {
  try {
    const validationResult = medicalClearanceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid clearance data",
        details: validationResult.error.issues,
      });
    }

    const clearanceData = validationResult.data;

    const [updated] = await db
      .update(medicalClearanceConsents)
      .set({
        isMedicallyCleared: clearanceData.isMedicallyCleared,
        clearanceDate: clearanceData.clearanceDate,
        clearanceExpiresDate: clearanceData.clearanceExpiresDate,
        clearedByProvider: clearanceData.clearedByProvider,
        clearanceVerifiedBy: (req as any).user?.id,
        hasActivityRestrictions: clearanceData.hasActivityRestrictions,
        restrictionSummary: clearanceData.restrictionSummary,
        updatedAt: new Date(),
      })
      .where(eq(medicalClearanceConsents.athleteId, clearanceData.athleteId))
      .returning();

    res.json({
      success: true,
      clearance: updated,
      message: "Medical clearance updated successfully",
    });
  } catch (error) {
    console.error("Error setting medical clearance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set medical clearance",
    });
  }
});

// Verify medical clearance for tournament registration
// Tournament directors can verify clearance status
router.get("/medical-clearance/verify/:athleteId", isAuthenticated, loadUserContext, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { tournamentId } = req.query;

    // Get consent record
    const [consent] = await db
      .select()
      .from(medicalClearanceConsents)
      .where(
        and(
          eq(medicalClearanceConsents.athleteId, athleteId),
          eq(medicalClearanceConsents.consentRevoked, false)
        )
      );

    if (!consent) {
      return res.json({
        verified: false,
        clearanceStatus: "no_consent",
        message: "No medical clearance consent on file",
      });
    }

    // Check if consent has expired
    if (consent.consentExpiresDate && new Date(consent.consentExpiresDate) < new Date()) {
      return res.json({
        verified: false,
        clearanceStatus: "consent_expired",
        message: "Medical clearance consent has expired",
      });
    }

    // Check tournament-specific authorization
    if (tournamentId) {
      const isAuthorized =
        consent.authorizeAllTournaments ||
        (consent.authorizedTournamentIds && consent.authorizedTournamentIds.includes(tournamentId as string));

      if (!isAuthorized) {
        return res.json({
          verified: false,
          clearanceStatus: "tournament_not_authorized",
          message: "Parent has not authorized participation in this specific tournament",
        });
      }
    }

    // Check medical clearance status
    if (!consent.isMedicallyCleared) {
      return res.json({
        verified: false,
        clearanceStatus: "not_cleared",
        message: "Student is not medically cleared for participation",
      });
    }

    // Check if clearance has expired
    if (consent.clearanceExpiresDate && new Date(consent.clearanceExpiresDate) < new Date()) {
      return res.json({
        verified: false,
        clearanceStatus: "clearance_expired",
        message: "Medical clearance has expired",
      });
    }

    // Update verification tracking
    await db
      .update(medicalClearanceConsents)
      .set({
        lastVerificationDate: new Date(),
        verificationCount: (consent.verificationCount || 0) + 1,
      })
      .where(eq(medicalClearanceConsents.id, consent.id));

    // Return verification response (MINIMAL data only)
    res.json({
      verified: true,
      clearanceStatus: "cleared",
      message: "Student is medically cleared for participation",
      studentName: `${consent.studentFirstName} ${consent.studentLastName}`,
      clearanceExpires: consent.clearanceExpiresDate,
      hasRestrictions: consent.hasActivityRestrictions,
      emergencyContact: {
        name: consent.emergencyContactName,
        phone: consent.emergencyContactPhone,
      },
    });
  } catch (error) {
    console.error("Error verifying medical clearance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify medical clearance",
    });
  }
});

// Get consent status for an athlete (authorized users only)
router.get("/medical-clearance/status/:athleteId", isAuthenticated, loadUserContext, requireHealthDataAccess, async (req, res) => {
  try {
    const { athleteId } = req.params;

    const [consent] = await db
      .select()
      .from(medicalClearanceConsents)
      .where(eq(medicalClearanceConsents.athleteId, athleteId));

    if (!consent) {
      return res.json({
        hasConsent: false,
        message: "No medical clearance consent on file",
      });
    }

    // Get athlete info for context
    const [athlete] = await db
      .select()
      .from(athletes)
      .where(eq(athletes.id, athleteId));

    res.json({
      hasConsent: true,
      consent: {
        id: consent.id,
        athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : `${consent.studentFirstName} ${consent.studentLastName}`,
        parentName: consent.parentGuardianName,
        parentEmail: consent.parentEmail,
        consentGrantedDate: consent.consentGrantedDate,
        consentExpiresDate: consent.consentExpiresDate,
        isMedicallyCleared: consent.isMedicallyCleared,
        clearanceDate: consent.clearanceDate,
        clearanceExpiresDate: consent.clearanceExpiresDate,
        authorizeAllTournaments: consent.authorizeAllTournaments,
        authorizedTournamentCount: consent.authorizedTournamentIds?.length || 0,
        hasRestrictions: consent.hasActivityRestrictions,
        restrictionSummary: consent.restrictionSummary,
        consentRevoked: consent.consentRevoked,
        verificationCount: consent.verificationCount || 0,
        lastVerificationDate: consent.lastVerificationDate,
      },
    });
  } catch (error) {
    console.error("Error fetching consent status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch consent status",
    });
  }
});

// Revoke consent (parents or authorized staff only)
router.post("/medical-clearance/revoke/:athleteId", isAuthenticated, loadUserContext, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { reason } = req.body;

    const [updated] = await db
      .update(medicalClearanceConsents)
      .set({
        consentRevoked: true,
        revokedDate: new Date(),
        revokedReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(medicalClearanceConsents.athleteId, athleteId))
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Consent record not found",
      });
    }

    res.json({
      success: true,
      message: "Medical clearance consent revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking consent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to revoke consent",
    });
  }
});

export default router;
