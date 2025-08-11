# Tournament Bracket Manager

## Overview

This is a full-stack tournament bracket management application that allows users to create and manage single-elimination tournaments with interactive bracket visualization and real-time match updates. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and in-memory storage as a fallback.

**Status**: Complete white-label tournament management SaaS platform for Champions for Change nonprofit. Revenue funds educational opportunities for underprivileged youth in Corpus Christi, Texas. Built by coaches who identified tournament management needs. Features user authentication with Replit OAuth, Stripe payment integration, AI-powered tournament creation across 65+ sports, custom branding with Champions for Change logo and color scheme, multi-tenant white-label architecture, and mission-focused user experience emphasizing educational impact.

## User Preferences

Preferred communication style: Simple, everyday language.
Mission-focused: Platform serves Champions for Change nonprofit to fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
Branding: Green and blue color scheme from Champions for Change logo, emphasis on educational impact and coach-built heritage.

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