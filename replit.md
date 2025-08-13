# Tournament Bracket Manager

## Overview
This full-stack tournament bracket management application functions as a white-label SaaS platform for the Champions for Change nonprofit. Its primary purpose is to generate funding for educational opportunities for underprivileged youth in Corpus Christi, Texas, by offering professional tournament management services. The platform enables users to create and manage single-elimination tournaments with interactive bracket visualization and real-time updates. Key capabilities include user authentication, payment integration, AI-powered tournament creation across various sports, custom branding, and a multi-tenant architecture with a five-tier user hierarchy mirroring school district structures. The project emphasizes its mission-driven approach, aiming to provide a comprehensive solution for managing competitive events while creating social impact and offering significant cost savings compared to competitors.

## User Preferences
Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.
Competitive Strategy: Mission-driven advantage - "Let them copy, they'll always be behind and can't replicate the authentic educational mission."
District Value Proposition: At $2,490/year, districts save $31,010-$65,510 annually compared to current solutions while supporting educational mission. ROI of 1,244%-2,629% makes non-adoption fiscally irresponsible.
Guaranteed Pricing Model: "The price you pay at the time is the price you always pay" - creates permanent cost advantage for early adopters and eliminates budget uncertainty.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
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
- **User Hierarchy**: A six-tier role-based access control system including District Athletic Trainer, Athletic Director, Athletic Trainer, Head Coach, Assistant Coach, and Scorekeeper/Judge. This hierarchy also manages medical/tournament data partitioning to enforce HIPAA compliance.

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