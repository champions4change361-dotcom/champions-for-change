# Tournament Bracket Manager

## Overview
This is a full-stack tournament bracket management application designed as a white-label SaaS platform for the Champions for Change nonprofit. The application enables users to create and manage single-elimination tournaments with interactive bracket visualization and real-time updates. Its core purpose is to fund educational opportunities for underprivileged youth in Corpus Christi, Texas, by offering professional tournament management services. Key capabilities include user authentication, payment integration, AI-powered tournament creation across various sports, custom branding, a multi-tenant architecture, and a five-tier user hierarchy mirroring school district structures. The platform emphasizes its mission-driven approach, providing a comprehensive solution for managing competitive events while generating social impact.

## Recent Miller VLC Demo Development
- Built comprehensive Miller VLC (Vertical Learning Community) demonstration platform targeting 3 CCISD schools
- Pre-loaded authentic school data: Roy Miller High (Buccaneers, est. 1894), Robert Driscoll Middle (Rangers), Sterling B. Martin Middle (Trojans)  
- Integrated real school information: addresses, phone numbers, principals, mascots, colors, sports programs, championships
- Created cross-school tournament capabilities demonstrating pipeline integration from middle schools to high school
- Military-grade organization features reflecting team's combined 41+ years experience (10 years coaching + 21 years military + additional coaching staff)
- Cost analysis showing $47,510 annual savings vs. competitors for immediate CCISD value proposition

## Comprehensive Health Demo Development (Added 08/13/25)
- Created comprehensive Athletic Director dashboard with fake data across wrestling, football, volleyball, and track & field
- Implemented injury simulation system showing AI-detected performance declines and health risks for realistic demo scenarios
- Built AI-powered competition results and tournament simulations with injury tracking across all sports
- Added Athletic Trainer workflow integration with medical intervention priorities and HIPAA compliance monitoring
- Developed position-specific monitoring that goes beyond counting stats to track ALL athlete positions through performance drills
- Integrated multi-sport health analytics showing real-time risk assessment and predictive injury prevention

## CCISD Document Integration Development (Added 08/13/25)
- Analyzed authentic CCISD athletic department documents including concussion protocols, physical exam forms, hot weather policies, and medical care plans
- Created comprehensive document integration analysis showing competitive advantages and implementation strategy
- Built CCISD Document Integration dashboard with 5 major tabs: Overview, Concussion Management, Environmental Monitoring, Medical Documentation, and Compliance
- Integrated authentic 5-step concussion return-to-play progression with 24-hour symptom-free requirements and physician clearance workflows
- Implemented WBGT (Wet Bulb Globe Temperature) monitoring system with automatic practice modifications per CCISD hot weather policy
- Added bilingual support (English/Spanish) matching authentic district forms and communications
- Developed HIPAA-compliant medical document management with audit trails and role-based access controls
- Created traffic light system for chronic conditions (Asthma, Anaphylaxis) with emergency action protocols
- Integrated insurance documentation workflows with primary/secondary coverage logic and claim automation
- Built district-level compliance dashboards with real-time monitoring and upcoming requirement alerts

## Athletic Trainer Scheduler Development (Added 08/13/25)
- Created comprehensive multi-school athletic trainer scheduling system addressing real operational challenges
- Built district-wide coordination dashboard for trainers covering multiple schools with real-time location tracking
- Implemented appointment management system with SMS/email notifications for athletes and parents
- Integrated HIPAA-compliant communication templates for concussion protocols, medical clearances, and care plan reviews
- Added priority-based scheduling with urgent/high/medium/low categorization for medical appointments
- Developed automated reminder system with delivery tracking and read receipts for parent communications
- Built trainer status monitoring with availability, current location, and certification tracking across assigned schools
- Created reschedule workflow allowing parents to request changes through digital interface
- Integrated with existing CCISD protocols for seamless medical appointment coordination

## Health & Safety Analytics Integration (Added 08/13/25)
- Implemented proactive athlete health monitoring system to identify potential health issues through performance trend analysis
- Added health alert system with severity levels (low, medium, high, critical) for early intervention
- Created performance trend tracking with AI-powered recommendations for coaches and athletic directors
- Integrated medical safety protocols with automatic recommendations for declining performance patterns
- Built comprehensive Health Analytics Dashboard for coaches to monitor athlete wellbeing and prevent serious health conditions
- Enhanced competitive advantage: first platform to offer predictive health monitoring for student athletes
- **Team Sports Analytics Expansion:** Developed position-specific monitoring for contact sports (football linemen, wrestling weight management) and endurance sports (soccer, basketball) to address traditional statistics blind spots
- **Contact Sports Specialization:** Advanced concussion risk monitoring, impact load tracking, and opponent-adjusted performance analysis for football and wrestling programs

