# Leaderboard Position Changes Implementation

## Overview
This document describes the implementation of position changes for the leaderboard feature (LEAD-004).

## Features Implemented

### 1. Daily Snapshot System
- Created `LeaderboardSnapshot` model in Prisma schema to store daily leaderboard positions
- Snapshots track user rank and XP for both GLOBAL and WEEKLY leaderboards
- Unique constraint on `userId`, `date`, and `type` to prevent duplicate snapshots

### 2. Rank Change Calculation
- Automatically calculates rank changes by comparing current rank with yesterday's snapshot
- Returns rank change data in leaderboard responses:
  - `rankChange`: Number of positions changed (positive = improved, negative = declined)
  - `rankChangeDirection`: Direction indicator (`up`, `down`, `same`, `new`)

### 3. Automated Snapshot Creation
- Created `LeaderboardSnapshotService` with daily cron job
- Runs automatically at midnight (00:00:00) every day
- Can be manually triggered via `triggerSnapshot()` method

## Database Schema

```prisma
model LeaderboardSnapshot {
  id        String   @id @default(cuid())
  userId    String
  rank      Int
  xp        Int
  type      LeaderboardSnapshotType @default(GLOBAL)
  date      DateTime @db.Date
  createdAt DateTime @default(now())

  @@unique([userId, date, type])
  @@index([date, type])
  @@map("leaderboard_snapshots")
}

enum LeaderboardSnapshotType {
  GLOBAL
  WEEKLY
}
```

## API Response Format

```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  isCurrentUser: boolean;
  rankChange?: number; // NEW: e.g., 3 means moved up 3 positions
  rankChangeDirection?: 'up' | 'down' | 'same' | 'new'; // NEW
}
```

### Rank Change Direction
- `up`: User improved their position (moved to a lower rank number)
- `down`: User declined their position (moved to a higher rank number)
- `same`: User maintained their position
- `new`: No previous snapshot exists for this user

## Setup Instructions

### 1. Run Database Migration
```bash
cd apps/api
npm run db:migrate
```

This will create the `leaderboard_snapshots` table.

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Create Initial Snapshot (Optional)
If you want to populate the first snapshot manually:

```bash
# Using the API endpoint or a script
curl -X POST http://localhost:3000/api/leaderboard/snapshots/trigger
```

Or programmatically:
```typescript
import { LeaderboardSnapshotService } from './leaderboard/leaderboard-snapshot.service';

// In your service
await leaderboardSnapshotService.triggerSnapshot();
```

## Testing

All tests are included and passing:

```bash
# Run leaderboard service tests
npm test -- leaderboard.service.spec.ts

# Run snapshot service tests
npm test -- leaderboard-snapshot.service.spec.ts
```

### Test Coverage
- ✅ Global leaderboard with rank changes
- ✅ Weekly leaderboard with rank changes
- ✅ Users moving up in ranking
- ✅ Users moving down in ranking
- ✅ Users maintaining same rank
- ✅ New users with no previous snapshot
- ✅ Daily snapshot creation
- ✅ Cron job execution

## Architecture

### Services

#### LeaderboardService
- Enhanced with snapshot integration
- Methods:
  - `getLeaderboard()` - Fetches leaderboard with rank changes
  - `createDailySnapshots()` - Creates snapshots for all users
  - `getSnapshotsForUsers()` - Retrieves multiple user snapshots
  - `getSnapshotForUser()` - Retrieves single user snapshot
  - `calculateRankChange()` - Calculates rank change data

#### LeaderboardSnapshotService
- Manages automated snapshot creation
- Methods:
  - `handleDailySnapshot()` - Cron job handler (runs at midnight)
  - `triggerSnapshot()` - Manual snapshot trigger

### DTOs

#### LeaderboardEntryDto
Added optional fields:
- `rankChange?: number`
- `rankChangeDirection?: RankChangeDirection`

#### RankChangeDirection
New type: `'up' | 'down' | 'same' | 'new'`

## Cron Schedule

The snapshot cron job runs using the `@nestjs/schedule` package:
- Schedule: `CronExpression.EVERY_DAY_AT_MIDNIGHT` (00:00:00)
- Timezone: Server timezone
- Retries: Errors are logged but don't stop the service

## Performance Considerations

1. **Batch Operations**: Snapshots are created using `createMany()` for efficient bulk inserts
2. **Indexing**: Index on `[date, type]` for fast snapshot queries
3. **Skip Duplicates**: `skipDuplicates: true` prevents errors on re-runs
4. **Lazy Loading**: Snapshots only loaded when needed for rank comparison

## Future Enhancements

Potential improvements for future iterations:
1. Add historical trend data (7-day, 30-day rank changes)
2. Implement snapshot cleanup for old data (e.g., keep only last 30 days)
3. Add analytics endpoint for rank change statistics
4. Support custom time ranges for rank comparisons
5. Add WebSocket notifications for significant rank changes

## Troubleshooting

### Snapshots Not Being Created
1. Check that `ScheduleModule.forRoot()` is imported in `LeaderboardModule`
2. Verify cron job is running: Check server logs for "Running daily leaderboard snapshot job"
3. Manually trigger: Call `triggerSnapshot()` method

### Rank Changes Not Showing
1. Ensure at least one snapshot exists (wait for midnight or trigger manually)
2. Check that yesterday's date is correctly calculated in `getYesterdayDate()`
3. Verify snapshot data exists in database:
   ```sql
   SELECT * FROM leaderboard_snapshots WHERE date = CURRENT_DATE - INTERVAL '1 day';
   ```

### Database Migration Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Run `npx prisma db push` for development
4. For production, use `npx prisma migrate deploy`

## Files Modified/Created

### Modified
- `/apps/api/prisma/schema.prisma` - Added LeaderboardSnapshot model
- `/apps/api/src/leaderboard/leaderboard.service.ts` - Added snapshot integration
- `/apps/api/src/leaderboard/leaderboard.module.ts` - Added ScheduleModule
- `/apps/api/src/leaderboard/dto/leaderboard-response.dto.ts` - Added rank change fields
- `/packages/shared/src/types/leaderboard.ts` - Added rank change types
- `/apps/api/src/leaderboard/leaderboard.service.spec.ts` - Updated tests
- `/apps/api/package.json` - Added @nestjs/schedule dependency

### Created
- `/apps/api/src/leaderboard/leaderboard-snapshot.service.ts` - Snapshot cron service
- `/apps/api/src/leaderboard/leaderboard-snapshot.service.spec.ts` - Snapshot service tests
- `/apps/api/LEADERBOARD_POSITION_CHANGES.md` - This documentation

## Rollback Procedure

If you need to rollback this feature:

1. Remove the ScheduleModule import from `LeaderboardModule`
2. Remove `rankChange` and `rankChangeDirection` from API responses
3. Drop the snapshot table:
   ```sql
   DROP TABLE leaderboard_snapshots;
   ```
4. Revert Prisma schema changes and regenerate client
