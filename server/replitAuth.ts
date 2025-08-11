import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

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
      httpOnly: true,
      secure: false, // Allow HTTP for development
      maxAge: sessionTtl,
      sameSite: 'lax', // More permissive for OAuth flows
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
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple authentication bypass for deployment
  console.log("Setting up simplified authentication for deployment compatibility");
  
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Simple login endpoint for deployment
  app.get("/api/login", async (req, res, next) => {
    console.log(`Login attempt for hostname: ${req.hostname}`);
    
    try {
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
        
        // Force session save
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          return res.redirect('/');
        });
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      return res.status(500).json({ error: "Authentication setup failed" });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log(`Callback for hostname: ${req.hostname}`);
    
    passport.authenticate("replitauth", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log(`Auth check - isAuthenticated: ${req.isAuthenticated()}, user: ${req.user ? 'exists' : 'none'}`);
  
  // Simplified authentication check for deployment
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return next();
};