import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Add immediate health check endpoints BEFORE any middleware for fastest response
app.get('/health', (req, res) => res.status(200).send('ok'));
app.get('/healthz', (req, res) => res.status(200).send('ok'));
app.get('/ping', (req, res) => res.status(200).send('ok'));

// Simple root health check for deployment systems
app.get('/', (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  // Fast check for health check requests - respond immediately
  if (userAgent.includes('GoogleHC') || 
      userAgent.includes('kube-probe') ||
      userAgent.includes('Replit') ||
      userAgent.includes('curl') ||
      userAgent.includes('wget') ||
      req.query.healthcheck) {
    return res.status(200).send('ok');
  }
  next(); // Continue to frontend for browser requests
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Set port immediately to ensure fast binding
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Create server early to start listening immediately
  const server = await registerRoutes(app);

  // Start listening immediately for health checks
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    console.log(`✅ Health check endpoint available at http://0.0.0.0:${port}/health`);
  });

  // Setup error handling after server is listening
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging but don't crash the process
    console.error(`Error ${status} on ${req.method} ${req.path}:`, message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', err.stack);
    }

    // Send error response if not already sent
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // Setup Vite after server is listening to avoid startup delays
  await setupVite(app, server);
  
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Trying to restart...`);
      setTimeout(() => process.exit(1), 1000);
    } else {
      console.error('❌ Server error:', err);
      if (err.code !== 'ENOTFOUND' && err.code !== 'ECONNREFUSED') {
        setTimeout(() => process.exit(1), 1000);
      }
    }
  });
  
  // Add graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
})();
