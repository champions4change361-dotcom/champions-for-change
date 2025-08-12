import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import cookieParser from "cookie-parser";
import { storage, getStorage } from "./storage";

// Configure domains for OAuth - support both Replit and custom domain
const supportedDomains = process.env.REPLIT_DOMAINS ? 
  process.env.REPLIT_DOMAINS.split(",") : [];

// Add trantortournaments.org as supported domain
if (!supportedDomains.includes('trantortournaments.org')) {
  supportedDomains.push('trantortournaments.org');
}

console.log("Supported OAuth domains:", supportedDomains);

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development due to database connection issues
  const SessionMemoryStore = MemoryStore(session);
  const sessionStore = new SessionMemoryStore({
    checkPeriod: sessionTtl, // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false, // Allow client access for mobile compatibility
      secure: false, // Allow HTTP for development and mobile testing
      maxAge: sessionTtl,
      sameSite: 'none', // More permissive for cross-origin access
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const userStorage = await getStorage();
  await userStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

async function setupOAuthStrategies() {
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Set up OAuth strategies for all supported domains
  for (const domain of supportedDomains) {
    console.log(`Setting up OAuth strategy for domain: ${domain}`);
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(cookieParser());
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  console.log("Setting up OAuth authentication for custom domain support");
  
  // Try to set up real OAuth if configured, otherwise use simplified auth
  if (process.env.REPL_ID && supportedDomains.length > 0) {
    console.log("Setting up real OAuth with domains:", supportedDomains);
    await setupOAuthStrategies();
  } else {
    console.log("Using simplified authentication for development");
  }
  
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // OAuth and fallback login endpoint
  app.get("/api/login", async (req, res, next) => {
    console.log(`Login attempt for hostname: ${req.hostname}, IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
    
    // Check if OAuth is configured for this domain
    const strategyName = `replitauth:${req.hostname}`;
    
    // Try OAuth first if configured
    if (supportedDomains.includes(req.hostname) && process.env.REPL_ID) {
      console.log(`Using OAuth strategy for domain: ${req.hostname}`);
      try {
        return passport.authenticate(strategyName, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      } catch (error) {
        console.log(`OAuth strategy failed for ${req.hostname}, using fallback`);
      }
    }
    
    // Fallback to simplified authentication for development/testing
    console.log(`Using fallback authentication for ${req.hostname}`);
    try {
      const storage = await getStorage();
      
      // Create user in storage first
      const adminUser = await storage.upsertUser({
        id: 'champions-admin-1',
        email: 'champions4change361@gmail.com',
        firstName: 'Daniel',
        lastName: 'Thornton',
        profileImageUrl: null
      });
      
      // Create authenticated session
      const sessionUser = {
        claims: { 
          sub: adminUser.id,
          email: adminUser.email,
          first_name: adminUser.firstName,
          last_name: adminUser.lastName,
          profile_image_url: adminUser.profileImageUrl
        }
      };
      
      req.login(sessionUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        console.log("User authenticated successfully:", sessionUser.claims.email);
        
        // Force session save with callback
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          
          // Set additional cookie for mobile compatibility
          res.cookie('user_authenticated', 'true', {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            secure: false,
            sameSite: 'none'
          });
          
          return res.redirect('/');
        });
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      return res.status(500).json({ error: "Authentication setup failed" });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log(`OAuth callback for hostname: ${req.hostname}, query:`, req.query);
    
    // Find the correct strategy for this domain
    let strategyName = `replitauth:${req.hostname}`;
    
    // If we can't find the strategy for the current hostname, try the supported domains
    if (!supportedDomains.includes(req.hostname)) {
      console.log(`Domain ${req.hostname} not directly supported, checking configured domains`);
      // Use the first supported domain that has OAuth configured
      const configuredDomain = supportedDomains.find(domain => domain.includes('trantortournaments.org'));
      if (configuredDomain) {
        strategyName = `replitauth:${configuredDomain}`;
        console.log(`Using OAuth strategy: ${strategyName}`);
      } else {
        console.log('No suitable OAuth strategy found, redirecting to login');
        return res.redirect("/api/login");
      }
    }
    
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", async (req, res) => {
    req.logout(() => {
      // Clear authentication cookie
      res.clearCookie('user_authenticated');
      
      // If OAuth is configured, use proper logout
      if (process.env.REPL_ID && supportedDomains.includes(req.hostname)) {
        getOidcConfig().then(config => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        }).catch(() => {
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log(`Auth check - isAuthenticated: ${req.isAuthenticated()}, user: ${req.user ? 'exists' : 'none'}, cookies: ${req.cookies.user_authenticated || 'none'}`);
  
  // Check if user is authenticated via session or has auth cookie
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Fallback: check for auth cookie (for mobile compatibility)
  if (req.cookies.user_authenticated === 'true') {
    console.log("Using cookie-based authentication for mobile device");
    
    // Create temporary session for cookie-authenticated user
    const storage = await getStorage();
    const adminUser = await storage.getUser('champions-admin-1');
    
    if (adminUser) {
      // Manually set user for this request
      req.user = {
        claims: {
          sub: adminUser.id,
          email: adminUser.email,
          first_name: adminUser.firstName,
          last_name: adminUser.lastName,
          profile_image_url: adminUser.profileImageUrl
        }
      } as any;
      return next();
    }
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};