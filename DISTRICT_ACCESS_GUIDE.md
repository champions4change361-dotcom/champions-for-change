# School District Network Access Guide 🏫

## Current Issue: Authentication Loop
School districts typically block OAuth redirects and external authentication providers, causing authentication loops when accessing platforms through district networks.

## Solution: Guest Access Mode for Schools

### Immediate Fix: Guest Tournament Viewing
For districts experiencing OAuth loops, we can implement a guest access mode that allows:
- Viewing public tournaments and brackets
- Basic tournament information access
- Live match updates and scoring
- No login required for viewing content

### Implementation Strategy

1. **Public Tournament Routes** (No Auth Required)
   - `/tournaments/public` - View all public tournaments
   - `/tournaments/:id/public` - View specific tournament brackets
   - `/matches/:id/public` - View live match updates
   - `/leaderboards/public` - View tournament standings

2. **District-Safe Features** (Guest Mode)
   - Tournament browsing and viewing
   - Live bracket updates
   - Team standings and results
   - Event schedules and information
   - No personal data or account creation required

3. **Admin Access Options** (For Tournament Managers)
   - **Option A**: Create tournaments from non-district networks
   - **Option B**: Phone/email-based tournament creation assistance
   - **Option C**: Temporary admin accounts with simple username/password

### Technical Implementation

```javascript
// Guest access middleware
const allowGuestAccess = (req, res, next) => {
  const isPublicRoute = req.path.includes('/public');
  const isSchoolDomain = req.hostname.includes('tournaments');
  
  if (isPublicRoute || isSchoolDomain) {
    return next(); // Allow access without authentication
  }
  
  return isAuthenticated(req, res, next);
};
```

### Domain-Specific Access Rules

#### tournaments.trantortournaments.org (School Domain)
- **Guest Access**: Full tournament viewing capabilities
- **No Authentication Required**: For viewing tournaments and brackets
- **Simplified Navigation**: Educational focus, no account features
- **District-Safe**: No OAuth redirects or external authentication

#### fantasy.trantortournaments.org (Fantasy Domain)
- **Full Authentication Required**: Age verification and account creation
- **Standard OAuth Flow**: For adult fantasy leagues
- **No Guest Access**: Protects age-restricted content

### User Experience for Schools

1. **Students/Teachers**: Can view tournaments immediately without login
2. **Coaches**: Can browse all tournament information and brackets
3. **Athletic Directors**: Can view live updates and standings
4. **Tournament Managers**: May need alternative access methods

### Deployment Priority

1. **IMMEDIATE**: Enable guest viewing for public tournaments
2. **THIS WEEK**: Create simplified tournament creation for districts
3. **ONGOING**: Monitor district access patterns and feedback

## Alternative Access Methods

### For Tournament Creation (District Networks)
1. **Mobile Hotspot**: Create tournaments using personal mobile data
2. **Home Network**: Set up tournaments from non-district connections
3. **Phone Assistance**: Call Champions for Change for tournament setup
4. **Email Setup**: Send tournament details via email for setup assistance

### Contact Information
- **Daniel Thornton**: champions4change361@gmail.com, 361-300-1552
- **Platform Support**: Available for district access assistance

## Testing Requirements

Before deploying district-friendly access:
- [ ] Verify guest access works without authentication
- [ ] Test tournament viewing from school networks
- [ ] Confirm no OAuth loops for viewing content
- [ ] Validate live match updates work in guest mode
- [ ] Test bracket display and navigation

## Long-Term Solution

Implement simplified authentication for educational institutions:
- District-specific access codes
- Simple username/password for school accounts
- Integration with common school authentication systems
- Dedicated support for educational network restrictions

The platform remains fully functional for viewing tournaments while addressing district network limitations.