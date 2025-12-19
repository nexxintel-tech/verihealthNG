# VeriHealth - Clinical Remote Monitoring Platform

## Overview

VeriHealth is a cross-platform medical remote monitoring system designed to collect health data from iOS (HealthKit) and Android (Health Connect) devices, sync it to a cloud database in real-time, and provide clinicians with AI-powered risk insights through a comprehensive dashboard. The system supports continuous monitoring of 16+ medical conditions using vitals and behavioral metrics, with automated alerts and notifications.

The current implementation is a **web-based clinician dashboard** built with React, Express, and Supabase. The mobile apps (iOS Swift + HealthKit, Android Kotlin + Health Connect) are planned but not yet implemented in this codebase.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Structure

The VeriHealth platform consists of two separate web applications:

1. **Clinician Dashboard** (`/client`, `/server`) - Authenticated portal for healthcare providers
2. **Public Website** (`/public-site`) - Marketing site for general visitors

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router)
- Problem: Need fast development feedback and optimized production builds
- Solution: Vite provides instant HMR in development and optimized bundling for production
- Trade-offs: Vite requires ESM-compatible packages; some older libraries may need special handling

**UI Component System**
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS v4 for styling with custom design tokens
- Problem: Need accessible, customizable UI components without building from scratch
- Solution: Radix UI provides unstyled, accessible primitives; Tailwind enables rapid styling
- Design system: Custom color palette for risk levels (low/medium/high), medical-specific theming

**State Management**
- TanStack Query (React Query) for server state management
- Problem: Need to handle async data fetching, caching, and real-time updates
- Solution: React Query provides automatic background refetching, cache invalidation, and optimistic updates
- Alternatives considered: Redux (too heavy), Context API (no caching)

**Data Visualization**
- Recharts for vital signs charts and trends
- Custom dashboard components for patient statistics and risk scores

### Backend Architecture

**Server Framework**
- Express.js with TypeScript in ESM module format
- Problem: Need a lightweight, flexible Node.js server
- Solution: Express provides minimal overhead with extensive middleware ecosystem
- Development vs Production: Vite dev server proxies API requests in dev; static file serving in production

**Database & ORM**
- Supabase (PostgreSQL) for primary data storage
- Drizzle ORM for type-safe database queries and migrations
- Problem: Need real-time capabilities, authentication, and relational data modeling
- Solution: Supabase provides managed PostgreSQL with real-time subscriptions and auth
- Schema: Users, Patients, Conditions, VitalReadings, RiskScores, Alerts tables

**API Design**
- RESTful API endpoints under `/api` prefix
- Routes handle patient lists, individual patient details, vital readings, and alerts
- Response format: JSON with proper HTTP status codes
- Error handling: Centralized error logging with detailed error responses

**Real-time Updates**
- Polling-based approach (30-second intervals) as fallback
- Designed for Supabase Realtime subscriptions (not yet fully implemented)
- Problem: Clinicians need near real-time patient data updates
- Solution: React Query cache invalidation on intervals; future upgrade to WebSocket-based Supabase Realtime

### Authentication & Authorization

**Authentication System**
- Supabase Auth for user management with email/password
- Email confirmation workflow (currently disabled pending domain verification)
- Password reset via secure token system
- Role-based access: patient, clinician, admin
- JWT-based session management with secure cookies
- Problem: Need secure, healthcare-compliant user authentication
- Solution: Supabase Auth provides HIPAA-eligible authentication when properly configured

**Email Confirmation System (Disabled - Pending Domain Setup)**
- Registration flow sends confirmation email via Resend API
- Login blocks unconfirmed users with option to resend confirmation email
- Password reset sends secure token links
- Status: Fully implemented but disabled (`ENABLE_EMAIL_CONFIRMATION=false`)
- Reason: Resend requires verified domain before sending to external addresses
- Next steps: Acquire custom domain, verify in Resend dashboard, set `ENABLE_EMAIL_CONFIRMATION=true`

