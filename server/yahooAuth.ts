import { Request, Response, Express } from 'express';
import * as crypto from 'crypto';

export interface YahooAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class YahooAuth {
  private config: YahooAuthConfig;
  
  constructor(config: YahooAuthConfig) {
    this.config = config;
  }

  // Generate state parameter for security
  private generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Step 1: Get authorization URL (OAuth 2.0)
  getAuthorizationUrl(state?: string): string {
    const authState = state || this.generateState();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      language: 'en-us',
      state: authState
    });

    return `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
  }

  // Step 2: Exchange authorization code for access token (OAuth 2.0)
  async exchangeCodeForToken(authorizationCode: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const url = 'https://api.login.yahoo.com/oauth2/get_token';
    
    // Create Basic Auth header
    const authHeader = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`, 'binary').toString('base64');
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
      code: authorizationCode,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    console.log('🔑 Yahoo OAuth 2.0 Token Exchange:');
    console.log('- URL:', url);
    console.log('- Grant Type: authorization_code');
    console.log('- Client ID:', this.config.clientId.substring(0, 12) + '...');
    console.log('- Redirect URI:', this.config.redirectUri);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Champions-for-Change/1.0'
        },
        body: body.toString()
      });

      console.log('📡 Yahoo API Response:');
      console.log('- Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Yahoo OAuth Error:', errorText);
        throw new Error(`Yahoo OAuth error: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('✅ Yahoo OAuth Success - Token received');
      
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Refresh access token when expired
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const url = 'https://api.login.yahoo.com/oauth2/get_token';
    const authHeader = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`, 'binary').toString('base64');
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      redirect_uri: this.config.redirectUri,
      refresh_token: refreshToken
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Yahoo refresh token error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

