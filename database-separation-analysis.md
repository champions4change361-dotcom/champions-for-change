# Database Separation Analysis

## Executive Summary
Current platform has **175 tables** in a single shared database serving 3 distinct applications. This analysis categorizes tables for separation strategy.

---

## 📊 Table Distribution by Domain

### **CORE Domain** (37 tables) - Shared Infrastructure
**Purpose:** Authentication, billing, permissions, platform-wide settings, shared catalogs
**Database Strategy:** Remains in main database, accessible to all apps

- **Authentication & Sessions:**
  - `sessions`, `users`, `passwordResetTokens`
  
- **Organizations & Permissions:**
  - `organizations`, `userOrganizationRoles`
  - `rolePermissions`, `permissionAssignments`, `permissionTemplates`
  
- **White-label & Configuration:**
  - `whitelabelConfigs`, `clientConfigurations`, `apiConfigurations`, `userDashboardConfigs`
  
- **Compliance & Audit:**
  - `complianceAuditLog`, `dataProcessingAgreements`
  
- **Billing & Payments:**
  - `discountCodes`, `paymentPlans`, `paymentPlanEnrollments`, `paymentPlanInstallments`
  
- **Analytics:**
  - `platformAnalytics`, `usageAnalytics`, `nightlyAnalysis`
  
- **Platform Communications:**
  - `messages`, `messageRecipients`, `messageUsage`, `mobileDevices`
  
- **Nonprofit/Donor Management:**
  - `donors`, `donations`, `taxExemptionDocuments`
  - `nonprofitSubscriptions`, `nonprofitInvoices`, `educationalImpactMetrics`
  - `emailCampaigns`, `campaignRecipients`, `contacts`
  
- **Shared Sports Taxonomy:**
  - `sports`, `sportCategories`, `sportOptions`
  *(Used by both District schoolSportsPrograms and Tournament sportEvents)*

---

### **FANTASY Domain** (20 tables) - Fantasy Sports App
**Purpose:** Fantasy football leagues, draft, scoring, player management
**Database Strategy:** MOVE to separate `fantasy` database (Phase 1 priority)

- **Fantasy League Core:**
  - `fantasyProfiles`, `fantasyLeagues`, `fantasyTeams`, `fantasyRosters`
  - `fantasyDrafts`, `fantasyMatchups`, `fantasyLineups`
  
- **Fantasy Transactions:**
  - `fantasyWaiverClaims`, `fantasyTrades`, `fantasyPicks`
  - `fantasyLeagueMessages`
  
- **Fantasy Players & Performance:**
  - `fantasyParticipants`, `professionalPlayers`, `playerPerformances`
  
- **Fantasy Compliance & Safety:**
  - `ageVerifications`, `fantasyEligibilityChecks`, `fantasySafetyRules`
  
- **Showdown (Daily Fantasy):**
  - `showdownContests`, `showdownEntries`, `showdownLeaderboards`

---

### **DISTRICT Domain** (44 tables) - School District Management
**Purpose:** School administration, student health, academic programs, budgeting
**Database Strategy:** Keep in main database, use `district` schema with RLS

- **District & School Structure:**
  - `districts`, `schools`, `schoolAssets`, `schoolSportsPrograms`, `schoolAcademicPrograms`
  
- **Student & Athlete Management:**
  - `athletes`, `studentData`
  
- **Health & Medical (HIPAA/FERPA protected):**
  - `medicalHistory`, `healthData`, `healthRiskAssessments`
  - `injuryIncidents`, `injuryFollowUps`
  - `supportTeams`, `supportTeamMembers`, `supportTeamInjuries`, `supportTeamAiConsultations`
  
- **Academic Competitions (UIL):**
  - `academicCompetitions`, `academicDistricts`, `academicEvents`, `academicMeets`
  - `academicOfficials`, `academicParticipants`, `academicResults`, `academicTeams`
  
- **Budget Management (Excel-style):**
  - `budgetCategories`, `budgetItems`, `budgetAllocations`, `budgetTransactions`
  - `budgetApprovals`, `budgetTemplates`, `budgetTransfers`
  - `districtBudgets`, `schoolDepartmentBudgets`, `sportProgramBudgets`, `expenseRecords`
  
- **Athletic Management:**
  - `athleticCalendarEvents`, `athleticSeasons`, `athleticVenues`
  - `facilityReservations`, `scheduleConflicts`
  
- **Assignments & Permissions:**
  - `coachEventAssignments`, `schoolEventAssignments`
  
- **Consent & Compliance:**
  - `consentFormTemplates`, `consentFormResponses`

---

### **TOURNAMENT Domain** (74 tables) - Tournament & Team Management
**Purpose:** Tournament creation, team registration, scoring, merchandise, tickets, corporate competitions
**Database Strategy:** Keep in main database, use `tournament` schema

- **Tournament Core:**
  - `tournaments`, `tournamentStructures`, `tournamentEvents`, `tournamentDivisions`
  - `tournamentFormatConfigs`, `tournamentGenerationLog`, `tournamentSubscriptions`
  - `tournamentCoordinationData`, `tournamentOrganizerNetwork`, `tournamentCredits`
  - `tournamentOrganizations`, `tournamentRegistrationForms`
  
- **Teams & Players:**
  - `teams`, `teamRegistrations`, `teamPlayers`, `teamDocuments`, `rosters`
  - `jerseyTeamMembers`, `jerseyTeamPayments`
  
- **Guest & Corporate:**
  - `guestParticipants`
  - `companies`, `corporateCompetitions`, `corporateParticipants`, `performanceMetrics`
  
- **Matches & Games:**
  - `matches`, `games`, `practices`
  
