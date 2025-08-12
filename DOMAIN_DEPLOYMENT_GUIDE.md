# Multi-Domain Deployment Guide 🚢

## Overview
The platform now features complete domain separation to ensure school districts can safely access tournament management tools without any adult content, while maintaining revenue-generating fantasy capabilities on separate domains.

## Domain Architecture

### 🏫 School-Safe Domain: tournaments.trantortournaments.org
- **Purpose**: Educational tournament management for schools and districts
- **Features**: Tournament creation, team management, scoring, analytics
- **Content**: Youth-safe sports only (basketball, soccer, track & field, academic)
- **Branding**: Professional blue theme, educational focus
- **Blocked Features**: Fantasy leagues, age verification, adult content, donation buttons

### 🎮 Fantasy Domain: fantasy.trantortournaments.org  
- **Purpose**: Adult fantasy sports entertainment
- **Features**: NFL Survivor, NBA DFS, League of Legends Pro, College Football Pick Em
- **Content**: Professional sports, age-verified participants only
- **Branding**: Purple entertainment theme, fantasy-focused
- **Required Features**: Age verification (18+), donation support

### ⚡ Pro Domain: pro.trantortournaments.org
- **Purpose**: Professional tournament management with optional fantasy
- **Features**: Advanced analytics, enterprise tools, fantasy integration
- **Content**: All adult sports and professional leagues
- **Branding**: Orange professional theme
- **Target**: Sports leagues, clubs, professional organizations

## Deployment Strategy

### Phase 1: School-Safe Deployment (IMMEDIATE)
1. Deploy current codebase to tournaments.trantortournaments.org
2. Verify fantasy content is completely hidden for school domain
3. Test tournament creation, team management, and scoring
4. Confirm educational branding and navigation

### Phase 2: Fantasy Domain Setup (NEXT)
1. Configure fantasy.trantortournaments.org subdomain
2. Deploy with fantasy features enabled
3. Implement age verification system
4. Test NFL, NBA, and Esports fantasy leagues

### Phase 3: Pro Domain Setup (FUTURE)
1. Configure pro.trantortournaments.org subdomain
2. Deploy with enterprise features
3. Test advanced analytics and fantasy integration

## Technical Implementation

### Domain Detection
```javascript
// Server-side domain detection
const getDomainConfig = (hostname) => {
  if (hostname.includes('fantasy')) return FANTASY_CONFIG;
  if (hostname.includes('pro')) return PRO_CONFIG;
  return SCHOOL_SAFE_CONFIG; // Default
};
```

### Feature Gates
- Fantasy content completely hidden on school domains
- Age verification only required on fantasy/pro domains
- Donation buttons only appear on fantasy domain
- Navigation adapts based on domain type

### Environment Variables
```bash
# For school domain deployment
DOMAIN_TYPE=SCHOLASTIC_TOURNAMENTS
ENABLE_FANTASY=false
ENABLE_DONATIONS=false
AGE_VERIFICATION=false

# For fantasy domain deployment  
DOMAIN_TYPE=FANTASY_LEAGUE_CENTRAL
ENABLE_FANTASY=true
ENABLE_DONATIONS=true
AGE_VERIFICATION=true
```

## School District Benefits

### ✅ Completely Safe for Schools
- No fantasy content visible on tournaments.trantortournaments.org
- No age verification requirements
- No adult-oriented features
- Educational branding and messaging

### ✅ Full Tournament Management
- All tournament creation and management features
- Team registration and scoring
- Live match updates and brackets
- Analytics and reporting

### ✅ Revenue Generation
- Platform revenue from fantasy domain funds student trips
- No exposure to adult content for school users
- Maintains Champions for Change mission

## DNS Configuration Required

1. **tournaments.trantortournaments.org** → Main Replit deployment (school-safe)
2. **fantasy.trantortournaments.org** → Replit deployment with fantasy features
3. **pro.trantortournaments.org** → Replit deployment with pro features

## Testing Checklist

### School Domain Testing
- [ ] No fantasy content visible anywhere
- [ ] Tournament creation works
- [ ] Team management functions
- [ ] Scoring and brackets display
- [ ] Educational branding applied
- [ ] No age verification prompts

### Fantasy Domain Testing  
- [ ] Fantasy leagues display
- [ ] Age verification required
- [ ] Professional player database accessible
- [ ] Donation buttons present
- [ ] Adult-oriented branding

## Deployment Commands

```bash
# Deploy to main domain (school-safe)
replit deploy --domain tournaments.trantortournaments.org

# Configure environment for school safety
export DOMAIN_TYPE=SCHOLASTIC_TOURNAMENTS
export ENABLE_FANTASY=false
```

## Next Steps

1. **IMMEDIATE**: Deploy current codebase to live domain
2. **THIS WEEK**: Configure DNS for subdomain separation
3. **NEXT WEEK**: Launch fantasy.trantortournaments.org
4. **ONGOING**: Monitor district access and gather feedback

The platform is now ready for district-safe deployment while maintaining revenue capabilities through domain separation.