// Express route handlers
export function setupYahooAuth(app: Express) {
  // Get the primary domain from REPLIT_DOMAINS
  const primaryDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
  const redirectUri = primaryDomain 
    ? `https://${primaryDomain}/api/yahoo/callback`
    : 'http://localhost:5000/api/yahoo/callback';

  const yahooAuth = new YahooAuth({
    clientId: process.env.YAHOO_CONSUMER_KEY!, // Consumer Key = Client ID in OAuth 2.0
    clientSecret: process.env.YAHOO_CONSUMER_SECRET!,
    redirectUri
  });

  // Start OAuth 2.0 flow
  app.get('/api/yahoo/auth', (req: Request, res: Response) => {
    try {
      console.log('🎯 Starting Yahoo OAuth 2.0 flow...');
      console.log('- Client ID:', process.env.YAHOO_CONSUMER_KEY?.substring(0, 8) + '...');
      console.log('- Client Secret present:', !!process.env.YAHOO_CONSUMER_SECRET);
      console.log('- Redirect URI:', yahooAuth['config'].redirectUri);
      
      // Generate state for security
      const state = crypto.randomBytes(16).toString('hex');
      (req.session as any).yahooOAuthState = state;
      
      const authUrl = yahooAuth.getAuthorizationUrl(state);
      console.log('✅ Yahoo OAuth 2.0 authorization URL generated');
      
      res.redirect(authUrl);
    } catch (error) {
      console.error('❌ Yahoo auth error details:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown OAuth error';
      console.log('🔄 Falling back to demo mode due to:', errorMsg);
      res.redirect(`/fantasy-coaching?yahoo=demo&error=${encodeURIComponent(errorMsg)}`);
    }
  });

  // Handle OAuth 2.0 callback
  app.get('/api/yahoo/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;
      
      // Check for OAuth error
      if (error) {
        console.error('❌ Yahoo OAuth error:', error);
        return res.redirect(`/fantasy-coaching?yahoo=error&message=${encodeURIComponent(error as string)}`);
      }
      
      // Verify state parameter for security
      const sessionState = (req.session as any).yahooOAuthState;
      if (!state || state !== sessionState) {
        console.error('❌ Invalid OAuth state parameter');
        return res.redirect('/fantasy-coaching?yahoo=error&message=Invalid+state+parameter');
      }
      
      if (!code) {
        console.error('❌ Missing authorization code');
        return res.redirect('/fantasy-coaching?yahoo=error&message=Missing+authorization+code');
      }

      console.log('🔄 Exchanging authorization code for access token...');
      const tokenData = await yahooAuth.exchangeCodeForToken(code as string);

      // Store tokens in session
      (req.session as any).yahooAccessToken = tokenData.access_token;
      (req.session as any).yahooRefreshToken = tokenData.refresh_token;
      (req.session as any).yahooTokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      // Clear OAuth state
      delete (req.session as any).yahooOAuthState;

      console.log('✅ Yahoo OAuth 2.0 authentication successful');
      res.redirect('/fantasy-coaching?yahoo=connected');
    } catch (error) {
      console.error('❌ Yahoo callback error:', error);
      const errorMsg = error instanceof Error ? error.message : 'OAuth callback error';
      res.redirect(`/fantasy-coaching?yahoo=error&message=${encodeURIComponent(errorMsg)}`);
    }
  });

  // Check Yahoo OAuth 2.0 connection status  
  app.get('/api/yahoo/status', (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      const hasAccessToken = !!session?.yahooAccessToken;
      const tokenExpiry = session?.yahooTokenExpiry || 0;
      const isTokenValid = hasAccessToken && Date.now() < tokenExpiry;
      const hasCredentials = !!(process.env.YAHOO_CONSUMER_KEY && process.env.YAHOO_CONSUMER_SECRET);
      
      // Debug logging for credential verification
      console.log('Yahoo OAuth 2.0 Status Check:');
      console.log('- Client ID present:', !!process.env.YAHOO_CONSUMER_KEY);
      console.log('- Client Secret present:', !!process.env.YAHOO_CONSUMER_SECRET);
      console.log('- Access token in session:', hasAccessToken);
      console.log('- Token valid:', isTokenValid);
      
      res.json({
        connected: isTokenValid,
        hasCredentials,
        tokenExpired: hasAccessToken && !isTokenValid,
        debug: {
          clientIdPresent: !!process.env.YAHOO_CONSUMER_KEY,
          clientSecretPresent: !!process.env.YAHOO_CONSUMER_SECRET,
          keyPrefix: process.env.YAHOO_CONSUMER_KEY?.substring(0, 8) + '...',
          hasAccessToken,
          tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
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

  // Disconnect Yahoo OAuth 2.0
  app.post('/api/yahoo/disconnect', (req: Request, res: Response) => {
    const session = req.session as any;
    delete session.yahooAccessToken;
    delete session.yahooRefreshToken;
    delete session.yahooTokenExpiry;
    delete session.yahooOAuthState;
    
    console.log('🔌 Yahoo OAuth 2.0 disconnected');
    res.json({ success: true });
  });

  // Test Yahoo OAuth 2.0 configuration
  app.get('/api/yahoo/test', (req: Request, res: Response) => {
    const hasKeys = !!(process.env.YAHOO_CONSUMER_KEY && process.env.YAHOO_CONSUMER_SECRET);
    const keyPrefix = process.env.YAHOO_CONSUMER_KEY?.substring(0, 12) + '...';
    
    res.json({
      hasCredentials: hasKeys,
      keyPrefix,
      redirectUri: yahooAuth['config'].redirectUri,
      oauthVersion: '2.0',
      status: 'Updated to OAuth 2.0 - Should resolve 404 errors',
      changes: [
        'Switched from deprecated OAuth 1.0a endpoints to current OAuth 2.0',
        'Now using oauth2/request_auth instead of oauth/v2/get_request_token',
        'Updated to use Client ID/Secret instead of Consumer Key/Secret format',
        'Implemented proper authorization code flow with state parameter'
      ],
      recommendation: 'OAuth 2.0 implementation should work with your existing Yahoo app configuration.'
    });
  });
}