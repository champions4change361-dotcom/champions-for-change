# Smart Usage Limits & Pay-Per-Tournament System 🔒

## Anti-Abuse Strategy Implementation

Sophisticated usage tracking system that prevents system exploitation while offering flexible upgrade paths for legitimate users. Balances accessibility with revenue generation through intelligent limits and credit packages.

## Usage Limit Structure

### Free Tier Limits
- **Foundation Plan**: 5 tournaments/month
- **Starter Plan**: 5 tournaments/month
- **Automatic Reset**: Monthly counter resets on calendar month boundary
- **Credit Rollover**: Purchased credits never expire

### Unlimited Tiers
- **Professional Plan**: Unlimited tournaments
- **Champion Plan**: Unlimited tournaments  
- **Enterprise Plans**: Unlimited tournaments
- **District Enterprise**: Unlimited tournaments

## Pay-Per-Tournament Credit Packages

### Single Tournament - $10
- **Credits**: 1 tournament
- **Price Per Tournament**: $10.00
- **Best For**: One-time events, testing the platform
- **Savings**: None (baseline price)

### 5-Tournament Pack - $40 (Popular)
- **Credits**: 5 tournaments
- **Price Per Tournament**: $8.00
- **Savings**: $10 vs individual purchases
- **Best For**: Regular organizers, small leagues

### 10-Tournament Pack - $70
- **Credits**: 10 tournaments
- **Price Per Tournament**: $7.00
- **Savings**: $30 vs individual purchases
- **Best For**: Active tournament organizers

### Monthly Boost - $90
- **Credits**: 15 tournaments
- **Price Per Tournament**: $6.00
- **Expires**: 31 days from purchase
- **Best For**: High-volume monthly activities

## Abuse Prevention Features

### Device Fingerprinting
- **Registration Tracking**: Browser/device fingerprint stored on signup
- **Multiple Account Detection**: Flags users creating multiple accounts from same device
- **Confidence Scoring**: Algorithmic abuse detection with 0-1 confidence score

### Usage Pattern Analysis
- **Rapid Creation Detection**: Flags high tournament creation on new accounts
- **Email Pattern Analysis**: Detects suspicious email formats (temp emails, plus signs)
- **IP Address Tracking**: Monitors multiple accounts from same IP address
- **Time-based Analysis**: Tracks usage patterns over 30-day windows

### Suspicious Activity Triggers
1. **Multiple Accounts**: >3 accounts from same device/IP
2. **New Account Abuse**: >5 tournaments in first week
3. **Email Patterns**: Temporary email services, multiple plus-sign variants
4. **High Volume**: >20 tournaments in 30 days on free plan

## Technical Implementation

### Database Schema Extensions

#### Users Table Additions
```sql
-- Usage tracking fields
monthly_tournament_limit INTEGER DEFAULT 5,
current_month_tournaments INTEGER DEFAULT 0,
last_month_reset TIMESTAMP DEFAULT NOW(),

-- Abuse prevention
registration_fingerprint VARCHAR,
registration_ip VARCHAR,
verified_phone VARCHAR,
organization_verified BOOLEAN DEFAULT FALSE,

-- Usage analytics
total_tournaments_created INTEGER DEFAULT 0,
lifetime_usage_value DECIMAL(10,2) DEFAULT 0,

-- Tournament credits
tournament_credits INTEGER DEFAULT 0,
credits_purchased DECIMAL(10,2) DEFAULT 0
```

#### Tournament Credits Table
- **Purchase Tracking**: Links credits to Stripe payments
- **Expiration Support**: Some credit types can expire
- **Status Tracking**: Pending, completed, failed, refunded states

#### Usage Analytics Table  
- **Action Logging**: Tournament creation, logins, credit purchases
- **Metadata Storage**: IP addresses, user agents, device fingerprints
- **Pattern Detection**: 30-day rolling window analysis

### API Endpoints

#### Usage Checking
- `GET /api/usage/can-create-tournament` - Check if user can create tournament
- `GET /api/usage/stats` - Get user's current usage statistics
- `POST /api/tournaments` - Enhanced with limit checking

#### Credit Management
- `POST /api/tournament-credits/purchase` - Initiate credit purchase via Stripe
- `POST /api/webhooks/stripe-credits` - Process successful payments

### Frontend Integration

#### Usage Status Widget
- **Monthly Progress**: Visual progress bar showing tournament usage
- **Credit Display**: Available credits with "never expire" messaging
- **Alert States**: Yellow warning at 80% usage, red alert at limit
- **Upgrade Prompts**: Smart suggestions for credits or plan upgrades

#### Purchase Flow
- **Package Selection**: Visual credit package comparison
- **Stripe Integration**: Secure checkout with automatic credit delivery
- **Success Handling**: Redirect to dashboard with confirmation

## Revenue Strategy

### Acquisition Funnel
1. **Free Access**: 5 tournaments/month attracts users
2. **Usage Awareness**: Clear tracking builds upgrade intent
3. **Flexible Options**: Credits for occasional use, subscriptions for regular use
4. **Value Demonstration**: Users see platform value before paying

### Pricing Psychology
- **Anchoring Effect**: $10 single tournament makes packs seem like better deals
- **Volume Discounts**: Clear savings messaging drives larger purchases  
- **Urgency Creation**: Monthly boost expiration encourages quick decisions
- **Sunk Cost**: Unused credits encourage continued platform engagement

### Anti-Abuse ROI
- **Resource Protection**: Prevents server overload from fake accounts
- **Revenue Protection**: Stops unlimited free usage through account creation
- **Quality Users**: Verification requirements improve user quality
- **Support Reduction**: Fewer abuse cases reduce customer service load

## Usage Analytics & Insights

### Key Metrics to Track
1. **Conversion Rate**: Free → Paid user percentage
2. **Credit Utilization**: How quickly users consume purchased credits
3. **Upgrade Path**: Which credit packages lead to subscription upgrades
4. **Abuse Prevention**: False positive rate and detection accuracy

### Success Indicators
- **<5% False Positives**: Legitimate users wrongly flagged for abuse
- **>20% Conversion**: Free users purchasing credits or upgrading
- **>15 Days**: Average time from signup to first purchase
- **<2% Abuse**: Percentage of accounts flagged as suspicious

## Implementation Status

### Completed ✅
- Enhanced user schema with usage tracking fields
- Tournament credits and usage analytics tables
- UsageLimitService with abuse detection algorithms
- API endpoints for limit checking and credit purchases
- Frontend UsageStatusWidget with upgrade prompts
- Stripe integration for credit package purchases

### Ready for Deployment
- Database migration for new schema fields
- Webhook endpoint for processing Stripe payments
- Frontend integration in tournament creation flow
- Usage dashboard for monitoring and analytics

## Strategic Benefits

### For Champions for Change
- **Revenue Generation**: New income stream from credit sales
- **Resource Protection**: Prevents infrastructure abuse
- **User Segmentation**: Clear distinction between casual and serious users
- **Growth Path**: Natural upgrade funnel from free to paid plans

### For Users
- **Flexible Pricing**: Pay only for what you need
- **No Waste**: Credits never expire, unlike monthly limits
- **Clear Value**: Transparent pricing with bulk discounts
- **Instant Access**: Immediate tournament creation after purchase

### For Platform Stability  
- **Abuse Prevention**: Multi-layered fraud detection
- **Resource Management**: Controlled usage prevents overload
- **Quality Control**: Verification requirements improve user base
- **Sustainable Growth**: Prevents unsustainable free usage patterns

This smart usage limit system transforms potential abuse into a revenue opportunity while maintaining accessibility for legitimate educational and business users.