# Yahoo Fantasy Sports API Setup Guide

## Getting Started with Yahoo Fantasy Sports API

To enable real sports intelligence in your Fantasy Coaching AI, you need to register with Yahoo and get proper API credentials.

### Step 1: Register Your Application

1. **Go to Yahoo Developer Network**: https://developer.yahoo.com/apps/create/
2. **Create a New Application**:
   - Application Name: "Fantasy Coaching AI"
   - Application Type: "Web Application"
   - Description: "AI-powered fantasy sports coaching and analytics platform"
   - Home Page URL: Your domain (e.g., https://your-replit-domain.replit.app)
   - Redirect URI: `https://your-domain.com/api/yahoo/callback`

### Step 2: Configure API Access

**Required Scopes:**
- Fantasy Sports API (Read access minimum, Read/Write for lineup management)
- User Profile access for personalization

**Application Settings:**
- API Permissions: Fantasy Sports
- Access Level: Read or Read/Write
- OAuth Flow: Authorization Code Grant

### Step 3: Get Your Credentials

After registration, Yahoo provides:
- **Consumer Key** (Client ID)
- **Consumer Secret** (Client Secret)

### Step 4: Environment Variables

Add these to your Replit secrets:
```
YAHOO_CONSUMER_KEY=your_consumer_key_here
YAHOO_CONSUMER_SECRET=your_consumer_secret_here
```

### Step 5: OAuth Implementation

The Yahoo API uses OAuth 1.0a with this flow:
1. Get request token
2. Redirect user to Yahoo for authorization
3. Exchange verifier for access token
4. Use access token for API calls

### Available Data from Yahoo Fantasy API

**Player Data:**
- Current stats and projections
- Injury reports and status updates
- Usage rates and snap counts
- Matchup difficulty ratings

**League Information:**
- User's fantasy teams
- League settings and scoring
- Waiver wire availability
- Trade opportunities

**Game Data:**
- Live scoring updates
- Weather conditions
- Vegas lines and totals
- Depth chart changes

### Sample API Endpoints

```
# Get user's teams
GET /fantasy/v2/users;use_login=1/games;game_keys=nfl/teams

# Get player stats
GET /fantasy/v2/league/{league_key}/players;player_keys={player_key}/stats

# Get injury reports
GET /fantasy/v2/players;player_keys={player_keys}/percent_owned

# Get matchup data
GET /fantasy/v2/team/{team_key}/matchups
```

### Implementation Notes

- Yahoo requires OAuth for all fantasy data access
- Rate limits apply (check current documentation)
- Data is updated in real-time during games
- Historical data available for analysis
- Supports both free and paid league data

### Alternative APIs

If Yahoo setup is complex, consider these alternatives:

**ESPN Fantasy API:**
- Similar functionality
- Different authentication flow
- Good for ESPN league data

**Fantasy Data API:**
- Comprehensive NFL statistics
- Injury reports and projections
- Commercial API with tiered pricing

**Sports Data IO:**
- Real-time NFL data
- Player statistics and projections
- Weather and venue information

### Next Steps

1. Register your application with Yahoo
2. Get your Consumer Key and Secret
3. Add credentials to Replit secrets
4. Test OAuth flow with simple API call
5. Implement full Fantasy Coaching AI features

The Fantasy Coaching AI is already built and ready - it just needs real API credentials to provide authentic sports intelligence instead of mock data.