- **Sports Configuration:**
  - `leagues`, `sportEvents`, `sportDivisionRules`
  *(Note: `sports`, `sportCategories`, `sportOptions` are in Core as shared taxonomy)*
  
- **Divisions:**
  - `divisionGenerationRules`, `divisionMatches`, `divisionParticipants`
  - `divisionScheduling`, `divisionTemplates`
  
- **Templates & Configurations:**
  - `bracketTemplates`, `competitionFormatTemplates`, `gameLengthTemplates`, `seriesTemplates`
  
- **Events:**
  - `eventAssignments`, `eventSchools`, `eventParticipants`, `eventResults`
  - `eventLocations`, `eventScores`, `eventTemplates`, `eventTickets`, `participantEvents`
  
- **Track & Field:**
  - `trackEvents`, `trackEventTiming`
  
- **Scoring & Competition:**
  - `competitionLeaderboards`, `scoringPolicies`, `scoringAutomations`
  - `liveScores`, `liveScoreMessages`, `scorekeeperAssignments`, `scoreUpdateLog`
  
- **Registration:**
  - `registrationRequests`, `registrationAssignmentLog`, `registrationSubmissions`
  - `registrationCodes`, `registrationFormFields`, `registrationResponses`
  
- **E-commerce:**
  - `merchandiseProducts`, `merchandiseOrders`
  - `ticketOrders`
  
- **Location & Access:**
  - `locationCheckIns`, `locationScoringPermissions`
  
- **Organizer Tools:**
  - `regionalTournamentCircuits`, `organizerContacts`, `organizerMetrics`, `organizerPageViews`
  
- **Pages & Content:**
  - `modularPages`, `pages`

---

## 🎯 Recommended Separation Strategy

### **Phase 1: Fantasy Isolation (HIGH PRIORITY)**
**Action:** Move 20 Fantasy tables to dedicated `fantasy` database
**Reason:** 
- High-volume ESPN/Pro Football Reference data ingestion
- Separate consumer data from HIPAA/FERPA protected student data
- Independent scaling for fantasy features

**Tables to Move:**
```
fantasyProfiles, fantasyLeagues, fantasyTeams, fantasyRosters, fantasyDrafts,
fantasyMatchups, fantasyWaiverClaims, fantasyTrades, fantasyLeagueMessages,
fantasyParticipants, fantasyPicks, fantasyLineups, playerPerformances,
ageVerifications, fantasyEligibilityChecks, fantasySafetyRules,
showdownContests, showdownEntries, showdownLeaderboards, professionalPlayers
```

### **Phase 2: Schema Separation in Main Database**
**Action:** Create schemas: `core`, `district`, `tournament`
**Reason:**
- Logical separation without full database split
- Enforce access controls via database roles
- Clear boundaries for code organization

**Schema Distribution:**
- **core schema:** 37 tables (auth, billing, permissions, analytics, shared catalogs)
- **district schema:** 44 tables (schools, health, academics, budgets)
- **tournament schema:** 74 tables (tournaments, teams, events, commerce, corporate)

### **Phase 3: Optional District Isolation**
**Action:** If PHI data volume or compliance demands, move District to separate database
**Reason:**
- Maximum HIPAA/FERPA compliance isolation
- Separate audit and encryption requirements
- Independent backup/retention policies

---

## 📋 Cross-App Dependencies

### **User & Organization References**
All apps reference:
- `users.id` - User identification
- `organizations.id` - Organization/district identification

**Solution:** Use UUID references, no cross-database foreign keys. Fetch user/org data via API or read-only views.

### **Billing References**
Fantasy and Tournament reference core billing:
- `paymentPlans`, `paymentPlanEnrollments`
- Stripe integration via `users.stripeCustomerId`

**Solution:** Core database maintains billing, apps query via API.

---

## 🔐 Security Implications

### **Current Risk:**
- HIPAA/FERPA protected student health data (`healthData`, `medicalHistory`, `injuryIncidents`) shares database with public fantasy data
- Compliance audit scope includes all 175 tables
- Any breach exposes ALL data types

### **Post-Separation:**
- Fantasy breach ≠ student health data breach
- Smaller compliance audit scope for district database
- Independent encryption and access controls per domain

---

## 📈 Performance Impact

### **Current Bottlenecks:**
- ESPN scoring updates (every 5 minutes) compete with athletic trainer health queries
- Fantasy player stat imports impact tournament bracket generation
- Shared connection pool serves all 3 apps

### **Post-Separation:**
- Fantasy gets dedicated connection pool for high-volume ingestion
- District queries for health data don't compete with fantasy scoring
- Tournament bracket generation isolated from other workloads

---

## 🛠️ Implementation Notes

### **Data Migration Order:**
1. Create Fantasy database + connection
2. Migrate Fantasy schema (20 tables)
3. Backfill Fantasy data
4. Update Fantasy routes to new storage
5. Create district/tournament schemas in main DB
6. Update District/Tournament routes to use schemas
7. Test all three apps independently

### **Zero-Downtime Strategy:**
- Dual-write during migration (old + new DB)
- Feature flag to switch reads to new DB
- Validate data consistency
- Cut over writes to new DB
- Retire old tables

---

## ✅ Next Steps

1. ✅ **Analysis Complete** - All 175 tables categorized
2. ⏭️ Create modular schema files (core.ts, fantasy.ts, district.ts, tournament.ts)
3. ⏭️ Set up Fantasy database connection
4. ⏭️ Implement storage interface separation
5. ⏭️ Execute Fantasy migration
6. ⏭️ Create schemas for District/Tournament
7. ⏭️ Update all route handlers
8. ⏭️ Test and verify isolation
