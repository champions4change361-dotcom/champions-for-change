# Tournament Bracket Manager

## Overview
This comprehensive district athletics management platform functions as a white-label SaaS platform for the Champions for Change nonprofit. Its primary purpose is to generate funding for educational opportunities for underprivileged youth in Corpus Christi, Texas, by offering professional tournament management and district athletic administration services. The platform enables full HIPAA/FERPA compliant management of student health and educational data, tournament creation, scheduling systems, and district-wide resource coordination. Key capabilities include enterprise-grade compliance infrastructure, role-based access controls, comprehensive audit trails, user authentication, AI-powered tournament creation across various sports, custom branding, and a multi-tenant architecture with a six-tier user hierarchy (District Athletic Trainer → Athletic Director → Athletic Trainer → Head Coach → Assistant Coach → Scorekeeper). Districts handle student fees through existing systems - no payment processing needed for student transactions. The project emphasizes its mission-driven approach while maintaining the highest standards of data protection and regulatory compliance for educational institutions.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $2,490/year, districts save $31,010-$65,510 annually compared to current solutions while supporting educational mission. ROI of 1,244%-2,629% makes non-adoption fiscally irresponsible. Districts handle student fees through existing systems - no payment processing burden on platform.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.
Organization Expansion: Include charter schools, private schools, pony leagues, pop warner, and youth organizations with dedicated registration path alongside districts.

### CSS and Tailwind Coding Preferences
- **Custom Design System**: Extensive use of CSS variables for consistent theming and dark mode support
- **Tailwind Extensions**: Custom colors, animations, spacing, and utility classes integrated with Tailwind configuration
- **Component Styling**: Preference for custom React components with variants (CustomCard, CustomButton, AnimatedText, FloatingElement)
- **Design Patterns**: Use of glass morphism, gradients, floating animations, and glow effects
- **Utility Classes**: Custom classes like `.btn-custom`, `.card-custom`, `.text-gradient`, `.glass-morphism`
- **Color System**: Tournament-themed colors (primary, secondary, accent) with proper HSL format
- **Animation Approach**: CSS-based animations with custom keyframes for float, pulse-glow, and slide-in effects
- **Responsive Design**: Mobile-first approach with consistent spacing and shadow systems
- **Documentation**: Maintain comprehensive design guide at `/custom-design-demo` for reference

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Custom Design System**: Extended Tailwind configuration with custom CSS variables, utility classes, animations, and React components for branded athletics platform styling.
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
- **User Management**: Complete user registration, login, logout flows.
- **Protected Routes**: Authentication middleware for tournament and payment endpoints.
- **Security**: CORS, secure session handling, user profile management.
- **User Hierarchy**: A three-tiered role-based access control system for proper district athletics management:
  - **District Level**: District Athletic Director (Super Admin), District Head Athletic Trainer (Health Admin)
  - **School Level**: School Athletic Director (School Admin), School Athletic Trainer (Health Monitor), School Principal (Oversight Access)
  - **Team Level**: Head Coach (Team Manager), Assistant Coaches (Limited Team Access), Athletic Training Students (Read-only Health Data)
  This hierarchy manages medical/tournament data partitioning to enforce HIPAA compliance with proper organizational authority structure.
- **HIPAA/FERPA Compliance**: Enterprise-grade route-level compliance middleware with automatic audit logging, role-based medical data access controls, and comprehensive violation tracking. Includes training verification, permission validation, and complete forensic audit trails for all sensitive data access.

### Custom Design System
- **CSS Variables**: Custom properties for consistent theming and dark mode support.
- **Tailwind Extensions**: Custom colors, animations, spacing, and shadows integrated with Tailwind configuration.
- **Component Library**: Custom React components (CustomCard, CustomButton, AnimatedText, FloatingElement) with variants and animations.
- **Demo Page**: `/custom-design-demo` showcases all custom design components and styling capabilities.
- **Design Guide**: Complete documentation in `CUSTOM_DESIGN_GUIDE.md` for creating custom CSS and Tailwind components.

### Key Design Patterns & Features
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend.
- **Repository Pattern**: Storage abstraction.
- **Component Composition**: Reusable UI components.
- **Type Safety**: End-to-end TypeScript with Zod runtime validation.
- **Progressive Enhancement**: Fallback storage for core functionality without a database.
- **Multi-Sport Event Management**: Comprehensive event selection for various sports with sport-specific scoring, including advanced analytics for contact sports (concussion risk, impact load) and endurance sports (position-specific monitoring).
- **Tournament Integration System**: Comprehensive format configurations (Single Elimination, Double Elimination, Round Robin, Track & Field Multi-Event) with detailed bracket generation, advancement, and tiebreaker rules.
- **Geolocation-Based Event Tracking**: Real-time location verification with geofencing, check-ins, and remote scoring controls.
- **Team Registration and Management**: Coaches register teams with rosters; tournament managers approve.
- **Scorekeeper Assignment and Verification**: Managers assign scorekeepers with verification processes.
- **Health & Safety Analytics**: Proactive athlete health monitoring, AI-powered recommendations for coaches, medical safety protocols, and health alert systems (low, medium, high, critical). Includes features like injury simulation, Athletic Trainer workflow integration, and HIPAA-compliant medical document management.
- **Scheduling Systems**: Comprehensive scheduling for athletic trainers across multiple schools, and game/practice scheduling for coaches including team roster integration, parent notifications, transportation coordination, and weather monitoring.

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

## Recent Changes

### VLC District Management System Integration (August 14, 2025)
Successfully implemented VLC-based district athletics management system:

**System Components**:
- Comprehensive district/school database schema with VLC organization
- Full CRUD operations for districts, schools, assets, and athletic venues  
- Schools page with file upload capabilities and navigation integration
- Database connectivity fixes using shared connection instances

**Miller VLC Assets**:
- Added Roy Miller High School "Welcome to Buc Nation" banner asset
- File: `attached_assets/IMG_0178_1755214650992.jpeg` 
- Purpose: Homepage banner for Miller VLC demo showcasing school athletics branding
- Integration ready for Miller VLC homepage mockup deployment

### Deployment Health Check Fixes (August 14, 2025)
Applied fixes for deployment health check failures:

**Root Cause**: 
- Error handler was throwing exceptions after sending responses, causing server crashes
- Missing proper deployment health check detection
- Insufficient graceful shutdown handling

**Solutions Applied**:
1. **Fixed Error Handling**: Removed `throw err` from global error handler to prevent process crashes. Added proper logging and conditional response sending.

2. **Enhanced Health Check Detection**: Improved root endpoint (`/`) to better detect deployment health checks by adding Replit user-agent detection and query parameter support.

3. **Multiple Health Endpoints**: Added multiple health check endpoints for deployment compatibility:
   - `/` (root with smart detection)
   - `/health` (standard)
   - `/healthz` (Kubernetes-style)
   - `/api/health` (API-specific)

4. **Improved Server Configuration**: 
   - Added graceful shutdown handling for SIGTERM and SIGINT signals
   - Enhanced error recovery with delayed exits instead of immediate crashes
   - Better logging for deployment monitoring

5. **Server Startup Improvements**: Added clearer logging messages showing health check endpoint availability.

**Result**: Server now properly responds to deployment health checks with 200 status codes and maintains stability during errors. All health endpoints verified working.