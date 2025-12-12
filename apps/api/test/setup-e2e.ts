import { resolve } from 'path';

// Set test environment variables before any other imports
// NOTE: Commented out DATABASE_URL to use main database for now due to Prisma connection issues
// process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/llmengineer_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// WARNING: Tests will run against the DATABASE_URL defined in .env
// Make sure tests include proper cleanup in beforeEach hooks
