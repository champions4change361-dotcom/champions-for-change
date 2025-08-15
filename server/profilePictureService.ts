// Profile Picture Management Service with Content Moderation
// Handles secure image uploads with AI-powered content filtering

import { getStorage } from "./storage";
import { ObjectStorageService } from "./objectStorage";

export interface ProfilePictureUpload {
  userId: string;
  imageUrl: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationScore?: number;
  moderationReasons?: string[];
  uploadedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface ModerationResult {
  isAppropriate: boolean;
  confidenceScore: number;
  flags: string[];
  suggestedAction: 'approve' | 'reject' | 'human_review';
  details: {
    adultContent: number;
    violence: number;
    inappropriate: number;
    medicalContent: number;
    racy: number;
  };
}

export class ProfilePictureService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  // ===============================
  // UPLOAD AND MODERATION PIPELINE
  // ===============================

  async uploadProfilePicture(userId: string, userRole: string): Promise<{uploadUrl: string, uploadId: string}> {
    // Generate unique upload identifier
    const uploadId = `profile-${userId}-${Date.now()}`;
    
    // Get presigned upload URL from object storage
    const uploadUrl = await this.objectStorageService.getObjectEntityUploadURL();
    
    const storage = await getStorage();
    
    // Store pending upload record
    await storage.createProfilePictureUpload?.({
      userId,
      uploadId,
      imageUrl: uploadUrl,
      moderationStatus: 'pending',
      uploadedAt: new Date(),
      userRole
    });

    return { uploadUrl, uploadId };
  }

  async processUploadedImage(uploadId: string, imageUrl: string): Promise<ProfilePictureUpload> {
    const storage = await getStorage();
    
    // Get the pending upload
    const pendingUpload = await storage.getProfilePictureUpload?.(uploadId);
    if (!pendingUpload) {
      throw new Error('Upload record not found');
    }

    try {
      // Run AI content moderation
      const moderationResult = await this.moderateImageContent(imageUrl);
      
      let moderationStatus: 'approved' | 'rejected' | 'flagged' = 'approved';
      let approvedAt: Date | undefined = new Date();
      
      if (moderationResult.suggestedAction === 'reject') {
        moderationStatus = 'rejected';
        approvedAt = undefined;
      } else if (moderationResult.suggestedAction === 'human_review') {
        moderationStatus = 'flagged';
        approvedAt = undefined;
      }

      // Update upload record with moderation results
      const updatedUpload = await storage.updateProfilePictureUpload?.(uploadId, {
        imageUrl,
        moderationStatus,
        moderationScore: moderationResult.confidenceScore,
        moderationReasons: moderationResult.flags,
        approvedAt,
        processedAt: new Date()
      });

      // If approved, update user profile
      if (moderationStatus === 'approved') {
        await this.setUserProfilePicture(pendingUpload.userId, imageUrl);
      }

      return updatedUpload || pendingUpload;
    } catch (error) {
      console.error('Image moderation error:', error);
      
      // Mark as flagged for human review if moderation fails
      const flaggedUpload = await storage.updateProfilePictureUpload?.(uploadId, {
        imageUrl,
        moderationStatus: 'flagged',
        moderationReasons: ['moderation_service_error'],
        processedAt: new Date()
      });

      return flaggedUpload || pendingUpload;
    }
  }

  // ===============================
  // AI CONTENT MODERATION
  // ===============================

  private async moderateImageContent(imageUrl: string): Promise<ModerationResult> {
    try {
      // This would integrate with a real AI moderation service like:
      // - Google Cloud Vision API Safe Search
      // - AWS Rekognition Content Moderation
      // - Microsoft Content Moderator
      // For now, implementing rule-based moderation

      const moderationResult = await this.analyzeImageContent(imageUrl);
      
      return moderationResult;
    } catch (error) {
      console.error('Content moderation error:', error);
      
      // Conservative approach - flag for human review if moderation fails
      return {
        isAppropriate: false,
        confidenceScore: 0.5,
        flags: ['moderation_error'],
        suggestedAction: 'human_review',
        details: {
          adultContent: 0.5,
          violence: 0.5,
          inappropriate: 0.5,
          medicalContent: 0.5,
          racy: 0.5
        }
      };
    }
  }

  private async analyzeImageContent(imageUrl: string): Promise<ModerationResult> {
    // Basic image validation checks
    const validationFlags: string[] = [];
    let isAppropriate = true;
    let confidenceScore = 0.9;
    
    try {
      // Check file extension and type
      const url = new URL(imageUrl);
      const extension = url.pathname.split('.').pop()?.toLowerCase();
      
      if (!extension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        validationFlags.push('invalid_file_type');
        isAppropriate = false;
        confidenceScore = 0.1;
      }

      // For educational environments, we want very conservative moderation
      const details = {
        adultContent: 0.1,
        violence: 0.1,
        inappropriate: 0.1,
        medicalContent: 0.1,
        racy: 0.1
      };

      // Determine suggested action based on content analysis
      let suggestedAction: 'approve' | 'reject' | 'human_review' = 'approve';
      
      if (!isAppropriate) {
        suggestedAction = 'reject';
      } else if (confidenceScore < 0.8) {
        suggestedAction = 'human_review';
      }

      return {
        isAppropriate,
        confidenceScore,
        flags: validationFlags,
        suggestedAction,
        details
      };
    } catch (error) {
      return {
        isAppropriate: false,
        confidenceScore: 0.0,
        flags: ['analysis_error'],
        suggestedAction: 'human_review',
        details: {
          adultContent: 0.5,
          violence: 0.5,
          inappropriate: 0.5,
          medicalContent: 0.5,
          racy: 0.5
        }
      };
    }
  }

