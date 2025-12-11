import * as fs from 'fs';
import * as path from 'path';
import {
  validateLessonData,
  validateBadgeData,
  normalizeDifficulty,
  getWeekDirectories,
  getLessonFiles,
  readJsonFile,
  syncLesson,
  syncBadge,
  syncLessons,
  syncBadges,
  syncContent,
  main,
  LessonJSON,
  BadgeJSON,
} from './sync-content';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    lesson: { upsert: jest.fn().mockResolvedValue({}) },
    badge: { upsert: jest.fn().mockResolvedValue({}) },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  })),
  Difficulty: { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
}));

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock console to reduce noise
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('Content Sync Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe('validateLessonData', () => {
    it('should return true for valid lesson data', () => {
      const lesson = { slug: 'test', title: 'Test', week: 1 };
      expect(validateLessonData(lesson)).toBe(true);
    });

    it('should return false when slug is missing', () => {
      const lesson = { title: 'Test', week: 1 };
      expect(validateLessonData(lesson)).toBe(false);
    });

    it('should return false when title is missing', () => {
      const lesson = { slug: 'test', week: 1 };
      expect(validateLessonData(lesson)).toBe(false);
    });

    it('should return false when week is missing', () => {
      const lesson = { slug: 'test', title: 'Test' };
      expect(validateLessonData(lesson)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(validateLessonData({})).toBe(false);
    });
  });

  describe('validateBadgeData', () => {
    it('should return true for valid badge data', () => {
      const badge = { slug: 'test', name: 'Test', category: 'progress' };
      expect(validateBadgeData(badge as Partial<BadgeJSON>)).toBe(true);
    });

    it('should return false when slug is missing', () => {
      const badge = { name: 'Test', category: 'progress' };
      expect(validateBadgeData(badge as Partial<BadgeJSON>)).toBe(false);
    });

    it('should return false when name is missing', () => {
      const badge = { slug: 'test', category: 'progress' };
      expect(validateBadgeData(badge as Partial<BadgeJSON>)).toBe(false);
    });

    it('should return false when category is missing', () => {
      const badge = { slug: 'test', name: 'Test' };
      expect(validateBadgeData(badge as Partial<BadgeJSON>)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(validateBadgeData({})).toBe(false);
    });
  });

  describe('normalizeDifficulty', () => {
    it('should return beginner for beginner', () => {
      expect(normalizeDifficulty('beginner')).toBe('beginner');
    });

    it('should return intermediate for intermediate', () => {
      expect(normalizeDifficulty('intermediate')).toBe('intermediate');
    });

    it('should return advanced for advanced', () => {
      expect(normalizeDifficulty('advanced')).toBe('advanced');
    });

    it('should return beginner for undefined', () => {
      expect(normalizeDifficulty(undefined)).toBe('beginner');
    });

    it('should return beginner for invalid difficulty', () => {
      expect(normalizeDifficulty('expert')).toBe('beginner');
    });

    it('should return beginner for empty string', () => {
      expect(normalizeDifficulty('')).toBe('beginner');
    });
  });

  describe('getWeekDirectories', () => {
    it('should return empty array when directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(getWeekDirectories('/fake/path')).toEqual([]);
    });

    it('should return sorted week directories', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['week-2', 'week-1', 'README.md'] as any);
      mockFs.statSync.mockImplementation((p: any) => ({
        isDirectory: () => !p.includes('README'),
      } as any));

      const result = getWeekDirectories('/lessons');
      expect(result).toEqual(['week-1', 'week-2']);
    });

    it('should filter out non-week directories', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['week-1', 'other-dir', 'config'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

      const result = getWeekDirectories('/lessons');
      expect(result).toEqual(['week-1']);
    });

    it('should filter out files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['week-1', 'week-file.json'] as any);
      mockFs.statSync.mockImplementation((p: any) => ({
        isDirectory: () => !p.includes('.json'),
      } as any));

      const result = getWeekDirectories('/lessons');
      expect(result).toEqual(['week-1']);
    });
  });

  describe('getLessonFiles', () => {
    it('should return empty array when directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(getLessonFiles('/fake/path')).toEqual([]);
    });

    it('should return only JSON files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        'lesson1.json',
        'lesson2.json',
        'README.md',
        'image.png',
      ] as any);

      const result = getLessonFiles('/week-1');
      expect(result).toEqual(['lesson1.json', 'lesson2.json']);
    });

    it('should return empty array for empty directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([] as any);

      expect(getLessonFiles('/week-1')).toEqual([]);
    });
  });

  describe('readJsonFile', () => {
    it('should return null when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(readJsonFile('/fake/file.json')).toBeNull();
    });

    it('should parse and return JSON content', () => {
      const testData = { slug: 'test', title: 'Test Lesson' };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(testData));

      const result = readJsonFile<LessonJSON>('/test.json');
      expect(result).toEqual(testData);
    });

    it('should return null for invalid JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json {');

      const result = readJsonFile('/test.json');
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should return null when read fails', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = readJsonFile('/test.json');
      expect(result).toBeNull();
    });
  });

  describe('syncLesson', () => {
    const mockPrisma = {
      lesson: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    } as any;

    it('should return false for invalid lesson data', async () => {
      const invalidLesson = { title: 'No Slug' } as LessonJSON;
      const result = await syncLesson(mockPrisma, invalidLesson);
      expect(result).toBe(false);
      expect(mockPrisma.lesson.upsert).not.toHaveBeenCalled();
    });

    it('should upsert valid lesson and return true', async () => {
      const lesson: LessonJSON = {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'A test',
        week: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        estimatedMinutes: 15,
        sections: [],
      };

      const result = await syncLesson(mockPrisma, lesson);
      expect(result).toBe(true);
      expect(mockPrisma.lesson.upsert).toHaveBeenCalledWith({
        where: { slug: 'test-lesson' },
        update: expect.objectContaining({
          title: 'Test Lesson',
          week: 1,
          isPublished: true,
        }),
        create: expect.objectContaining({
          slug: 'test-lesson',
          title: 'Test Lesson',
          week: 1,
          isPublished: true,
        }),
      });
    });

    it('should use default values for missing optional fields', async () => {
      const lesson = {
        slug: 'minimal',
        title: 'Minimal',
        week: 1,
      } as LessonJSON;

      await syncLesson(mockPrisma, lesson);
      expect(mockPrisma.lesson.upsert).toHaveBeenCalledWith(
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

    it('should normalize invalid difficulty', async () => {
      const lesson = {
        slug: 'test',
        title: 'Test',
        week: 1,
        difficulty: 'expert' as any,
      } as LessonJSON;

      await syncLesson(mockPrisma, lesson);
      expect(mockPrisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            difficulty: 'beginner',
          }),
        })
      );
    });
  });

  describe('syncBadge', () => {
    const mockPrisma = {
      badge: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    } as any;

    it('should return false for invalid badge data', async () => {
      const invalidBadge = { name: 'No Slug' } as BadgeJSON;
      const result = await syncBadge(mockPrisma, invalidBadge);
      expect(result).toBe(false);
      expect(mockPrisma.badge.upsert).not.toHaveBeenCalled();
    });

    it('should upsert valid badge and return true', async () => {
      const badge: BadgeJSON = {
        slug: 'test-badge',
        name: 'Test Badge',
        description: 'A test badge',
        icon: '🏆',
        category: 'progress',
        requirement: { lessons: 1 },
        xpBonus: 50,
        isSecret: false,
      };

      const result = await syncBadge(mockPrisma, badge);
      expect(result).toBe(true);
      expect(mockPrisma.badge.upsert).toHaveBeenCalledWith({
        where: { slug: 'test-badge' },
        update: expect.objectContaining({
          name: 'Test Badge',
          category: 'progress',
        }),
        create: expect.objectContaining({
          slug: 'test-badge',
          name: 'Test Badge',
          category: 'progress',
        }),
      });
    });

    it('should use default values for missing optional fields', async () => {
      const badge = {
        slug: 'minimal',
        name: 'Minimal',
        category: 'progress',
      } as BadgeJSON;

      await syncBadge(mockPrisma, badge);
      expect(mockPrisma.badge.upsert).toHaveBeenCalledWith(
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

  describe('syncLessons', () => {
    const mockPrisma = {
      lesson: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    } as any;

    beforeEach(() => {
      mockPrisma.lesson.upsert.mockClear();
    });

    it('should throw error when lessons directory does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(syncLessons(mockPrisma, '/content')).rejects.toThrow(
        'Lessons directory not found'
      );
    });

    it('should sync lessons from all week directories', async () => {
      const lessonData = { slug: 'lesson1', title: 'Lesson 1', week: 1 };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['week-1'] as any)
        .mockReturnValueOnce(['lesson1.json'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(lessonData));

      const result = await syncLessons(mockPrisma, '/content');
      expect(result).toBe(1);
      expect(mockPrisma.lesson.upsert).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no lessons are found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([] as any);

      const result = await syncLessons(mockPrisma, '/content');
      expect(result).toBe(0);
    });

    it('should skip invalid lesson files', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['week-1'] as any)
        .mockReturnValueOnce(['invalid.json'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: true }));

      const result = await syncLessons(mockPrisma, '/content');
      expect(result).toBe(0);
    });
  });

  describe('syncBadges', () => {
    const mockPrisma = {
      badge: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    } as any;

    beforeEach(() => {
      mockPrisma.badge.upsert.mockClear();
    });

    it('should throw error when badges file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(syncBadges(mockPrisma, '/content')).rejects.toThrow(
        'Badges file not found'
      );
    });

    it('should throw error for invalid badges file format', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: true }));

      await expect(syncBadges(mockPrisma, '/content')).rejects.toThrow(
        'Invalid badges file format'
      );
    });

    it('should sync all valid badges', async () => {
      const badgesData = {
        badges: [
          { slug: 'badge1', name: 'Badge 1', category: 'progress' },
          { slug: 'badge2', name: 'Badge 2', category: 'streak' },
        ],
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(badgesData));

      const result = await syncBadges(mockPrisma, '/content');
      expect(result).toBe(2);
      expect(mockPrisma.badge.upsert).toHaveBeenCalledTimes(2);
    });

    it('should skip invalid badges', async () => {
      const badgesData = {
        badges: [
          { slug: 'valid', name: 'Valid', category: 'progress' },
          { name: 'Invalid - no slug', category: 'progress' },
        ],
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(badgesData));

      const result = await syncBadges(mockPrisma, '/content');
      expect(result).toBe(1);
    });
  });

  describe('syncContent', () => {
    const mockPrisma = {
      lesson: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      badge: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    } as any;

    beforeEach(() => {
      mockPrisma.lesson.upsert.mockClear();
      mockPrisma.badge.upsert.mockClear();
    });

    it('should throw error when content repository does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(syncContent(mockPrisma, '/fake/path')).rejects.toThrow(
        'Content repository not found'
      );
    });

    it('should sync badges and lessons', async () => {
      const badgesData = {
        badges: [{ slug: 'badge1', name: 'Badge 1', category: 'progress' }],
      };
      const lessonData = { slug: 'lesson1', title: 'Lesson 1', week: 1 };

      // Mock for content directory, badges file, and lessons directory
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['week-1'] as any) // getLessonFiles in syncLessons
        .mockReturnValueOnce(['lesson1.json'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(badgesData)) // badges.json
        .mockReturnValueOnce(JSON.stringify(lessonData)); // lesson file

      const result = await syncContent(mockPrisma, '/content');
      expect(result).toEqual({ lessons: 1, badges: 1 });
    });

    it('should return counts of synced items', async () => {
      const badgesData = {
        badges: [
          { slug: 'b1', name: 'B1', category: 'progress' },
          { slug: 'b2', name: 'B2', category: 'streak' },
        ],
      };
      const lesson1 = { slug: 'l1', title: 'L1', week: 1 };
      const lesson2 = { slug: 'l2', title: 'L2', week: 1 };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['week-1'] as any)
        .mockReturnValueOnce(['l1.json', 'l2.json'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(badgesData))
        .mockReturnValueOnce(JSON.stringify(lesson1))
        .mockReturnValueOnce(JSON.stringify(lesson2));

      const result = await syncContent(mockPrisma, '/content');
      expect(result.badges).toBe(2);
      expect(result.lessons).toBe(2);
    });
  });

  describe('Path construction', () => {
    it('should construct correct lessons directory path', () => {
      const contentPath = '/path/to/content';
      const lessonsDir = path.join(contentPath, 'lessons');
      expect(lessonsDir).toBe('/path/to/content/lessons');
    });

    it('should construct correct badges file path', () => {
      const contentPath = '/path/to/content';
      const badgesFile = path.join(contentPath, 'badges', 'badges.json');
      expect(badgesFile).toBe('/path/to/content/badges/badges.json');
    });
  });

  describe('main', () => {
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    afterAll(() => {
      mockConsoleError.mockRestore();
    });

    it('should throw error when content repository does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(main()).rejects.toThrow('Content repository not found');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should sync content successfully when repository exists', async () => {
      const badgesData = {
        badges: [{ slug: 'badge1', name: 'Badge 1', category: 'progress' }],
      };
      const lessonData = { slug: 'lesson1', title: 'Lesson 1', week: 1 };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['week-1'] as any)
        .mockReturnValueOnce(['lesson1.json'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(badgesData))
        .mockReturnValueOnce(JSON.stringify(lessonData));

      await expect(main()).resolves.toBeUndefined();
    });
  });
});
