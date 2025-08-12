# Stripe Setup Guide for Champions for Change

## Creating Your New Stripe Account

Since you don't currently have a Stripe account for Champions for Change, you need to create a new one:

### Step 1: Create New Stripe Account
1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Use your Champions for Change email: `champions4change361@gmail.com`
4. Business name: "Champions for Change"
5. Business type: "Nonprofit"
6. Country: United States

### Step 2: Complete Business Profile
- Business description: "Educational nonprofit funding student trips for underprivileged youth in Corpus Christi, Texas"
- Website: trantortournaments.org
- Business address: Your Champions for Change address

### Step 3: Get Your API Keys
Once your account is created:

1. Go to Dashboard → Developers → API keys
2. **Publishable key** (starts with `pk_test_` for testing):
   - Copy this for `VITE_STRIPE_PUBLIC_KEY`
3. **Secret key** (starts with `sk_test_` for testing):
   - Click "Reveal test key"
   - Copy this for `STRIPE_SECRET_KEY`

### Step 4: Test Mode First
- Start with TEST keys to verify everything works
- Test donations will use fake credit cards
- No real money is processed in test mode

### Step 5: Activate Live Mode Later
- Complete Stripe's verification process
- Get live keys (`pk_live_` and `sk_live_`)
- Switch to live mode for real donations

## Important Notes
- Never share your secret keys
- Test mode is safe for development
- Live mode requires business verification
- Nonprofit rates may be available - contact Stripe support

## Current Status
❌ No Stripe account exists for Champions for Change
❌ Old keys from deleted Jersey Watch/Challonge accounts are expired
✅ Need to create fresh account for this nonprofit