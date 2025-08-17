# Tournament Bracket Manager

## Overview
This platform is a white-label SaaS solution for the Champions for Change nonprofit, aiming to generate funding for educational opportunities for underprivileged youth. It serves as a comprehensive district academic and athletic management platform, covering all 50+ UIL competitions (academic and athletic). Its core purpose is to provide professional tournament management and district-wide administration services. Key capabilities include HIPAA/FERPA compliant data management, tournament creation, scheduling, enterprise-grade compliance, role-based access controls, comprehensive audit trails, user authentication, AI-powered tournament creation, custom branding, and a multi-tenant architecture with an expanded role hierarchy from district to student level. The platform enables full management of student health and educational data, emphasizing its mission-driven approach alongside data protection and regulatory compliance for educational institutions.

## Recent Changes (August 17, 2025)
- **Authentication System Completed**: Dual authentication supporting both Replit OAuth and form-based login with master admin credentials
- **Case-Insensitive Email Fix**: Resolved email capitalization issues in authentication flow
- **Session Management Enhanced**: Improved session persistence with detailed debugging and proper cookie handling  
- **User Creation System**: Backend validation and CRUD operations fully functional with comprehensive error handling
- **Admin Portal Access**: Master admin can successfully access `/admin` with full platform management capabilities
- **Production Email System**: SendGrid integration fully operational with verified sender identity (Daniel Thornton <champions4change361@gmail.com>)
- **Real User Testing**: Live athletic trainer account created for Jolynn Millette (snwbunny99504@aol.com) with working email delivery

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $4,500-5,000/year, districts save $26,000+ annually compared to current solutions while supporting educational mission. ROI still massive and fiscally irresponsible not to adopt. Districts handle student fees through existing systems - no payment processing burden on platform.
Tournament Organizer Pricing: $39/month ($468/year) or $399/year (2 months free) - competitive with Jersey Watch + Challonge combined.
Business Enterprise Pricing: $149/month or $1,499/year (2 months free) for flexible enterprise solutions.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
White Label Strategy: Remove from initial offering to simplify market entry. Add later with 50-100% price increase. Focus on "Professional Platform" with logo, colors, custom domain.
Organization Expansion: Include charter schools, private schools, pony leagues, pop warner, and youth organizations with dedicated registration path alongside districts.
Custom Design System: Extensive use of CSS variables for consistent theming and dark mode support
Tailwind Extensions: Custom colors, animations, spacing, and utility classes integrated with Tailwind configuration
Component Styling: Preference for custom React components with variants (CustomCard, CustomButton, AnimatedText, FloatingElement)
Design Patterns: Use of glass morphism, gradients, floating animations, and glow effects
Utility Classes: Custom classes like `.btn-custom`, `.card-custom`, `.text-gradient`, `.glass-morphism`
Color System: Tournament-themed colors (primary, secondary, accent) with proper HSL format
Animation Approach: CSS-based animations with custom keyframes for float, pulse-glow, and slide-in effects
Responsive Design: Mobile-first approach with consistent spacing and shadow systems
Documentation: Maintain comprehensive design guide at `/custom-design-demo` for reference

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Custom Design System**: Extended Tailwind configuration with custom CSS variables, utility classes, animations, and React components for branded platform styling.
- **Form Management**: React Hook Form with Zod validation.
- **Component Structure**: Modular design for UI, pages, and business logic.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with structured error handling and request logging.
- **Development Setup**: Vite integration with Hot Module Replacement (HMR).
- **Storage Abstraction**: Interface-based system supporting in-memory and database implementations.
- **Health Checks**: Optimized deployment health check endpoints with <5ms response times. Root endpoint simplified to always return 200 for health checks.
- **Deployment Ready**: Enhanced error handling, multiple health check endpoints (/health, /healthz, /ping, /api/health), robust process error handling, and production-mode stability features.

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database for serverless PostgreSQL.
- **Fallback Storage**: In-memory storage.
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-Zod.

