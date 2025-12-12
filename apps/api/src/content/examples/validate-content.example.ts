/**
 * Example script demonstrating how to use the Content Validator Service
 *
 * This can be used as a standalone script or integrated into your application
 */

import { NestFactory } from '@nestjs/core';
import { ContentValidatorService } from '../content-validator.service';
import { ContentModule } from '../content.module';
import { join } from 'path';

async function validateContent() {
  // Create a standalone NestJS application context
  const app = await NestFactory.createApplicationContext(ContentModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Get the validator service
  const validator = app.get(ContentValidatorService);

  console.log('🔍 Content Validator - LLM Engineer Platform\n');

  // Example 1: Validate a single lesson
  console.log('📚 Example 1: Validating a lesson...');
  const lessonData = {
    slug: 'intro-to-llms',
    title: 'Introduction to Large Language Models',
    description: 'Learn the basics of LLMs and how they work',
    week: 1,
    order: 1,
    difficulty: 'beginner',
    xpReward: 100,
    estimatedMinutes: 30,
  };

  const lessonResult = await validator.validateLesson(lessonData);
  if (lessonResult.valid) {
    console.log('✅ Lesson is valid!');
  } else {
    console.log('❌ Lesson validation failed:');
    lessonResult.errors.forEach((err) => console.log(`   - ${err}`));
  }

  // Example 2: Validate a quiz
  console.log('\n📝 Example 2: Validating a multiple choice quiz...');
  const quizData = {
    type: 'multiple_choice',
    question: 'What does LLM stand for?',
    options: [
      'Large Language Model',
      'Linear Learning Machine',
      'Language Logic Module',
      'Long Learning Method',
    ],
    correctAnswer: 0,
    explanation:
      'LLM stands for Large Language Model, which is a type of AI trained on vast amounts of text data.',
  };

  const quizResult = await validator.validateQuiz(quizData);
  if (quizResult.valid) {
    console.log('✅ Quiz is valid!');
  } else {
    console.log('❌ Quiz validation failed:');
    quizResult.errors.forEach((err) => console.log(`   - ${err}`));
  }

  // Example 3: Validate a badge
  console.log('\n🏆 Example 3: Validating a badge...');
  const badgeData = {
    slug: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'lessons',
    requirement: 1,
  };

  const badgeResult = await validator.validateBadge(badgeData);
  if (badgeResult.valid) {
    console.log('✅ Badge is valid!');
  } else {
    console.log('❌ Badge validation failed:');
    badgeResult.errors.forEach((err) => console.log(`   - ${err}`));
  }

  // Example 4: Validate invalid data to see error messages
  console.log('\n❗ Example 4: Validating invalid lesson (demonstrates error handling)...');
  const invalidLesson = {
    slug: 'invalid-lesson',
    title: 'A'.repeat(250), // Too long
    description: 'Test',
    week: 15, // Out of range
    order: -1, // Negative
    difficulty: 'expert', // Invalid value
    xpReward: 1000, // Too high
    estimatedMinutes: 200, // Too long
  };

  const invalidResult = await validator.validateLesson(invalidLesson);
  console.log('Expected errors found:');
  invalidResult.errors.forEach((err) => console.log(`   - ${err}`));

  // Example 5: Validate a directory of content files (if exists)
  console.log('\n📁 Example 5: Validating content directory...');
  const contentDir = join(__dirname, '../../../prisma/content');

  try {
    const report = await validator.validateContentDirectory(contentDir);

    console.log(`\n📊 Validation Report:`);
    console.log(`   Total files: ${report.totalFiles}`);
    console.log(`   ✅ Valid files: ${report.validFiles}`);
    console.log(`   ❌ Invalid files: ${report.invalidFiles}`);

    if (report.errors.length > 0) {
      console.log('\n⚠️  Errors found:');
      report.errors.forEach(({ file, errors }) => {
        console.log(`\n   File: ${file}`);
        errors.forEach((err) => console.log(`      - ${err}`));
      });
    }
  } catch (error) {
    console.log(
      '⚠️  Content directory validation skipped (directory may not exist or contain JSON files)'
    );
  }

  console.log('\n✨ Validation examples completed!\n');

  // Close the application context
  await app.close();
}

// Run the validator if this file is executed directly
if (require.main === module) {
  validateContent()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { validateContent };
