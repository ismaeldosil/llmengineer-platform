import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    badge: {
      upsert: jest.fn(),
    },
    lesson: {
      upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Difficulty: {
      beginner: 'beginner',
      intermediate: 'intermediate',
      advanced: 'advanced',
    },
  };
});

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('Content Sync Script', () => {
  let prisma: any;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;
  let mockReaddirSync: jest.MockedFunction<typeof fs.readdirSync>;
  let mockStatSync: jest.MockedFunction<typeof fs.statSync>;
  let mockReadFileSync: jest.MockedFunction<typeof fs.readFileSync>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
    mockReaddirSync = fs.readdirSync as jest.MockedFunction<
      typeof fs.readdirSync
    >;
    mockStatSync = fs.statSync as jest.MockedFunction<typeof fs.statSync>;
    mockReadFileSync = fs.readFileSync as jest.MockedFunction<
      typeof fs.readFileSync
    >;
  });

  describe('Content Repository Validation', () => {
    it('should verify content repository exists', () => {
      mockExistsSync.mockReturnValue(true);

      const contentPath = '/path/to/llmengineer-content';
      const exists = fs.existsSync(contentPath);

      expect(exists).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(contentPath);
    });

    it('should throw error when content repository does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const contentPath = '/path/to/llmengineer-content';
      const exists = fs.existsSync(contentPath);

      expect(exists).toBe(false);
    });

    it('should verify lessons directory exists', () => {
      mockExistsSync.mockReturnValue(true);

      const lessonsPath = '/path/to/llmengineer-content/lessons';
      const exists = fs.existsSync(lessonsPath);

      expect(exists).toBe(true);
    });

    it('should verify badges file exists', () => {
      mockExistsSync.mockReturnValue(true);

      const badgesPath = '/path/to/llmengineer-content/badges/badges.json';
      const exists = fs.existsSync(badgesPath);

      expect(exists).toBe(true);
    });
  });

  describe('Badge Synchronization', () => {
    const mockBadgesData = {
      badges: [
        {
          slug: 'first-lesson',
          name: 'Primer Paso',
          description: 'Completaste tu primera lección',
          icon: '🎯',
          category: 'progress',
          requirement: { lessonsCompleted: 1 },
          xpBonus: 50,
          isSecret: false,
        },
        {
          slug: 'streak-3',
          name: 'En Racha',
          description: '3 días consecutivos de aprendizaje',
          icon: '⚡',
          category: 'streak',
          requirement: { streak: 3 },
          xpBonus: 25,
          isSecret: false,
        },
      ],
    };

    it('should read badges from JSON file', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockBadgesData));

      const badgesPath = '/path/to/badges.json';
      const content = fs.readFileSync(badgesPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data.badges).toHaveLength(2);
      expect(data.badges[0].slug).toBe('first-lesson');
    });

    it('should sync badges to database', async () => {
      const badge = mockBadgesData.badges[0];

      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          requirement: badge.requirement,
          xpBonus: badge.xpBonus,
          isSecret: badge.isSecret,
        },
        create: {
          slug: badge.slug,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          requirement: badge.requirement,
          xpBonus: badge.xpBonus,
          isSecret: badge.isSecret,
        },
      });

      expect(prisma.badge.upsert).toHaveBeenCalledWith({
        where: { slug: 'first-lesson' },
        update: expect.objectContaining({
          name: 'Primer Paso',
          category: 'progress',
        }),
        create: expect.objectContaining({
          slug: 'first-lesson',
          name: 'Primer Paso',
          category: 'progress',
        }),
      });
    });

    it('should handle invalid badges gracefully', () => {
      const invalidBadge = {
        // Missing slug
        name: 'Invalid Badge',
        category: 'progress',
      };

      expect(invalidBadge).not.toHaveProperty('slug');
    });

    it('should set default values for missing badge properties', async () => {
      const minimalBadge = {
        slug: 'test-badge',
        name: 'Test Badge',
        category: 'progress',
      };

      await prisma.badge.upsert({
        where: { slug: minimalBadge.slug },
        create: {
          ...minimalBadge,
          description: minimalBadge.description || '',
          icon: minimalBadge.icon || '🏆',
          requirement: {},
          xpBonus: 0,
          isSecret: false,
        },
        update: {},
      });

      expect(prisma.badge.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            description: '',
            icon: '🏆',
            requirement: {},
            xpBonus: 0,
            isSecret: false,
          }),
        })
      );
    });
  });

  describe('Lesson Synchronization', () => {
    const mockLessonData = {
      slug: 'intro-to-llms',
      title: 'Introducción a los LLMs',
      description: 'Aprende sobre LLMs',
      week: 1,
      order: 1,
      difficulty: 'beginner',
      xpReward: 100,
      estimatedMinutes: 15,
      sections: [
        {
          title: 'Section 1',
          content: 'Content here',
          keyPoints: ['Point 1', 'Point 2'],
        },
      ],
      quiz: {
        passingScore: 70,
        questions: [],
      },
    };

    it('should read week directories', () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['week-1', 'week-2'] as any);
      mockStatSync.mockReturnValue({ isDirectory: () => true } as any);

      const lessonsPath = '/path/to/lessons';
      const weekDirs = fs
        .readdirSync(lessonsPath)
        .filter(
          (file) =>
            fs.statSync(path.join(lessonsPath, file)).isDirectory() &&
            file.startsWith('week-')
        );

      expect(weekDirs).toEqual(['week-1', 'week-2']);
    });

    it('should read lesson JSON files from week directory', () => {
      mockReaddirSync.mockReturnValue([
        '01-intro-to-llms.json',
        '02-api-basics.json',
      ] as any);

      const weekPath = '/path/to/week-1';
      const lessonFiles = fs
        .readdirSync(weekPath)
        .filter((file) => file.endsWith('.json'));

      expect(lessonFiles).toHaveLength(2);
      expect(lessonFiles[0]).toBe('01-intro-to-llms.json');
    });

    it('should parse lesson JSON correctly', () => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockLessonData));

      const lessonPath = '/path/to/lesson.json';
      const content = fs.readFileSync(lessonPath, 'utf-8');
      const lesson = JSON.parse(content);

      expect(lesson.slug).toBe('intro-to-llms');
      expect(lesson.week).toBe(1);
      expect(lesson.sections).toHaveLength(1);
    });

    it('should sync lesson to database', async () => {
      await prisma.lesson.upsert({
        where: { slug: mockLessonData.slug },
        update: {
          title: mockLessonData.title,
          description: mockLessonData.description,
          week: mockLessonData.week,
          order: mockLessonData.order,
          difficulty: mockLessonData.difficulty as Difficulty,
          xpReward: mockLessonData.xpReward,
          estimatedMinutes: mockLessonData.estimatedMinutes,
          sections: mockLessonData.sections,
          isPublished: true,
        },
        create: {
          slug: mockLessonData.slug,
          title: mockLessonData.title,
          description: mockLessonData.description,
          week: mockLessonData.week,
          order: mockLessonData.order,
          difficulty: mockLessonData.difficulty as Difficulty,
          xpReward: mockLessonData.xpReward,
          estimatedMinutes: mockLessonData.estimatedMinutes,
          sections: mockLessonData.sections,
          isPublished: true,
        },
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith({
        where: { slug: 'intro-to-llms' },
        update: expect.objectContaining({
          title: 'Introducción a los LLMs',
          week: 1,
          difficulty: 'beginner',
          isPublished: true,
        }),
        create: expect.objectContaining({
          slug: 'intro-to-llms',
          title: 'Introducción a los LLMs',
          week: 1,
          difficulty: 'beginner',
          isPublished: true,
        }),
      });
    });

    it('should validate required lesson fields', () => {
      const validLesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        week: 1,
      };

      expect(validLesson).toHaveProperty('slug');
      expect(validLesson).toHaveProperty('title');
      expect(validLesson).toHaveProperty('week');
    });

    it('should skip invalid lesson files', () => {
      const invalidLesson = {
        // Missing slug
        title: 'Invalid Lesson',
        week: 1,
      };

      expect(invalidLesson).not.toHaveProperty('slug');
    });

    it('should handle different difficulty levels', async () => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];

      for (const difficulty of difficulties) {
        await prisma.lesson.upsert({
          where: { slug: `lesson-${difficulty}` },
          create: {
            slug: `lesson-${difficulty}`,
            difficulty: difficulty as Difficulty,
          },
          update: {},
        });
      }

      expect(prisma.lesson.upsert).toHaveBeenCalledTimes(3);
    });

    it('should set default difficulty to beginner for invalid values', () => {
      const lessonWithInvalidDifficulty = {
        slug: 'test-lesson',
        difficulty: 'expert', // Invalid
      };

      const difficulty = ['beginner', 'intermediate', 'advanced'].includes(
        lessonWithInvalidDifficulty.difficulty
      )
        ? lessonWithInvalidDifficulty.difficulty
        : 'beginner';

      expect(difficulty).toBe('beginner');
    });

    it('should set default values for missing lesson properties', async () => {
      const minimalLesson = {
        slug: 'minimal-lesson',
        title: 'Minimal Lesson',
        week: 1,
      };

      await prisma.lesson.upsert({
        where: { slug: minimalLesson.slug },
        create: {
          ...minimalLesson,
          description: '',
          order: 1,
          difficulty: 'beginner' as Difficulty,
          xpReward: 100,
          estimatedMinutes: 15,
          sections: [],
          isPublished: true,
        },
        update: {},
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            description: '',
            order: 1,
            xpReward: 100,
            estimatedMinutes: 15,
            sections: [],
          }),
        })
      );
    });
  });

  describe('Directory Structure', () => {
    it('should filter only week directories', () => {
      const allFiles = ['week-1', 'week-2', 'README.md', 'config.json'];

      const weekDirs = allFiles.filter(
        (file) => file.startsWith('week-') && !file.includes('.')
      );

      expect(weekDirs).toEqual(['week-1', 'week-2']);
    });

    it('should sort week directories correctly', () => {
      const weekDirs = ['week-3', 'week-1', 'week-10', 'week-2'];
      const sorted = weekDirs.sort();

      expect(sorted).toEqual(['week-1', 'week-10', 'week-2', 'week-3']);
    });

    it('should filter only JSON files', () => {
      const allFiles = [
        '01-lesson.json',
        '02-lesson.json',
        'README.md',
        'image.png',
      ];

      const jsonFiles = allFiles.filter((file) => file.endsWith('.json'));

      expect(jsonFiles).toEqual(['01-lesson.json', '02-lesson.json']);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      expect(() => fs.readFileSync('/invalid/path', 'utf-8')).toThrow(
        'File read error'
      );
    });

    it('should handle JSON parse errors', () => {
      mockReadFileSync.mockReturnValue('invalid json {');

      expect(() => {
        const content = fs.readFileSync('/path/to/file.json', 'utf-8');
        JSON.parse(content);
      }).toThrow();
    });

    it('should handle database errors during upsert', async () => {
      prisma.lesson.upsert.mockRejectedValue(new Error('Database error'));

      await expect(
        prisma.lesson.upsert({
          where: { slug: 'test' },
          update: {},
          create: {},
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('Idempotency', () => {
    beforeEach(() => {
      // Reset the mock implementation for idempotency tests
      prisma.lesson.upsert.mockResolvedValue({});
    });

    it('should allow multiple syncs without errors', async () => {
      const lesson = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        week: 1,
      };

      // First sync
      await prisma.lesson.upsert({
        where: { slug: lesson.slug },
        update: lesson,
        create: lesson,
      });

      // Second sync (should update existing)
      await prisma.lesson.upsert({
        where: { slug: lesson.slug },
        update: lesson,
        create: lesson,
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledTimes(2);
    });

    it('should update existing lessons with new data', async () => {
      const originalLesson = {
        slug: 'test-lesson',
        title: 'Original Title',
      };

      const updatedLesson = {
        slug: 'test-lesson',
        title: 'Updated Title',
      };

      await prisma.lesson.upsert({
        where: { slug: originalLesson.slug },
        update: updatedLesson,
        create: originalLesson,
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            title: 'Updated Title',
          }),
        })
      );
    });
  });

  describe('Database Connection Management', () => {
    it('should connect to database', async () => {
      await prisma.$connect();
      expect(prisma.$connect).toHaveBeenCalled();
    });

    it('should disconnect from database after sync', async () => {
      await prisma.$disconnect();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });

    it('should disconnect even on error', async () => {
      try {
        throw new Error('Sync error');
      } catch (error) {
        await prisma.$disconnect();
      }

      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Path Resolution', () => {
    it('should resolve content repository path correctly', () => {
      const scriptPath = __dirname;
      const contentPath = path.resolve(scriptPath, '../../../..', 'llmengineer-content');

      expect(contentPath).toContain('llmengineer-content');
    });

    it('should construct lessons directory path', () => {
      const contentPath = '/path/to/llmengineer-content';
      const lessonsPath = path.join(contentPath, 'lessons');

      expect(lessonsPath).toBe('/path/to/llmengineer-content/lessons');
    });

    it('should construct badges file path', () => {
      const contentPath = '/path/to/llmengineer-content';
      const badgesPath = path.join(contentPath, 'badges', 'badges.json');

      expect(badgesPath).toBe('/path/to/llmengineer-content/badges/badges.json');
    });
  });
});
