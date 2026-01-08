# Architecture Documentation

## Database Connection Strategy

The project handles database connections differently for local development and production to support the Neon serverless environment.

### Connection Logic
The `database()` function in `src/db/client.ts` manages the connection:

* **Production**: Connects directly to Neon serverless Postgres.
* **Local Development**: Uses `.localtest.me` domains with a custom WebSocket proxy on port `4444`.
    * This mimics the Neon environment locally using Docker.
    * `neonConfig` is automatically configured based on hostname detection.

## Dual Environment Configuration

The project maintains strict separation between development and test environments to prevent data conflicts.

### 1. Environment Files
* **Dev**: `.env` is the source. It generates `.dev.vars` for the Workers runtime.
* **Test**: `.env.test` is the source. It generates `.dev.vars.test`.

> **Note:** Always use `npm run hono:env` to sync changes from `.env` to `.dev.vars`. This script validates variables against the Zod schema in `src/types.ts`.

### 2. Drizzle Configuration
* `drizzle.config.ts`: Reads from `.env` (Target: Dev Database)
* `drizzle.test.config.ts`: Reads from `.env.test` (Target: Test Database)

### 3. Wrangler Environments
* **Default**: Used for development and production deployments.
* **Test**: A specific environment defined in `wrangler.jsonc` for running tests.

## Type-Safe Environment Variables

Environment variables are defined and validated using **Zod** in `src/types.ts`.

* **Validation**: The `parseEnv()` function validates variables at runtime.
* **Type Generation**: `npm run cf-typegen` generates Cloudflare bindings types from `wrangler.jsonc`.
* **Key Variables**:
    * `DATABASE_URL`: Postgres connection string (Required).
    * `JWKS_URI`: JWT key set URI for authentication (Optional).

## Hono App Structure

* **Entry Point**: `src/index.tsx` exports the Hono app instance.
* **SSR**: Uses `vite-ssr-components` with a custom `jsxRenderer` middleware defined in `src/renderer.tsx`.
* **Middleware**: Protected routes utilize `jwk()` middleware for JWT validation.
* **Dependency Injection**: The Database client is instantiated **per-request** via `database(c.env.DATABASE_URL)` to ensure the correct environment variables are used.

## Database Schema Management

* **Definition**: Schema is defined in `src/db/schema.ts` using Drizzle ORM.
* **Migrations**: Stored in `src/db/migrations/`.
* **Workflow**:
    1.  Modify `src/db/schema.ts`.
    2.  Generate migration: `npx drizzle-kit generate`.
    3.  Apply migration: `npm run db:migrate`.