### Admin Panel (System Admin Only)

**User Management**
- Full user listing with search and role-based filtering
- Enable/disable user accounts (Supabase Auth ban/unban)
- Role assignment with institution linking for clinicians/institution admins
- Bulk actions: select multiple users for batch operations
- User details view: profile, institution, last sign-in, patient count
- Send email to individual users via Resend
- Export all users to CSV

**Institution Management**
- CRUD operations for healthcare institutions
- Set default institution for new registrations
- Validation prevents deletion of institutions with assigned users

**User Invites**
- Token-based invitation system with pre-assigned roles
- Email delivery of invite links
- 7-day expiration with status tracking
- Invite management (view pending, cancel)

**Activity Logging**
- Comprehensive audit trail of all admin actions
- Tracks: user, action, target type, target ID, details, IP address, timestamp
- Paginated log viewer with action/target filtering

**Analytics Dashboard**
- User distribution pie chart (by role)
- User growth over time bar chart
- Daily activity line chart
- Summary statistics: total users, role counts, institution count

### Design Patterns

**Separation of Concerns**
- `client/`: All frontend code (React components, pages, hooks, styles)
- `server/`: Backend API routes and application logic
- `shared/`: Shared types and database schema (Drizzle)
- Problem: Avoid code duplication and maintain consistency between frontend and backend
- Solution: Shared TypeScript definitions ensure type safety across the stack

**Development vs Production**
- Development: `server/index-dev.ts` with Vite middleware for HMR
- Production: `server/index-prod.ts` serves pre-built static assets from `dist/public`
- Build process: `vite build` compiles frontend; `esbuild` bundles backend into single file

## External Dependencies

### Third-Party Services

**Supabase**
- Purpose: Managed PostgreSQL database, authentication, and real-time subscriptions
- Integration: `@supabase/supabase-js` client library
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Critical for: All persistent data storage, user authentication, real-time features

**Resend**
- Purpose: Transactional email delivery (confirmation emails, password resets)
- Integration: `resend` npm package via Replit connector
- Environment variables: `RESEND_API_KEY` (auto-managed by Replit)
- Status: Fully integrated but disabled pending custom domain verification
- Current domain: `ustoufaleo.resend.app` (test domain, can't send to external addresses)
- Email templates: Professional HTML templates in `server/email.ts`

**MessageBird (Planned)**
- Purpose: SMS/voice alerts and notifications to clinicians
- Status: Not yet implemented in codebase
- Future use: Send critical alerts when patient risk scores exceed thresholds

### Mobile Platform SDKs (Planned)

**iOS HealthKit**
- Purpose: Collect health data (HR, HRV, BP, SpO2, Sleep, Steps, etc.) from Apple devices
- Status: Not implemented; requires native Swift app
- Architecture: Background delivery, local queue for offline sync, push to Supabase

**Android Health Connect**
- Purpose: Collect same health metrics from Android devices
- Status: Not implemented; requires native Kotlin app
- Architecture: Permission model, background sync, offline-first queue

### Development Tools

**Replit-Specific Plugins**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Code navigation helper
- `@replit/vite-plugin-dev-banner`: Development environment banner
- Custom `vite-plugin-meta-images`: Automatically updates OpenGraph images for Replit deployments

### Key Libraries

**UI & Styling**
- `@radix-ui/*`: 20+ component primitives (dialogs, dropdowns, tooltips, etc.)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Type-safe component variants
- `lucide-react`: Icon library

**Data & Forms**
- `react-hook-form`: Form state management
- `@hookform/resolvers` + `zod`: Form validation
- `date-fns`: Date manipulation and formatting

**Charts & Visualization**
- `recharts`: Declarative charting library for vital signs visualization

**Database**
- `drizzle-orm`: TypeScript ORM for PostgreSQL
- `drizzle-zod`: Generate Zod schemas from Drizzle tables
- `connect-pg-simple`: PostgreSQL session store (for future session management)