### Authentication and Authorization
- **Dual Authentication System**: Supports both Replit OAuth integration and form-based authentication with session management.
- **Form-Based Login**: Complete login interface at `/login` with master admin credentials (champions4change361@gmail.com / master-admin-danielthornton).
- **Case-Insensitive Authentication**: Email authentication handles both uppercase and lowercase variations for better user experience.
- **Session Management**: Express sessions with PostgreSQL session store, supporting both OAuth and form-based auth flows.
- **User Management**: Complete user registration, login, logout flows with user type-based portals.
- **Login Portals**: Separate login experiences for Districts (`/login/district`), Tournament Organizers (`/login/organizer`), and Business Enterprise (`/login/business`).
- **Master Admin Portal**: Full access admin management system (`/admin`) for creating test users and accessing all platform features.
- **Auto-Fill Credentials**: Convenient master admin credential auto-fill functionality for testing and development.
- **Role-Based Access**: Automatic role assignment based on user type selection with appropriate subscription plans and organizational context.
- **Admin Management**: Comprehensive admin tools for creating fake user profiles, viewing all users, and accessing platform analytics.
- **Protected Routes**: Authentication middleware for tournament and payment endpoints with session-based and OAuth validation.
- **Security**: CORS, secure session handling, user profile management, comprehensive debug logging for authentication flows.
- **User Hierarchy**: A multi-tiered role-based access control system including District, School, and Team levels, with specific roles like Athletic Director, Trainer, Principal, Head Coach, etc. This hierarchy enforces HIPAA compliance for medical/tournament data partitioning.
- **HIPAA/FERPA Compliance**: Enterprise-grade route-level compliance middleware with automatic audit logging, role-based medical data access controls, and comprehensive violation tracking.

### Core Features & Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for core functionality without a database.
- **5-Step Tournament Creation Wizard**: Guided process for tournament setup including sport/format selection, size, team entry (manual, bulk, CSV), bracket generation, and tournament start.
- **CSV Bulk Import/Export System**: Subdomain-specific templates (District, Enterprise, Free/General), automatic validation, duplicate detection, sample data generation, and error handling.
- **Enhanced Team Management**: Live updates for team name editing, multiple input methods (manual, bulk, CSV, random), smart validation, and sport-specific name generation.
- **AI Integration**: 3-Tier AI Consultation (Consultation, Generation, Full-Service) providing recommendations that populate the 5-step wizard based on user history and context.
- **Multi-Sport Event Management**: Comprehensive event selection with sport-specific scoring and analytics.
- **Tournament Integration System**: Comprehensive format configurations (Single Elimination, Double Elimination, Round Robin, Track & Field Multi-Event) with bracket generation and tiebreaker rules.
- **Geolocation-Based Event Tracking**: Real-time location verification with geofencing, check-ins, and remote scoring controls.
- **Team Registration and Management**: Coaches register teams with rosters; tournament managers approve.
- **Scorekeeper Assignment and Verification**: Managers assign scorekeepers with verification processes.
- **Health & Safety Analytics**: Proactive athlete health monitoring, AI-powered recommendations, medical safety protocols, health alert systems, injury simulation, and HIPAA-compliant medical document management.
- **Athletic Trainer Dashboard**: Comprehensive athlete health management system with multi-sport athlete tracking, injury care plans, medical document uploads (X-rays, MRIs), communication tools, supply inventory management, AED checks, and certification reminders.
- **Scheduling Systems**: Comprehensive scheduling for athletic trainers and game/practice scheduling for coaches, including team roster integration, parent notifications, transportation, and weather monitoring.
- **Academic Competition System**: Integration for 50+ UIL academic competitions (High School and A+ Academics) covering grades 2-12 with district, regional, and state advancement, including role hierarchy, TEKS alignment, and academic achievement tracking.
- **Subdomain-Based Architecture**: Separation of tournament management into distinct subdomains for enterprise users, district athletics, and school-level athletics to resolve role conflicts and connection issues, while maintaining cross-role schedule visibility.
- **Age Verification System**: Implemented for specific domains (e.g., `fantasy.trantortournaments.org`) to ensure 21+ access for legal compliance, using local storage with 30-day validity.

## External Dependencies
- **Database**: Neon PostgreSQL (serverless).
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Icons**: Font Awesome and Lucide React.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Payment Integration**: Stripe (with nonprofit discount rates).
- **API Integration**: ESPN API (for NFL scoring, play-by-play, player performance).
- **AI**: AI-powered tournament creation and AI coaching messages.