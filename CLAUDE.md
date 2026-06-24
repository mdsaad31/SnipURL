# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Snip URL is a Next.js-based URL shortener with QR code generation, analytics, password protection, and link expiration. It uses Clerk for authentication, Drizzle ORM with PostgreSQL (CockroachDB), and is designed for deployment on Vercel.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Type checking (run before committing)
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Database Commands

```bash
# Push schema changes to database (for development)
npm run db:push

# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI at https://local.drizzle.studio)
npm run db:studio
```

## Architecture

### Routing & Middleware

The app uses Next.js App Router with a custom middleware (`middleware.ts`) that handles:
- **Short code rewrites**: Single-segment paths (e.g., `/abc`) are rewritten to `/api/redirect/[code]` for link resolution
- **Protected routes**: `/dashboard/*` routes require Clerk authentication
- **Reserved words**: Certain paths are excluded from short code resolution (see `RESERVED_WORDS` in `lib/short-code.ts`)
- **Geo data forwarding**: Middleware forwards geo headers (`x-geo-country`, `x-geo-city`) from edge runtime to API routes

**Important**: When adding new public pages, update three locations:
1. `middleware.ts` - Add to `publicPagePrefixes` or `publicPages`
2. `lib/short-code.ts` - Add to `RESERVED_WORDS`
3. Verify paths don't conflict with potential short codes

### Database Schema (`lib/db/schema.ts`)

Three core tables with Drizzle ORM:
- **users**: Clerk user sync (via webhook), link limits, default expiry settings
- **links**: Short URLs with optional password, expiration, public analytics toggle
- **clicks**: Analytics data with hashed IPs, geo info, device/browser/OS detection

Relations are defined using Drizzle's `relations()` API. All foreign keys use UUIDs.

### Short Code Generation (`lib/short-code.ts`)

- Uses nanoid with custom alphabet (62 chars: `0-9A-Za-z`)
- Default length: 6 characters
- Custom aliases: 3-50 chars, alphanumeric + hyphens, no leading/trailing hyphens
- Reserved words list (~100+ entries) prevents collisions with app routes
- Collision handling: up to 10 retry attempts before throwing

### Link Resolution Flow

1. User visits `/{code}` → middleware rewrites to `/api/redirect/[code]`
2. `/api/redirect/[code]/route.ts` handles:
   - Link lookup and validation (exists, active, not expired)
   - Password challenge redirect if `password_hash` exists
   - Analytics logging (fire-and-forget)
   - 302 redirect to `original_url`
3. Password-protected links:
   - GET redirects to `/{code}/challenge` (client renders password form)
   - POST to `/api/redirect/[code]` validates password, logs click, returns URL for client-side redirect

### Analytics (`lib/analytics.ts`)

- `logClick()`: Async function that records click data
- IP addresses are hashed with `IP_HASH_SALT` before storage (never store raw IPs)
- Device detection via user-agent parsing
- Geo data from Vercel/Cloudflare/AWS headers (country & city)
- Public analytics: Links with `analytics_public: true` expose data at `/analytics/[code]` and `/api/analytics/public/[code]`
- `analytics_shared_fields`: JSON array of visible sections (e.g., `["overview", "locations", "devices"]`)

### Authentication

- Clerk handles all auth flows (`sign-in`, `sign-up`)
- Webhook at `/api/webhooks/clerk/route.ts` syncs user creation/updates/deletion to database
- Protected routes use `clerkMiddleware()` with `createRouteMatcher(["/dashboard(.*)"])`
- Server-side auth: `import { auth } from "@clerk/nextjs/server"; const { userId } = await auth();`

### Environment Variables

Required (see `.env.example`):
- `NEXT_PUBLIC_APP_URL`: Full app URL (e.g., `https://snipurl.click`)
- `DATABASE_URL`: PostgreSQL connection string with `?sslmode=verify-full`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: Clerk auth keys
- `CLERK_WEBHOOK_SECRET`: Svix signing secret for webhook verification
- `IP_HASH_SALT`: Random string for IP hashing (never commit real value)

## Route Groups

- `(public)`: Homepage, analytics pages, QR pages (no auth required)
- `(auth)`: Sign-in/sign-up pages (Clerk components)
- `dashboard`: Protected routes (links, analytics, settings, QR codes)

## Key Patterns

### Client-Side State Management

Dashboard uses custom hooks (`app/dashboard/_hooks/use-links.ts`) with SWR-like patterns:
- Optimistic updates for delete/toggle operations
- Manual rollback on API failure
- `mutate()` function for cache invalidation after mutations

### QR Code Generation

- Server-side generation via `/api/qr/[code]/route.ts` using `qrcode` library
- Supports customization (foreground/background colors, error correction level, size)
- SVG format for scalability
- Linked to short URL, not original URL

### Bulk Operations

- `/api/links/bulk/route.ts`: Create multiple links in a single transaction
- Handles short code collision per-link (generates new code on conflict)
- Returns partial success results (successful + failed links)

## Database Considerations

- PostgreSQL in "Transaction" pool mode (CockroachDB default)
- `prepare: false` required for transaction mode (see `lib/db/index.ts`)
- Use `db:push` for dev schema changes, `db:generate` + `db:migrate` for production migrations
- Migrations output to `./supabase/migrations/` (configurable in `drizzle.config.ts`)

## Security Notes

- IP addresses: MUST hash before storing (use `IP_HASH_SALT`)
- Passwords: Use bcrypt (already implemented via `bcryptjs`)
- Never commit real `.env.local` file (it's in `.gitignore`)
- Git history check: The repo previously contained a leaked `DATABASE_URL` in a migration script (commit e6b575b) — avoid committing connection strings to any file

## Deployment

- Vercel-optimized with `output: "standalone"` in `next.config.mjs`
- Docker support via `Dockerfile` and `docker-compose.yml`
- Requires edge runtime for geo data in middleware (automatic on Vercel)
- Set all environment variables in Vercel dashboard (not `.env` files)
