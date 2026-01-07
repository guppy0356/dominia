# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dominia is a learning project for building CRUD applications using:
- **Hono** - Web framework for Cloudflare Workers
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **Neon** - Serverless PostgreSQL (with local development via Docker)
- **Vitest** - Testing framework with Cloudflare Workers integration
- **vite-ssr-components** - SSR for Hono JSX components

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run deploy           # Build and deploy to Cloudflare Workers
```

### Database
```bash
npm run db:migrate       # Run migrations against dev database (.env)
npm run db:clean         # Drop all tables and reset dev database
npm run test:prepare     # Run migrations against test database (.env.test)
npm run test:clean       # Drop all tables and reset test database
```

### Testing
```bash
npm test                 # Run all tests once (uses test database)
```

Note: Tests run sequentially (`fileParallelism: false`, `maxConcurrency: 1`) to avoid database conflicts.

### Type Checking & Linting
```bash
npm run cf-typegen       # Generate CloudflareBindings type from wrangler.jsonc
npm run type-check       # Generate types + run TypeScript type checking
npm run hono:env         # Generate .dev.vars from .env (syncs runtime env for Workers)
```

Biome is used for formatting/linting. Auto-generated files (worker-configuration.d.ts, .wrangler/, dist/) are excluded via biome.json.

## Architecture

### Database Connection Strategy

The `database()` function in `src/db/client.ts` handles both local and remote connections:
- **Local development**: Uses `.localtest.me` domains with custom WebSocket proxy on port 4444
- **Production**: Connects directly to Neon serverless Postgres
- Automatically configures `neonConfig` based on hostname detection

### Dual Environment Configuration

The project maintains separate configurations for dev and test environments:

1. **Environment files**:
   - `.env` → generates `.dev.vars` (dev environment)
   - `.env.test` → generates `.dev.vars.test` (test environment)
   - Use `npm run hono:env` to sync .env → .dev.vars based on Zod schema in `src/types.ts`

2. **Drizzle configs**:
   - `drizzle.config.ts` - Uses `.env` (dev database)
   - `drizzle.test.config.ts` - Uses `.env.test` (test database)

3. **Wrangler environments**:
   - Default environment for dev/production
   - `test` environment in wrangler.jsonc for tests

### Type-Safe Environment Variables

Environment variables are validated via Zod schema in `src/types.ts`:
- `DATABASE_URL` (required) - Postgres connection string
- `JWKS_URI` (optional) - JWT key set URI for authentication

The `parseEnv()` function validates at runtime. Generate Cloudflare bindings types with `npm run cf-typegen`.

### Testing Architecture

Tests use `@cloudflare/vitest-pool-workers` to run in a Cloudflare Workers environment:
- **Authentication mocking**: `test/helpers/jwt.ts` creates RSA key pairs and JWTs for testing protected endpoints
- **Network mocking**: Uses `fetchMock` to intercept JWKS requests
- **Database isolation**: Tests connect to separate test database (DATABASE_URL from .env.test)
- **Sequential execution**: Configured to prevent test conflicts

Test structure example (see `test/index.test.ts`):
```typescript
beforeEach(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
  fetchMock.enableNetConnect(/db\.localtest\.me:4444/); // Allow test DB
  // Mock JWKS endpoint
});
```

### Hono App Structure

- Entry point: `src/index.tsx` exports Hono app
- Uses JSX for SSR with `jsxRenderer` middleware (`src/renderer.tsx`)
- Protected routes use `jwk()` middleware for JWT validation
- Database client created per-request via `database(c.env.DATABASE_URL)`

### Database Schema Management

- Schema defined in `src/db/schema.ts` using Drizzle ORM
- Migrations stored in `src/db/migrations/`
- Use Drizzle Kit for schema changes: generate migrations with `npx drizzle-kit generate`, then `npm run db:migrate`

### Scripts

- **`scripts/generate-dev-vars.ts`**: Validates .env against Zod schema and generates .dev.vars for Workers runtime
- **`scripts/db-clean.ts`**: Drops all tables from schema and truncates drizzle migrations table. Pass `--env=test` for test database.

## Development Workflow

1. Edit `.env` or `.env.test` for database/environment configuration
2. Run `npm run hono:env` to sync changes to .dev.vars files (validates against Zod schema)
3. For schema changes, update `src/db/schema.ts`, generate migration, run `npm run db:migrate`
4. Tests automatically use test database via vitest.config.ts wrangler environment
5. Type-check with `npm run type-check` (runs cf-typegen + tsc)
