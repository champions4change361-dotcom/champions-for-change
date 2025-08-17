import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";

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
      
      // Check for master admin credentials
      if (email === 'champions4change361@gmail.com' && password === 'master-admin-danielthornton') {
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

        // Store in session
        (req as any).session.user = masterAdmin;
        
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

  // Session-based auth check middleware
  const checkAuth = (req: any, res: any, next: any) => {
    if (req.session?.user || (req.user && req.user.claims)) {
      next();
    } else {
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
      
      if (!firstName || !lastName || !email || !role || !subscriptionPlan) {
        return res.status(400).json({ error: "Missing required fields" });
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
      
      res.json({ success: true, user: fakeUser });
    } catch (error) {
      console.error("Error creating fake user:", error);
      res.status(500).json({ error: "Failed to create fake user" });
    }
  });

  // Create and return server
  const server = createServer(app);
  return server;
}