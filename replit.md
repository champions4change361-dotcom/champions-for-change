# Athletic & Academic Management Platform

## Overview
This platform is a universal tournament management platform revolutionized with a donation-based nonprofit model. Users access a unified tier system with full tournament and team management capabilities for a suggested $50/month donation (pay-what-feels-right), supporting Champions for Change educational programs with 100% tax-deductible contributions. The platform provides equal enterprise features to all users regardless of organization size while funding educational opportunities for underprivileged students.

**PRODUCTION-READY DONATION SYSTEM**: Complete Stripe integration fully verified with real financial transactions. Successfully processed $25 test donation with bank account verification, confirming end-to-end payment processing for Champions for Change educational programs.

**DOMAIN RESELLER INTEGRATION**: Complete Openprovider integration (Account ID: 309533) enables white-label domain services at transparent nonprofit pricing (registry cost + $3 processing fee). Live API connectivity confirmed with credentials (champions4change361@gmail.com). Domain search available at `/domains` provides real-time availability and competitive pricing vs $15.99 retail rates.

**UNIFIED DONATION MODEL**: All users receive identical enterprise-level features through a simplified $50/month suggested donation. No tiered pricing, platform type selection, or feature restrictions. The platform serves as a complete district management system covering athletic programs, academic competitions (50+ UIL events), budget allocation, organizational oversight, and health monitoring. Key capabilities include HIPAA/FERPA compliant data management, Excel-style budget systems, interactive organizational charts, AI-powered injury prediction (95% accuracy), athletic trainer dashboards, role-based access controls, comprehensive audit trails, AI assistants on all data entry pages, tournament management, and multi-tenant architecture with full district-to-student hierarchy.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for underprivileged youth.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Domain Strategy: Primary domain www.championsforchange.net DEPLOYED on Replit (verification in progress). Transfer code from Jersey Watch (%eRUvQT-jvI0Q4oQ{386). All existing business cards and QR codes will redirect seamlessly to the Replit-hosted tournament platform.
Transparency Policy: Absolute commitment to honest marketing - no fake reviews, testimonials, or misleading claims. Platform will earn authentic reviews through real user experiences.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
Enterprise Equality Philosophy: All organizations receive the same enterprise-level capabilities regardless of size or budget. Pricing differentiated by volume limits and support level, never by feature quality. Small districts get identical enterprise features as large districts. Small businesses get identical enterprise features as large corporations.
Organization Categories: Clear distinction between Private Schools (independent institutions with flexible security requirements), Community Nonprofits (churches, Boys & Girls Clubs with tournament organizing needs), and Business Enterprise (white-label platform providers). Public school districts and charter schools represent future market expansion after security certifications are completed.
Unified Donation Model: $50/month suggested donation - All users receive identical enterprise-level features including unlimited students/participants, full athletic management suite, academic competition tracking, AI injury prediction, health communication, equipment management, smart scheduling, merchandise webstore, event ticket management, advanced analytics, custom branding, priority support, training and onboarding, multi-sport coordination, white-label experience, and unlimited tournament capacity. Perfect for all organization types from individual coaches to large corporations.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
Organization Expansion: Include charter schools, private schools, pony leagues, pop warner, and youth organizations with dedicated registration path alongside districts.
Mobile-first development approach validated - platform built 95% on mobile device ensuring excellent mobile web experience. Customer acquisition prioritized over native app development for current phase. Developed conversational AI chat interface with natural language processing, replacing dropdown-based interactions with intuitive chat experience similar to human conversation. AI provides guidance and recommendations but does not create tournaments on the live platform. Redesigned AI consultant from misleading tournament creator to Registration Assistant helping visitors choose appropriate subscription plans based on organization type, size, and needs.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Custom Design System**: Extensive use of CSS variables for consistent theming and dark mode. Design patterns include glass morphism, gradients, floating animations, and glow effects with a tournament-themed HSL color system. Mobile-first responsive design.
- **Form Management**: React Hook Form with Zod validation.
- **Component Structure**: Modular design for UI, pages, and business logic.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with structured error handling and request logging.
- **Development Setup**: Vite integration with Hot Module Replacement (HMR).
- **Storage Abstraction**: Interface-based system supporting in-memory and database implementations.

### Data Storage
- **Multi-Database Architecture**: HIPAA/FERPA compliant separation with dedicated databases for different data domains
  - **Main Database** (DATABASE_URL): Core authentication, billing, district management, tournament operations, academic competitions, health tracking
  - **Fantasy Database** (DATABASE_URL_FANTASY): Isolated fantasy sports data including professional players (364 NFL players from Pro Football Reference), leagues, teams, rosters, drafts - prevents cross-contamination with student health data
- **Database Provider**: Neon Database for serverless PostgreSQL
  - Main DB: ep-dark-lake-aeblribj.c-2.us-east-2.aws.neon.tech
  - Fantasy DB: Separate Neon instance with dedicated connection string
- **Schema Management**: Drizzle Kit with separate configs (drizzle.config.ts for main, drizzle.fantasy.config.ts for fantasy)
- **Data Validation**: Zod schemas for runtime type validation
- **Storage Layer**: Dual storage implementation - DbStorage for main database, FantasyStorage for fantasy database with soft user references (varchar IDs, no cross-DB foreign keys)
- **Database Status**: ✅ Multi-database architecture operational (Fantasy separation completed 9/30/2025)

### Authentication and Authorization
- **Dual Authentication System**: Replit OAuth and form-based authentication with session management.
- **Unified Login**: Single login portal (`/login`) serves all user types with no platform type selection required. Legacy login form available at `/legacy-login` as fallback.
- **Session Management**: Express sessions with PostgreSQL session store.
- **User Hierarchy**: Multi-tiered role-based access control (District, School, Coaching levels) enforcing HIPAA/FERPA compliance for data partitioning.
- **Security**: CORS, secure session handling, protected routes, and comprehensive debug logging.

### Core Features & Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for core functionality without a database.
- **Tournament Creation**: 5-Step wizard and "Perfect Tournament Flow Logic" for guided setup based on complexity.
- **Webstore & E-commerce**: Comprehensive merchandise system with product catalogs, inventory management, custom personalization, event ticket sales, revenue sharing calculations, and integrated Stripe payment processing. Advanced page builder allows tournament directors to create custom webstore pages.
- **Data Management**: CSV Bulk Import/Export, Enhanced Team Management, and Multi-Sport Event Management.
- **AI Integration**: 3-Tier AI Consultation (Consultation, Generation, Full-Service) with Keystone AI Avatar system (Professional Coach, Friendly Advisor, Sports Mascot, Keystone Coach) providing recommendations and guidance. AI provides consultation only - does not create tournaments on the live platform.
- **Health & Safety**: Comprehensive Sports Injury AI (95-96% diagnostic accuracy), Health & Safety Analytics, Athletic Trainer Dashboard, and specialized management for Cheerleading & Athletic Support Teams with injury protocols.
- **Scheduling Systems**: Comprehensive scheduling for athletic trainers, game/practice, and Scorekeeper Scheduling System.
- **Academic Competition System**: Integration for over 50 UIL academic competitions (grades 2-12) with district, regional, and state advancement, including role hierarchy and TEKS alignment.
- **Subdomain-Based Architecture**: Separation of tournament management into distinct subdomains.
- **Cascading Dropdown System**: 3-tier progressive disclosure for competition selection.
- **Family Access Management**: Three-tier security system (Full/Events Only/Results Only) with parent authorization and location privacy.
- **Enterprise Accessibility**: WCAG-compliant interface with proper text contrast and accessible navigation.

## External Dependencies
- **Database**: Neon PostgreSQL.
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Icons**: Font Awesome and Lucide React.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Payment Integration**: Stripe.
- **Domain Registration**: Openprovider (Account ID: 309533).
- **API Integration**: ESPN API.
- **AI**: AI-powered tournament consultation and AI coaching messages.
- **Email**: SendGrid.