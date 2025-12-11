# Database Seeding and Content Sync

This document explains how to use the database seeding and content synchronization scripts.

## Prerequisites

1. PostgreSQL database running
2. Database connection configured in `.env`
3. Prisma migrations applied: `npm run db:migrate`
4. For content sync: `llmengineer-content` repository cloned at the same level as this project

## Scripts

### 1. Database Seed (`npm run db:seed`)

Seeds the database with initial data for development and testing.

**What it creates:**
- **15 Badges**: All achievement badges including first-lesson, streaks, levels, etc.
- **10 Lessons**: Sample lessons from weeks 1-2
- **Test User**: Email: `test@example.com`, Password: `password123`
- **Sample Data**: 3 lesson completions and 2 streak log entries for the test user

**Usage:**
```bash
cd apps/api
npm run db:seed
```

**Expected Output:**
```
Starting database seed...
Seeding badges...
✓ Seeded 15 badges
Seeding lessons...
✓ Seeded 10 lessons
Seeding test user...
✓ Created test user: test@example.com
Seeding sample completions...
✓ Created 3 sample completions
✓ Created 2 streak log entries
Database seed completed successfully!
```

**Idempotency:** This script can be run multiple times safely. It uses `upsert` operations, so existing data will be updated rather than creating duplicates.

### 2. Content Sync (`npm run content:sync`)

Synchronizes lessons and badges from the `llmengineer-content` repository into the database.

**What it syncs:**
- **Badges**: From `llmengineer-content/badges/badges.json`
- **Lessons**: From `llmengineer-content/lessons/week-*/` directories

**Usage:**
```bash
cd apps/api
npm run content:sync
```

**Expected Output:**
```
============================================================
Content Synchronization Script
============================================================
Content Repository: /path/to/llmengineer-content

Syncing badges from content repository...
  ✓ Synced: first-lesson
  ✓ Synced: streak-3
  ...
✓ Successfully synced 15 badges

Syncing lessons from content repository...

Processing week-1 (2 lessons)...
  ✓ Synced: intro-to-llms
  ✓ Synced: api-basics

Processing week-2 (3 lessons)...
  ✓ Synced: prompt-engineering
  ...

✓ Successfully synced 10 lessons

============================================================
✓ Content synchronization completed successfully!
============================================================
```

**Idempotency:** This script can also be run multiple times. It will update existing lessons/badges with new data from the JSON files.

## Testing

Both scripts have comprehensive test suites:

```bash
# Test seed script
npm test -- prisma/seed.spec.ts

# Test content sync script
npm test -- scripts/sync-content.spec.ts

# Test both
npm test -- prisma/seed.spec.ts scripts/sync-content.spec.ts
```

**Test Coverage:**
- 18 tests for seed script
- 31 tests for content sync script
- Tests validate idempotency, error handling, data validation, and database operations

## Manual Verification

### Verify Seed Data

After running `npm run db:seed`, verify the data in your database:

```bash
# Open Prisma Studio
npm run db:studio

# Or use psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM badges;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM lessons;"
psql $DATABASE_URL -c "SELECT email FROM users WHERE email = 'test@example.com';"
```

### Verify Content Sync

After running `npm run content:sync`:

```bash
# Check badge count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM badges;"

# Check lesson count
psql $DATABASE_URL -c "SELECT week, COUNT(*) FROM lessons GROUP BY week ORDER BY week;"

# Verify lesson content
npm run db:studio
# Navigate to Lessons table and check that 'sections' field is populated
```

## Troubleshooting

### Error: Content repository not found

```
Content repository not found at: /path/to/llmengineer-content
Please clone llmengineer-content repository to the parent directory.
```

**Solution:** Clone the content repository:
```bash
cd /path/to/parent-directory
git clone <llmengineer-content-repo-url>
```

### Error: Database connection failed

**Solution:** Verify your `.env` file has the correct `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/llmengineer_dev"
```

### Error: Prisma Client not generated

```
Error: @prisma/client did not initialize yet
```

**Solution:** Generate Prisma Client:
```bash
npm run db:generate
```

## Integration with CI/CD

These scripts can be integrated into your deployment pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run database migrations
  run: npm run db:migrate

- name: Seed database
  run: npm run db:seed
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Sync content
  run: npm run content:sync
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Development Workflow

**Typical workflow:**

1. **Initial setup:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

2. **When content is updated:**
   ```bash
   npm run content:sync
   ```

3. **Reset and re-seed (for testing):**
   ```bash
   npm run db:push  # Reset schema
   npm run db:seed  # Seed initial data
   npm run content:sync  # Sync content
   ```

## Data Structure

### Badges (15 total)
- **Progress**: first-lesson, level-5, level-10, xp-1000, xp-5000
- **Streak**: streak-3, streak-7, streak-30
- **Completion**: week-1-complete, week-4-complete, week-8-complete
- **Mastery**: quiz-master
- **Special**: speed-learner, game-winner, prompt-golfer

### Test User
- **Email**: test@example.com
- **Password**: password123
- **Initial Progress**:
  - Total XP: 300
  - Level: 2 (Prompt Apprentice)
  - Current Streak: 2 days
  - Longest Streak: 3 days
  - Lessons Completed: 3

### Sample Lessons
- 5 lessons from Week 1 (beginner level)
- 5 lessons from Week 2 (beginner/intermediate level)

## Notes

- Both scripts are **idempotent** - safe to run multiple times
- They use **upsert** operations to avoid duplicate data
- All database operations are atomic (wrapped in transactions where needed)
- Scripts will disconnect from database on completion
- Error handling ensures database connection is closed even on failure
