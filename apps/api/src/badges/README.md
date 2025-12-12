# Badges Module

This module handles badge management for the LLM Engineer Platform, including loading badges from JSON files, tracking user progress, and awarding badges.

## Overview

The Badges module consists of:
- **BadgesService**: Core service for badge operations and user progress tracking
- **BadgesLoaderService**: Service for loading badges from JSON files into the database
- **BadgesController**: REST API endpoints for badges
- **BadgesModule**: NestJS module configuration

## Features

### BadgesLoaderService

The `BadgesLoaderService` provides functionality to load and synchronize badges from JSON files into the database.

#### Key Methods

##### `loadBadgesFromFile(filePath: string): Promise<BadgeLoadResult>`
Loads badges from a JSON file and upserts them to the database.
- **Parameters**: Absolute or relative path to badges.json
- **Returns**: Result summary with counts of created/updated badges and any errors
- **Behavior**:
  - Creates new badges if they don't exist
  - Updates existing badges (matched by slug)
  - Validates badge structure before inserting
  - Continues processing on individual badge errors

##### `validateBadgeStructure(badge: unknown): boolean`
Validates that a badge object has all required fields and correct types.
- **Required fields**: slug, name, description, icon, category, requirement, xpReward
- **Valid categories**: progress, streak, completion, mastery, special
- **Optional fields**: isSecret (defaults to false)

##### `upsertBadge(badge: BadgeData): Promise<boolean>`
Upserts a single badge to the database.
- **Returns**: `true` if badge was updated, `false` if created
- **Behavior**: Uses slug as unique identifier

##### `loadDefaultBadges(): Promise<BadgeLoadResult>`
Convenience method to load badges from the default location (`prisma/content/badges.json`).

## Badge JSON Structure

Badges are defined in JSON format with the following structure:

```json
{
  "badges": [
    {
      "slug": "first-lesson",
      "name": "Primera Lección",
      "description": "Completa tu primera lección",
      "icon": "🎯",
      "category": "progress",
      "requirement": {
        "type": "lessons_completed",
        "value": 1
      },
      "xpReward": 50,
      "isSecret": false
    }
  ]
}
```

### Badge Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Unique identifier for the badge |
| `name` | string | Yes | Display name of the badge |
| `description` | string | Yes | Description of what the badge represents |
| `icon` | string | Yes | Emoji or icon representing the badge |
| `category` | string | Yes | Category: progress, streak, completion, mastery, or special |
| `requirement` | object | Yes | Requirement criteria (see below) |
| `xpReward` | number | Yes | XP bonus awarded when badge is earned (≥0) |
| `isSecret` | boolean | No | Whether badge is secret (defaults to false) |

### Requirement Structure

The `requirement` field defines the criteria for earning a badge:

```json
{
  "type": "lessons_completed",
  "value": 10
}
```

**Supported Requirement Types:**
- `lessons_completed`: Complete N lessons
- `perfect_quizzes`: Get 100% on N quizzes
- `week_completed`: Complete all lessons in a week
- `streak`: Maintain an N-day streak
- `level`: Reach level N
- `total_xp`: Accumulate N total XP
- `all_weeks_completed`: Complete all weeks in the course
- `special`: Special condition (value is a string identifier)

## Usage

### CLI Script

Load badges from JSON using the CLI script:

```bash
# Load from default location (prisma/content/badges.json)
npm run badges:load

# Load from a specific file
npm run badges:load -- path/to/badges.json

# Or use ts-node directly
ts-node scripts/load-badges.ts
ts-node scripts/load-badges.ts path/to/custom-badges.json
```

The script will output:
- Number of badges created
- Number of badges updated
- Any validation or database errors encountered

### Programmatic Usage

```typescript
import { BadgesLoaderService } from './badges/badges-loader.service';

// Inject the service
constructor(private badgesLoaderService: BadgesLoaderService) {}

// Load from default location
const result = await this.badgesLoaderService.loadDefaultBadges();

// Load from custom file
const result = await this.badgesLoaderService.loadBadgesFromFile(
  'path/to/badges.json'
);

// Check results
console.log(`Created: ${result.created}`);
console.log(`Updated: ${result.updated}`);
console.log(`Errors: ${result.errors.length}`);

if (result.errors.length > 0) {
  result.errors.forEach(err => {
    console.error(`${err.slug}: ${err.error}`);
  });
}
```

