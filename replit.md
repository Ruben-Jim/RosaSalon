# Bella Beauty Salon Management System

## Overview

This is a modern beauty salon management system designed to streamline appointment booking, customer management, and service delivery. The application provides both a customer-facing booking interface and an admin dashboard for salon operations management. It handles hair services, eyebrow treatments, and special beauty services with comprehensive payment tracking and customer communication features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server. The client-side application follows a component-based architecture with:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with custom query client configuration
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theme system
- **Form Handling**: React Hook Form with Zod schema validation

**Design System**: Beauty salon themed with warm color palette (browns, golds) and elegant typography using Inter and Playfair Display fonts. The UI includes glass morphism effects and responsive design patterns.

### Backend Architecture

**Framework**: Express.js with TypeScript using ES modules. The server implements a RESTful API architecture with:

- **Storage Layer**: Abstracted storage interface supporting both in-memory storage (development) and database implementations
- **Route Organization**: Modular route registration system with centralized error handling
- **Development Tools**: Vite integration for hot module replacement and development server

**API Design**: REST endpoints for services, customers, appointments, and messages with proper HTTP status codes and JSON responses.

### Data Storage Solutions

**Database**: PostgreSQL configured through Drizzle ORM with:

- **Schema Management**: Type-safe database schema definitions with automatic TypeScript type generation
- **Migrations**: Drizzle Kit for database migration management
- **Connection**: Neon Database serverless PostgreSQL connection

**Data Models**:
- Users (authentication)
- Services (categorized by hair, eye, special treatments)
- Customers (contact information and history)
- Appointments (scheduling with payment tracking)
- Messages (customer communication system)

### Authentication and Authorization

Currently implements a basic user system with username/password authentication. The application is designed for extension with session management using connect-pg-simple for PostgreSQL session storage.

### External Service Integrations

**Payment Processing**: Stripe integration configured for handling:
- Down payments for service bookings
- Full payment processing
- Payment status tracking

**Development Tools**:
- Replit integration for cloud development environment
- Runtime error overlay for development debugging
- Cartographer for development tooling

**Design System**: shadcn/ui configuration with New York style variant, custom alias paths, and Tailwind CSS integration with CSS variables for theming.

The application uses a monorepo structure with shared schema definitions between client and server, ensuring type safety across the full stack. The architecture supports both development and production deployments with environment-specific configurations.