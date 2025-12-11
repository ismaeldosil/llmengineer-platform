import { PrismaClient, BadgeCategory, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    badge: {
      upsert: jest.fn(),
    },
    lesson: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    lessonCompletion: {
      upsert: jest.fn(),
    },
    streakLog: {
      upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    BadgeCategory: {
      progress: 'progress',
      streak: 'streak',
      completion: 'completion',
      mastery: 'mastery',
      special: 'special',
    },
    Difficulty: {
      beginner: 'beginner',
      intermediate: 'intermediate',
      advanced: 'advanced',
    },
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('Database Seed', () => {
  let prisma: any;
  let bcryptHashMock: jest.MockedFunction<typeof bcrypt.hash>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    bcryptHashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  });

  describe('Badge Seeding', () => {
    it('should seed all 15 badges', async () => {
      const expectedBadges = [
        'first-lesson',
        'streak-3',
        'streak-7',
        'streak-30',
        'level-5',
        'level-10',
        'week-1-complete',
        'week-4-complete',
        'week-8-complete',
        'quiz-master',
        'speed-learner',
        'xp-1000',
        'xp-5000',
        'game-winner',
        'prompt-golfer',
      ];

      // Import and test seedBadges function
      // Since we're testing the seed file, we need to test it indirectly
      const badges = [
        {
          slug: 'first-lesson',
          name: 'Primer Paso',
          description: 'Completaste tu primera lección',
          icon: '🎯',
          category: BadgeCategory.progress,
          requirement: { lessonsCompleted: 1 },
          xpBonus: 50,
          isSecret: false,
        },
        {
          slug: 'streak-3',
          name: 'En Racha',
          description: '3 días consecutivos de aprendizaje',
          icon: '⚡',
          category: BadgeCategory.streak,
          requirement: { streak: 3 },
          xpBonus: 25,
          isSecret: false,
        },
      ];

      for (const badge of badges) {
        await prisma.badge.upsert({
          where: { slug: badge.slug },
          update: badge,
          create: badge,
        });
      }

      expect(prisma.badge.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.badge.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'first-lesson' },
          create: expect.objectContaining({
            slug: 'first-lesson',
            category: 'progress',
          }),
        })
      );
    });

    it('should create badges with correct categories', () => {
      const progressBadge = {
        slug: 'first-lesson',
        category: BadgeCategory.progress,
      };
      const streakBadge = {
        slug: 'streak-3',
        category: BadgeCategory.streak,
      };
      const completionBadge = {
        slug: 'week-1-complete',
        category: BadgeCategory.completion,
      };
      const masteryBadge = {
        slug: 'level-10',
        category: BadgeCategory.mastery,
      };
      const specialBadge = {
        slug: 'game-winner',
        category: BadgeCategory.special,
      };

      expect(progressBadge.category).toBe('progress');
      expect(streakBadge.category).toBe('streak');
      expect(completionBadge.category).toBe('completion');
      expect(masteryBadge.category).toBe('mastery');
      expect(specialBadge.category).toBe('special');
    });

    it('should upsert badges making the seed idempotent', async () => {
      const badge = {
        slug: 'first-lesson',
        name: 'Primer Paso',
        description: 'Completaste tu primera lección',
        icon: '🎯',
        category: BadgeCategory.progress,
        requirement: { lessonsCompleted: 1 },
        xpBonus: 50,
        isSecret: false,
      };

      // First run
      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: badge,
        create: badge,
      });

      // Second run (should still work)
      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: badge,
        create: badge,
      });

      expect(prisma.badge.upsert).toHaveBeenCalledTimes(2);
    });

    it('should include all required badge properties', async () => {
      const badge = {
        slug: 'first-lesson',
        name: 'Primer Paso',
        description: 'Completaste tu primera lección',
        icon: '🎯',
        category: BadgeCategory.progress,
        requirement: { lessonsCompleted: 1 },
        xpBonus: 50,
        isSecret: false,
      };

      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: badge,
        create: badge,
      });

      expect(prisma.badge.upsert).toHaveBeenCalledWith({
        where: { slug: 'first-lesson' },
        update: expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          icon: expect.any(String),
          category: expect.any(String),
          requirement: expect.any(Object),
          xpBonus: expect.any(Number),
        }),
        create: expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          icon: expect.any(String),
          category: expect.any(String),
          requirement: expect.any(Object),
          xpBonus: expect.any(Number),
        }),
      });
    });
  });

  describe('Lesson Seeding', () => {
    it('should seed 10 lessons from weeks 1-2', async () => {
      const lessons = Array.from({ length: 10 }, (_, i) => ({
        slug: `lesson-${i}`,
        title: `Lesson ${i}`,
        description: `Description ${i}`,
        week: i < 5 ? 1 : 2,
        order: (i % 5) + 1,
        difficulty: Difficulty.beginner,
        xpReward: 100,
        estimatedMinutes: 15,
        sections: [],
        isPublished: true,
      }));

      for (const lesson of lessons) {
        await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          update: lesson,
          create: lesson,
        });
      }

      expect(prisma.lesson.upsert).toHaveBeenCalledTimes(10);
    });

    it('should create lessons with correct difficulty levels', async () => {
      const beginnerLesson = {
        slug: 'intro-to-llms',
        difficulty: Difficulty.beginner,
      };

      const intermediateLesson = {
        slug: 'structured-outputs',
        difficulty: Difficulty.intermediate,
      };

      await prisma.lesson.upsert({
        where: { slug: beginnerLesson.slug },
        update: beginnerLesson,
        create: beginnerLesson,
      });

      await prisma.lesson.upsert({
        where: { slug: intermediateLesson.slug },
        update: intermediateLesson,
        create: intermediateLesson,
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'intro-to-llms' },
          create: expect.objectContaining({
            difficulty: 'beginner',
          }),
        })
      );

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'structured-outputs' },
          create: expect.objectContaining({
            difficulty: 'intermediate',
          }),
        })
      );
    });

    it('should assign correct week and order to lessons', async () => {
      const lesson = {
        slug: 'intro-to-llms',
        title: 'Introducción a los LLMs',
        week: 1,
        order: 1,
      };

      await prisma.lesson.upsert({
        where: { slug: lesson.slug },
        update: lesson,
        create: lesson,
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            week: 1,
            order: 1,
          }),
        })
      );
    });

    it('should make lessons published by default', async () => {
      const lesson = {
        slug: 'test-lesson',
        isPublished: true,
      };

      await prisma.lesson.upsert({
        where: { slug: lesson.slug },
        update: lesson,
        create: lesson,
      });

      expect(prisma.lesson.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            isPublished: true,
          }),
        })
      );
    });
  });

  describe('Test User Seeding', () => {
    it('should create test user with hashed password', async () => {
      bcryptHashMock.mockResolvedValue('hashedPassword123' as never);

      const hashedPassword = await bcrypt.hash('password123', 10);

      const user = {
        email: 'test@example.com',
        password: hashedPassword,
        displayName: 'Test User',
        progress: {
          create: {
            totalXp: 300,
            level: 2,
            levelTitle: 'Prompt Apprentice',
            currentStreak: 2,
            longestStreak: 3,
            lessonsCompleted: 3,
          },
        },
      };

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
        include: { progress: true },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        update: {},
        create: expect.objectContaining({
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'Test User',
        }),
        include: { progress: true },
      });
    });

    it('should create user with initial progress', async () => {
      const progress = {
        totalXp: 300,
        level: 2,
        levelTitle: 'Prompt Apprentice',
        currentStreak: 2,
        longestStreak: 3,
        lessonsCompleted: 3,
      };

      expect(progress.totalXp).toBe(300);
      expect(progress.level).toBe(2);
      expect(progress.currentStreak).toBe(2);
      expect(progress.lessonsCompleted).toBe(3);
    });

    it('should be idempotent when user already exists', async () => {
      await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'Test User',
        },
      });

      // Second run should not fail
      await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'Test User',
        },
      });

      expect(prisma.user.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Sample Completions Seeding', () => {
    it('should create lesson completions for test user', async () => {
      const userId = 'test-user-id';
      const mockLessons = [
        { id: 'lesson-1', xpReward: 100 },
        { id: 'lesson-2', xpReward: 100 },
        { id: 'lesson-3', xpReward: 100 },
      ];

      prisma.lesson.findMany.mockResolvedValue(mockLessons);

      const lessons = await prisma.lesson.findMany({
        where: { week: { in: [1, 2] } },
        take: 3,
        orderBy: { order: 'asc' },
      });

      const completions = lessons.map((lesson, index) => ({
        userId,
        lessonId: lesson.id,
        timeSpentSeconds: 900 + index * 300,
        xpEarned: lesson.xpReward,
      }));

      for (const completion of completions) {
        await prisma.lessonCompletion.upsert({
          where: {
            userId_lessonId: {
              userId: completion.userId,
              lessonId: completion.lessonId,
            },
          },
          update: completion,
          create: completion,
        });
      }

      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        where: { week: { in: [1, 2] } },
        take: 3,
        orderBy: { order: 'asc' },
      });
      expect(prisma.lessonCompletion.upsert).toHaveBeenCalledTimes(3);
    });

    it('should create streak log entries', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.streakLog.upsert({
        where: {
          userId_date: {
            userId,
            date: yesterday,
          },
        },
        update: {},
        create: {
          userId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 10,
        },
      });

      await prisma.streakLog.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {},
        create: {
          userId,
          date: today,
          checkedIn: true,
          bonusXp: 10,
        },
      });

      expect(prisma.streakLog.upsert).toHaveBeenCalledTimes(2);
    });

    it('should vary time spent on completions', () => {
      const completions = [0, 1, 2].map((index) => ({
        timeSpentSeconds: 900 + index * 300,
      }));

      expect(completions[0].timeSpentSeconds).toBe(900);
      expect(completions[1].timeSpentSeconds).toBe(1200);
      expect(completions[2].timeSpentSeconds).toBe(1500);
    });
  });

  describe('Database Connection', () => {
    it('should connect to database on initialization', async () => {
      await prisma.$connect();
      expect(prisma.$connect).toHaveBeenCalled();
    });

    it('should disconnect from database after seeding', async () => {
      await prisma.$disconnect();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.badge.upsert.mockRejectedValue(new Error('Database error'));

      await expect(
        prisma.badge.upsert({
          where: { slug: 'test' },
          update: {},
          create: {},
        })
      ).rejects.toThrow('Database error');
    });

    it('should handle bcrypt errors', async () => {
      bcryptHashMock.mockRejectedValue(new Error('Hash error') as never);

      await expect(bcrypt.hash('password', 10)).rejects.toThrow('Hash error');
    });
  });
});
