import { Test, TestingModule } from '@nestjs/testing';
import { ContentValidatorService } from './content-validator.service';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('ContentValidatorService', () => {
  let service: ContentValidatorService;
  const testDir = join(process.cwd(), 'test-content');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentValidatorService],
    }).compile();

    service = module.get<ContentValidatorService>(ContentValidatorService);
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('validateLesson', () => {
    it('should validate a correct lesson', async () => {
      const validLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(validLesson);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject lesson with missing required fields', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        // Missing description
        week: 1,
        order: 1,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject lesson with invalid week', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 13, // Out of range (1-12)
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('week'))).toBe(true);
    });

    it('should reject lesson with week less than 1', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 0,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('week'))).toBe(true);
    });

    it('should reject lesson with invalid difficulty', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'expert', // Invalid value
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('difficulty'))).toBe(true);
    });

    it('should reject lesson with xpReward out of range', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 600, // Out of range (50-500)
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('xpReward'))).toBe(true);
    });

    it('should reject lesson with xpReward below minimum', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 25, // Below minimum (50)
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('xpReward'))).toBe(true);
    });

    it('should reject lesson with estimatedMinutes out of range', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 150, // Out of range (5-120)
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('estimatedMinutes'))).toBe(true);
    });

    it('should reject lesson with title exceeding max length', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'A'.repeat(201), // Exceeds 200 chars
        description: 'Learn about Large Language Models',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('title'))).toBe(true);
    });

    it('should reject lesson with non-positive order', async () => {
      const invalidLesson = {
        slug: 'intro-to-llms',
        title: 'Introduction to LLMs',
        description: 'Learn about Large Language Models',
        week: 1,
        order: 0, // Must be positive
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const result = await service.validateLesson(invalidLesson);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('order'))).toBe(true);
    });

    it('should reject non-object data', async () => {
      const result = await service.validateLesson('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Los datos de la lección deben ser un objeto');
    });

    it('should reject null data', async () => {
      const result = await service.validateLesson(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Los datos de la lección deben ser un objeto');
    });
  });

  describe('validateQuiz', () => {
    it('should validate a correct multiple choice quiz', async () => {
      const validQuiz = {
        type: 'multiple_choice',
        question: 'What is an LLM?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'LLM stands for Large Language Model',
      };

      const result = await service.validateQuiz(validQuiz);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct true/false quiz', async () => {
      const validQuiz = {
        type: 'true_false',
        question: 'LLMs use transformer architecture?',
        correctAnswer: true,
        explanation: 'Yes, most modern LLMs use transformer architecture',
      };

      const result = await service.validateQuiz(validQuiz);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct code completion quiz', async () => {
      const validQuiz = {
        type: 'code_completion',
        question: 'Complete the function',
        correctAnswer: 'return x + y',
        explanation: 'This adds two numbers',
      };

      const result = await service.validateQuiz(validQuiz);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject quiz with missing question', async () => {
      const invalidQuiz = {
        type: 'multiple_choice',
        options: ['Option A', 'Option B'],
        correctAnswer: 0,
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject multiple_choice without options', async () => {
      const invalidQuiz = {
        type: 'multiple_choice',
        question: 'What is an LLM?',
        correctAnswer: 0,
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('opciones'))).toBe(true);
    });

    it('should reject multiple_choice with too few options', async () => {
      const invalidQuiz = {
        type: 'multiple_choice',
        question: 'What is an LLM?',
        options: ['Only one option'],
        correctAnswer: 0,
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('opciones'))).toBe(true);
    });

    it('should reject multiple_choice with wrong correctAnswer type', async () => {
      const invalidQuiz = {
        type: 'multiple_choice',
        question: 'What is an LLM?',
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 'not a number',
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('correctAnswer'))).toBe(true);
    });

    it('should reject multiple_choice with out of range correctAnswer', async () => {
      const invalidQuiz = {
        type: 'multiple_choice',
        question: 'What is an LLM?',
        options: ['Option A', 'Option B'],
        correctAnswer: 5, // Out of range
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('índice válido'))).toBe(true);
    });

    it('should reject true_false with wrong correctAnswer type', async () => {
      const invalidQuiz = {
        type: 'true_false',
        question: 'LLMs use transformer architecture?',
        correctAnswer: 'yes', // Should be boolean
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('booleano'))).toBe(true);
    });

    it('should reject code_completion with wrong correctAnswer type', async () => {
      const invalidQuiz = {
        type: 'code_completion',
        question: 'Complete the function',
        correctAnswer: 123, // Should be string
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('cadena de texto'))).toBe(true);
    });

    it('should reject quiz with invalid type', async () => {
      const invalidQuiz = {
        type: 'invalid_type',
        question: 'What is an LLM?',
        correctAnswer: 0,
      };

      const result = await service.validateQuiz(invalidQuiz);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('type'))).toBe(true);
    });

    it('should reject non-object data', async () => {
      const result = await service.validateQuiz('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Los datos del quiz deben ser un objeto');
    });
  });

  describe('validateBadge', () => {
    it('should validate a correct badge', async () => {
      const validBadge = {
        slug: 'first-lesson',
        name: 'First Lesson',
        description: 'Complete your first lesson',
        icon: 'trophy',
        category: 'lessons',
        requirement: 1,
      };

      const result = await service.validateBadge(validBadge);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject badge with missing required fields', async () => {
      const invalidBadge = {
        slug: 'first-lesson',
        name: 'First Lesson',
        // Missing description, icon, category, requirement
      };

      const result = await service.validateBadge(invalidBadge);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject badge with invalid category', async () => {
      const invalidBadge = {
        slug: 'first-lesson',
        name: 'First Lesson',
        description: 'Complete your first lesson',
        icon: 'trophy',
        category: 'invalid_category',
        requirement: 1,
      };

      const result = await service.validateBadge(invalidBadge);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('category'))).toBe(true);
    });

    it('should reject badge with requirement less than 1', async () => {
      const invalidBadge = {
        slug: 'first-lesson',
        name: 'First Lesson',
        description: 'Complete your first lesson',
        icon: 'trophy',
        category: 'lessons',
        requirement: 0,
      };

      const result = await service.validateBadge(invalidBadge);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('requirement'))).toBe(true);
    });

    it('should accept all valid categories', async () => {
      const categories = ['lessons', 'streaks', 'xp', 'quizzes', 'special'];

      for (const category of categories) {
        const badge = {
          slug: 'test-badge',
          name: 'Test Badge',
          description: 'A test badge',
          icon: 'star',
          category,
          requirement: 1,
        };

        const result = await service.validateBadge(badge);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject non-object data', async () => {
      const result = await service.validateBadge('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Los datos de la insignia deben ser un objeto');
    });
  });

  describe('validateModule', () => {
    it('should validate a correct module', async () => {
      const validModule = {
        slug: 'llm-basics',
        title: 'LLM Basics',
        description: 'Introduction to Large Language Models',
        week: 1,
        order: 1,
      };

      const result = await service.validateModule(validModule);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject module with missing required fields', async () => {
      const invalidModule = {
        slug: 'llm-basics',
        title: 'LLM Basics',
        // Missing description, week, order
      };

      const result = await service.validateModule(invalidModule);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject module with invalid week', async () => {
      const invalidModule = {
        slug: 'llm-basics',
        title: 'LLM Basics',
        description: 'Introduction to Large Language Models',
        week: 15, // Out of range
        order: 1,
      };

      const result = await service.validateModule(invalidModule);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('week'))).toBe(true);
    });

    it('should reject module with order less than 1', async () => {
      const invalidModule = {
        slug: 'llm-basics',
        title: 'LLM Basics',
        description: 'Introduction to Large Language Models',
        week: 1,
        order: 0,
      };

      const result = await service.validateModule(invalidModule);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('order'))).toBe(true);
    });

    it('should reject non-object data', async () => {
      const result = await service.validateModule('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Los datos del módulo deben ser un objeto');
    });
  });

  describe('validateContentDirectory', () => {
    beforeEach(async () => {
      // Create test directory
      await mkdir(testDir, { recursive: true });
    });

    it('should validate directory with valid JSON files', async () => {
      const validLesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'A test lesson',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      await writeFile(join(testDir, 'lesson-1.json'), JSON.stringify(validLesson, null, 2));

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(1);
      expect(report.validFiles).toBe(1);
      expect(report.invalidFiles).toBe(0);
      expect(report.errors).toHaveLength(0);
    });

    it('should report invalid files', async () => {
      const invalidLesson = {
        slug: 'test-lesson',
        // Missing required fields
      };

      await writeFile(join(testDir, 'lesson-1.json'), JSON.stringify(invalidLesson, null, 2));

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(1);
      expect(report.validFiles).toBe(0);
      expect(report.invalidFiles).toBe(1);
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0].file).toBe('lesson-1.json');
    });

    it('should handle mixed valid and invalid files', async () => {
      const validLesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'A test lesson',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const invalidLesson = {
        slug: 'invalid-lesson',
        title: 'Invalid Lesson',
        // Missing other required fields
      };

      await writeFile(join(testDir, 'lesson-1.json'), JSON.stringify(validLesson, null, 2));
      await writeFile(join(testDir, 'lesson-2.json'), JSON.stringify(invalidLesson, null, 2));

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(2);
      expect(report.validFiles).toBe(1);
      expect(report.invalidFiles).toBe(1);
      expect(report.errors).toHaveLength(1);
    });

    it('should handle malformed JSON', async () => {
      await writeFile(join(testDir, 'invalid.json'), '{ invalid json }');

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(1);
      expect(report.invalidFiles).toBe(1);
      expect(report.errors[0].errors[0]).toContain('Error al procesar archivo');
    });

    it('should only process JSON files', async () => {
      const validLesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'A test lesson',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      await writeFile(join(testDir, 'lesson-1.json'), JSON.stringify(validLesson, null, 2));
      await writeFile(join(testDir, 'readme.txt'), 'This is a text file');
      await writeFile(join(testDir, 'lesson-1.ts'), 'export const lesson = {};');

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(1); // Only JSON file counted
      expect(report.validFiles).toBe(1);
    });

    it('should validate different content types', async () => {
      const validLesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'A test lesson',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 30,
      };

      const validQuiz = {
        type: 'multiple_choice',
        question: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 0,
      };

      const validBadge = {
        slug: 'test-badge',
        name: 'Test Badge',
        description: 'A test badge',
        icon: 'star',
        category: 'lessons',
        requirement: 1,
      };

      await writeFile(join(testDir, 'lesson-1.json'), JSON.stringify(validLesson, null, 2));
      await writeFile(join(testDir, 'quiz-1.json'), JSON.stringify(validQuiz, null, 2));
      await writeFile(join(testDir, 'badge-1.json'), JSON.stringify(validBadge, null, 2));

      const report = await service.validateContentDirectory(testDir);

      expect(report.totalFiles).toBe(3);
      expect(report.validFiles).toBe(3);
      expect(report.invalidFiles).toBe(0);
    });

    it('should throw error for non-existent directory', async () => {
      await expect(service.validateContentDirectory('/non/existent/path')).rejects.toThrow();
    });
  });
});
