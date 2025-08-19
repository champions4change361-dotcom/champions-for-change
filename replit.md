# Tournament Bracket Manager

## Overview
This platform is a white-label SaaS solution for the Champions for Change nonprofit, aiming to generate funding for educational opportunities for underprivileged youth. It serves as a comprehensive district academic and athletic management platform, covering all 50+ UIL competitions. Its core purpose is to provide professional tournament management and district-wide administration services. Key capabilities include HIPAA/FERPA compliant data management, tournament creation, scheduling, enterprise-grade compliance, role-based access controls, comprehensive audit trails, user authentication, AI-powered tournament creation, custom branding, and a multi-tenant architecture with an expanded role hierarchy from district to student level. The platform enables full management of student health and educational data, emphasizing its mission-driven approach alongside data protection and regulatory compliance for educational institutions.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for underprivileged youth.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Domain Strategy: Primary domain will be championsforchange.net hosted on Replit. All existing business cards and QR codes should redirect seamlessly to the new Replit-hosted tournament platform.
Transparency Policy: Absolute commitment to honest marketing - no fake reviews, testimonials, or misleading claims. Platform will earn authentic reviews through real user experiences.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $4,500-5,000/year, districts save $26,000+ annually compared to current solutions while supporting educational mission. ROI still massive and fiscally irresponsible not to adopt. Districts handle student fees through existing systems - no payment processing burden on platform.
Tournament Organizer Pricing: $39/month ($468/year) or $399/year (2 months free) - competitive with Jersey Watch + Challonge combined.
Business Enterprise Pricing: $149/month or $1,499/year (2 months free) for flexible enterprise solutions.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
White Label Strategy: Remove from initial offering to simplify market entry. Add later with 50-100% price increase. Focus on "Professional Platform" with logo, colors, custom domain.
Organization Expansion: Include charter schools, private schools, pony leagues, pop warner, and youth organizations with dedicated registration path alongside districts.

## Current Platform Status
**Phase**: Market Entry Ready - Tournament management platform with AI medical consultation and organizational tools
**Revenue Strategy**: Start affordable ($39/month tournament organizers, $4,500/year districts) to build user base, then add premium video analysis
**Competitive Moat**: Mission-driven purpose funding student educational opportunities - cannot be replicated by pure tech companies
**AI Video Analysis**: Built and ready for deployment when AI video technology advances (12-18 months projected)
**Market Position**: Comprehensive athletics ecosystem vs. point solutions, with uncopyable nonprofit mission advantage
**Safari Compatibility**: Platform optimized for macOS Safari with responsive button layouts and proper text sizing (August 2025)

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Custom Design System**: Extensive use of CSS variables for consistent theming and dark mode support. Integrated custom Tailwind extensions (colors, animations, spacing). Preference for custom React components with variants (CustomCard, CustomButton, AnimatedText, FloatingElement). Design patterns include glass morphism, gradients, floating animations, and glow effects. Tournament-themed color system in HSL format. CSS-based animations with custom keyframes. Mobile-first responsive design with improved navigation system for CCISD VLC schools access and proper content spacing.
- **Form Management**: React Hook Form with Zod validation.
- **Component Structure**: Modular design for UI, pages, and business logic.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with structured error handling and request logging.
- **Development Setup**: Vite integration with Hot Module Replacement (HMR).
- **Storage Abstraction**: Interface-based system supporting in-memory and database implementations.
- **Health Checks**: Optimized deployment health check endpoints.
- **Deployment Ready**: Enhanced error handling, multiple health check endpoints, robust process error handling, and production-mode stability features.

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database for serverless PostgreSQL.
- **Fallback Storage**: In-memory storage.
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-Zod.

