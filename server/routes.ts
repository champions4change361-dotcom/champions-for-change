import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { emailService } from "./emailService";
import supportTeamRoutes from "./supportTeamRoutes";
import { stripe } from "./nonprofitStripeConfig";
import { registerDomainRoutes } from "./domainRoutes";
import { registerTournamentRoutes } from "./routes/tournamentRoutes";

console.log('🏫 District athletics management platform initialized');
console.log('💚 Champions for Change nonprofit mission active');

export async function registerRoutes(app: Express): Promise<Server> {
  // PRIORITY: Health check endpoints first for fastest response
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      service: 'District Athletics Management',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.get('/health', (req, res) => {
    res.status(200).send('ok');
  });

  app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
  });

  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // Setup authentication
  await setupAuth(app);

  // Support team routes for cheerleading, dance teams, marching band, color guard
  app.use('/api', supportTeamRoutes);

  // Miller VLC Demo route for district firewall compatibility
  app.get('/', (req, res, next) => {
    if (req.query.demo === 'miller' || req.query.vlc === 'true') {
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miller VLC Demo - CCISD Tournament Management</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .cta { background: #f59e0b; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 10px; font-weight: bold; }
        .back-link { color: #60a5fa; text-decoration: none; margin-bottom: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Main Site</a>
        
        <div class="header">
            <h1>Miller Vertical Learning Community</h1>
            <h2>CCISD Tournament Management Platform</h2>
            <p>Authentic demonstration built by CCISD alumni for immediate deployment</p>
        </div>

        <div style="background: #10b981; padding: 30px; border-radius: 12px; text-align: center; margin: 40px 0;">
            <h2>Immediate Value for CCISD</h2>
            <h3>$47,510 Annual Cost Savings</h3>
            <p>ROI: 1,906% - Making non-adoption fiscally irresponsible</p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="/" class="cta">View Full Platform</a>
        </div>
    </div>
</body>
</html>
      `);
      return;
    } else {
      // Continue with normal routing for other requests
      // Let Vite middleware handle the React app
      next();
    }
  });

  // Login endpoint for form-based authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, userType } = req.body;
      
      console.log('Login attempt:', {
        email: email,
        passwordLength: password ? password.length : 0,
        userType: userType,
        emailMatch: email?.toLowerCase() === 'champions4change361@gmail.com',
        passwordMatch: password === 'master-admin-danielthornton'
      });
      
      // Check for master admin credentials (case-insensitive email)
      if (email?.toLowerCase() === 'champions4change361@gmail.com' && password === 'master-admin-danielthornton') {
        // Create master admin user session with all required role properties
        const masterAdmin = {
          id: 'master-admin-danielthornton',
          email: email,
          firstName: 'Daniel',
          lastName: 'Thornton',
          role: 'district_athletic_director',
          userRole: 'district_athletic_director', // Add this for the dashboard
          complianceRole: 'district_athletic_director', // Add this for permissions
          subscriptionPlan: 'district_enterprise',
          subscriptionStatus: 'active',
          organizationId: 'champions-for-change',
          organizationName: 'Champions for Change',
          userType: userType || 'district',
          isAdmin: true,
          isWhitelabelClient: true,
          whitelabelDomain: 'trantortournaments.org'
        };

        // Store in session and wait for it to be saved before responding
        (req as any).session.user = masterAdmin;
        
        // Wait for session to be saved before responding
        await new Promise<void>((resolve, reject) => {
          (req as any).session.save((err: any) => {
            if (err) {
              console.error('Session save error:', err);
              reject(err);
            } else {
              console.log('Session saved successfully for master admin');
              resolve();
            }
          });
        });
        
        console.log('Master admin session created successfully');
        res.json({ 
          success: true, 
          user: masterAdmin,
          message: 'Login successful',
          redirectTo: '/role-based-dashboards'
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Authentication service error' });
    }
  });

  // Basic user authentication endpoint - modified to check session
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      console.log('Auth user check - Session ID:', req.sessionID);
      console.log('Auth user check - Session user:', req.session?.user ? 'present' : 'missing');
      console.log('Auth user check - OAuth user:', req.user ? 'present' : 'missing');
      
      // Check session-based auth first
      if (req.session?.user) {
        console.log('Returning session user:', req.session.user.email);
        return res.json(req.session.user);
      }
      
      // Then check OAuth auth
      if (req.user && req.user.claims) {
        console.log('Returning OAuth user:', req.user.claims.email);
        res.json({
          id: req.user.claims.sub,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      } else {
        console.log('No valid user found, returning 401');
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Enhanced authentication check middleware
  const checkAuth = (req: any, res: any, next: any) => {
    console.log('Auth check - Session user:', req.session?.user ? 'present' : 'missing');
    console.log('Auth check - OAuth user:', req.user ? 'present' : 'missing');
    console.log('Auth check - Session ID:', req.sessionID);
    
    // Check for session-based auth (form login) OR OAuth-based auth
    if (req.session?.user || (req.user && req.user.claims)) {
      next();
    } else {
      console.log('Authentication failed - no valid session or OAuth');
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Admin endpoints
  app.get("/api/admin/users", checkAuth, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/create-fake-user", checkAuth, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const { firstName, lastName, email, role, subscriptionPlan, organizationName, userType } = req.body;
      
      console.log('Create user request data:', { firstName, lastName, email, role, subscriptionPlan, organizationName, userType });
      
      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!role) missingFields.push('role');
      if (!subscriptionPlan) missingFields.push('subscriptionPlan');
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      const fakeUser = await storage.upsertUser({
        id: `fake-${Date.now()}-${email.replace('@', '-at-')}`,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
        subscriptionPlan,
        subscriptionStatus: 'active',
        complianceRole: role,
        organizationId: organizationName.toLowerCase().replace(/\s+/g, '-'),
        organizationName,
        isWhitelabelClient: false,
        whitelabelDomain: null
      });
      
      // Send welcome email notification to new user
      try {
        const emailResult = await emailService.sendWelcomeEmail(
          email, 
          firstName, 
          role, 
          organizationName
        );
        console.log(`📧 Welcome email sent to ${firstName} (${email}):`, emailResult);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the user creation if email fails
      }
      
      res.json({ success: true, user: fakeUser });
    } catch (error) {
      console.error("Error creating fake user:", error);
      res.status(500).json({ error: "Failed to create fake user" });
    }
  });

  // Special route to create Jolynn's real account with email
  app.post("/api/create-jolynn-real-account", async (req: any, res) => {
    console.log("🎯 Creating Jolynn's real account - START");
    console.log("Request body:", req.body);
    console.log("SendGrid API Key present:", !!process.env.SENDGRID_API_KEY);
    
    try {
      const { firstName, lastName, email } = req.body;
      
      if (email !== "snwbunny99504@aol.com") {
        console.log("❌ Unauthorized email attempt:", email);
        return res.status(403).json({ error: "This endpoint is only for Jolynn's account" });
      }

      const storage = await getStorage();
      console.log("✅ Storage obtained");
      
      const jolynnUser = await storage.upsertUser({
        id: `real-athletic-trainer-jolynn`,
        email: "snwbunny99504@aol.com",
        firstName: "Jolynn",
        lastName: "Millette",
        profileImageUrl: null,
        subscriptionPlan: "district_enterprise",
        subscriptionStatus: "active",
        complianceRole: "school_athletic_trainer",
        organizationId: "ccisd-carroll-high",
        organizationName: "CCISD Carroll High School",
        isWhitelabelClient: false,
        whitelabelDomain: null
      });
      
      console.log("✅ User created:", jolynnUser);
      console.log("📧 About to send REAL welcome email to Jolynn at the bar...");
      
      // Send REAL welcome email to Jolynn via SendGrid (live test!)
      const emailResult = await emailService.sendWelcomeEmail(
        "snwbunny99504@aol.com", 
        "Jolynn", 
        "school_athletic_trainer", 
        "CCISD Carroll High School"
      );
      
      console.log(`🎯 REAL Welcome email result:`, emailResult);
      
      const response = { 
        success: true, 
        user: jolynnUser, 
        email: emailResult,
        message: "Real account created and welcome email sent to Jolynn!",
        sendgridActive: !!process.env.SENDGRID_API_KEY
      };
      
      console.log("📤 Sending response:", response);
      res.json(response);
    } catch (error) {
      console.error("❌ Error creating Jolynn's real account:", error);
      res.status(500).json({ error: "Failed to create Jolynn's account", details: (error as Error).message });
    }
  });

  // Business Registration endpoint
  app.post("/api/registration/business", async (req, res) => {
    try {
      console.log('Business registration request:', req.body);
      
      const {
        firstName,
        lastName,
        email,
        phone,
        organizationName,
        organizationType,
        description,
        sportsInvolved,
        paymentMethod,
        plan,
        price,
        requestType = 'tournament_manager',
        subscriptionPlan
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !organizationName) {
        return res.status(400).json({
          error: "Missing required fields: firstName, lastName, email, organizationName"
        });
      }

      const storage = await getStorage();
      
      // Create user record for business registration
      const userId = `business-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const businessUser = await storage.upsertUser({
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        profileImageUrl: null,
        subscriptionPlan: plan || 'tournament-organizer',
        subscriptionStatus: paymentMethod === 'stripe' ? 'pending' : 'pending_approval',
        complianceRole: 'tournament_manager',
        organizationId: `business-${organizationName.toLowerCase().replace(/\s+/g, '-')}`,
        organizationName: organizationName,
        isWhitelabelClient: false,
        whitelabelDomain: null,
        phone: phone,
        organizationType: organizationType || 'business',
        sportsInvolved: sportsInvolved || [],
        description: description,
        requestType: requestType,
        paymentMethod: paymentMethod,
        pendingCheckAmount: paymentMethod === 'check' ? price : null,
        accountStatus: paymentMethod === 'check' ? 'pending_check_payment' : 'active'
      });

      console.log('✅ Business user created:', businessUser);

      // Send welcome email for business registration
      try {
        const emailResult = await emailService.sendWelcomeEmail(
          email,
          firstName,
          'tournament_manager',
          organizationName
        );
        console.log('📧 Business welcome email sent:', emailResult);
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }

      res.json({
        success: true,
        user: businessUser,
        plan: plan,
        message: "Business registration successful! Check your email for next steps."
      });

    } catch (error) {
      console.error('❌ Business registration error:', error);
      res.status(500).json({
        error: "Registration failed",
        details: (error as Error).message
      });
    }
  });

  // Admin: Get pending users for approval
  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const storage = await getStorage();
      
      // For now, return mock data since we need to set up proper admin authentication
      const mockPendingUsers = [
        {
          id: "pending-user-1",
          firstName: "John",
          lastName: "Tournament Organizer",
          email: "john@example.com",
          phone: "555-123-4567",
          organizationName: "Local Sports Club",
          organizationType: "sports_club",
          subscriptionPlan: "tournament-organizer",
          paymentMethod: "check",
          pendingCheckAmount: "39",
          accountStatus: "pending_check_payment",
          description: "We organize youth basketball tournaments in our community and need professional features.",
          sportsInvolved: ["Basketball", "Soccer"],
          createdAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        users: mockPendingUsers
      });

    } catch (error) {
      console.error('❌ Error fetching pending users:', error);
      res.status(500).json({
        error: "Failed to fetch pending users",
        details: (error as Error).message
      });
    }
  });

  // Admin: Approve a pending user
  app.post("/api/admin/approve-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const storage = await getStorage();
      
      console.log(`✅ Admin approving user: ${userId}`);
      
      // For demo purposes, just return success
      // In production, this would update the user's account status
      
      res.json({
        success: true,
        message: "User account activated successfully"
      });

    } catch (error) {
      console.error('❌ Error approving user:', error);
      res.status(500).json({
        error: "Failed to approve user",
        details: (error as Error).message
      });
    }
  });

  // Admin: Reject a pending user
  app.post("/api/admin/reject-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const storage = await getStorage();
      
      console.log(`❌ Admin rejecting user: ${userId}`);
      
      // For demo purposes, just return success
      // In production, this would update the user's account status and send notification
      
      res.json({
        success: true,
        message: "User account rejected and notified"
      });

    } catch (error) {
      console.error('❌ Error rejecting user:', error);
      res.status(500).json({
        error: "Failed to reject user",
        details: (error as Error).message
      });
    }
  });

  // Athletic Director Onboarding Link Generation
  app.post("/api/generate-staff-invitation", isAuthenticated, async (req: any, res) => {
    try {
      const { staffRole, maxUses = 1, expirationDays = 7 } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Import the UniversalRegistrationSystem
      const { UniversalRegistrationSystem } = require('./universal-registration');
      const storage = await getStorage();
      
      // Generate a registration code for the staff role
      const codeData = {
        type: staffRole === 'athletic_trainer' ? 'district_admin' : 'district_admin',
        userId: userId,
        organizationId: req.user?.organizationId || 'ccisd',
        permissions: [staffRole],
        expiresAt: new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000)),
        maxUses: maxUses
      };
      
      const registrationCode = UniversalRegistrationSystem.generateRegistrationCode(codeData);
      const invitationLink = UniversalRegistrationSystem.generateInvitationLink(registrationCode);
      
      // Store the code in storage (if storage supports it)
      // await storage.saveRegistrationCode(registrationCode, codeData);
      
      res.json({
        success: true,
        code: registrationCode,
        link: invitationLink,
        expiresAt: codeData.expiresAt,
        maxUses: maxUses,
        staffRole: staffRole
      });
      
    } catch (error) {
      console.error("Error generating staff invitation:", error);
      res.status(500).json({ error: "Failed to generate staff invitation" });
    }
  });

  // Validate invitation code before registration
  app.get("/api/validate-invitation/:code", async (req: any, res) => {
    try {
      const { code } = req.params;
      const { UniversalRegistrationSystem } = require('./universal-registration');
      const storage = await getStorage();
      
      const validation = await UniversalRegistrationSystem.validateRegistrationCode(code, storage);
      
      res.json({
        valid: validation.valid,
        type: validation.type,
        permissions: validation.permissions,
        organizationId: validation.organizationId,
        error: validation.error
      });
      
    } catch (error) {
      console.error("Error validating invitation code:", error);
      res.status(500).json({ error: "Failed to validate invitation code" });
    }
  });

  // Donation endpoint for processing donations
  app.post("/api/create-donation", async (req, res) => {
    try {
      console.log('Donation request body:', JSON.stringify(req.body, null, 2));
      
      const {
        amount,
        donorInfo,
        postDonationChoice,
        source,
        description
      } = req.body;

      // Extract donor info from nested structure
      const firstName = donorInfo?.firstName;
      const lastName = donorInfo?.lastName;
      const email = donorInfo?.email;
      const phone = donorInfo?.phone;

      console.log('Extracted fields:', { amount, firstName, lastName, email });

      // Validate required fields
      if (!amount || !firstName || !lastName || !email) {
        return res.status(400).json({
          error: `Missing required fields. Got: amount=${amount}, firstName=${firstName}, lastName=${lastName}, email=${email}`
        });
      }

      // Validate amount
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 1) {
        return res.status(400).json({
          error: "Invalid donation amount. Minimum $1 required."
        });
      }

      // Validate postDonationChoice
      const validChoices = ['test_platform', 'just_donate', 'learn_more'];
      if (postDonationChoice && !validChoices.includes(postDonationChoice)) {
        return res.status(400).json({
          error: "Invalid post-donation choice"
        });
      }

      // Create donor record (simplified for now)
      const donorId = `donor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create donation record
      const donation = {
        id: `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        donorId,
        amount: numericAmount,
        firstName,
        lastName,
        email,
        phone: phone || null,
        postDonationChoice: postDonationChoice || 'just_donate',
        source: source || 'website',
        status: 'pending',
        createdAt: new Date()
      };

      console.log('💚 Donation created:', donation);

      // Create Stripe payment intent for the donation
      console.log('Creating Stripe payment intent for amount:', numericAmount);
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(numericAmount * 100), // Convert to cents
          currency: "usd",
          description: `$${numericAmount} donation to Champions for Change educational programs`,
          metadata: {
            platform: "Champions for Change",
            purpose: "Educational Trips",
            donorId: donation.donorId,
            donationId: donation.id,
            amount_dollars: numericAmount.toString()
          }
        });

        console.log('✅ Stripe payment intent created:', paymentIntent.id);

        // Return success with donation data and payment client secret
        res.json({
          success: true,
          donorId: donation.donorId,
          donationId: donation.id,
          amount: donation.amount,
          clientSecret: paymentIntent.client_secret,
          message: 'Donation created successfully'
        });
      } catch (stripeError) {
        console.error('❌ Stripe payment intent creation failed:', stripeError);
        
        // Return success for donation but indicate payment setup issue
        res.json({
          success: true,
          donorId: donation.donorId,
          donationId: donation.id,
          amount: donation.amount,
          error: 'Payment setup failed',
          message: 'Donation recorded but payment setup incomplete'
        });
      }

    } catch (error) {
      console.error('Donation creation error:', error);
      res.status(500).json({
        error: "Failed to create donation"
      });
    }
  });

  // Registration endpoint for new users
  app.post("/api/registration/request", async (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      
      const {
        requestType,
        firstName,
        lastName,
        email,
        phone,
        position,
        organizationName,
        organizationType,
        parentOrganization,
        yearsExperience,
        sportsInvolved,
        certifications,
        requestReason,
        paymentMethod,
        subscriptionPlan,
        references
      } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !requestType || !organizationName) {
        return res.status(400).json({ 
          error: "Missing required fields" 
        });
      }

      // Create registration request object
      const registrationRequest = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestType,
        firstName,
        lastName,
        email,
        phone: phone || null,
        position: position || null,
        organizationName,
        organizationType: organizationType || 'other',
        parentOrganization: parentOrganization || null,
        yearsExperience: yearsExperience || 0,
        sportsInvolved: Array.isArray(sportsInvolved) ? sportsInvolved : [],
        certifications: certifications || null,
        requestReason: requestReason || '',
        paymentMethod: paymentMethod || 'stripe',
        subscriptionPlan: subscriptionPlan || 'freemium',
        references: Array.isArray(references) ? references : [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // For now, just log the registration and return success
      // In production, this would be saved to database
      console.log('📝 Registration request created:', registrationRequest);

      // Send success response
      res.json({ 
        success: true, 
        message: 'Registration submitted successfully',
        registrationId: registrationRequest.id,
        nextStep: paymentMethod === 'stripe' ? 'payment' : 'confirmation'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: "Failed to process registration request" 
      });
    }
  });

  // Stripe payment route for donations
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, description } = req.body;
      
      if (!amount || amount < 5) {
        return res.status(400).json({ 
          error: "Invalid amount. Minimum donation is $5." 
        });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description: description || "Donation to Champions for Change",
        metadata: {
          platform: "Champions for Change",
          purpose: "Educational Trips",
          amount_dollars: amount.toString()
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });

  // ========================================
  // COACHES LOUNGE LEAGUE ENDPOINTS
  // ========================================

  // Join a league using registration code
  app.post("/api/leagues/join", async (req, res) => {
    try {
      const { code } = req.body;
      console.log('League join request with code:', code);

      if (!code) {
        return res.status(400).json({ error: "Registration code is required" });
      }

      // Mock league join response - in real implementation, would query database
      const mockLeague = {
        id: `league-${Date.now()}`,
        name: "Champions Fantasy League",
        leagueType: "ppr_league",
        registrationCode: code,
        status: "active",
        currentParticipants: 8,
        maxParticipants: 12
      };

      res.json({
        success: true,
        league: mockLeague,
        leagueName: mockLeague.name,
        message: "Successfully joined league!"
      });

    } catch (error) {
      console.error('League join error:', error);
      res.status(500).json({ error: "Failed to join league" });
    }
  });

  // Create a new league
  app.post("/api/leagues/create", async (req, res) => {
    try {
      const { type } = req.body;
      console.log('League creation request for type:', type);

      if (!type) {
        return res.status(400).json({ error: "League type is required" });
      }

      // Generate registration code
      const registrationCode = `COACH${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Mock league creation response
      const newLeague = {
        id: `league-${Date.now()}`,
        name: `${type.replace('_', ' ').toUpperCase()} League`,
        leagueType: type,
        registrationCode: registrationCode,
        status: "draft",
        currentParticipants: 1,
        maxParticipants: 12
      };

      res.json({
        success: true,
        league: newLeague,
        registrationCode: registrationCode,
        message: "League created successfully!"
      });

    } catch (error) {
      console.error('League creation error:', error);
      res.status(500).json({ error: "Failed to create league" });
    }
  });

  // Join league via commissioner endpoint (alternative endpoint)
  app.post("/api/commissioner/join-league", async (req, res) => {
    try {
      const { registrationCode } = req.body;
      console.log('Commissioner league join request with code:', registrationCode);

      if (!registrationCode) {
        return res.status(400).json({ error: "Registration code is required" });
      }

      // Mock league data
      const mockLeague = {
        id: `league-${Date.now()}`,
        name: "Premier Coaching League",
        leagueType: "coaching_league",
        registrationCode: registrationCode,
        status: "active",
        currentParticipants: 6,
        maxParticipants: 10
      };

      res.json({
        success: true,
        league: mockLeague,
        message: "Successfully joined the league!"
      });

    } catch (error) {
      console.error('Commissioner league join error:', error);
      res.status(500).json({ error: "Failed to join league", message: "Invalid registration code or league not found" });
    }
  });

  // Yahoo Sports API Authentication
  const { setupYahooAuth } = await import('./yahooAuth');
  setupYahooAuth(app);

  // Fantasy Coaching AI endpoints
  
  // Roster data by sport and position
  app.get('/api/fantasy/roster/:sport/:position', async (req, res) => {
    try {
      const { sport, position } = req.params;
      console.log(`Roster request: ${sport} ${position}`);

      const { YahooSportsAPI } = await import('./yahooSportsAPI');
      const yahooAPI = new YahooSportsAPI();
      let roster = [];

      switch (sport.toLowerCase()) {
        case 'nfl':
          if (position === 'DEF') {
            // Return NFL team defenses
            roster = [
              { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },
              { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL' },
              { id: 'CLE', name: 'Cleveland Browns', team: 'CLE' },
              { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL' },
              { id: 'BUF', name: 'Buffalo Bills', team: 'BUF' },
              { id: 'PIT', name: 'Pittsburgh Steelers', team: 'PIT' },
              { id: 'NE', name: 'New England Patriots', team: 'NE' },
              { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },
              { id: 'MIA', name: 'Miami Dolphins', team: 'MIA' },
              { id: 'NYJ', name: 'New York Jets', team: 'NYJ' },
              { id: 'DEN', name: 'Denver Broncos', team: 'DEN' },
              { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' }
            ];
          } else {
            // Get NFL players for position - expanded roster data
            const nflRosters: any = {
              'QB': [
                // Tier 1 Elite
                { id: 'mahomes', name: 'Patrick Mahomes', team: 'KC' },
                { id: 'allen', name: 'Josh Allen', team: 'BUF' },
                { id: 'burrow', name: 'Joe Burrow', team: 'CIN' },
                { id: 'herbert', name: 'Justin Herbert', team: 'LAC' },
                { id: 'jackson', name: 'Lamar Jackson', team: 'BAL' },
                { id: 'hurts', name: 'Jalen Hurts', team: 'PHI' },
                // Tier 2 Solid Starters
                { id: 'tua', name: 'Tua Tagovailoa', team: 'MIA' },
                { id: 'dak', name: 'Dak Prescott', team: 'DAL' },
                { id: 'rodgers', name: 'Aaron Rodgers', team: 'NYJ' },
                { id: 'wilson', name: 'Russell Wilson', team: 'PIT' },
                { id: 'lawrence', name: 'Trevor Lawrence', team: 'JAC' },
                { id: 'stroud', name: 'C.J. Stroud', team: 'HOU' },
                // Tier 3 Streamers/Backups
                { id: 'goff', name: 'Jared Goff', team: 'DET' },
                { id: 'cousins', name: 'Kirk Cousins', team: 'ATL' },
                { id: 'richardson', name: 'Anthony Richardson', team: 'IND' },
                { id: 'jones', name: 'Daniel Jones', team: 'NYG' },
                { id: 'watson', name: 'Deshaun Watson', team: 'CLE' },
                { id: 'mayfield', name: 'Baker Mayfield', team: 'TB' }
              ],
              'RB': [
                // Tier 1 Workhorses
                { id: 'mccaffrey', name: 'Christian McCaffrey', team: 'SF' },
                { id: 'henry', name: 'Derrick Henry', team: 'BAL' },
                { id: 'barkley', name: 'Saquon Barkley', team: 'PHI' },
                { id: 'chubb', name: 'Nick Chubb', team: 'CLE' },
                { id: 'jacobs', name: 'Josh Jacobs', team: 'GB' },
                { id: 'jones', name: 'Aaron Jones', team: 'MIN' },
                // Tier 2 Quality Starters
                { id: 'mixon', name: 'Joe Mixon', team: 'HOU' },
                { id: 'cook', name: 'Dalvin Cook', team: 'NYJ' },
                { id: 'walker', name: 'Kenneth Walker III', team: 'SEA' },
                { id: 'ekeler', name: 'Austin Ekeler', team: 'WAS' },
                { id: 'montgomery', name: 'David Montgomery', team: 'DET' },
                { id: 'gibbs', name: 'Jahmyr Gibbs', team: 'DET' },
                // Tier 3 Flex/Backup Options
                { id: 'pollard', name: 'Tony Pollard', team: 'TEN' },
                { id: 'swift', name: 'D\'Andre Swift', team: 'CHI' },
                { id: 'etienne', name: 'Travis Etienne', team: 'JAC' },
                { id: 'conner', name: 'James Conner', team: 'ARI' },
                { id: 'mostert', name: 'Raheem Mostert', team: 'MIA' },
                { id: 'stevenson', name: 'Rhamondre Stevenson', team: 'NE' }
              ],
              'WR': [
                // Tier 1 Elite
                { id: 'jefferson', name: 'Justin Jefferson', team: 'MIN' },
                { id: 'chase', name: 'Ja\'Marr Chase', team: 'CIN' },
                { id: 'hill', name: 'Tyreek Hill', team: 'MIA' },
                { id: 'adams', name: 'Davante Adams', team: 'LV' },
                { id: 'diggs', name: 'Stefon Diggs', team: 'HOU' },
                { id: 'brown', name: 'A.J. Brown', team: 'PHI' },
                // Tier 2 High-End WR1/2
                { id: 'kupp', name: 'Cooper Kupp', team: 'LAR' },
                { id: 'evans', name: 'Mike Evans', team: 'TB' },
                { id: 'godwin', name: 'Chris Godwin', team: 'TB' },
                { id: 'waddle', name: 'Jaylen Waddle', team: 'MIA' },
                { id: 'amon-ra', name: 'Amon-Ra St. Brown', team: 'DET' },
                { id: 'deebo', name: 'Deebo Samuel', team: 'SF' },
                // Tier 3 WR2/Flex Options
                { id: 'higgins', name: 'Tee Higgins', team: 'CIN' },
                { id: 'robinson', name: 'Allen Robinson II', team: 'PIT' },
                { id: 'thomas', name: 'Michael Thomas', team: 'NO' },
                { id: 'hopkins', name: 'DeAndre Hopkins', team: 'TEN' },
                { id: 'lockett', name: 'Tyler Lockett', team: 'SEA' },
                { id: 'metcalf', name: 'DK Metcalf', team: 'SEA' },
                { id: 'smith', name: 'DeVonta Smith', team: 'PHI' },
                { id: 'williams', name: 'Mike Williams', team: 'NYJ' }
              ],
              'TE': [
                // Tier 1 Elite
                { id: 'kelce', name: 'Travis Kelce', team: 'KC' },
                { id: 'andrews', name: 'Mark Andrews', team: 'BAL' },
                { id: 'kittle', name: 'George Kittle', team: 'SF' },
                // Tier 2 Reliable TE1s
                { id: 'waller', name: 'Darren Waller', team: 'NYG' },
                { id: 'goedert', name: 'Dallas Goedert', team: 'PHI' },
                { id: 'pitts', name: 'Kyle Pitts', team: 'ATL' },
                { id: 'hockenson', name: 'T.J. Hockenson', team: 'MIN' },
                { id: 'ertz', name: 'Zach Ertz', team: 'WAS' },
                // Tier 3 Streamers/Backups
                { id: 'njoku', name: 'David Njoku', team: 'CLE' },
                { id: 'schultz', name: 'Dalton Schultz', team: 'HOU' },
                { id: 'engram', name: 'Evan Engram', team: 'JAC' },
                { id: 'kmet', name: 'Cole Kmet', team: 'CHI' },
                { id: 'ferguson', name: 'Jake Ferguson', team: 'DAL' },
                { id: 'freiermuth', name: 'Pat Freiermuth', team: 'PIT' }
              ],
              'K': [
                { id: 'tucker', name: 'Justin Tucker', team: 'BAL' },
                { id: 'bass', name: 'Tyler Bass', team: 'BUF' },
                { id: 'mcpherson', name: 'Evan McPherson', team: 'CIN' },
                { id: 'butker', name: 'Harrison Butker', team: 'KC' },
                { id: 'carlson', name: 'Daniel Carlson', team: 'LV' },
                { id: 'folk', name: 'Nick Folk', team: 'TEN' },
                { id: 'lutz', name: 'Wil Lutz', team: 'DEN' },
                { id: 'elliott', name: 'Jake Elliott', team: 'PHI' },
                { id: 'succop', name: 'Ryan Succop', team: 'TB' },
                { id: 'myers', name: 'Jason Myers', team: 'SEA' },
                { id: 'hopkins2', name: 'Dustin Hopkins', team: 'CLE' },
                { id: 'sanders', name: 'Jason Sanders', team: 'MIA' }
              ]
            };
            roster = nflRosters[position] || [];
            
            // Try Yahoo API as backup enhancement
            try {
              const projections = await yahooAPI.getPlayerProjections(position);
              if (projections && projections.length > 0) {
                // Merge with Yahoo data if available
                const yahooPlayers = projections.map((player: any) => ({
                  id: player.playerId,
                  name: player.playerName,
                  team: player.team,
                  position: player.position
                }));
                // Use Yahoo data if more comprehensive
                if (yahooPlayers.length > roster.length) {
                  roster = yahooPlayers;
                }
              }
            } catch (error) {
              console.log('Using fallback roster data for', position);
            }
          }
          break;
        
        case 'nba':
          // NBA roster data by position
          const nbaRosters: any = {
            'PG': [
              { id: 'curry', name: 'Stephen Curry', team: 'GSW' },
              { id: 'doncic', name: 'Luka Doncic', team: 'DAL' },
              { id: 'morant', name: 'Ja Morant', team: 'MEM' }
            ],
            'SG': [
              { id: 'edwards', name: 'Anthony Edwards', team: 'MIN' },
              { id: 'booker', name: 'Devin Booker', team: 'PHX' },
              { id: 'mitchell', name: 'Donovan Mitchell', team: 'CLE' }
            ],
            'SF': [
              { id: 'tatum', name: 'Jayson Tatum', team: 'BOS' },
              { id: 'durant', name: 'Kevin Durant', team: 'PHX' },
              { id: 'lebron', name: 'LeBron James', team: 'LAL' }
            ],
            'PF': [
              { id: 'giannis', name: 'Giannis Antetokounmpo', team: 'MIL' },
              { id: 'davis', name: 'Anthony Davis', team: 'LAL' },
              { id: 'zion', name: 'Zion Williamson', team: 'NOP' }
            ],
            'C': [
              { id: 'jokic', name: 'Nikola Jokic', team: 'DEN' },
              { id: 'embiid', name: 'Joel Embiid', team: 'PHI' },
              { id: 'wemby', name: 'Victor Wembanyama', team: 'SAS' }
            ]
          };
          roster = nbaRosters[position] || [];
          break;

        case 'mlb':
          // Comprehensive MLB rosters with backups - DraftKings style
          const mlbRosters: any = {
            'P': [
              // Top Starters
              { id: 'degrom', name: 'Jacob deGrom', team: 'TEX' },
              { id: 'cole', name: 'Gerrit Cole', team: 'NYY' },
              { id: 'scherzer', name: 'Max Scherzer', team: 'NYM' },
              { id: 'burnes', name: 'Corbin Burnes', team: 'BAL' },
              { id: 'wheeler', name: 'Zack Wheeler', team: 'PHI' },
              { id: 'alcantara', name: 'Sandy Alcantara', team: 'MIA' },
              { id: 'verlander', name: 'Justin Verlander', team: 'HOU' },
              { id: 'cease', name: 'Dylan Cease', team: 'SD' },
              { id: 'nola', name: 'Aaron Nola', team: 'PHI' },
              { id: 'bassitt', name: 'Chris Bassitt', team: 'TOR' },
              { id: 'manoah', name: 'Alek Manoah', team: 'TOR' },
              { id: 'valdez', name: 'Framber Valdez', team: 'HOU' },
              // Relief Pitchers
              { id: 'hader', name: 'Josh Hader', team: 'HOU' },
              { id: 'diaz', name: 'Edwin Diaz', team: 'NYM' },
              { id: 'clase', name: 'Emmanuel Clase', team: 'CLE' },
              { id: 'hendriks', name: 'Liam Hendriks', team: 'CWS' },
              { id: 'romano', name: 'Jordan Romano', team: 'TOR' },
              { id: 'pressly', name: 'Ryan Pressly', team: 'HOU' },
              { id: 'kimbrel', name: 'Craig Kimbrel', team: 'PHI' },
              { id: 'iglesias', name: 'Raisel Iglesias', team: 'ATL' }
            ],
            'C': [
              { id: 'smith', name: 'Will Smith', team: 'LAD' },
              { id: 'realmuto', name: 'J.T. Realmuto', team: 'PHI' },
              { id: 'salvador', name: 'Salvador Perez', team: 'KC' },
              { id: 'contreras', name: 'Willson Contreras', team: 'STL' },
              { id: 'murphy', name: 'Sean Murphy', team: 'ATL' },
              { id: 'kirk', name: 'Alejandro Kirk', team: 'TOR' },
              { id: 'varsho', name: 'Daulton Varsho', team: 'TOR' },
              { id: 'adley', name: 'Adley Rutschman', team: 'BAL' },
              { id: 'keibert', name: 'Keibert Ruiz', team: 'WAS' },
              { id: 'grandal', name: 'Yasmani Grandal', team: 'CWS' },
              { id: 'stephenson', name: 'Tyler Stephenson', team: 'CIN' },
              { id: 'nola2', name: 'Austin Nola', team: 'SD' }
            ],
            '1B': [
              { id: 'freeman', name: 'Freddie Freeman', team: 'LAD' },
              { id: 'goldschmidt', name: 'Paul Goldschmidt', team: 'STL' },
              { id: 'olson', name: 'Matt Olson', team: 'ATL' },
              { id: 'alonso', name: 'Pete Alonso', team: 'NYM' },
              { id: 'vladguerrero', name: 'Vladimir Guerrero Jr.', team: 'TOR' },
              { id: 'rizzo', name: 'Anthony Rizzo', team: 'NYY' },
              { id: 'bell', name: 'Josh Bell', team: 'WAS' },
              { id: 'abreu', name: 'Jose Abreu', team: 'HOU' },
              { id: 'santana', name: 'Carlos Santana', team: 'MIL' },
              { id: 'hosmer', name: 'Eric Hosmer', team: 'SD' },
              { id: 'walsh', name: 'Jared Walsh', team: 'LAA' },
              { id: 'voit', name: 'Luke Voit', team: 'WAS' }
            ],
            '2B': [
              { id: 'altuve', name: 'Jose Altuve', team: 'HOU' },
              { id: 'muncy', name: 'Max Muncy', team: 'LAD' },
              { id: 'lemahieu', name: 'DJ LeMahieu', team: 'NYY' },
              { id: 'mcneil', name: 'Jeff McNeil', team: 'NYM' },
              { id: 'arraez', name: 'Luis Arraez', team: 'MIA' },
              { id: 'semien', name: 'Marcus Semien', team: 'TEX' },
              { id: 'biggio', name: 'Cavan Biggio', team: 'TOR' },
              { id: 'india', name: 'Jonathan India', team: 'CIN' },
              { id: 'lux', name: 'Gavin Lux', team: 'LAD' },
              { id: 'gleyber', name: 'Gleyber Torres', team: 'NYY' },
              { id: 'albies', name: 'Ozzie Albies', team: 'ATL' },
              { id: 'merrifield', name: 'Whit Merrifield', team: 'TOR' }
            ],
            '3B': [
              { id: 'arenado', name: 'Nolan Arenado', team: 'STL' },
              { id: 'devers', name: 'Rafael Devers', team: 'BOS' },
              { id: 'machado', name: 'Manny Machado', team: 'SD' },
              { id: 'bregman', name: 'Alex Bregman', team: 'HOU' },
              { id: 'turner', name: 'Justin Turner', team: 'BOS' },
              { id: 'chapman', name: 'Matt Chapman', team: 'TOR' },
              { id: 'ramirez', name: 'Jose Ramirez', team: 'CLE' },
              { id: 'riley', name: 'Austin Riley', team: 'ATL' },
              { id: 'rendon', name: 'Anthony Rendon', team: 'LAA' },
              { id: 'suarez', name: 'Eugenio Suarez', team: 'SEA' },
              { id: 'hayes', name: 'Ke\'Bryan Hayes', team: 'PIT' },
              { id: 'bohm', name: 'Alec Bohm', team: 'PHI' }
            ],
            'SS': [
              { id: 'tatis', name: 'Fernando Tatis Jr.', team: 'SD' },
              { id: 'turner2', name: 'Trea Turner', team: 'PHI' },
              { id: 'bogaerts', name: 'Xander Bogaerts', team: 'SD' },
              { id: 'lindor', name: 'Francisco Lindor', team: 'NYM' },
              { id: 'story', name: 'Trevor Story', team: 'BOS' },
              { id: 'correa', name: 'Carlos Correa', team: 'MIN' },
              { id: 'swanson', name: 'Dansby Swanson', team: 'CHC' },
              { id: 'bichette', name: 'Bo Bichette', team: 'TOR' },
              { id: 'seager', name: 'Corey Seager', team: 'TEX' },
              { id: 'anderson', name: 'Tim Anderson', team: 'CWS' },
              { id: 'franco', name: 'Wander Franco', team: 'TB' },
              { id: 'pena', name: 'Jeremy Pena', team: 'HOU' }
            ],
            'OF': [
              { id: 'trout', name: 'Mike Trout', team: 'LAA' },
              { id: 'betts', name: 'Mookie Betts', team: 'LAD' },
              { id: 'acuna', name: 'Ronald Acuña Jr.', team: 'ATL' },
              { id: 'soto', name: 'Juan Soto', team: 'SD' },
              { id: 'tucker', name: 'Kyle Tucker', team: 'HOU' },
              { id: 'alvarez', name: 'Yordan Alvarez', team: 'HOU' },
              { id: 'harper', name: 'Bryce Harper', team: 'PHI' },
              { id: 'ohtani', name: 'Shohei Ohtani', team: 'LAD' },
              { id: 'judge', name: 'Aaron Judge', team: 'NYY' },
              { id: 'springer', name: 'George Springer', team: 'TOR' },
              { id: 'hernandez', name: 'Teoscar Hernandez', team: 'LAD' },
              { id: 'robert', name: 'Luis Robert Jr.', team: 'CWS' },
              { id: 'harris', name: 'Michael Harris II', team: 'ATL' },
              { id: 'castellanos', name: 'Nick Castellanos', team: 'PHI' },
              { id: 'schwarber', name: 'Kyle Schwarber', team: 'PHI' },
              { id: 'gurriel', name: 'Lourdes Gurriel Jr.', team: 'TOR' },
              { id: 'stanton', name: 'Giancarlo Stanton', team: 'NYY' },
              { id: 'bellinger', name: 'Cody Bellinger', team: 'CHC' },
              { id: 'ward', name: 'Taylor Ward', team: 'LAA' },
              { id: 'riley2', name: 'Austin Riley', team: 'ATL' }
            ]
          };
          roster = mlbRosters[position] || [];
          break;

        case 'nhl':
          // NHL roster data by position
          const nhlRosters: any = {
            'C': [
              { id: 'mcdavid', name: 'Connor McDavid', team: 'EDM' },
              { id: 'draisaitl', name: 'Leon Draisaitl', team: 'EDM' },
              { id: 'mackinnon', name: 'Nathan MacKinnon', team: 'COL' }
            ],
            'LW': [
              { id: 'pastrnak', name: 'David Pastrnak', team: 'BOS' },
              { id: 'panarin', name: 'Artemi Panarin', team: 'NYR' }
            ],
            'RW': [
              { id: 'kucherov', name: 'Nikita Kucherov', team: 'TBL' },
              { id: 'rantanen', name: 'Mikko Rantanen', team: 'COL' }
            ],
            'D': [
              { id: 'makar', name: 'Cale Makar', team: 'COL' },
              { id: 'hedman', name: 'Victor Hedman', team: 'TBL' }
            ],
            'G': [
              { id: 'shesterkin', name: 'Igor Shesterkin', team: 'NYR' },
              { id: 'vasilevskiy', name: 'Andrei Vasilevskiy', team: 'TBL' }
            ]
          };
          roster = nhlRosters[position] || [];
          break;

        default:
          return res.status(400).json({ success: false, message: 'Unsupported sport' });
      }

      res.json({
        success: true,
        sport,
        position,
        roster,
        count: roster.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Roster API error:', error);
      res.status(500).json({ success: false, message: 'Failed to load roster data' });
    }
  });

  // Player Analysis endpoint
  app.post('/api/fantasy/analyze-player', async (req, res) => {
    try {
      const { sport, position, player, team } = req.body;
      console.log(`Player analysis request: ${sport} ${position} ${player} (${team})`);

      // Generate realistic fantasy projections by sport/position
      const projectedPoints = getRealisticProjection(sport, position);
      
      const analysis = {
        success: true,
        player: player,
        sport: sport.toUpperCase(),
        position: position,
        team: team,
        analysis: {
          projectedPoints: projectedPoints,
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
          matchupRating: Math.floor(Math.random() * 5) + 6, // 6-10 rating
          recommendation: getPlayerRecommendation(position),
          keyFactors: getKeyFactors(sport, position),
          injuryRisk: getInjuryRisk(),
          weather: sport === 'nfl' ? getWeatherImpact() : null,
          gameScript: getGameScript(position),
          ownership: `${Math.floor(Math.random() * 40) + 5}%` // 5-45% ownership
        }
      };

      res.json(analysis);

    } catch (error) {
      console.error('Player analysis error:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze player' });
    }
  });

  function getRealisticProjection(sport: string, position: string) {
    const sportProjections: any = {
      'nfl': {
        'QB': () => Math.floor(Math.random() * 11) + 15, // 15-25 points
        'RB': () => Math.floor(Math.random() * 15) + 8,  // 8-22 points  
        'WR': () => Math.floor(Math.random() * 15) + 6,  // 6-20 points
        'TE': () => Math.floor(Math.random() * 15) + 4,  // 4-18 points
        'K': () => Math.floor(Math.random() * 10) + 6,   // 6-15 points
        'DEF': () => Math.floor(Math.random() * 17) + 2, // 2-18 points (realistic!)
      },
      'nba': {
        'PG': () => Math.floor(Math.random() * 25) + 30, // 30-55 points
        'SG': () => Math.floor(Math.random() * 25) + 25, // 25-50 points
        'SF': () => Math.floor(Math.random() * 25) + 25, // 25-50 points
        'PF': () => Math.floor(Math.random() * 20) + 25, // 25-45 points
        'C': () => Math.floor(Math.random() * 20) + 25,  // 25-45 points
      },
      'mlb': {
        'P': () => Math.floor(Math.random() * 30) + 10,  // 10-40 points
        'C': () => Math.floor(Math.random() * 20) + 8,   // 8-28 points
        '1B': () => Math.floor(Math.random() * 20) + 10, // 10-30 points
        '2B': () => Math.floor(Math.random() * 18) + 8,  // 8-26 points
        '3B': () => Math.floor(Math.random() * 20) + 10, // 10-30 points
        'SS': () => Math.floor(Math.random() * 18) + 8,  // 8-26 points
        'OF': () => Math.floor(Math.random() * 20) + 8,  // 8-28 points
      },
      'nhl': {
        'C': () => Math.floor(Math.random() * 15) + 15,  // 15-30 points
        'W': () => Math.floor(Math.random() * 15) + 12,  // 12-27 points
        'D': () => Math.floor(Math.random() * 12) + 8,   // 8-20 points
        'G': () => Math.floor(Math.random() * 20) + 10,  // 10-30 points
      }
    };
    
    const sportProj = sportProjections[sport.toLowerCase()];
    if (sportProj && sportProj[position]) {
      return sportProj[position]();
    }
    return Math.floor(Math.random() * 20) + 10; // fallback
  }

  function getPlayerRecommendation(position: string) {
    const recommendations = {
      'QB': 'Strong play in favorable matchup',
      'RB': 'Solid volume expected, good floor',
      'WR': 'Target-heavy role, ceiling play',
      'TE': 'Red zone upside, consistent target share',
      'K': 'High-scoring game environment',
      'DEF': 'Multiple turnover opportunities expected',
      'PG': 'High assist upside with pace advantage',
      'SG': 'Volume shooting opportunity',
      'SF': 'Well-rounded production expected',
      'PF': 'Rebound and double-double potential',
      'C': 'Dominant paint presence'
    };
    return recommendations[position] || 'Solid play expected';
  }

  function getKeyFactors(sport: string, position: string) {
    const sportFactors = {
      'nfl': ['Matchup', 'Usage Rate', 'Game Script', 'Weather'],
      'nba': ['Pace', 'Usage', 'Matchup', 'Rest Advantage'],
      'mlb': ['Ballpark', 'Pitcher Matchup', 'Lineup Position', 'Weather'],
      'nhl': ['Ice Time', 'Power Play', 'Matchup', 'Back-to-back']
    };
    return sportFactors[sport.toLowerCase()] || ['Matchup', 'Usage', 'Form', 'Opportunity'];
  }

  function getInjuryRisk() {
    const risks = ['Low', 'Medium', 'High'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  function getWeatherImpact() {
    const conditions = ['No Impact', 'Wind Factor', 'Cold Weather', 'Dome Game'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  function getGameScript(position: string) {
    const scripts = ['Positive', 'Neutral', 'Negative', 'Blowout Upside'];
    return scripts[Math.floor(Math.random() * scripts.length)];
  }

  app.post("/api/fantasy/analyze-slate", async (req, res) => {
    try {
      const { slate = 'all-day' } = req.body;
      
      // Use real Yahoo API credentials
      const { YahooSportsAPI } = await import('./yahooSportsAPI');
      const yahooAPI = new YahooSportsAPI();
      
      const analysis = await yahooAPI.analyzeSundaySlate(slate);
      
      res.json({
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Fantasy slate analysis error:', error);
      res.status(500).json({ error: "Failed to analyze slate" });
    }
  });

  app.post("/api/fantasy/ask-question", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      console.log('Fantasy AI Question:', question);
      
      // Use Yahoo Sports API to get real data for AI analysis
      const { YahooSportsAPI } = await import('./yahooSportsAPI');
      const yahooAPI = new YahooSportsAPI();
      
      // Get the user's session to check for Yahoo authentication
      const session = req.session as any;
      const hasYahooToken = !!session?.yahooAccessToken;
      
      let response;
      
      // Use Yahoo API to generate intelligent responses based on real data
      try {
        if (hasYahooToken) {
          // Authenticated user - can access personalized Yahoo Fantasy data
          response = await yahooAPI.generateIntelligentResponse(question, session);
        } else {
          // Use public Yahoo Sports data for analysis
          response = await yahooAPI.answerFantasyQuestion(question);
        }
      } catch (apiError) {
        console.error('Yahoo API error, falling back to enhanced analysis:', apiError);
        
        // Fallback to enhanced generic analysis when API fails
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('running back') || lowerQuestion.includes('rb') || lowerQuestion.includes('carries')) {
          response = {
            answer: `🏈 **RB ANALYSIS REQUEST**: I need live Yahoo Sports data to provide specific player insights. Connect your Yahoo account for personalized recommendations based on your league data.`,
            analysis: `Without Yahoo authentication, I can't access current player usage rates, matchup data, or injury reports. Connect to unlock detailed RB analysis.`,
            supportingData: [
              { metric: 'Data Needed', value: 'Yahoo Fantasy Sports API' },
              { metric: 'Analysis Type', value: 'Usage rates, carry share, matchups' },
              { metric: 'Recommendation', value: 'Connect Yahoo account above' }
            ],
            confidence: 60
          };
        } else if (lowerQuestion.includes('wide receiver') || lowerQuestion.includes('wr') || lowerQuestion.includes('matchup')) {
          response = {
            answer: `🎯 **WR MATCHUP ANALYSIS**: Real-time target share data and defensive rankings require Yahoo Sports API access. Connect your account for detailed WR insights.`,
            analysis: `WR analysis needs current target trends, red zone usage, and opponent defensive stats from Yahoo's live data feeds.`,
            supportingData: [
              { metric: 'Data Source', value: 'Yahoo Sports API Required' },
              { metric: 'Analysis Focus', value: 'Target share, red zone usage, matchups' },
              { metric: 'Sports Covered', value: 'NFL, NBA, MLB, NHL' }
            ],
            confidence: 65
          };
        } else if (lowerQuestion.includes('basketball') || lowerQuestion.includes('nba') || lowerQuestion.includes('points') || lowerQuestion.includes('rebounds')) {
          response = {
            answer: `🏀 **NBA FANTASY ANALYSIS**: Basketball insights require live Yahoo NBA data including usage rates, pace factors, and injury reports.`,
            analysis: `NBA analysis covers player efficiency, pace-adjusted stats, matchup advantages, and real-time injury impacts across all teams.`,
            supportingData: [
              { metric: 'Sport', value: 'NBA Basketball' },
              { metric: 'Key Metrics', value: 'Usage %, Pace, Efficiency' },
              { metric: 'Data Source', value: 'Yahoo Sports NBA API' }
            ],
            confidence: 70
          };
        } else if (lowerQuestion.includes('baseball') || lowerQuestion.includes('mlb') || lowerQuestion.includes('pitcher') || lowerQuestion.includes('hitter')) {
          response = {
            answer: `⚾ **MLB FANTASY INSIGHTS**: Baseball analysis requires Yahoo's pitcher vs. hitter matchup data, weather conditions, and ballpark factors.`,
            analysis: `MLB insights include platoon splits, ballpark effects, weather impacts, and detailed pitcher-hitter historical matchups.`,
            supportingData: [
              { metric: 'Sport', value: 'MLB Baseball' },
              { metric: 'Analysis Type', value: 'Matchups, Weather, Ballparks' },
              { metric: 'Data Requirements', value: 'Yahoo MLB API Access' }
            ],
            confidence: 75
          };
        } else if (lowerQuestion.includes('hockey') || lowerQuestion.includes('nhl') || lowerQuestion.includes('goals') || lowerQuestion.includes('assists')) {
          response = {
            answer: `🏒 **NHL FANTASY ANALYSIS**: Hockey insights need Yahoo's line combination data, power play units, and goalie matchup information.`,
            analysis: `NHL analysis covers line combinations, power play opportunities, goalie starts, and team pace factors for comprehensive insights.`,
            supportingData: [
              { metric: 'Sport', value: 'NHL Hockey' },
              { metric: 'Key Factors', value: 'Lines, PP units, Goalies' },
              { metric: 'Data Source', value: 'Yahoo NHL API' }
            ],
            confidence: 72
          };
        } else {
          response = {
            answer: `🤖 **MULTI-SPORT AI READY**: I can analyze NFL, NBA, MLB, and NHL fantasy questions using live Yahoo Sports data once connected.`,
            analysis: `The AI supports comprehensive analysis across all major sports with real-time data integration when Yahoo authentication is available.`,
            supportingData: [
              { metric: 'Sports Supported', value: 'NFL, NBA, MLB, NHL' },
              { metric: 'Data Source', value: 'Yahoo Sports API (all leagues)' },
              { metric: 'Analysis Types', value: 'Players, Matchups, Trends, Injuries' }
            ],
            confidence: 80
          };
        }
      }
      
      res.json({
        success: true,
        question,
        ...response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Fantasy question error:', error);
      res.status(500).json({ error: "Failed to answer question" });
    }
  });

  app.get("/api/fantasy/injury-reports", async (req, res) => {
    try {
      const { YahooSportsAPI } = await import('./yahooSportsAPI');
      const yahooAPI = new YahooSportsAPI();
      
      const injuries = await yahooAPI.getInjuryReports();
      
      res.json({
        success: true,
        injuries,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Injury reports error:', error);
      res.status(500).json({ error: "Failed to get injury reports" });
    }
  });

  app.get("/api/fantasy/projections/:position", async (req, res) => {
    try {
      const { position } = req.params;
      const { week = 1 } = req.query;
      
      if (!['RB', 'WR', 'QB', 'TE'].includes(position.toUpperCase())) {
        return res.status(400).json({ error: "Invalid position" });
      }

      const { YahooSportsAPI } = await import('./yahooSportsAPI');
      const yahooAPI = new YahooSportsAPI();
      
      const projections = await yahooAPI.getPlayerProjections(
        position.toUpperCase() as 'RB' | 'WR' | 'QB' | 'TE',
        parseInt(week as string)
      );
      
      res.json({
        success: true,
        position,
        week,
        projections,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Player projections error:', error);
      res.status(500).json({ error: "Failed to get projections" });
    }
  });

  // AI conversation route
  const { handleAIConversation } = await import('./ai-conversation');
  app.post('/api/ai-conversation', handleAIConversation);

  // Session management routes
  const { registerSessionRoutes } = await import('./sessionRoutes');
  registerSessionRoutes(app);

  // Domain management routes
  registerDomainRoutes(app);

  // Tournament management routes
  registerTournamentRoutes(app);

  // Create and return server
  const server = createServer(app);
  return server;
}