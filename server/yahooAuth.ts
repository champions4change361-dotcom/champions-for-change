import { Request, Response, Express } from 'express';
import * as crypto from 'crypto';

export interface YahooAuthConfig {
  consumerKey: string;
  consumerSecret: string;
  redirectUri: string;
}

export class YahooAuth {
  private config: YahooAuthConfig;
  private requestTokens: Map<string, { token: string; secret: string }> = new Map();

  constructor(config: YahooAuthConfig) {
    this.config = config;
  }

  // Generate OAuth signature
  private generateSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret: string = ''
  ): string {
    // Validate method is a proper HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const normalizedMethod = method.toUpperCase();
    if (!validMethods.includes(normalizedMethod)) {
      throw new Error(`Invalid HTTP method: ${method}`);
    }

    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Create base string
    const baseString = [
      normalizedMethod,
      encodeURIComponent(url),
      encodeURIComponent(sortedParams)
    ].join('&');

    // Create signing key
    const signingKey = `${encodeURIComponent(this.config.consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // Generate signature
    return crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');
  }

  // Step 1: Get request token
  async getRequestToken(): Promise<{ authUrl: string; requestToken: string }> {
    const url = 'https://api.login.yahoo.com/oauth/v2/get_request_token';
    const params: Record<string, string> = {
      oauth_callback: this.config.redirectUri,
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0'
    };

    const signature = this.generateSignature('POST', url, params);
    params.oauth_signature = signature;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Champions-for-Change/1.0'
        },
        body: new URLSearchParams(params).toString()
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status}`);
      }

      const data = await response.text();
      const parsed = new URLSearchParams(data);
      
      const requestToken = parsed.get('oauth_token')!;
      const requestSecret = parsed.get('oauth_token_secret')!;
      const authUrl = parsed.get('xoauth_request_auth_url')!;

      // Store request token and secret
      this.requestTokens.set(requestToken, {
        token: requestToken,
        secret: requestSecret
      });

      return {
        authUrl,
        requestToken
      };
    } catch (error) {
      console.error('Error getting request token:', error);
      throw error;
    }
  }

  // Step 2: Exchange verifier for access token
  async getAccessToken(requestToken: string, verifier: string): Promise<{
    accessToken: string;
    accessSecret: string;
    sessionHandle?: string;
  }> {
    const requestTokenData = this.requestTokens.get(requestToken);
    if (!requestTokenData) {
      throw new Error('Invalid request token');
    }

    const url = 'https://api.login.yahoo.com/oauth/v2/get_token';
    const params: Record<string, string> = {
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: requestToken,
      oauth_verifier: verifier,
      oauth_version: '1.0'
    };

    const signature = this.generateSignature('POST', url, params, requestTokenData.secret);
    params.oauth_signature = signature;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Champions-for-Change/1.0'
        },
        body: new URLSearchParams(params).toString()
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status}`);
      }

      const data = await response.text();
      const parsed = new URLSearchParams(data);
      
      const accessToken = parsed.get('oauth_token')!;
      const accessSecret = parsed.get('oauth_token_secret')!;
      const sessionHandle = parsed.get('oauth_session_handle') || undefined;

      // Clean up request token
      this.requestTokens.delete(requestToken);

      return {
        accessToken,
        accessSecret,
        sessionHandle
      };
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }
}

// Express route handlers
export function setupYahooAuth(app: Express) {
  const yahooAuth = new YahooAuth({
    consumerKey: process.env.YAHOO_CONSUMER_KEY!,
    consumerSecret: process.env.YAHOO_CONSUMER_SECRET!,
    redirectUri: `${process.env.REPLIT_DOMAIN || 'http://localhost:5000'}/api/yahoo/callback`
  });

  // Start OAuth flow
  app.get('/api/yahoo/auth', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Starting Yahoo OAuth flow...');
      console.log('- Consumer Key:', process.env.YAHOO_CONSUMER_KEY?.substring(0, 8) + '...');
      console.log('- Consumer Secret present:', !!process.env.YAHOO_CONSUMER_SECRET);
      console.log('- Redirect URI:', yahooAuth.config?.redirectUri || 'Not configured');
      
      const { authUrl, requestToken } = await yahooAuth.getRequestToken();
      
      // Store request token in session
      (req.session as any).yahooRequestToken = requestToken;
      console.log('✅ Yahoo OAuth redirect URL generated:', authUrl);
      
      res.redirect(authUrl);
    } catch (error) {
      console.error('❌ Yahoo auth error details:', error);
      // Provide more specific error info
      const errorMsg = error instanceof Error ? error.message : 'Unknown OAuth error';
      console.log('🔄 Falling back to demo mode due to:', errorMsg);
      res.redirect(`/fantasy-coaching?yahoo=demo&error=${encodeURIComponent(errorMsg)}`);
    }
  });

  // Handle OAuth callback
  app.get('/api/yahoo/callback', async (req: Request, res: Response) => {
    try {
      const { oauth_token, oauth_verifier } = req.query;
      
      if (!oauth_token || !oauth_verifier) {
        return res.status(400).json({ error: 'Missing OAuth parameters' });
      }

      const { accessToken, accessSecret, sessionHandle } = await yahooAuth.getAccessToken(
        oauth_token as string,
        oauth_verifier as string
      );

      // Store tokens in session
      (req.session as any).yahooAccessToken = accessToken;
      (req.session as any).yahooAccessSecret = accessSecret;
      (req.session as any).yahooSessionHandle = sessionHandle;

      // Redirect to Fantasy Coaching page
      res.redirect('/fantasy-coaching?yahoo=connected');
    } catch (error) {
      console.error('Yahoo callback error:', error);
      res.redirect('/fantasy-coaching?yahoo=error');
    }
  });

  // Check Yahoo connection status  
  app.get('/api/yahoo/status', (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      const isConnected = !!(session?.yahooAccessToken && session?.yahooAccessSecret);
      const hasCredentials = !!(process.env.YAHOO_CONSUMER_KEY && process.env.YAHOO_CONSUMER_SECRET);
      
      // Debug logging for credential verification
      console.log('Yahoo API Status Check:');
      console.log('- Consumer Key present:', !!process.env.YAHOO_CONSUMER_KEY);
      console.log('- Consumer Secret present:', !!process.env.YAHOO_CONSUMER_SECRET);
      console.log('- Consumer Key prefix:', process.env.YAHOO_CONSUMER_KEY?.substring(0, 8) + '...');
      console.log('- Access tokens in session:', isConnected);
      
      res.json({
        connected: isConnected,
        hasCredentials,
        debug: {
          consumerKeyPresent: !!process.env.YAHOO_CONSUMER_KEY,
          consumerSecretPresent: !!process.env.YAHOO_CONSUMER_SECRET,
          keyPrefix: process.env.YAHOO_CONSUMER_KEY?.substring(0, 8) + '...'
        }
      });
    } catch (error) {
      console.error('Yahoo status check error:', error);
      res.json({
        connected: false,
        hasCredentials: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Disconnect Yahoo
  app.post('/api/yahoo/disconnect', (req: Request, res: Response) => {
    const session = req.session as any;
    delete session.yahooAccessToken;
    delete session.yahooAccessSecret;
    delete session.yahooSessionHandle;
    
    res.json({ success: true });
  });
}