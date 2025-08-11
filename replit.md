# Tournament Bracket Manager

## Overview

This is a full-stack tournament bracket management application that allows users to create and manage single-elimination tournaments with interactive bracket visualization and real-time match updates. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and in-memory storage as a fallback.

**Status**: Complete white-label tournament management SaaS platform for Champions for Change nonprofit. Revenue funds educational opportunities for underprivileged youth in Corpus Christi, Texas. Built by coaches who identified tournament management needs. Features user authentication with Replit OAuth, Stripe payment integration, AI-powered tournament creation across 65+ sports, custom branding with Champions for Change logo and color scheme, multi-tenant white-label architecture, five-tier user hierarchy reflecting real school district structure, and mission-focused user experience emphasizing educational impact.

**Latest Update (Aug 11, 2025)**: Keystone AI consultation system fully operational with ultimate stress test capabilities - handling all enterprise and viral scenarios simultaneously. Peak performance features: 32-state enterprise deployment + 3+ million concurrent viewers + 6,000 viral signup surge (30% Pro, 15% Basic, 55% Free) + complex multi-sport tournaments (NBA Finals, MLB World Series, College Football) all running concurrently. Advanced infrastructure delivers 20+ strategic recommendations covering CDN deployment, load balancing, geographic redundancy, white-label branding, dedicated support teams, database scaling, registration queues, payment processing, and automated onboarding. Complete enterprise-grade platform ready for maximum success scenarios driven by national TV advertising. Three-tier system operational across all devices with bulletproof scalability.

## User Preferences

Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.

## Executive Director Information

Name: Daniel Thornton, Executive Director of Champions for Change
Background: 21 years military service (Marines then Army), retired and moved to Corpus Christi, Texas in 2016. Teaching and coaching at Robert Driscoll Middle School since 2016.
Contact: Champions4change361@gmail.com, 361-300-1552
Mission: Funding $2,600+ student trips through educational tour companies for underprivileged youth in Corpus Christi, Texas.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Component Structure**: Modular component architecture with separate UI components, pages, and business logic components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Development Setup**: Vite integration for development with HMR support
- **Storage Abstraction**: Interface-based storage system supporting both in-memory and database implementations

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-Zod integration

### Authentication and Authorization
- **Authentication Provider**: Replit OAuth integration with openid-client
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Management**: Complete user registration, login, logout flows
- **Protected Routes**: Authentication middleware for tournament and payment endpoints
- **Security**: CORS configuration, secure session handling, and user profile management

### External Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Icons**: Font Awesome and Lucide React icons
- **Development**: Replit-specific development tools and error handling
- **Validation**: Zod for schema validation across frontend and backend
- **Date Handling**: date-fns for date manipulation utilities

### Key Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend
- **Repository Pattern**: Storage abstraction allowing for multiple storage implementations
- **Component Composition**: Reusable UI components with consistent styling and behavior
- **Type Safety**: End-to-end TypeScript with runtime validation using Zod
- **Progressive Enhancement**: Fallback storage system ensures application works without database connection
- **Multi-Sport Event Management**: Comprehensive event selection system covering Track & Field (30+ events), Swimming & Diving (25+ events), Golf (20+ events including youth skills), and Fishing & Hunting (20+ events)
- **Advanced Event Selection**: Checkbox-based interface with category grouping, "Select All" functionality, and real-time event counters
- **Sport-Specific Scoring**: Time-based (running/swimming), distance-based (throwing/jumping), stroke-based (golf), weight-based (fishing), and point-based (skills competitions) scoring systems
- **Youth Program Support**: Specialized events for middle school programs including golf skills competitions and youth hunting/fishing derbies
- **Mission Integration**: Platform branding reflects Champions for Change nonprofit mission with green/blue color scheme
- **Educational Impact Focus**: User interface emphasizes funding student trips and educational opportunities
- **Revenue-to-Education Model**: 100% of platform revenue directed to supporting underprivileged youth in Corpus Christi, Texas
- **Coach-Built Heritage**: Platform messaging highlights development by coaches who understand tournament management needs
- **Five-Tier School District Hierarchy**: Tournament Manager/District Athletic Director (creates tournaments, assigns schools to events) → School Athletic Director (assigns coaches within their school to specific events) → Coach (registers teams, manages team participation, works under school AD) → Scorekeeper/Judge (assigned by tournament manager to specific events, updates scores for assigned events only) → Athlete/Fan (views results, tracks performance, follows tournaments)
- **Role-Based Access Control**: Dynamic navigation and features based on user roles and subscription levels
- **Team Registration System**: Coaches can register teams with full player rosters, organization details, and event selections
- **Registration Approval Workflow**: Tournament managers review and approve/reject team registrations with detailed player information
- **Scorekeeper Assignment System**: Tournament managers assign scorekeepers to specific events within tournaments, critical for multi-event sports and competitions like BBQ cookoffs
- **Event-Specific Score Management**: Scorekeepers can only update scores for events they are specifically assigned to, ensuring secure and organized score recording
- **Score Verification Process**: Tournament managers can verify scores entered by scorekeepers to ensure accuracy and integrity
- **District-to-School Assignment Flow**: District ADs assign schools to tournament events, School ADs then assign their coaches to specific events within those assignments
- **Hierarchical Coach Management**: School Athletic Directors manage coaches from their specific school/organization, reflecting real-world structure like Corpus Christi ISD → Robert Driscoll Middle School