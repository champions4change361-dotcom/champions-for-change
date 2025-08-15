import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { z } from "zod";

const bulkRegistrationSchema = z.object({
  staff: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    role: z.enum([
      'district_athletic_director',
      'district_head_athletic_trainer', 
      'school_athletic_director',
      'school_athletic_trainer',
      'school_principal',
      'head_coach',
      'assistant_coach',
      'athletic_training_student',
      'scorekeeper',
      'athlete',
      'fan'
    ]),
    organizationName: z.string()
  }))
});

const roleUpdateSchema = z.object({
  userId: z.string(),
  newRole: z.enum([
    'district_athletic_director',
    'district_head_athletic_trainer',
    'school_athletic_director', 
    'school_athletic_trainer',
    'school_principal',
    'head_coach',
    'assistant_coach',
    'athletic_training_student',
    'scorekeeper',
    'athlete',
    'fan'
  ])
});

export function registerStaffRoutes(app: Express) {
  
  // Bulk staff registration - District level only
  app.post('/api/staff/bulk-register', isAuthenticated, async (req: any, res) => {
    try {
      // Check permissions - only district level administrators can bulk register
      const userRole = req.user?.claims?.sub ? (await storage.getUser(req.user.claims.sub))?.userRole : null;
      if (userRole !== 'district_athletic_director' && userRole !== 'district_head_athletic_trainer') {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Only District Athletic Directors and District Head Athletic Trainers can perform bulk registration.' 
        });
      }

      const validation = bulkRegistrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid staff data', details: validation.error.errors });
      }

      const { staff } = validation.data;
      const results = [];
      const errors = [];

      // Process each staff member
      for (const staffMember of staff) {
        try {
          // Create user record with pre-assigned role
          const newUser = await storage.upsertUser({
            email: staffMember.email,
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            userRole: staffMember.role,
            organizationName: staffMember.organizationName,
            subscriptionPlan: 'district_enterprise', // All district staff get enterprise access
            subscriptionStatus: 'active',
            aiPreferences: {
              wantsProactiveHelp: true,
              communicationStyle: 'professional',
              helpLevel: 'guided', 
              hasCompletedOnboarding: false
            }
          });
          
          results.push({
            email: staffMember.email,
            name: `${staffMember.firstName} ${staffMember.lastName}`,
            role: staffMember.role,
            status: 'success'
          });

        } catch (error) {
          console.error(`Failed to register staff member ${staffMember.email}:`, error);
          errors.push({
            email: staffMember.email,
            name: `${staffMember.firstName} ${staffMember.lastName}`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        registered: results.length,
        failed: errors.length,
        results,
        errors
      });

    } catch (error) {
      console.error('Bulk registration error:', error);
      res.status(500).json({ error: 'Internal server error during bulk registration' });
    }
  });

  // Update user role - District level only
  app.post('/api/staff/update-role', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserRole = req.user?.claims?.sub ? (await storage.getUser(req.user.claims.sub))?.userRole : null;
      if (currentUserRole !== 'district_athletic_director' && currentUserRole !== 'district_head_athletic_trainer') {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Only District Athletic Directors and District Head Athletic Trainers can update roles.' 
        });
      }

      const validation = roleUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid role update data', details: validation.error.errors });
      }

      const { userId, newRole } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        userRole: newRole
      });

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          userRole: updatedUser.userRole,
          organizationName: updatedUser.organizationName
        }
      });

    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Internal server error during role update' });
    }
  });

  // Get district staff list - District level only
  app.get('/api/staff/district', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserRole = req.user?.claims?.sub ? (await storage.getUser(req.user.claims.sub))?.userRole : null;
      if (currentUserRole !== 'district_athletic_director' && currentUserRole !== 'district_head_athletic_trainer') {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Only District Athletic Directors and District Head Athletic Trainers can view district staff.' 
        });
      }

      // For now, return placeholder - would need to implement district-wide user query in storage
      res.json({
        success: true,
        staff: [],
        message: 'District staff listing coming soon'
      });

    } catch (error) {
      console.error('Get district staff error:', error);
      res.status(500).json({ error: 'Internal server error getting district staff' });
    }
  });
}