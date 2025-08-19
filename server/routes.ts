import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { emailService } from "./emailService";
import supportTeamRoutes from "./supportTeamRoutes";
import Stripe from "stripe";

console.log('🏫 District athletics management platform initialized');
console.log('💚 Champions for Change nonprofit mission active');

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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
        // Create master admin user session
        const masterAdmin = {
          id: 'master-admin-danielthornton',
          email: email,
          firstName: 'Daniel',
          lastName: 'Thornton',
          role: 'district_athletic_director',
          subscriptionPlan: 'district_enterprise',
          organizationName: 'Champions for Change',
          userType: userType || 'district',
          isAdmin: true
        };

        // Store in session with callback to ensure it's saved
        (req as any).session.user = masterAdmin;
        (req as any).session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          } else {
            console.log('Session saved successfully for master admin');
          }
        });
        
        console.log('Master admin session created successfully');
        res.json({ 
          success: true, 
          user: masterAdmin,
          message: 'Login successful' 
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
      // Check session-based auth first
      if (req.session?.user) {
        return res.json(req.session.user);
      }
      
      // Then check OAuth auth
      if (req.user && req.user.claims) {
        res.json({
          id: req.user.claims.sub,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      } else {
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

  // Create and return server
  const server = createServer(app);
  return server;
}