### Authentication and Authorization
- **Dual Authentication System**: Supports both Replit OAuth integration and form-based authentication with session management.
- **Form-Based Login**: Complete login interface at `/login` with master admin credentials. Email authentication handles both uppercase and lowercase variations.
- **Session Management**: Express sessions with PostgreSQL session store, supporting both OAuth and form-based auth flows.
- **User Management**: Complete user registration, login, logout flows with user type-based portals.
- **Login Portals**: Separate login experiences for Districts (`/login/district`), Tournament Organizers (`/login/organizer`), and Business Enterprise (`/login/business`).
- **Master Admin Portal**: Full access admin management system (`/admin`) for creating test users and accessing all platform features.
- **Role-Based Access**: Automatic role assignment based on user type selection with appropriate subscription plans and organizational context.
- **Admin Management**: Comprehensive admin tools for creating user profiles, viewing all users, and accessing platform analytics.
- **Protected Routes**: Authentication middleware for tournament and payment endpoints with session-based and OAuth validation.
- **Security**: CORS, secure session handling, user profile management, comprehensive debug logging for authentication flows.
- **User Hierarchy**: A multi-tiered role-based access control system matching standard district athletics structure: District Level (Athletic Director, Athletic Coordinator, Athletic Trainer, Aquatic Coordinator), School Level (same positions at school level), and Coaching Level (Head Coach, Assistant Coach). This hierarchy enforces HIPAA compliance for medical/tournament data partitioning and aligns with standard district organizational charts like CCISD.
- **HIPAA/FERPA Compliance**: Enterprise-grade route-level compliance middleware with automatic audit logging, role-based medical data access controls, and comprehensive violation tracking.
- **Age Verification System**: Implemented for specific domains to ensure 21+ access for legal compliance.
- **Stripe Payment Integration**: Secure payment processing with proper publishable/secret key separation for client-server architecture.

### Core Features & Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for core functionality without a database.
- **5-Step Tournament Creation Wizard**: Guided process for tournament setup.
- **CSV Bulk Import/Export System**: Subdomain-specific templates, automatic validation, duplicate detection, sample data generation, and error handling.
- **Enhanced Team Management**: Live updates, multiple input methods, smart validation, and sport-specific name generation.
- **AI Integration**: 3-Tier AI Consultation (Consultation, Generation, Full-Service) providing recommendations based on user history and context. Features Keystone AI Avatar system with multiple personalities including Professional Coach, Friendly Advisor, Sports Mascot, and custom Keystone Coach specifically designed for Champions for Change mission-focused interactions.
- **Perfect Tournament Flow Logic**: Universal complexity analysis system that routes users based on competition type, participant count, budget, and compliance needs. Simple tournaments (≤50 participants, free tier, minimal features, individual/simple team sports) get direct tournament creation access, while complex tournaments get professional setup support.
- **Comprehensive Sports Injury AI**: Evidence-based AI consultation covering all major sports injuries (ACL, ankle, concussion, hamstring, back, hip, knee) with 95-96% diagnostic accuracy, plus specialized protocols for cheerleading (ankle injuries 44.9% prevalence, concussion risk 96% from stunts), dance teams, and marching band support groups.
- **Multi-Sport Event Management**: Comprehensive event selection with sport-specific scoring and analytics.
- **Tournament Integration System**: Comprehensive format configurations with bracket generation and tiebreaker rules.
- **Geolocation-Based Event Tracking**: Real-time location verification with geofencing, check-ins, and remote scoring controls.
- **Team Registration and Management**: Coaches register teams with rosters; tournament managers approve.
- **Scorekeeper Assignment and Verification**: Managers assign scorekeepers with verification processes.
- **Health & Safety Analytics**: Proactive athlete health monitoring, AI-powered recommendations, medical safety protocols, health alert systems, injury simulation, and HIPAA-compliant medical document management.
- **Athletic Trainer Dashboard**: Comprehensive athlete health management system with multi-sport athlete tracking, injury care plans, medical document uploads, communication tools, supply inventory management, AED checks, and certification reminders.
- **Cheerleading & Athletic Support Teams**: Dedicated management system for cheerleaders, dance teams, marching band, and color guard with specialized injury assessment protocols, safety compliance tracking (USA Cheer/USASF guidelines), and evidence-based rehabilitation programs.
- **Scheduling Systems**: Comprehensive scheduling for athletic trainers and game/practice scheduling for coaches.
- **Academic Competition System**: Integration for 50+ UIL academic competitions covering grades 2-12 with district, regional, and state advancement, including role hierarchy, TEKS alignment, and academic achievement tracking.
- **Subdomain-Based Architecture**: Separation of tournament management into distinct subdomains for enterprise users, district athletics, and school-level athletics.
- **Cascading Dropdown System**: Comprehensive 3-tier progressive disclosure system for competition selection.

## External Dependencies
- **Database**: Neon PostgreSQL.
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Icons**: Font Awesome and Lucide React.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Payment Integration**: Stripe.
- **API Integration**: ESPN API.
- **AI**: AI-powered tournament creation and AI coaching messages.
- **Email**: SendGrid.