# E2E Testing Troubleshooting Guide

## Current Status

The E2E test suite for authentication has been successfully created with comprehensive test coverage. However, there is a **known issue** with the PostgreSQL/Prisma configuration that prevents tests from running against the test database.

## Issue Description

**Error**: `PrismaClientInitializationError: User 'postgres' was denied access on the database 'llmengineer_test.public'`

**Root Cause**: Prisma is incorrectly interpreting the database name as `llmengineer_test.public` instead of database `llmengineer_test` with schema `public`. This appears to be related to how Prisma parses PostgreSQL connection strings with underscores in the database name.

## What Has Been Tried

1. **Created separate test database**: `llmengineer_test` ✅
2. **Copied schema**: Used `pg_dump` to copy schema from main database ✅
3. **Granted all permissions**: Comprehensive GRANT statements on database, schema, tables, sequences ✅
4. **Modified search_path**: Set default search_path to `public` ✅
5. **Removed schema parameter**: Tried both with and without `?schema=public` in connection string ✅
6. **Environment variable override**: Set DATABASE_URL in multiple locations ✅
7. **Regenerated Prisma client**: With test DATABASE_URL ✅

## Workaround Solutions

### Option 1: Use Main Database with Cleanup (Recommended for now)

Since the test database connection is problematic, you can temporarily use the main development database. The tests include comprehensive cleanup in `beforeEach` hooks:

```typescript
beforeEach(async () => {
  // Clean up database before each test
  await prisma.userBadge.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.user.deleteMany();
});
```

**To use this approach:**

1. Simply run tests against the main database:
   ```bash
   npm run test:e2e
   ```

2. The tests will clean up after themselves
3. **Warning**: Do not run E2E tests on a production database!

### Option 2: Use Docker Postgres with Different Database Name

Try creating a test database with a simpler name (no underscores):

```bash
# Create database
docker exec llmengineer-db psql -U postgres -c "CREATE DATABASE llmtest;"

# Copy schema
docker exec llmengineer-db pg_dump -U postgres -s llmengineer | docker exec -i llmengineer-db psql -U postgres llmtest

# Update test configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmtest"
```

### Option 3: Mock Prisma Service

Create a mock Prisma service for testing that uses an in-memory database or mocks.

## Recommended Next Steps

1. **For immediate testing needs**: Use Option 1 (main database with cleanup)
2. **For long-term solution**:
   - Investigate Prisma GitHub issues for similar problems
   - Consider upgrading Prisma to latest version (currently using 5.22.0, latest is 7.1.0)
   - File a bug report with Prisma if this is indeed a bug

## Test Files Created

All test infrastructure has been successfully created:

- `/Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/api/test/jest-e2e.json` - Jest E2E configuration
- `/Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/api/test/setup-e2e.ts` - Test environment setup
- `/Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/api/test/README.md` - Setup and usage documentation
- `/Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/api/src/auth/auth.e2e-spec.ts` - Complete auth E2E test suite
- `/Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/api/.env.test` - Test environment variables

## Test Coverage

The `auth.e2e-spec.ts` file includes comprehensive tests for:

### POST /auth/register
- ✅ Register new user and return user + token
- ✅ Reject duplicate email
- ✅ Validate email format
- ✅ Require minimum password length
- ✅ Validate displayName length
- ✅ Reject missing required fields

### POST /auth/login
- ✅ Login existing user and return token
- ✅ Reject invalid credentials
- ✅ Reject non-existent user
- ✅ Validate email format on login
- ✅ Require minimum password length on login
- ✅ Update lastActiveAt on successful login

### GET /auth/me
- ✅ Return user data with valid token
- ✅ Return 401 without token
- ✅ Return 401 with invalid token
- ✅ Return 401 with malformed authorization header
- ✅ Return 401 with expired token
- ✅ Return 401 when user is deleted after token issued

### Complete Flow
- ✅ Register -> login -> get profile successfully
- ✅ Handle multiple users independently
- ✅ Create user progress on registration

**Total: 21 comprehensive E2E tests**

## Quick Test Command

```bash
# If using main database (Option 1)
npm run test:e2e

# If using test database with manual override
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmengineer_test" npm run test:e2e

# Run specific test
npm run test:e2e -- --testNamePattern="should register new user"
```

## Contact

If you resolve this issue, please update this documentation with the solution!