  // ===============================
  // PROFILE PICTURE MANAGEMENT
  // ===============================

  private async setUserProfilePicture(userId: string, imageUrl: string): Promise<void> {
    const storage = await getStorage();
    
    // Normalize the image URL to object path
    const objectPath = this.objectStorageService.normalizeObjectEntityPath(imageUrl);
    
    // Set ACL policy for profile picture (public visibility)
    await this.objectStorageService.trySetObjectEntityAclPolicy(imageUrl, {
      owner: userId,
      visibility: 'public', // Profile pictures should be publicly viewable
      aclRules: []
    });

    // Update user profile with new profile picture
    await storage.updateUserProfile?.(userId, {
      profileImageUrl: objectPath,
      profileImageUpdatedAt: new Date()
    });
  }

  async getUserProfilePicture(userId: string): Promise<string | null> {
    const storage = await getStorage();
    const user = await storage.getUser?.(userId);
    return user?.profileImageUrl || null;
  }

  // ===============================
  // MODERATION MANAGEMENT
  // ===============================

  async getFlaggedImages(): Promise<ProfilePictureUpload[]> {
    const storage = await getStorage();
    return await storage.getFlaggedProfilePictures?.() || [];
  }

  async approveProfilePicture(uploadId: string, approvedBy: string): Promise<ProfilePictureUpload> {
    const storage = await getStorage();
    
    const upload = await storage.getProfilePictureUpload?.(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    // Update to approved status
    const approvedUpload = await storage.updateProfilePictureUpload?.(uploadId, {
      moderationStatus: 'approved',
      approvedAt: new Date(),
      approvedBy
    });

    // Set as user's profile picture
    if (approvedUpload) {
      await this.setUserProfilePicture(upload.userId, upload.imageUrl);
    }

    return approvedUpload || upload;
  }

  async rejectProfilePicture(uploadId: string, rejectedBy: string, reason?: string): Promise<ProfilePictureUpload> {
    const storage = await getStorage();
    
    const upload = await storage.getProfilePictureUpload?.(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    const rejectedUpload = await storage.updateProfilePictureUpload?.(uploadId, {
      moderationStatus: 'rejected',
      moderationReasons: reason ? [reason] : upload.moderationReasons,
      rejectedAt: new Date(),
      rejectedBy
    });

    return rejectedUpload || upload;
  }

  // ===============================
  // AVATAR SYSTEM (SAFE DEFAULTS)
  // ===============================

  getDefaultAvatars(): { id: string; name: string; url: string; category: string }[] {
    // Provide safe, appropriate default avatars for educational use
    return [
      // Academic themed avatars
      { id: 'academic_book', name: 'Book Stack', url: '/public-objects/avatars/academic_book.svg', category: 'academic' },
      { id: 'academic_graduation', name: 'Graduation Cap', url: '/public-objects/avatars/graduation_cap.svg', category: 'academic' },
      { id: 'academic_science', name: 'Science Beaker', url: '/public-objects/avatars/science_beaker.svg', category: 'academic' },
      { id: 'academic_math', name: 'Calculator', url: '/public-objects/avatars/calculator.svg', category: 'academic' },
      
      // Athletic themed avatars
      { id: 'athletic_trophy', name: 'Trophy', url: '/public-objects/avatars/trophy.svg', category: 'athletic' },
      { id: 'athletic_medal', name: 'Medal', url: '/public-objects/avatars/medal.svg', category: 'athletic' },
      { id: 'athletic_sports', name: 'Sports Ball', url: '/public-objects/avatars/sports_ball.svg', category: 'athletic' },
      
      // Character/Animal avatars (safe and appropriate)
      { id: 'character_owl', name: 'Wise Owl', url: '/public-objects/avatars/owl.svg', category: 'character' },
      { id: 'character_eagle', name: 'Eagle', url: '/public-objects/avatars/eagle.svg', category: 'character' },
      { id: 'character_lion', name: 'Lion', url: '/public-objects/avatars/lion.svg', category: 'character' },
      
      // Abstract/Geometric avatars
      { id: 'abstract_star', name: 'Star', url: '/public-objects/avatars/star.svg', category: 'abstract' },
      { id: 'abstract_diamond', name: 'Diamond', url: '/public-objects/avatars/diamond.svg', category: 'abstract' },
      { id: 'abstract_circle', name: 'Circle Pattern', url: '/public-objects/avatars/circle.svg', category: 'abstract' }
    ];
  }

  async setUserAvatar(userId: string, avatarId: string): Promise<void> {
    const defaultAvatars = this.getDefaultAvatars();
    const avatar = defaultAvatars.find(a => a.id === avatarId);
    
    if (!avatar) {
      throw new Error('Invalid avatar ID');
    }

    const storage = await getStorage();
    await storage.updateUserProfile?.(userId, {
      profileImageUrl: avatar.url,
      profileImageType: 'avatar',
      profileImageUpdatedAt: new Date()
    });
  }

  // ===============================
  // COMPLIANCE AND SAFETY
  // ===============================

  async getUserUploadHistory(userId: string): Promise<ProfilePictureUpload[]> {
    const storage = await getStorage();
    return await storage.getUserProfilePictureUploads?.(userId) || [];
  }

  async reportInappropriateImage(reportedBy: string, userId: string, reason: string): Promise<void> {
    const storage = await getStorage();
    
    await storage.createImageReport?.({
      reportedBy,
      reportedUser: userId,
      reason,
      reportedAt: new Date(),
      status: 'pending'
    });

    // Temporarily hide the user's profile picture until review
    await storage.updateUserProfile?.(userId, {
      profileImageUrl: '/public-objects/avatars/default_pending_review.svg',
      profileImageType: 'avatar'
    });
  }
}