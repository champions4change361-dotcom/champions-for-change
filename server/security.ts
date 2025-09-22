import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { logSecurityEvent } from './security-monitor';

// Security middleware configuration
export function setupSecurity(app: express.Application) {
  console.log('🔒 Setting up comprehensive security middleware...');

  // 1. Security Headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"], // Added Stripe.js
        connectSrc: ["'self'", "https:", "wss:", "ws:", "https://api.stripe.com"], // Added Stripe API
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com"], // Allow Stripe
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Vite HMR
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 2. Rate Limiting - Multiple tiers for different endpoints
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit auth attempts
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit API calls
    message: {
      error: 'Too many API requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply different rate limits to different routes
  app.use('/api/auth', authLimiter);
  app.use('/api/login', authLimiter);
  app.use('/api/register', authLimiter);
  app.use('/api', apiLimiter);
  app.use(generalLimiter);

  // 3. Input Sanitization - Prevent NoSQL injection
  app.use(mongoSanitize({
    replaceWith: '_'
  }));

  // 4. Parameter Pollution Protection
  app.use(hpp({
    whitelist: ['tags', 'categories', 'sports'] // Allow arrays for these params
  }));

  // 5. Block Known Malicious Paths
  const maliciousPaths = [
    '/wp-admin',
    '/wp-login',
    '/wp-content',
    '/wp-includes',
    '/wordpress',
    '/.env',
    '/config',
    // NOTE: /admin removed - this is our legitimate admin interface
    '/phpmyadmin',
    '/mysql',
    '/database',
    '/.git',
    '/server-status',
    '/server-info',
    '/.well-known/security.txt',
    '/robots.txt',
  ];

  app.use((req: Request, res: Response, next: NextFunction) => {
    const path = req.path.toLowerCase();
    
    // Block WordPress and other common attack vectors
    if (maliciousPaths.some(malPath => path.startsWith(malPath))) {
      logSecurityEvent(
        'malicious_path',
        req.ip,
        req.get('User-Agent') || 'unknown',
        req.path,
        `Attempted access to blocked path: ${req.path}`,
        'high'
      );
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested resource does not exist'
      });
    }

    // Block requests with suspicious file extensions
    if (path.match(/\.(php|asp|aspx|jsp|cgi|pl)$/)) {
      console.log(`🚫 Blocked suspicious file request: ${req.ip} -> ${req.path}`);
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested resource does not exist'
      });
    }

    next();
  });

  // 6. Block Suspicious Referrers and User Agents
  app.use((req: Request, res: Response, next: NextFunction) => {
    const referer = req.get('Referer') || '';
    const userAgent = req.get('User-Agent') || '';
    
    const suspiciousReferrers = [
      'spyhost.site',
      'malware.com',
      'attack.com',
      'hack.com',
      'botnet'
    ];

    const suspiciousUserAgents = [
      'sqlmap',
      'nikto',
      'nessus',
      'openvas',
      'masscan',
      'nmap'
    ];

    // Check for suspicious referrers
    if (suspiciousReferrers.some(suspicious => referer.includes(suspicious))) {
      logSecurityEvent(
        'suspicious_referrer',
        req.ip,
        userAgent,
        req.path,
        `Suspicious referrer: ${referer}`,
        'high'
      );
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    // Check for suspicious user agents
    if (suspiciousUserAgents.some(suspicious => userAgent.toLowerCase().includes(suspicious))) {
      console.log(`🚫 Blocked suspicious user agent: ${req.ip} -> ${userAgent}`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    next();
  });

  // 7. Security Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Log potentially suspicious activity
    const suspiciousPatterns = [
      'union.*select',
      'script.*alert',
      '<script',
      'javascript:',
      'eval\\(',
      'document\\.cookie',
      'base64_decode',
      'wget',
      'curl',
      '\\.\\.\/',
      'etc/passwd',
      'proc/self/environ'
    ];

    const fullUrl = req.originalUrl;
    const body = JSON.stringify(req.body);
    const query = JSON.stringify(req.query);

    const isSuspicious = suspiciousPatterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(fullUrl) || regex.test(body) || regex.test(query);
    });

    if (isSuspicious) {
      console.log(`⚠️  Suspicious request detected:`);
      console.log(`   IP: ${req.ip}`);
      console.log(`   Method: ${req.method}`);
      console.log(`   URL: ${fullUrl}`);
      console.log(`   User-Agent: ${req.get('User-Agent')}`);
      console.log(`   Referer: ${req.get('Referer') || 'none'}`);
      
      // Don't block automatically, just log for now
      // You can escalate to blocking if you see patterns
    }

    next();
  });

  // 8. CORS Configuration for production
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      'https://championsforchange.net',
      'https://trantortournaments.org',
      'https://www.championsforchange.net',
      'https://www.trantortournaments.org'
    ];

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:5000', 'http://127.0.0.1:5000');
    }

    const origin = req.get('Origin');
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  });

  // 9. Request Size Limits
  app.use(express.json({ limit: '10mb' })); // Reasonable limit for tournament data
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  console.log('✅ Security middleware configured:');
  console.log('   - Rate limiting enabled');
  console.log('   - Security headers applied');
  console.log('   - Malicious path blocking active');
  console.log('   - Input sanitization enabled');
  console.log('   - Suspicious activity monitoring active');
  console.log('   - CORS properly configured');
}

// Emergency security response for detected attacks
export function emergencyBlock(req: Request, res: Response) {
  console.log(`🚨 EMERGENCY BLOCK: ${req.ip} -> ${req.path}`);
  console.log(`   User-Agent: ${req.get('User-Agent')}`);
  console.log(`   Referer: ${req.get('Referer')}`);
  
  res.status(403).json({
    error: 'Security Alert',
    message: 'This request has been blocked for security reasons',
    contact: 'champions4change361@gmail.com'
  });
}