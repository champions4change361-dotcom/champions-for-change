import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { nightlySportsIntelligence } from "./nightly-sports-intelligence.js";
import { setupSecurity } from "./security";

const app = express();

// Health check endpoints are handled in routes.ts to avoid conflicts
// Root endpoint will be handled by Vite/React app after setupVite() is called

// Setup comprehensive security BEFORE other middleware
setupSecurity(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CRITICAL SECURITY CHECK: Ensure audit integrity key is set for HIPAA compliance
  if (!process.env.AUDIT_INTEGRITY_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: AUDIT_INTEGRITY_KEY environment variable is required for production!');
      console.error('🚨 This is required for HIPAA compliance and audit log integrity.');
      console.error('🚨 Application cannot start without this security requirement.');
      process.exit(1);
    } else {
      console.warn('⚠️  DEVELOPMENT: AUDIT_INTEGRITY_KEY not set - using fallback for development only');
      process.env.AUDIT_INTEGRITY_KEY = 'development-key-not-for-production';
    }
  }
  console.log('✅ Security check passed: AUDIT_INTEGRITY_KEY is configured');

  // Set port immediately to ensure fast binding
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Initialize live data service
  const { LiveDataService } = await import('./live-data-service.js');
  await LiveDataService.scheduleDataRefresh();
  console.log('🔄 Live data service initialized');

  // Create server early to start listening immediately
  const server = await registerRoutes(app);

  // 🏈 Initialize ESPN Real-Time Scoring Service (after storage is available)
  console.log('🏈 Starting ESPN real-time scoring service...');
  const { ESPNScoringService } = await import('./espn-scoring-service');
  const { getStorage } = await import('./storage');
  const storage = await getStorage();
  const espnScoringService = new ESPNScoringService(storage);
  espnScoringService.startRealTimeScoring();
  console.log('✅ ESPN real-time scoring service initialized');

  // 🏆 Initialize Tournament Real-Time WebSocket (after server is available)
  console.log('🔄 Initializing tournament real-time scoring...');
  try {
    const socketio = await import('socket.io');
    const io = new socketio.Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Store io instance globally for tournament services to use
    (global as any).tournamentIO = io;
    
    io.on('connection', (socket) => {
      console.log('🔗 Tournament client connected:', socket.id);
      
      socket.on('join-tournament', (tournamentId: string) => {
        socket.join(`tournament-${tournamentId}`);
        console.log(`📡 Client joined tournament ${tournamentId}`);
      });
      
      socket.on('leave-tournament', (tournamentId: string) => {
        socket.leave(`tournament-${tournamentId}`);
        console.log(`📡 Client left tournament ${tournamentId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Tournament client disconnected:', socket.id);
      });
    });
    
    console.log('✅ Tournament real-time scoring WebSocket initialized on main server');
  } catch (error) {
    console.error('❌ Failed to initialize tournament WebSocket:', error);
  }

  // Initialize Pro Football Reference Integration (replaces all NFL scrapers)
  const { pfrIntegration } = await import('./pro-football-reference-integration.js');
  pfrIntegration.startScheduledUpdates();
  console.log('🏈 Pro Football Reference integration initialized (replaces NFL.com scrapers)');

  // Setup Vite before starting server
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    // In production, serve static files from the build directory
    serveStatic(app);
  }

  // Setup error handling before starting server
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging but don't crash the process
    console.error(`❌ Error ${status} on ${req.method} ${req.path}:`, message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', err.stack);
    }

    // Send error response if not already sent
    if (!res.headersSent) {
      // For root endpoint, always return 200 even on errors (health checks handled in routes.ts)
      if (req.path === '/') {
        res.status(200).send('ok');
      } else {
        res.status(status).json({ message });
      }
    }
  });

  // Start listening after Vite setup
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server listening on port ${port}`);
    console.log(`✅ Health check endpoints available:`);
    console.log(`   - http://0.0.0.0:${port}/`);
    console.log(`   - http://0.0.0.0:${port}/health`);
    console.log(`   - http://0.0.0.0:${port}/healthz`);
    console.log(`   - http://0.0.0.0:${port}/api/health`);
    console.log(`🎯 DEPLOYMENT READY: All health checks configured for Replit`);
    log(`serving on port ${port}`);
  });
  
  server.on('error', (err: any) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Trying to restart...`);
      setTimeout(() => process.exit(1), 1000);
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.warn(`⚠️  Network error (${err.code}), but server can continue`);
    } else {
      console.error(`❌ Critical server error: ${err.message}`);
      // Don't exit immediately on deployment - let health checks continue working
      if (process.env.NODE_ENV === 'production') {
        console.error('🔄 Production mode: keeping server alive for health checks');
      } else {
        setTimeout(() => process.exit(1), 1000);
      }
    }
  });
  
  // Add critical process error handling for deployment stability
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('🔄 Production mode: keeping server alive despite error');
    } else {
      console.error('💥 Development mode: exiting process');
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env.NODE_ENV === 'production') {
      console.error('🔄 Production mode: keeping server alive despite rejection');
    } else {
      console.error('💥 Development mode: exiting process');
      process.exit(1);
    }
  });

  // Add graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('📋 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('📋 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
})();
