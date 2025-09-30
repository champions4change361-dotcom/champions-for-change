import type { Express, Request, Response } from "express";
import { districtStorage } from "./districtStorage";
import { insertDistrictSchema, insertSchoolSchema, insertSchoolAssetSchema, insertSchoolInviteSchema } from "@shared/schema";
import { isAuthenticated } from "./replitAuth";
import { loadUserContext, requirePermissions } from "./rbac-middleware";
import { PERMISSIONS } from "./rbac-permissions";
import { emailService } from "./emailService";
import { randomBytes } from "crypto";

export function registerDistrictRoutes(app: Express) {
  // District endpoints
  app.get("/api/districts", async (req: Request, res: Response) => {
    try {
      const districts = await districtStorage.getAllDistricts();
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.get("/api/districts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const district = await districtStorage.getDistrict(id);
      if (!district) {
        return res.status(404).json({ error: "District not found" });
      }
      res.json(district);
    } catch (error) {
      console.error("Error fetching district:", error);
      res.status(500).json({ error: "Failed to fetch district" });
    }
  });

  app.get("/api/districts/code/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const district = await districtStorage.getDistrictByCode(code);
      if (!district) {
        return res.status(404).json({ error: "District not found" });
      }
      res.json(district);
    } catch (error) {
      console.error("Error fetching district by code:", error);
      res.status(500).json({ error: "Failed to fetch district" });
    }
  });

  app.post("/api/districts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertDistrictSchema.parse(req.body);
      const district = await districtStorage.createDistrict(validatedData);
      res.status(201).json(district);
    } catch (error) {
      console.error("Error creating district:", error);
      res.status(500).json({ error: "Failed to create district" });
    }
  });

  // School endpoints
  app.get("/api/schools", async (req: Request, res: Response) => {
    try {
      const { districtId } = req.query;
      let schools;
      
      if (districtId) {
        schools = await districtStorage.getSchoolsByDistrict(districtId as string);
      } else {
        // For now, return empty array if no district specified
        // Could be enhanced to return all schools
        schools = [];
      }
      
      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ error: "Failed to fetch schools" });
    }
  });

  app.get("/api/schools/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const school = await districtStorage.getSchool(id);
      if (!school) {
        return res.status(404).json({ error: "School not found" });
      }
      res.json(school);
    } catch (error) {
      console.error("Error fetching school:", error);
      res.status(500).json({ error: "Failed to fetch school" });
    }
  });

  app.get("/api/schools/vlc/:vlcCode", async (req: Request, res: Response) => {
    try {
      const { vlcCode } = req.params;
      const school = await districtStorage.getSchoolByVLC(vlcCode);
      if (!school) {
        return res.status(404).json({ error: "School not found" });
      }
      res.json(school);
    } catch (error) {
      console.error("Error fetching school by VLC:", error);
      res.status(500).json({ error: "Failed to fetch school" });
    }
  });

  app.get("/api/schools/:id/feeders", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const feederSchools = await districtStorage.getFeederSchools(id);
      res.json(feederSchools);
    } catch (error) {
      console.error("Error fetching feeder schools:", error);
      res.status(500).json({ error: "Failed to fetch feeder schools" });
    }
  });

  app.post("/api/schools", 
    loadUserContext,
    requirePermissions([PERMISSIONS.SCHOOL_DATA_WRITE]),
    async (req: Request, res: Response) => {
      try {
        const { rbacContext } = req;
        const validatedData = insertSchoolSchema.parse(req.body);
        
        // District AD can add any school
        // School-level staff (AD, Coordinator, etc.) can only manage feeder relationships for their own school
        const isSchoolLevelRole = rbacContext?.user.userRole?.startsWith('school_');
        const isDistrictLevelRole = rbacContext?.user.userRole?.startsWith('district_');
        
        if (isSchoolLevelRole) {
          // School-level staff must be managing feeders for their own school
          if (validatedData.feedsIntoSchoolId) {
            // Verify the parent school belongs to this staff member
            const parentSchool = await districtStorage.getSchool(validatedData.feedsIntoSchoolId);
            if (!parentSchool) {
              return res.status(404).json({ error: "Parent school not found" });
            }
            
            if (parentSchool.athleticDirectorId !== rbacContext.user.id) {
              return res.status(403).json({ 
                error: "Forbidden: School staff can only add feeder schools to their own school" 
              });
            }
            
            // Validate parent school is a high school
            if (parentSchool.schoolType !== 'high') {
              return res.status(400).json({
                error: "Feeder schools can only feed into high schools"
              });
            }
            
            // Validate same district
            if (validatedData.districtId !== parentSchool.districtId) {
              return res.status(400).json({
                error: "Feeder schools must be in the same district as the parent school"
              });
            }
          } else {
            // School-level staff cannot create standalone schools
            return res.status(403).json({
              error: "Forbidden: Only District ADs can create new schools. School staff can only add feeder schools."
            });
          }
        } else if (!isDistrictLevelRole) {
          return res.status(403).json({
            error: "Forbidden: Must be a district or school administrator to manage schools"
          });
        }
        
        const school = await districtStorage.createSchool(validatedData);
        res.status(201).json(school);
      } catch (error) {
        console.error("Error creating school:", error);
        res.status(500).json({ error: "Failed to create school" });
      }
    }
  );

  // School AD Invitation endpoint
  app.post("/api/schools/invite",
    loadUserContext,
    requirePermissions([PERMISSIONS.SCHOOL_DATA_WRITE]),
    async (req: Request, res: Response) => {
      try {
        const { rbacContext } = req;
        const { 
          districtId, 
          schoolName, 
          schoolType, 
          districtSchoolCode, 
          feedsIntoSchoolId, 
          inviteeEmail, 
          inviteeName, 
          invitedRole 
        } = req.body;

        // Validate required fields
        if (!districtId || !schoolName || !schoolType || !inviteeEmail) {
          return res.status(400).json({ 
            error: "Missing required fields: districtId, schoolName, schoolType, inviteeEmail" 
          });
        }

        // RBAC: Only District AD or School AD (for their feeders) can send invites
        const isSchoolLevelRole = rbacContext?.user.userRole?.startsWith('school_');
        const isDistrictLevelRole = rbacContext?.user.userRole?.startsWith('district_');

        if (isSchoolLevelRole) {
          // School AD can only invite for their feeder schools
          if (!feedsIntoSchoolId) {
            return res.status(403).json({
              error: "Forbidden: School staff can only invite ADs for feeder schools"
            });
          }

          const parentSchool = await districtStorage.getSchool(feedsIntoSchoolId);
          if (!parentSchool || parentSchool.athleticDirectorId !== rbacContext.user.id) {
            return res.status(403).json({
              error: "Forbidden: You can only invite ADs for your own feeder schools"
            });
          }

          // Validate parent is a high school
          if (parentSchool.schoolType !== 'high') {
            return res.status(400).json({
              error: "Feeder schools can only feed into high schools"
            });
          }

          // Validate same district
          if (districtId !== parentSchool.districtId) {
            return res.status(400).json({
              error: "Feeder school must be in the same district as parent school"
            });
          }
        } else if (!isDistrictLevelRole) {
          return res.status(403).json({
            error: "Forbidden: Must be a district or school administrator to send invites"
          });
        }

        // Generate secure invite token
        const inviteToken = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        // Create invite
        const inviteData = insertSchoolInviteSchema.parse({
          districtId,
          schoolName,
          schoolType,
          districtSchoolCode,
          feedsIntoSchoolId,
          inviteeEmail,
          inviteeName,
          invitedRole: invitedRole || 'school_athletic_director',
          invitedById: rbacContext!.user.id,
          inviteToken,
          inviteStatus: 'pending',
          expiresAt,
        });

        const invite = await districtStorage.createSchoolInvite(inviteData);

        // Get district info for email
        const district = await districtStorage.getDistrict(districtId);
        if (!district) {
          return res.status(404).json({ error: "District not found" });
        }

        // Send invitation email
        const inviterName = `${rbacContext!.user.firstName || ''} ${rbacContext!.user.lastName || ''}`.trim() || 'District Administrator';
        
        await emailService.sendSchoolADInvite({
          inviteeEmail,
          inviteeName: inviteeName || inviteeEmail,
          schoolName,
          districtName: district.name,
          inviteToken,
          invitedBy: inviterName,
          expiresAt,
        });

        res.status(201).json({
          success: true,
          invite: {
            id: invite.id,
            schoolName: invite.schoolName,
            inviteeEmail: invite.inviteeEmail,
            inviteStatus: invite.inviteStatus,
            expiresAt: invite.expiresAt,
          }
        });
      } catch (error) {
        console.error("Error sending school AD invite:", error);
        res.status(500).json({ error: "Failed to send school AD invite" });
      }
    }
  );

  // School asset endpoints
  app.get("/api/schools/:schoolId/assets", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { type } = req.query;
      
      let assets;
      if (type) {
        assets = await districtStorage.getSchoolAssetsByType(schoolId, type as string);
      } else {
        assets = await districtStorage.getSchoolAssets(schoolId);
      }
      
      res.json(assets);
    } catch (error) {
      console.error("Error fetching school assets:", error);
      res.status(500).json({ error: "Failed to fetch school assets" });
    }
  });

  app.get("/api/schools/:schoolId/assets/:assetId", async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const asset = await districtStorage.getSchoolAsset(assetId);
      if (!asset) {
        return res.status(404).json({ error: "School asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching school asset:", error);
      res.status(500).json({ error: "Failed to fetch school asset" });
    }
  });

  app.post("/api/schools/:schoolId/assets", 
    loadUserContext,
    requirePermissions([PERMISSIONS.SCHOOL_DATA_WRITE]),
    async (req: Request, res: Response) => {
      try {
        const { schoolId } = req.params;
        const { rbacContext } = req;
        
        // Verify user has access to this school
        const school = await districtStorage.getSchool(schoolId);
        if (!school) {
          return res.status(404).json({ error: "School not found" });
        }
        
        // District-level staff can access any school in their district
        // School-level staff can only access their own school
        const isSchoolLevelRole = rbacContext?.user.userRole?.startsWith('school_');
        if (isSchoolLevelRole && school.athleticDirectorId !== rbacContext.user.id) {
          return res.status(403).json({ 
            error: "Forbidden: You can only manage assets for your own school" 
          });
        }
        
        const validatedData = insertSchoolAssetSchema.parse({
          ...req.body,
          schoolId,
          uploadedById: rbacContext!.user.id
        });
        
        const asset = await districtStorage.createSchoolAsset(validatedData);
        res.status(201).json(asset);
      } catch (error) {
        console.error("Error creating school asset:", error);
        res.status(500).json({ error: "Failed to create school asset" });
      }
    }
  );

  app.put("/api/schools/:schoolId/assets/:assetId", 
    loadUserContext,
    requirePermissions([PERMISSIONS.SCHOOL_DATA_WRITE]),
    async (req: Request, res: Response) => {
      try {
        const { schoolId, assetId } = req.params;
        const { rbacContext } = req;
        
        // Verify asset exists and belongs to this school
        const existingAsset = await districtStorage.getSchoolAsset(assetId);
        if (!existingAsset) {
          return res.status(404).json({ error: "School asset not found" });
        }
        
        if (existingAsset.schoolId !== schoolId) {
          return res.status(403).json({ 
            error: "Forbidden: Asset does not belong to this school" 
          });
        }
        
        // Verify user has access to this school
        const school = await districtStorage.getSchool(schoolId);
        if (!school) {
          return res.status(404).json({ error: "School not found" });
        }
        
        const isSchoolLevelRole = rbacContext?.user.userRole?.startsWith('school_');
        if (isSchoolLevelRole && school.athleticDirectorId !== rbacContext.user.id) {
          return res.status(403).json({ 
            error: "Forbidden: You can only manage assets for your own school" 
          });
        }
        
        const asset = await districtStorage.updateSchoolAsset(assetId, req.body);
        if (!asset) {
          return res.status(404).json({ error: "School asset not found" });
        }
        res.json(asset);
      } catch (error) {
        console.error("Error updating school asset:", error);
        res.status(500).json({ error: "Failed to update school asset" });
      }
    }
  );

  app.delete("/api/schools/:schoolId/assets/:assetId", 
    loadUserContext,
    requirePermissions([PERMISSIONS.SCHOOL_DATA_WRITE]),
    async (req: Request, res: Response) => {
      try {
        const { schoolId, assetId } = req.params;
        const { rbacContext } = req;
        
        // Verify asset exists and belongs to this school
        const existingAsset = await districtStorage.getSchoolAsset(assetId);
        if (!existingAsset) {
          return res.status(404).json({ error: "School asset not found" });
        }
        
        if (existingAsset.schoolId !== schoolId) {
          return res.status(403).json({ 
            error: "Forbidden: Asset does not belong to this school" 
          });
        }
        
        // Verify user has access to this school
        const school = await districtStorage.getSchool(schoolId);
        if (!school) {
          return res.status(404).json({ error: "School not found" });
        }
        
        const isSchoolLevelRole = rbacContext?.user.userRole?.startsWith('school_');
        if (isSchoolLevelRole && school.athleticDirectorId !== rbacContext.user.id) {
          return res.status(403).json({ 
            error: "Forbidden: You can only manage assets for your own school" 
          });
        }
        
        const deleted = await districtStorage.deleteSchoolAsset(assetId);
        if (!deleted) {
          return res.status(404).json({ error: "School asset not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting school asset:", error);
        res.status(500).json({ error: "Failed to delete school asset" });
      }
    }
  );

  // Endpoint to initialize CCISD data
  app.post("/api/districts/init-ccisd", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if CCISD already exists
      const existingDistrict = await districtStorage.getDistrictByCode("CCISD");
      if (existingDistrict) {
        return res.status(409).json({ 
          error: "CCISD already exists",
          district: existingDistrict
        });
      }

      // Create Corpus Christi ISD
      const ccisd = await districtStorage.createDistrict({
        name: "Corpus Christi Independent School District",
        abbreviation: "CCISD",
        districtCode: "CCISD",
        state: "TX",
        city: "Corpus Christi",
        zipCode: "78401",
        website: "https://www.ccisd.us",
        phone: "(361) 886-9020",
        brandColors: {
          primary: "#003366", // Navy blue
          secondary: "#00B4D8", // Light blue
          accent: "#90E0EF"
        }
      });

      // Create Roy Miller High School
      const royMiller = await districtStorage.createSchool({
        districtId: ccisd.id,
        name: "Roy Miller High School",
        abbreviation: "RMHS",
        schoolType: "high",
        vlcCode: "RMHS-001", // VLC code for Roy Miller
        address: "6565 Yorktown Blvd",
        city: "Corpus Christi",
        state: "TX",
        zipCode: "78414",
        phone: "(361) 886-3800",
        website: "https://www.ccisd.us/roymiller",
        mascotName: "Buccaneers",
        schoolColors: {
          primary: "#003366", // Navy blue
          secondary: "#C8102E", // Red
          accent: "#FFD700" // Gold
        },
        grades: ["9", "10", "11", "12"],
        totalEnrollment: 2200,
        athleticParticipation: 450
      });

      // Add some other CCISD schools for completeness
      const additionalSchools = [
        {
          name: "King High School",
          abbreviation: "KHS",
          vlcCode: "KHS-001",
          mascotName: "Mustangs"
        },
        {
          name: "Miller High School", 
          abbreviation: "MHS",
          vlcCode: "MHS-001",
          mascotName: "Bucs"
        },
        {
          name: "Ray High School",
          abbreviation: "RHS", 
          vlcCode: "RHS-001",
          mascotName: "Texans"
        },
        {
          name: "Carroll High School",
          abbreviation: "CHS",
          vlcCode: "CHS-001", 
          mascotName: "Tigers"
        }
      ];

      const createdSchools = [royMiller];
      for (const schoolData of additionalSchools) {
        const school = await districtStorage.createSchool({
          districtId: ccisd.id,
          ...schoolData,
          schoolType: "high",
          address: "Corpus Christi, TX", // Generic for now
          city: "Corpus Christi",
          state: "TX",
          zipCode: "78401",
          grades: ["9", "10", "11", "12"],
          schoolColors: {
            primary: "#003366",
            secondary: "#C8102E"
          }
        });
        createdSchools.push(school);
      }

      res.status(201).json({
        message: "CCISD initialized successfully",
        district: ccisd,
        schools: createdSchools
      });
    } catch (error) {
      console.error("Error initializing CCISD:", error);
      res.status(500).json({ error: "Failed to initialize CCISD" });
    }
  });
}