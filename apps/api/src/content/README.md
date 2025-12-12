# Content Validator Service

A comprehensive validation service for LLM Engineer Platform content files.

## Overview

The Content Validator Service validates JSON content files for lessons, quizzes, badges, and modules before they are loaded into the system. It ensures data integrity and helps prevent runtime errors.

## Features

- Validates lessons, quizzes, badges, and modules
- Uses class-validator decorators for type-safe validation
- Provides detailed error messages
- Supports batch validation of entire directories
- Comprehensive test coverage (42 tests)

## Installation

The service is part of the `ContentModule` and can be imported into any NestJS module:

```typescript
import { ContentModule } from './content/content.module';

@Module({
  imports: [ContentModule],
  // ...
})
export class YourModule {}
```

## Usage

### Validating Individual Content

```typescript
import { ContentValidatorService } from './content/content-validator.service';

@Injectable()
export class YourService {
  constructor(private contentValidator: ContentValidatorService) {}

  async validateLesson(lessonData: unknown) {
    const result = await this.contentValidator.validateLesson(lessonData);

    if (!result.valid) {
      console.error('Validation errors:', result.errors);
      throw new Error('Invalid lesson data');
    }

    // Proceed with valid data
  }
}
```

### Validating a Directory

```typescript
async validateAllContent() {
  const contentPath = join(__dirname, '../../prisma/content');
  const report = await this.contentValidator.validateContentDirectory(contentPath);

  console.log(`Total files: ${report.totalFiles}`);
  console.log(`Valid files: ${report.validFiles}`);
  console.log(`Invalid files: ${report.invalidFiles}`);

  if (report.invalidFiles > 0) {
    console.error('Errors found:');
    report.errors.forEach(({ file, errors }) => {
      console.error(`  ${file}:`);
      errors.forEach(err => console.error(`    - ${err}`));
    });
  }
}
```

## Validation Rules

### Lesson Validation

```typescript
{
  slug: string;              // Required
  title: string;             // Required, max 200 chars
  description: string;       // Required
  week: number;              // Required, 1-12
  order: number;             // Required, positive integer
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;          // Required, 50-500
  estimatedMinutes: number;  // Required, 5-120
}
```

### Quiz Validation

```typescript
{
  type: 'multiple_choice' | 'true_false' | 'code_completion';
  question: string;          // Required
  options?: string[];        // Required for multiple_choice (min 2)
  correctAnswer: number | boolean | string;  // Type depends on quiz type
  explanation?: string;      // Optional
}
```

**Quiz Type Rules:**
- `multiple_choice`: requires `options` array, `correctAnswer` must be valid index (number)
- `true_false`: `correctAnswer` must be boolean
- `code_completion`: `correctAnswer` must be string

### Badge Validation

```typescript
{
  slug: string;              // Required
  name: string;              // Required
  description: string;       // Required
  icon: string;              // Required
  category: 'lessons' | 'streaks' | 'xp' | 'quizzes' | 'special';
  requirement: number;       // Required, min 1
}
```

### Module Validation

```typescript
{
  slug: string;              // Required
  title: string;             // Required
  description: string;       // Required
  week: number;              // Required, 1-12
  order: number;             // Required, min 1
}
```

## API Reference

### `validateLesson(data: unknown): Promise<ValidationResult>`

Validates lesson data against the schema.

### `validateQuiz(data: unknown): Promise<ValidationResult>`

Validates quiz data against the schema. Includes special handling for different quiz types.

### `validateBadge(data: unknown): Promise<ValidationResult>`

Validates badge data against the schema.

### `validateModule(data: unknown): Promise<ValidationResult>`

Validates module data against the schema.

### `validateContentDirectory(dirPath: string): Promise<ValidationReport>`

Validates all JSON files in a directory. Automatically detects content type based on filename.

## Types

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### ValidationReport

```typescript
interface ValidationReport {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  errors: Array<{ file: string; errors: string[] }>;
}
```

## Testing

Run the test suite:

```bash
npm test -- apps/api/src/content/content-validator.service.spec.ts
```

The test suite includes:
- 12 lesson validation tests
- 11 quiz validation tests (covering all quiz types)
- 6 badge validation tests
- 5 module validation tests
- 8 directory validation tests

## Error Messages

All error messages are in Spanish to match the platform's language. Examples:

- "slug debe ser una cadena de texto"
- "week debe ser al menos 1"
- "xpReward no puede ser mayor a 500"
- "Las preguntas multiple_choice deben tener al menos 2 opciones"

## Future Enhancements

Potential improvements:
- Support for custom validation rules
- JSON schema generation
- Integration with content seeding process
- Real-time validation in development
- Validation webhooks for CI/CD