### Validation

The loader performs comprehensive validation:

```typescript
// Validate a badge before loading
const isValid = badgesLoaderService.validateBadgeStructure(badge);
if (!isValid) {
  console.error('Invalid badge structure');
}
```

Validation checks:
- All required fields are present
- Field types are correct
- Category is valid
- xpReward is non-negative
- Requirement has type and value
- isSecret is boolean (if provided)

## Sample Badges

The default badge set (`prisma/content/badges.json`) includes:

### Progress Badges
- **Primera Lección** (first-lesson): Complete your first lesson
- **Nivel 5** (level-5): Reach level 5
- **Nivel 10** (level-10): Reach level 10
- **1000 XP** (xp-1000): Accumulate 1000 XP

### Completion Badges
- **Semana Completa** (week-complete): Complete all lessons in a week
- **Estudiante Dedicado** (ten-lessons): Complete 10 lessons
- **Curso Completo** (all-weeks): Complete all weeks in the course

### Streak Badges
- **Racha de 3** (streak-3): Maintain a 3-day streak
- **Racha Semanal** (streak-7): Maintain a 7-day streak

### Mastery Badges
- **Quiz Master** (quiz-master): Get 100% on 5 quizzes

### Special Badges
- **Madrugador** (early-bird): Complete a lesson before 6 AM (secret)
- **Ave Nocturna** (night-owl): Complete a lesson after midnight (secret)

## Database Schema

Badges are stored in the `badges` table with the following structure:

```prisma
model Badge {
  id          String        @id @default(cuid())
  slug        String        @unique
  name        String
  description String
  icon        String
  category    BadgeCategory
  requirement Json
  xpBonus     Int           @default(0)
  isSecret    Boolean       @default(false)
  createdAt   DateTime      @default(now())

  users UserBadge[]
}

enum BadgeCategory {
  progress
  streak
  completion
  mastery
  special
}
```

**Note**: In JSON files, use `xpReward`, which is mapped to `xpBonus` in the database.

## Error Handling

The loader handles errors gracefully:

1. **File Errors**: Invalid path, missing file, or unreadable file
2. **JSON Errors**: Malformed JSON or invalid structure
3. **Validation Errors**: Invalid badge data (continues with other badges)
4. **Database Errors**: Connection issues or constraint violations

Errors are collected and reported in the result:

```typescript
interface BadgeLoadResult {
  created: number;
  updated: number;
  errors: Array<{ slug: string; error: string }>;
}
```

## Testing

Comprehensive tests are provided in `badges-loader.service.spec.ts`:

```bash
# Run all badge loader tests
npm test -- badges-loader.service.spec.ts

# Run with coverage
npm run test:cov -- badges-loader.service.spec.ts
```

Test coverage includes:
- Validation of all badge fields
- Successful creation and updates
- Error handling and recovery
- File path resolution
- Edge cases and special characters

## Best Practices

1. **Use Slugs as Identifiers**: Slugs are unique and human-readable
2. **Validate Before Loading**: Use `validateBadgeStructure()` for custom validation
3. **Version Control Badge Files**: Keep badges.json in source control
4. **Test Badge Changes**: Validate JSON structure before deployment
5. **Review Load Results**: Check created/updated counts after loading
6. **Handle Errors**: Monitor error logs for validation issues
7. **Backup Before Updates**: Test in development before production

## Integration

The BadgesLoaderService integrates with:
- **PrismaService**: Database operations
- **BadgesModule**: Exported for use in other modules
- **CLI Scripts**: Command-line badge management
- **Logging**: Structured logging with NestJS Logger

## Future Enhancements

Potential improvements:
- Bulk operations optimization
- Badge versioning and history
- Dry-run mode for validation
- Badge import/export tools
- Badge preview/testing utilities
- Internationalization support
