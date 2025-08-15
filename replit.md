# Tournament Bracket Manager

## Overview
This platform is a white-label SaaS solution for the Champions for Change nonprofit, aiming to generate funding for educational opportunities for underprivileged youth. It serves as a comprehensive district academic and athletic management platform, covering all 50+ UIL competitions (academic and athletic). Its core purpose is to provide professional tournament management and district-wide administration services. Key capabilities include HIPAA/FERPA compliant data management, tournament creation, scheduling, enterprise-grade compliance, role-based access controls, comprehensive audit trails, user authentication, AI-powered tournament creation, custom branding, and a multi-tenant architecture with an expanded role hierarchy from district to student level. The platform enables full management of student health and educational data, emphasizing its mission-driven approach alongside data protection and regulatory compliance for educational institutions.

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

### CSS and Tailwind Coding Preferences
- Custom Design System: Extensive use of CSS variables for consistent theming and dark mode support
- Tailwind Extensions: Custom colors, animations, spacing, and utility classes integrated with Tailwind configuration
- Component Styling: Preference for custom React components with variants (CustomCard, CustomButton, AnimatedText, FloatingElement)
- Design Patterns: Use of glass morphism, gradients, floating animations, and glow effects
- Utility Classes: Custom classes like `.btn-custom`, `.card-custom`, `.text-gradient`, `.glass-morphism`
- Color System: Tournament-themed colors (primary, secondary, accent) with proper HSL format
- Animation Approach: CSS-based animations with custom keyframes for float, pulse-glow, and slide-in effects
- Responsive Design: Mobile-first approach with consistent spacing and shadow systems
- Documentation: Maintain comprehensive design guide at `/custom-design-demo` for reference

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

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database for serverless PostgreSQL.
- **Fallback Storage**: In-memory storage.
- **Schema Management**: Drizzle Kit for migrations.
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-Zod.

### Authentication and Authorization
- **Authentication Provider**: Replit OAuth integration with openid-client.
- **Session Management**: Express sessions with PostgreSQL session store.
- **User Management**: Complete user registration, login, logout flows with user type-based portals.
- **Login Portals**: Separate login experiences for Districts (/login/district), Tournament Organizers (/login/organizer), and Business Enterprise (/login/business).
- **Master Admin Portal**: Full access admin management system (/admin) for creating test users and accessing all platform features.
- **Role-Based Access**: Automatic role assignment based on user type selection with appropriate subscription plans and organizational context.
- **Admin Management**: Comprehensive admin tools for creating fake user profiles, viewing all users, and accessing platform analytics.
- **Protected Routes**: Authentication middleware for tournament and payment endpoints.
- **Security**: CORS, secure session handling, user profile management.
- **User Hierarchy**: A multi-tiered role-based access control system including District, School, and Team levels, with specific roles like Athletic Director, Trainer, Principal, Head Coach, etc. This hierarchy enforces HIPAA compliance for medical/tournament data partitioning.
- **HIPAA/FERPA Compliance**: Enterprise-grade route-level compliance middleware with automatic audit logging, role-based medical data access controls, and comprehensive violation tracking.

### Custom Design System
- **CSS Variables**: Custom properties for consistent theming and dark mode support.
- **Tailwind Extensions**: Custom colors, animations, spacing, and shadows integrated with Tailwind configuration.
- **Component Library**: Custom React components (CustomCard, CustomButton, AnimatedText, FloatingElement) with variants and animations.
- **Demo Page**: `/custom-design-demo` showcases all custom design components and styling capabilities.

### Key Design Patterns & Features
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for core functionality without a database.
- **Multi-Sport Event Management**: Comprehensive event selection with sport-specific scoring and analytics.
- **Tournament Integration System**: Comprehensive format configurations (Single Elimination, Double Elimination, Round Robin, Track & Field Multi-Event) with bracket generation and tiebreaker rules.
- **Geolocation-Based Event Tracking**: Real-time location verification with geofencing, check-ins, and remote scoring controls.
- **Team Registration and Management**: Coaches register teams with rosters; tournament managers approve.
- **Scorekeeper Assignment and Verification**: Managers assign scorekeepers with verification processes.
- **Health & Safety Analytics**: Proactive athlete health monitoring, AI-powered recommendations, medical safety protocols, and health alert systems, including injury simulation and HIPAA-compliant medical document management.
- **Athletic Trainer Dashboard**: Comprehensive athlete health management system with multi-sport athlete tracking, injury care plans, medical document uploads (X-rays, MRIs), communication tools for parents/coaches/doctors, supply inventory management, AED checks, and certification reminders.
- **Scheduling Systems**: Comprehensive scheduling for athletic trainers and game/practice scheduling for coaches, including team roster integration, parent notifications, transportation, and weather monitoring.
- **Academic Competition System**: Integration for 50+ UIL academic competitions (High School and A+ Academics), covering grades 2-12 with district, regional, and state advancement. Includes role hierarchy for academic stakeholders, TEKS alignment, and academic achievement tracking.
- **Subdomain-Based Architecture**: Separation of tournament management into distinct subdomains for enterprise users, district athletics, and school-level athletics to resolve role conflicts and connection issues, while maintaining cross-role schedule visibility.

## External Dependencies
- **Database**: Neon PostgreSQL (serverless).
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Icons**: Font Awesome and Lucide React.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Payment Integration**: Stripe.
- **API Integration**: ESPN API (for NFL scoring, play-by-play, player performance).
- **AI**: AI-powered tournament creation and AI coaching messages.