# Tournament Bracket Manager

## Overview
This is a full-stack tournament bracket management application designed as a white-label SaaS platform for the Champions for Change nonprofit. The application enables users to create and manage single-elimination tournaments with interactive bracket visualization and real-time updates. Its core purpose is to fund educational opportunities for underprivileged youth in Corpus Christi, Texas, by offering professional tournament management services. Key capabilities include user authentication, payment integration, AI-powered tournament creation across various sports, custom branding, a multi-tenant architecture, and a five-tier user hierarchy mirroring school district structures. The platform emphasizes its mission-driven approach, providing a comprehensive solution for managing competitive events while generating social impact.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $2,490/year, districts save $31,010-$65,510 annually compared to current solutions while supporting educational mission. ROI of 1,244%-2,629% makes non-adoption fiscally irresponsible.

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