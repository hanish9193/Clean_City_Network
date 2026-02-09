# WasteWise (CleanCity) - AI-Powered Waste Management App

## Overview

WasteWise (branded as "CleanCity" in the UI) is a full-stack web application for smart urban waste management. Citizens report waste by uploading photos, which are automatically scanned for privacy-sensitive content (faces, license plates, addresses) using AI vision. The system calculates collection priorities using ML-inspired algorithms and optimizes routes for waste collectors. The app is built as a mobile-first progressive web experience.

The project serves as a working prototype demonstrating three novel patentable innovations:
1. **Priority-Weighted Graph Transformation** for route optimization
2. **Deep RL Priority Prediction** for task prioritization
3. **Multimodal Privacy Protection** using AI vision analysis

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework:** React with TypeScript, bundled by Vite
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state caching and synchronization
- **UI Components:** Shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling:** Tailwind CSS with CSS variables for theming; eco-friendly green color palette; custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Maps:** Leaflet + react-leaflet for collector dashboard map view
- **Charts:** Recharts for analytics visualizations
- **Animations:** Framer Motion for page transitions and scanning effects
- **Layout:** Mobile-first design with bottom navigation bar, sticky header, and safe area support

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets` → `./attached_assets/`

### Backend (Express + Node.js)
- **Runtime:** Node.js with tsx for TypeScript execution
- **Framework:** Express.js serving both API routes and the built frontend
- **API Pattern:** RESTful endpoints under `/api/` prefix, with route definitions shared between client and server in `shared/routes.ts`
- **Build:** esbuild for server bundling, Vite for client bundling; output goes to `dist/`
- **Dev Mode:** Vite dev server runs as middleware with HMR via `server/vite.ts`
- **Production:** Static files served from `dist/public/` via `server/static.ts`

### Database (PostgreSQL + Drizzle ORM)
- **Database:** PostgreSQL (required, configured via `DATABASE_URL` environment variable)
- **ORM:** Drizzle ORM with drizzle-zod for schema validation
- **Schema Location:** `shared/schema.ts` (main) and `shared/models/` (auth, chat models)
- **Migrations:** Managed via `drizzle-kit push` (command: `npm run db:push`)
- **Session Store:** PostgreSQL-backed sessions via `connect-pg-simple`

### Key Database Tables
- `users` — Replit Auth user profiles (id, username, email, profile image)
- `sessions` — Express session storage (mandatory for Replit Auth)
- `tasks` — Waste reports with image URLs, location, priority scores, privacy data, status
- `optimization_routes` — Optimized collection routes with assigned tasks and efficiency metrics
- `strikes` — User violation records
- `conversations` / `messages` — Chat/conversation storage for AI integrations

### Authentication
- **Provider:** Replit Auth via OpenID Connect (OIDC)
- **Implementation:** Passport.js with `openid-client` strategy
- **Session:** Server-side sessions stored in PostgreSQL, 1-week TTL
- **Client Hook:** `useAuth()` hook fetches user from `/api/auth/user`
- **Login Flow:** Redirect to `/api/login`, callback handled by Passport

### API Endpoints
- `POST /api/privacy/check` — AI vision analysis for PII detection in uploaded images
- `POST /api/tasks` — Create waste report with image, location, priority
- `GET /api/tasks` — List tasks with optional status filter
- `GET /api/tasks/:id` — Get single task
- `PATCH /api/tasks/:id/status` — Update task status
- `POST /api/routes/optimize` — Generate optimized collection route
- `GET /api/auth/user` — Get current authenticated user

### AI/ML Integration
- **Privacy Detection:** OpenAI GPT-4o-mini (Vision) analyzes uploaded images for faces, license plates, and readable addresses. Returns bounding boxes with confidence scores.
- **Priority Calculation:** Server-side algorithm simulating deep RL priority prediction (Equation 14)
- **Route Optimization:** Server-side algorithm implementing priority-weighted graph transformation (Equation 22)

### Replit Integrations (Pre-built Modules)
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **Auth** — Replit OIDC authentication setup
- **Chat** — Conversation and message CRUD with OpenAI streaming
- **Audio** — Voice recording, playback, and streaming via AudioWorklet
- **Image** — Image generation and editing via `gpt-image-1`
- **Batch** — Rate-limited batch processing with retries for LLM calls

### Storage Pattern
- `server/storage.ts` exports a `DatabaseStorage` class implementing `IStorage` interface
- All database operations go through this storage layer, making it easy to swap implementations

## External Dependencies

### Required Services
- **PostgreSQL Database** — Provisioned via Replit; connection string in `DATABASE_URL` env var
- **OpenAI API** — Used for privacy detection (GPT-4o-mini vision), chat, image generation; configured via:
  - `AI_INTEGRATIONS_OPENAI_API_KEY`
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Replit Auth (OIDC)** — Requires:
  - `ISSUER_URL` (defaults to `https://replit.com/oidc`)
  - `REPL_ID` (auto-set by Replit)
  - `SESSION_SECRET`

### Key NPM Packages
- **Server:** express, drizzle-orm, pg, passport, openid-client, express-session, connect-pg-simple, openai, zod
- **Client:** react, wouter, @tanstack/react-query, recharts, leaflet, react-leaflet, framer-motion, shadcn/ui (radix primitives), tailwindcss
- **Shared:** drizzle-zod, zod (schema validation shared between client and server)

### Development Tools
- **TypeScript** across the entire stack
- **Vite** for frontend dev server and production builds
- **esbuild** for server bundling
- **Drizzle Kit** for database schema management
- **Replit plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`