# Tournament Bracket Manager

## Overview
This platform is a white-label SaaS solution for the Champions for Change nonprofit, aimed at generating funding for educational opportunities for underprivileged youth. It serves as a comprehensive district academic and athletic management platform, covering over 50 UIL competitions. Its core purpose is to provide professional tournament management and district-wide administration services, including HIPAA/FERPA compliant data management, tournament creation and scheduling, enterprise-grade compliance, role-based access controls, comprehensive audit trails, user authentication, AI-powered tournament creation, custom branding, and a multi-tenant architecture with an expanded role hierarchy from district to student level. The platform enables full management of student health and educational data, emphasizing its mission-driven approach alongside data protection and regulatory compliance for educational institutions.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for underprivileged youth.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Domain Strategy: Primary domain www.championsforchange.net DEPLOYED on Replit (verification in progress). Transfer code from Jersey Watch (%eRUvQT-jvI0Q4oQ{386). All existing business cards and QR codes will redirect seamlessly to the Replit-hosted tournament platform.
Transparency Policy: Absolute commitment to honest marketing - no fake reviews, testimonials, or misleading claims. Platform will earn authentic reviews through real user experiences.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
Enterprise Equality Philosophy: All organizations receive the same enterprise-level capabilities regardless of size or budget. Pricing differentiated by volume limits and support level, never by feature quality. Small districts get identical enterprise features as large districts. Small businesses get identical enterprise features as large corporations.
Champions District: $2,490/year (up to 15 schools) - Full enterprise district capabilities including HIPAA/FERPA compliance, athletic trainer medical data management, white-label branding, role hierarchy, emergency notifications, and cross-school coordination. Same features as District Enterprise.
District Enterprise: $4,500/year (15+ schools, 25,000+ students) - Identical features to Champions District but with unlimited capacity, enhanced integrations, and dedicated account manager.
Tournament Organizer: $39/month ($468/year) or $399/year (2 months free) - Complete tournament management with unlimited events, AI assistance, and professional features.
Business Enterprise: $149/month or $1,499/year - Complete enterprise features for small to mid-size businesses (up to 50 tournaments/year). Same capabilities as large corporations.
Annual Pro: $990/month - High-volume tournament companies (50+ tournaments/year) with unlimited capacity and enhanced support.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
White Label Strategy: Remove from initial offering to simplify market entry. Add later with 50-100% price increase. Focus on "Professional Platform" with logo, colors, custom domain.
Organization Expansion: Include charter schools, private schools, pony leagues, pop warner, and youth organizations with dedicated registration path alongside districts.

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
- **Database Provider**: Neon Database for serverless PostgreSQL.
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation.

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
- **AI Integration**: 3-Tier AI Consultation (Consultation, Generation, Full-Service) with Keystone AI Avatar system (Professional Coach, Friendly Advisor, Sports Mascot, Keystone Coach) providing recommendations.
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
- **API Integration**: ESPN API.
- **AI**: AI-powered tournament creation and AI coaching messages.
- **Email**: SendGrid.