## Admin Role Management & Access Control (Added 08/13/25)
- Created comprehensive role-based access control system with District Athletic Trainer admin role
- Built medical/tournament partition enforcement preventing unauthorized access to HIPAA-protected data
- Implemented six-tier user hierarchy: District Athletic Trainer, Athletic Director, Athletic Trainer, Head Coach, Assistant Coach, Scorekeeper
- Added granular permission matrix with role assignment capabilities for District Athletic Trainer and Athletic Directors
- Developed HIPAA compliance audit system with automated monitoring and access trail logging
- Integrated real-time user status tracking with certification management and location monitoring
- Created bulk role assignment tools and pending approval workflow for new user onboarding
- Built security alerts and compliance dashboards for district-level oversight

## Game & Practice Scheduler for Coaches (Added 08/13/25)
- Created comprehensive scheduling system for coaches to manage games, practices, scrimmages, and tournaments
- Built team roster integration with medical status tracking and parent contact management
- Implemented automated parent notification system with customizable message templates
- Added transportation coordination with bus request tracking and departure time management
- Developed weather monitoring integration with automatic practice modification recommendations
- Created equipment tracking and checklist system for each event type
- Built tournament and competition tracking with district-wide calendar coordination
- Integrated facility usage tracking and conflict prevention across multiple schools
- Added bulk scheduling tools, event duplication, and template creation for efficient planning
- Developed analytics dashboard tracking communication effectiveness and parent response rates

## Health & Safety Analytics Integration (Added 08/13/25)
- Implemented proactive athlete health monitoring system to identify potential health issues through performance trend analysis
- Added health alert system with severity levels (low, medium, high, critical) for early intervention
- Created performance trend tracking with AI-powered recommendations for coaches and athletic directors
- Integrated medical safety protocols with automatic recommendations for declining performance patterns
- Built comprehensive Health Analytics Dashboard for coaches to monitor athlete wellbeing and prevent serious health conditions
- Enhanced competitive advantage: first platform to offer predictive health monitoring for student athletes
- **Team Sports Analytics Expansion:** Developed position-specific monitoring for contact sports (football linemen, wrestling weight management) and endurance sports (soccer, basketball) to address traditional statistics blind spots
- **Contact Sports Specialization:** Advanced concussion risk monitoring, impact load tracking, and opponent-adjusted performance analysis for football and wrestling programs

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $2,490/year, districts save $31,010-$65,510 annually compared to current solutions while supporting educational mission. ROI of 1,244%-2,629% makes non-adoption fiscally irresponsible.
Pricing Evolution Strategy: Current $2,490/year pricing locked through 2027 for early adopters. Future pricing $4,990-6,990/year when competitors force market positioning. Nonprofit status ensures price increases fund educational mission, not profit margins.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter for lightweight routing.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Form Management**: React Hook Form with Zod validation.
- **Component Structure**: Modular design with separate UI, pages, and business logic.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with structured error handling and request logging.
- **Development Setup**: Vite integration with HMR.
- **Storage Abstraction**: Interface-based system supporting in-memory and database implementations.

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database for serverless PostgreSQL.
- **Fallback Storage**: In-memory storage.
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-Zod.

### Authentication and Authorization
- **Authentication Provider**: Replit OAuth integration with openid-client.
- **Session Management**: Express sessions with PostgreSQL session store.
- **User Management**: Complete user registration, login, logout flows.
- **Protected Routes**: Authentication middleware for tournament and payment endpoints.
- **Security**: CORS, secure session handling, user profile management.
- **Five-Tier User Hierarchy**: Tournament Manager/District Athletic Director, School Athletic Director, Coach, Scorekeeper/Judge, Athlete/Fan, with corresponding role-based access control.

### Key Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction for multiple implementations.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for application functionality without a database.
- **Multi-Sport Event Management**: Comprehensive event selection for sports like Track & Field, Swimming & Diving, Golf, Fishing & Hunting with sport-specific scoring.
- **Tournament Integration System**: Features comprehensive format configurations (Single Elimination, Double Elimination, Round Robin, Track & Field Multi-Event) with detailed bracket generation, advancement, and tiebreaker rules.
- **Geolocation-Based Event Tracking**: Real-time location verification with customizable geofencing for venue proximity, location check-ins for scorekeepers/participants, and remote scoring controls.
- **Team Registration and Management**: Coaches can register teams with player rosters; tournament managers approve registrations.
- **Scorekeeper Assignment and Verification**: Tournament managers assign scorekeepers to specific events, with score verification processes.
- **Hierarchical Coach Management**: Reflects real-world organizational structures for assigning coaches.
- **Commissioner Power Structure**: Fantasy league hierarchy for league creation, participant management, and data verification.
- **Cross-Domain Messaging**: Messaging capabilities for fantasy and business communications.

## External Dependencies
- **Database**: Neon PostgreSQL (serverless).
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Icons**: Font Awesome and Lucide React.
- **Development**: Replit-specific development tools.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Payment Integration**: Stripe.
- **API Integration**: ESPN API (for NFL scoring, play-by-play, player performance).
- **AI**: AI-powered tournament creation and AI coaching messages.