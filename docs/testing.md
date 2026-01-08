# Testing Documentation

## Overview

Tests are executed using **Vitest** with `@cloudflare/vitest-pool-workers`. This allows tests to run within a simulated Cloudflare Workers environment, ensuring high fidelity with production behavior.

## Testing Architecture

### 1. Database Isolation strategy
To prevent data corruption and race conditions, tests run against a dedicated test database.

* **Configuration**: Tests use `DATABASE_URL` from `.env.test`.
* **Sequential Execution**: Enforced in `vitest.config.ts` via `fileParallelism: false` and `maxConcurrency: 1`.
    * *Reason*: Since we use a real Postgres instance (Neon/Docker) rather than an in-memory mock, running tests in parallel would cause database locking and data inconsistency issues.

### 2. Mocking Strategy

#### Network Requests (`fetchMock`)
We use `fetchMock` to intercept external requests.
* **Global Rule**: `fetchMock.disableNetConnect()` is enabled by default to prevent accidental external calls.
* **Exception**: Connections to the local test database (`db.localtest.me:4444`) are explicitly allowed.

#### Authentication (JWT)
Protected endpoints are tested using helper utilities in `test/helpers/jwt.ts`.
* **Mechanism**: Creates RSA key pairs and signs valid JWTs for testing.
* **JWKS**: The JWKS endpoint is mocked via `fetchMock` so the app can validate the test tokens without reaching out to a real provider.

## Test Utilities & Scripts

### Database Management
* **`npm run test:prepare`**: Runs migrations against the test database (using `.env.test`).
* **`npm run db:clean -- --env=test`**: Drops all tables and resets the test database.
* **`npm test`**: Runs the full test suite.

### Example Test Structure
Refer to `test/index.test.ts` for a complete example.

```typescript
beforeEach(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
  // Allow connection to the local DB proxy
  fetchMock.enableNetConnect(/db\.localtest\.me:4444/); 
});
