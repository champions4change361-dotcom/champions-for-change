// Profile Picture Management Routes with Content Moderation
// Secure image uploads with AI-powered content filtering for all subdomains

import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { ProfilePictureService } from "./profilePictureService";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  requireFerpaCompliance,
  auditDataAccess,
  type ComplianceRequest
} from "./complianceMiddleware";

export function registerProfilePictureRoutes(app: Express) {
  console.log('📸 Setting up profile picture management with content moderation');
  const profilePictureService = new ProfilePictureService();
  const objectStorageService = new ObjectStorageService();

  // ===============================
  // PUBLIC OBJECT SERVING (for avatars and approved profile pictures)
  // ===============================
  
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===============================
  // PROFILE PICTURE UPLOAD SYSTEM
  // ===============================

  // Get upload URL for profile picture
  app.post("/api/profile/picture/upload", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      await auditDataAccess(userId, 'profile_picture_upload', 'upload_request', req);
      
      const { uploadUrl, uploadId } = await profilePictureService.uploadProfilePicture(userId, userRole);
      
      res.json({
        uploadUrl,
        uploadId,
        instructions: "Upload your image to this URL, then call the process endpoint",
        guidelines: {
          maxSize: "10MB",
          allowedTypes: ["JPG", "PNG", "GIF", "WEBP"],
          contentPolicy: "Educational appropriate content only - no inappropriate images",
          moderation: "All uploads are automatically moderated for safety"
        }
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(500).json({ error: "Failed to create profile picture upload" });
    }
  });

  // Process uploaded profile picture (triggers moderation)
  app.post("/api/profile/picture/process", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { uploadId, imageUrl } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!uploadId || !imageUrl) {
        return res.status(400).json({ error: "uploadId and imageUrl required" });
      }
      
      await auditDataAccess(userId, 'profile_picture_upload', 'process_upload', req);
      
      const processedUpload = await profilePictureService.processUploadedImage(uploadId, imageUrl);
      
      res.json({
        uploadId,
        status: processedUpload.moderationStatus,
        message: this.getModerationMessage(processedUpload.moderationStatus),
        moderationScore: processedUpload.moderationScore,
        flags: processedUpload.moderationReasons,
        nextSteps: this.getNextStepsMessage(processedUpload.moderationStatus)
      });
    } catch (error) {
      console.error("Profile picture process error:", error);
      res.status(500).json({ error: "Failed to process profile picture" });
    }
  });

  // ===============================
  // AVATAR SYSTEM (SAFE DEFAULTS)
  // ===============================

  // Get available default avatars
  app.get("/api/profile/avatars", async (req, res) => {
    try {
      const avatars = profilePictureService.getDefaultAvatars();
      res.json({
        avatars,
        categories: ['academic', 'athletic', 'character', 'abstract'],
        description: "Safe, appropriate default avatars for educational use"
      });
    } catch (error) {
      console.error("Default avatars error:", error);
      res.status(500).json({ error: "Failed to fetch default avatars" });
    }
  });

  // Set user avatar
  app.post("/api/profile/avatar", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { avatarId } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!avatarId) {
        return res.status(400).json({ error: "avatarId required" });
      }
      
      await auditDataAccess(userId, 'profile_picture_update', 'avatar_selection', req);
      
      await profilePictureService.setUserAvatar(userId, avatarId);
      
      res.json({
        success: true,
        avatarId,
        message: "Avatar updated successfully",
        profileImageUrl: profilePictureService.getDefaultAvatars().find(a => a.id === avatarId)?.url
      });
    } catch (error) {
      console.error("Set avatar error:", error);
      res.status(500).json({ error: error.message || "Failed to set avatar" });
    }
  });

  // ===============================
  // PROFILE PICTURE MANAGEMENT
  // ===============================

  // Get user's current profile picture
  app.get("/api/profile/picture", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const profilePictureUrl = await profilePictureService.getUserProfilePicture(userId);
      
      res.json({
        userId,
        profileImageUrl: profilePictureUrl,
        hasCustomImage: profilePictureUrl && !profilePictureUrl.includes('/avatars/'),
        uploadHistory: await profilePictureService.getUserUploadHistory(userId)
      });
    } catch (error) {
      console.error("Get profile picture error:", error);
      res.status(500).json({ error: "Failed to get profile picture" });
    }
  });

  // Get user profile picture for display (supports cross-user viewing)
  app.get("/api/profile/:userId/picture", isAuthenticated, async (req, res) => {
    try {
      const { userId: targetUserId } = req.params;
      const requestingUserId = req.user?.claims?.sub;
      
      // Users can always view their own profile picture
      // Others can view public profile pictures (privacy controls could be added here)
      
      const profilePictureUrl = await profilePictureService.getUserProfilePicture(targetUserId);
      
      res.json({
        userId: targetUserId,
        profileImageUrl: profilePictureUrl,
        canView: true, // Could implement privacy controls here
        requestedBy: requestingUserId
      });
    } catch (error) {
      console.error("Get user profile picture error:", error);
      res.status(500).json({ error: "Failed to get user profile picture" });
    }
  });

  // ===============================
  // MODERATION AND SAFETY
  // ===============================

  // Get flagged images (admin/moderator only)
  app.get("/api/profile/moderation/flagged", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Only allow administrators and moderators
      if (!userRole.includes('coordinator') && !userRole.includes('director') && !userRole.includes('admin')) {
        return res.status(403).json({ error: "Access denied - moderator privileges required" });
      }
      
      await auditDataAccess(userId, 'profile_picture_moderation', 'view_flagged_images', req);
      
      const flaggedImages = await profilePictureService.getFlaggedImages();
      
      res.json({
        flaggedImages,
        count: flaggedImages.length,
        moderatedBy: userId,
        description: "Images pending human review"
      });
    } catch (error) {
      console.error("Get flagged images error:", error);
      res.status(500).json({ error: "Failed to get flagged images" });
    }
  });

  // Approve flagged profile picture (admin/moderator only)
  app.post("/api/profile/moderation/approve/:uploadId", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { uploadId } = req.params;
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Only allow administrators and moderators
      if (!userRole.includes('coordinator') && !userRole.includes('director') && !userRole.includes('admin')) {
        return res.status(403).json({ error: "Access denied - moderator privileges required" });
      }
      
      await auditDataAccess(userId, 'profile_picture_moderation', 'approve_image', req);
      
      const approvedUpload = await profilePictureService.approveProfilePicture(uploadId, userId);
      
      res.json({
        uploadId,
        status: 'approved',
        approvedBy: userId,
        approvedAt: approvedUpload.approvedAt,
        message: "Profile picture approved and set as user's profile image"
      });
    } catch (error) {
      console.error("Approve profile picture error:", error);
      res.status(500).json({ error: "Failed to approve profile picture" });
    }
  });

  // Reject flagged profile picture (admin/moderator only)
  app.post("/api/profile/moderation/reject/:uploadId", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { uploadId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Only allow administrators and moderators
      if (!userRole.includes('coordinator') && !userRole.includes('director') && !userRole.includes('admin')) {
        return res.status(403).json({ error: "Access denied - moderator privileges required" });
      }
      
      await auditDataAccess(userId, 'profile_picture_moderation', 'reject_image', req);
      
      const rejectedUpload = await profilePictureService.rejectProfilePicture(uploadId, userId, reason);
      
      res.json({
        uploadId,
        status: 'rejected',
        rejectedBy: userId,
        reason: reason || 'Content policy violation',
        message: "Profile picture rejected due to inappropriate content"
      });
    } catch (error) {
      console.error("Reject profile picture error:", error);
      res.status(500).json({ error: "Failed to reject profile picture" });
    }
  });

  // Report inappropriate profile picture
  app.post("/api/profile/report/:userId", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { userId: reportedUserId } = req.params;
      const { reason } = req.body;
      const reportingUserId = req.user?.claims?.sub;
      
      if (!reason) {
        return res.status(400).json({ error: "Reason for report is required" });
      }
      
      await auditDataAccess(reportingUserId, 'profile_picture_report', 'report_inappropriate_image', req);
      
      await profilePictureService.reportInappropriateImage(reportingUserId, reportedUserId, reason);
      
      res.json({
        success: true,
        reportedUser: reportedUserId,
        reportedBy: reportingUserId,
        reason,
        message: "Report submitted successfully. The profile picture will be reviewed by moderators.",
        nextSteps: "The user's profile picture has been temporarily hidden pending review."
      });
    } catch (error) {
      console.error("Report profile picture error:", error);
      res.status(500).json({ error: "Failed to report profile picture" });
    }
  });

  console.log('✅ Profile picture management routes configured');
  console.log('   📸 Upload System: Secure image uploads with presigned URLs');
  console.log('   🛡️ Content Moderation: AI-powered inappropriate content detection');
  console.log('   🎭 Avatar System: Safe default avatars for educational use');
  console.log('   👥 Cross-User Access: Profile picture viewing across subdomains');
  console.log('   🚨 Safety Features: Reporting and moderation workflows');
  console.log('   📋 FERPA Compliance: Audit logging and access controls');
  console.log('   🌐 Universal Access: Available across all subdomains');
}

// Helper functions for moderation messages
function getModerationMessage(status: string): string {
  switch (status) {
    case 'approved':
      return 'Your profile picture has been approved and is now visible to others.';
    case 'rejected':
      return 'Your profile picture was rejected due to inappropriate content. Please try uploading a different image.';
    case 'flagged':
      return 'Your profile picture is under review by our moderation team. You\'ll be notified when it\'s approved.';
    case 'pending':
      return 'Your profile picture is being processed and will be reviewed shortly.';
    default:
      return 'Profile picture status unknown.';
  }
}

function getNextStepsMessage(status: string): string {
  switch (status) {
    case 'approved':
      return 'Your profile picture is now active. You can upload a new one anytime.';
    case 'rejected':
      return 'Please select a default avatar or upload a different image that follows our content guidelines.';
    case 'flagged':
      return 'Please wait for moderator review. You can use a default avatar in the meantime.';
    case 'pending':
      return 'Please wait while your image is being processed and reviewed.';
    default:
      return 'Please contact support if you have questions about your profile picture status.';
  }
}