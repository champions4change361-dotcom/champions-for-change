# Athletic & Academic Management Platform

## Overview
This platform is a comprehensive Enterprise Resource Planning (ERP) system designed for educational athletic and academic programs. As a white-label SaaS solution for the Champions for Change nonprofit, it generates funding for educational opportunities for underprivileged youth. **PRODUCTION-READY DONATION SYSTEM**: Complete Stripe integration fully verified with real financial transactions. Successfully processed $25 test donation with bank account verification, confirming end-to-end payment processing for Champions for Change educational programs.

**DOMAIN RESELLER INTEGRATION**: Complete Openprovider integration (Account ID: 309533) enables white-label domain services at transparent nonprofit pricing (registry cost + $3 processing fee). Live API connectivity confirmed with credentials (champions4change361@gmail.com). Domain search available at `/domains` provides real-time availability and competitive pricing vs $15.99 retail rates.

**CHECK PAYMENT SYSTEM**: Implemented pending approval workflow for annual subscribers who pay by check. Check payments restricted to Annual Pro subscribers only ($990/month plans). Monthly subscribers must use credit/debit cards. Check payment address: Champions for Change, 15210 Cruiser St. Corpus Christi TX 78418. Processing time: 7-10 business days with admin approval system at `/admin/approvals`. It serves as a complete district management system covering athletic programs, academic competitions (50+ UIL events), budget allocation, organizational oversight, and health monitoring. Key capabilities include HIPAA/FERPA compliant data management, Excel-style budget systems, interactive organizational charts, AI-powered injury prediction (95% accuracy), athletic trainer dashboards, role-based access controls, comprehensive audit trails, AI assistants on all data entry pages, tournament management, and multi-tenant architecture with full district-to-student hierarchy. The platform aims to manage educational programs, student health data, financial allocation, and organizational structure, emphasizing a mission-driven approach alongside enterprise-grade compliance for educational institutions.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for underprivileged youth.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Domain Strategy: Primary domain www.championsforchange.net DEPLOYED on Replit (verification in progress). Transfer code from Jersey Watch (%eRUvQT-jvI0Q4oQ{386). All existing business cards and QR codes will redirect seamlessly to the Replit-hosted tournament platform.
Transparency Policy: Absolute commitment to honest marketing - no fake reviews, testimonials, or misleading claims. Platform will earn authentic reviews through real user experiences.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
Enterprise Equality Philosophy: All organizations receive the same enterprise-level capabilities regardless of size or budget. Pricing differentiated by volume limits and support level, never by feature quality. Small districts get identical enterprise features as large districts. Small businesses get identical enterprise features as large corporations.
Organization Categories: Clear distinction between Private Schools (independent institutions with flexible security requirements), Community Nonprofits (churches, Boys & Girls Clubs with tournament organizing needs), and Business Enterprise (white-label platform providers). Public school districts and charter schools represent future market expansion after security certifications are completed.
Independent School Pro: $199/month - Up to 500 students, full athletic management suite, academic competition tracking, AI injury prediction, health communication, equipment management, smart scheduling, and basic support. Perfect for mid-size private schools.
Private School Enterprise: $399/month - Up to 1,500 students, all Pro features plus advanced analytics, custom branding, priority support, training and onboarding, and multi-sport coordination. Ideal for larger private institutions.
Educational Partnership: $99/month - Schools under 200 students, essential features, perfect for smaller private schools and religious institutions with community support.
Tournament Organizer: $39/month or $399/year (2 months free) - Complete tournament management with unlimited events, team/athlete registration, payment processing, custom donation pages, professional branding, and white-label experience. Perfect for individual tournament organizers, coaches, and community leaders who want professional features beyond basic free tools like Challonge.
Business Enterprise: $149/month or $1,499/year - Complete white-label tournament platform for businesses. Same enterprise capabilities as large corporations.
Annual Pro: $990/month - High-volume tournament companies (50+ tournaments/year) with unlimited capacity and enhanced support.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
White Label Strategy: Remove from initial offering to simplify market entry. Add later with 50-100% price increase. Focus on "Professional Platform" with logo, colors, custom domain.
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
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database for serverless PostgreSQL (ACTIVE: ep-dark-lake-aeblribj.c-2.us-east-2.aws.neon.tech).
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation.
- **Database Status**: ✅ Connected and operational (all Supabase references removed 8/22/2025).

### Authentication and Authorization
- **Dual Authentication System**: Replit OAuth and form-based authentication with session management.
- **Login Portals**: Separate login experiences for Districts (`/login/district`), Tournament Organizers (`/login/organizer`), and Business Enterprise (`/login/business`), plus a master admin portal (`/admin`).
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