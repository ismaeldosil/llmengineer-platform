# E2E Testing Guide

## Setup

### 1. Create Test Database

Before running E2E tests, you need to create a separate test database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE llmengineer_test;

# Exit psql
\q
```

### 2. Run Migrations

Apply database migrations to the test database:

```bash
# Set the test database URL temporarily
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmengineer_test?schema=public"

# Run migrations
npm run db:push

# Unset the environment variable
unset DATABASE_URL
```

Or use the .env.test file:

```bash
# Copy .env.test to .env temporarily or update DATABASE_URL in .env
npm run db:push
```

## Running Tests

### Run all E2E tests
```bash
# Method 1: Using test database with DATABASE_URL override
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmengineer_test" npm run test:e2e

# Method 2: Using npm script (after setup)
npm run test:e2e
```

**Important**: Due to Prisma client caching, you must set the `DATABASE_URL` environment variable when running E2E tests to ensure they use the test database instead of the development database.

### Run specific test file
```bash
npm run test:e2e -- auth.e2e-spec
```

### Run tests in watch mode
```bash
npm run test:e2e -- --watch
```

### Run tests with coverage
```bash
npm run test:e2e -- --coverage
```

## Test Structure

```
apps/api/
├── test/
│   ├── jest-e2e.json       # E2E Jest configuration
│   ├── setup-e2e.ts        # Test environment setup
│   └── README.md           # This file
├── src/
│   └── auth/
│       └── auth.e2e-spec.ts # Auth E2E tests
└── .env.test               # Test environment variables
```

## Environment Variables

The test suite uses `.env.test` for configuration:

- `DATABASE_URL`: Points to the test database (`llmengineer_test`)
- `JWT_SECRET`: Test-specific JWT secret
- `NODE_ENV`: Set to "test"

## Test Database Cleanup

The E2E tests automatically clean up the database before each test using:

```typescript
beforeEach(async () => {
  await prisma.userBadge.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.user.deleteMany();
});
```

This ensures test isolation and prevents conflicts between tests.

## Troubleshooting

### Database Connection Errors

If you see `User 'postgres' was denied access`, check:

1. PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
2. Test database exists: `psql -U postgres -l | grep llmengineer_test`
3. Credentials in `.env.test` are correct
4. User has permissions: `psql -U postgres -d llmengineer_test -c "SELECT current_user;"`

### Migration Errors

If schema is out of sync:

```bash
# Reset test database
dropdb llmengineer_test
createdb llmengineer_test

# Re-run migrations
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmengineer_test?schema=public"
npm run db:push
```

### Port Already in Use

E2E tests use port 3002 (configured in `.env.test`). If this port is in use, change it in `.env.test`.

## Writing New E2E Tests

1. Create test file with `.e2e-spec.ts` extension
2. Import required modules and setup test app
3. Use `supertest` for HTTP requests
4. Clean up database in `beforeEach` hook
5. Close app in `afterAll` hook

Example:

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should work', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);
  });
});
```
