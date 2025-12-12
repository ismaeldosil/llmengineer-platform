import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';

describe('LessonsService', () => {
  let lessonsService: LessonsService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let badgesService: BadgesService;

  const mockLesson = {
    id: 'lesson-id-1',
    slug: 'intro-to-prompts',
    title: 'Introduction to Prompts',
    description: 'Learn the basics of prompt engineering',
    week: 1,
    order: 1,
    difficulty: 'beginner' as const,
    xpReward: 100,
    estimatedMinutes: 15,
    contentUrl: 'https://example.com/lesson-1',
    sections: [],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLesson2 = {
    id: 'lesson-id-2',
    slug: 'advanced-prompts',
    title: 'Advanced Prompts',
    description: 'Advanced prompt techniques',
    week: 1,
    order: 2,
    difficulty: 'advanced' as const,
    xpReward: 200,
    estimatedMinutes: 30,
    contentUrl: 'https://example.com/lesson-2',
    sections: [],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUnpublishedLesson = {
    id: 'lesson-id-3',
    slug: 'unpublished-lesson',
    title: 'Unpublished Lesson',
    description: 'This lesson is not published',
    week: 2,
    order: 1,
    difficulty: 'beginner' as const,
    xpReward: 100,
    estimatedMinutes: 15,
    contentUrl: null,
    sections: [],
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCompletion = {
    id: 'completion-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    timeSpentSeconds: 300,
    xpEarned: 100,
    completedAt: new Date(),
  };

  const mockPrismaService = {
    lesson: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    lessonCompletion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    userProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUsersService = {
    addXp: jest.fn(),
  };

  const mockBadgesService = {
    checkAndAwardBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: BadgesService,
          useValue: mockBadgesService,
        },
      ],
    }).compile();

    lessonsService = module.get<LessonsService>(LessonsService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    badgesService = module.get<BadgesService>(BadgesService);

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set default mock for userProgress.findUnique
    mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 0 });

    // Set default mock for lessonCompletion.count (for first lesson check)
    // Default to 1 (not first lesson) to avoid affecting existing tests
    // Tests that specifically test first lesson bonus will override this
    mockPrismaService.lessonCompletion.count.mockResolvedValue(1);
  });

  describe('findAll', () => {
    it('should return all published lessons ordered by week and order', async () => {
      const userId = 'user-id-1';
      mockPrismaService.lesson.findMany.mockResolvedValue([mockLesson, mockLesson2]);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([]);

      const result = await lessonsService.findAll(userId);

      expect(prismaService.lesson.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: [{ week: 'asc' }, { order: 'asc' }],
      });
      expect(result).toEqual([
        { ...mockLesson, isCompleted: false },
        { ...mockLesson2, isCompleted: false },
      ]);
    });

    it('should mark completed lessons correctly', async () => {
      const userId = 'user-id-1';
      mockPrismaService.lesson.findMany.mockResolvedValue([mockLesson, mockLesson2]);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([{ lessonId: 'lesson-id-1' }]);

      const result = await lessonsService.findAll(userId);

      expect(prismaService.lessonCompletion.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: { lessonId: true },
      });
      expect(result).toEqual([
        { ...mockLesson, isCompleted: true },
        { ...mockLesson2, isCompleted: false },
      ]);
    });

    it('should return empty array when no lessons exist', async () => {
      const userId = 'user-id-1';
      mockPrismaService.lesson.findMany.mockResolvedValue([]);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([]);

      const result = await lessonsService.findAll(userId);

      expect(result).toEqual([]);
    });

    it('should only return published lessons', async () => {
      const userId = 'user-id-1';
      mockPrismaService.lesson.findMany.mockResolvedValue([mockLesson, mockLesson2]);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([]);

      await lessonsService.findAll(userId);

      expect(prismaService.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPublished: true },
        })
      );
    });

    it('should handle multiple completed lessons', async () => {
      const userId = 'user-id-1';
      mockPrismaService.lesson.findMany.mockResolvedValue([mockLesson, mockLesson2]);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([
        { lessonId: 'lesson-id-1' },
        { lessonId: 'lesson-id-2' },
      ]);

      const result = await lessonsService.findAll(userId);

      expect(result).toEqual([
        { ...mockLesson, isCompleted: true },
        { ...mockLesson2, isCompleted: true },
      ]);
    });
  });

  describe('findOne', () => {
    it('should find lesson by ID', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);

      const result = await lessonsService.findOne(lessonId, userId);

      expect(prismaService.lesson.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ id: lessonId }, { slug: lessonId }],
        },
      });
      expect(result).toEqual({ ...mockLesson, isCompleted: false });
    });

    it('should find lesson by slug', async () => {
      const userId = 'user-id-1';
      const slug = 'intro-to-prompts';
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);

      const result = await lessonsService.findOne(slug, userId);

      expect(prismaService.lesson.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ id: slug }, { slug: slug }],
        },
      });
      expect(result).toEqual({ ...mockLesson, isCompleted: false });
    });

    it('should mark lesson as completed if user has completed it', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      const result = await lessonsService.findOne(lessonId, userId);

      expect(prismaService.lessonCompletion.findUnique).toHaveBeenCalledWith({
        where: {
          userId_lessonId: { userId, lessonId: mockLesson.id },
        },
      });
      expect(result).toEqual({ ...mockLesson, isCompleted: true });
    });

    it('should throw NotFoundException when lesson does not exist', async () => {
      const userId = 'user-id-1';
      const lessonId = 'non-existent-id';
      mockPrismaService.lesson.findFirst.mockResolvedValue(null);

      await expect(lessonsService.findOne(lessonId, userId)).rejects.toThrow(NotFoundException);
      await expect(lessonsService.findOne(lessonId, userId)).rejects.toThrow(
        'Lección no encontrada'
      );
    });

    it('should include all lesson data including sections', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const lessonWithSections = {
        ...mockLesson,
        sections: [
          { id: 'section-1', title: 'Section 1', content: 'Content 1' },
          { id: 'section-2', title: 'Section 2', content: 'Content 2' },
        ],
      };
      mockPrismaService.lesson.findFirst.mockResolvedValue(lessonWithSections);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);

      const result = await lessonsService.findOne(lessonId, userId);

      expect(result.sections).toEqual(lessonWithSections.sections);
    });

    it('should find unpublished lesson by ID (for admin/preview)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-3';
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockUnpublishedLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);

      const result = await lessonsService.findOne(lessonId, userId);

      expect(result).toEqual({ ...mockUnpublishedLesson, isCompleted: false });
    });
  });

  describe('complete', () => {
    it('should successfully complete a lesson', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300; // 5 minutes = 33% of estimated 15 min -> speed bonus!
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 300s / (15min * 60s) = 0.33 < 0.8 -> speed bonus (+25 XP)
      // Expected XP = 100 (base) + 25 (speed) = 125
      expect(prismaService.lessonCompletion.create).toHaveBeenCalledWith({
        data: {
          userId,
          lessonId,
          timeSpentSeconds,
          xpEarned: 125,
        },
      });
      expect(result).toMatchObject({
        lessonId,
        xpEarned: 125,
        completedAt: mockCompletion.completedAt,
        xpBreakdown: expect.any(Object),
        leveledUp: expect.any(Boolean),
      });
    });

    it('should increment lessonsCompleted counter', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          lessonsCompleted: { increment: 1 },
        },
      });
    });

    it('should call addXp with correct XP amount', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300; // < 80% of 15min -> speed bonus
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) + 25 (speed bonus) = 125
      expect(usersService.addXp).toHaveBeenCalledWith(userId, 125);
    });

    it('should check and award badges after completion', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(badgesService.checkAndAwardBadges).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when lesson does not exist', async () => {
      const userId = 'user-id-1';
      const lessonId = 'non-existent-id';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(null);

      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        NotFoundException
      );
      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        'Lección no encontrada'
      );
    });

    it('should throw ConflictException when lesson is already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        ConflictException
      );
      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        'Lección ya completada'
      );

      // Should not create duplicate completion
      expect(prismaService.lessonCompletion.create).not.toHaveBeenCalled();
    });

    it('should not increment lessonsCompleted if already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        ConflictException
      );

      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should not award XP if lesson already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(lessonsService.complete(lessonId, userId, timeSpentSeconds)).rejects.toThrow(
        ConflictException
      );

      expect(usersService.addXp).not.toHaveBeenCalled();
    });

    it('should store correct timeSpentSeconds', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 450;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        timeSpentSeconds,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(prismaService.lessonCompletion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          timeSpentSeconds: 450,
        }),
      });
    });

    it('should award correct XP based on lesson xpReward', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-2';
      const timeSpentSeconds = 600; // 10 min = 33% of 30 min -> speed bonus
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson2);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        xpEarned: 225,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 200 (base) + 25 (speed bonus) = 225
      expect(result.xpEarned).toBe(225);
      expect(usersService.addXp).toHaveBeenCalledWith(userId, 225);
    });

    it('should execute operations in correct order', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      const callOrder: string[] = [];

      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockImplementation(async () => {
        callOrder.push('create_completion');
        return mockCompletion;
      });
      mockPrismaService.userProgress.update.mockImplementation(async () => {
        callOrder.push('update_progress');
        return {};
      });
      mockUsersService.addXp.mockImplementation(async () => {
        callOrder.push('add_xp');
        return {};
      });
      mockBadgesService.checkAndAwardBadges.mockImplementation(async () => {
        callOrder.push('check_badges');
        return [];
      });

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // Verify operations executed in correct order
      expect(callOrder).toEqual(['create_completion', 'update_progress', 'add_xp', 'check_badges']);
    });
  });

  describe('complete - quiz score bonuses', () => {
    it('should award perfect quiz bonus (100%)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000; // > 80% of 15min, no speed bonus
      const quizScore = 100;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // 100 (base) + 0 (no speed) + 50 (perfect quiz) = 150
      expect(result.xpEarned).toBe(150);
      expect(result.xpBreakdown).toMatchObject({
        base: 100,
        speedBonus: 0,
        quizBonus: 50,
      });
    });

    it('should award excellent quiz bonus (90%+)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      const quizScore = 92;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // 100 (base) + 0 (no speed) + 25 (excellent quiz) = 125
      expect(result.xpEarned).toBe(125);
      expect(result.xpBreakdown.quizBonus).toBe(25);
    });

    it('should award good quiz bonus (70%+)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      const quizScore = 75;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // 100 (base) + 0 (no speed) + 10 (good quiz) = 110
      expect(result.xpEarned).toBe(110);
      expect(result.xpBreakdown.quizBonus).toBe(10);
    });

    it('should not award quiz bonus for score below 70%', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      const quizScore = 65;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // 100 (base) + 0 (no speed) + 0 (no quiz bonus) = 100
      expect(result.xpEarned).toBe(100);
      expect(result.xpBreakdown.quizBonus).toBe(0);
    });

    it('should combine speed and quiz bonuses', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300; // < 80% of 15min -> speed bonus
      const quizScore = 100; // perfect quiz
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // 100 (base) + 25 (speed) + 50 (perfect quiz) = 175
      expect(result.xpEarned).toBe(175);
      expect(result.xpBreakdown).toMatchObject({
        base: 100,
        speedBonus: 25,
        quizBonus: 50,
        total: 175,
      });
    });
  });

  describe('complete - streak multipliers (old system - deprecated by GAME-010)', () => {
    it('should not apply multiplier for 3-day streak (< 7 days)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 3 });
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) * 1.0 = 100 (no multiplier for < 7 days per GAME-010)
      expect(result.xpEarned).toBe(100);
      expect(result.xpBreakdown.streakMultiplier).toBe(1.0);
    });

    it('should apply 7-day streak multiplier (x1.2)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) * 1.2 = 120
      expect(result.xpEarned).toBe(120);
      expect(result.xpBreakdown.streakMultiplier).toBe(1.2);
    });

    it('should apply 1.2x for 14-day streak (uses 7+ tier per GAME-010)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 14 });
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) * 1.2 = 120 (GAME-010: 7+ days = 1.2x, 30+ days = 1.5x)
      expect(result.xpEarned).toBe(120);
      expect(result.xpBreakdown.streakMultiplier).toBe(1.2);
    });

    it('should apply 30-day streak multiplier (x1.5)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 30 });
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) * 1.5 = 150
      expect(result.xpEarned).toBe(150);
      expect(result.xpBreakdown.streakMultiplier).toBe(1.5);
    });

    it('should combine all bonuses and streak multiplier correctly', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300; // speed bonus
      const quizScore = 100; // perfect quiz
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      // (100 base + 25 speed + 50 quiz) * 1.2 = 175 * 1.2 = 210
      expect(result.xpEarned).toBe(210);
      expect(result.xpBreakdown).toMatchObject({
        base: 100,
        speedBonus: 25,
        quizBonus: 50,
        streakMultiplier: 1.2,
      });
    });

    it('should handle null userProgress (no streak)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // 100 (base) * 1.0 (no streak) = 100
      expect(result.xpEarned).toBe(100);
      expect(result.xpBreakdown.streakMultiplier).toBe(1.0);
    });
  });

  describe('complete - level up detection', () => {
    it('should detect level up and return new level info', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({
        leveledUp: true,
        level: 2,
        levelTitle: 'Prompt Apprentice',
      });
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(result.newLevelTitle).toBe('Prompt Apprentice');
    });

    it('should handle no level up', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({
        leveledUp: false,
        level: 1,
        levelTitle: 'Prompt Curious',
      });
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
      expect(result.newLevelTitle).toBe('Prompt Curious');
    });

    it('should handle addXp returning null (fallback behavior)', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue(null);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBeUndefined();
      expect(result.newLevelTitle).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle lesson with 0 XP reward', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const lessonWithZeroXp = { ...mockLesson, xpReward: 0 };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWithZeroXp);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        xpEarned: 25,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, 300);

      // 0 (base) + 25 (speed bonus) = 25
      expect(result.xpEarned).toBe(25);
      expect(usersService.addXp).toHaveBeenCalledWith(userId, 25);
    });

    it('should handle lesson with 0 time spent', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        timeSpentSeconds: 0,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, 0);

      expect(prismaService.lessonCompletion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          timeSpentSeconds: 0,
        }),
      });
    });

    it('should handle findAll with different user IDs correctly', async () => {
      const userId1 = 'user-id-1';
      const userId2 = 'user-id-2';

      mockPrismaService.lesson.findMany.mockResolvedValue([mockLesson]);
      mockPrismaService.lessonCompletion.findMany
        .mockResolvedValueOnce([{ lessonId: 'lesson-id-1' }]) // user1 completed
        .mockResolvedValueOnce([]); // user2 not completed

      const result1 = await lessonsService.findAll(userId1);
      const result2 = await lessonsService.findAll(userId2);

      expect(result1[0].isCompleted).toBe(true);
      expect(result2[0].isCompleted).toBe(false);
    });

    it('should handle very long time spent', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 9999; // way over estimated time
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        timeSpentSeconds,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      // Should only get base XP, no speed bonus
      expect(result.xpEarned).toBe(100);
      expect(result.xpBreakdown.speedBonus).toBe(0);
    });

    it('should handle quiz score of exactly 0', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 1000;
      const quizScore = 0;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

      expect(result.xpEarned).toBe(100);
      expect(result.xpBreakdown.quizBonus).toBe(0);
    });
  });

  describe('complete - GAME-010 multiplier system integration', () => {
    describe('First lesson today bonus', () => {
      it('should award 50 XP bonus for first lesson of the day', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0); // First lesson today
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) + 50 (first lesson bonus) = 150
        expect(result.xpEarned).toBe(150);
        expect(result.xpBreakdown.firstLessonBonus).toBe(50);
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
      });

      it('should not award first lesson bonus for second lesson of the day', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(1); // Already completed 1 lesson today
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) + 0 (no first lesson bonus) = 100
        expect(result.xpEarned).toBe(100);
        expect(result.xpBreakdown.firstLessonBonus).toBe(0);
        expect(result.appliedBonuses).not.toContain('First lesson today (+50 XP)');
      });

      it('should check for lessons completed today when determining first lesson', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0);
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // Verify that count was called with correct date range (today 00:00:00 onwards)
        expect(mockPrismaService.lessonCompletion.count).toHaveBeenCalledWith({
          where: {
            userId,
            completedAt: {
              gte: expect.any(Date),
            },
          },
        });

        // Verify the date is today at midnight
        const callArgs = mockPrismaService.lessonCompletion.count.mock.calls[0][0];
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        expect(callArgs.where.completedAt.gte.getTime()).toBe(todayMidnight.getTime());
      });
    });

    describe('Streak multipliers (7+ and 30+ days)', () => {
      it('should apply 1.2x multiplier for 7-day streak', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) * 1.2 = 120
        expect(result.xpEarned).toBe(120);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.2);
        expect(result.appliedBonuses).toContain('7-day streak bonus (1.2x)');
      });

      it('should apply 1.5x multiplier for 30-day streak', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 30 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) * 1.5 = 150
        expect(result.xpEarned).toBe(150);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.5);
        expect(result.appliedBonuses).toContain('30-day streak bonus (1.5x)');
      });

      it('should not apply multiplier for streaks less than 7 days', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 5 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) * 1.0 = 100 (no multiplier)
        expect(result.xpEarned).toBe(100);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.0);
        expect(result.appliedBonuses).toHaveLength(0);
      });
    });

    describe('Combined multipliers and bonuses', () => {
      it('should combine 7-day streak multiplier with first lesson bonus', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0); // First lesson today
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) * 1.2 = 120, + 50 (first lesson) = 170
        expect(result.xpEarned).toBe(170);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.2);
        expect(result.xpBreakdown.firstLessonBonus).toBe(50);
        expect(result.appliedBonuses).toContain('7-day streak bonus (1.2x)');
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
      });

      it('should combine 30-day streak multiplier with first lesson bonus', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0); // First lesson today
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 30 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        // 100 (base) * 1.5 = 150, + 50 (first lesson) = 200
        expect(result.xpEarned).toBe(200);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.5);
        expect(result.xpBreakdown.firstLessonBonus).toBe(50);
        expect(result.appliedBonuses).toContain('30-day streak bonus (1.5x)');
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
      });

      it('should apply multipliers to speed and quiz bonuses', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 300; // Fast completion -> speed bonus
        const quizScore = 100; // Perfect quiz
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

        // (100 base + 25 speed + 50 quiz) * 1.2 = 175 * 1.2 = 210
        expect(result.xpEarned).toBe(210);
        expect(result.xpBreakdown.base).toBe(100);
        expect(result.xpBreakdown.speedBonus).toBe(25);
        expect(result.xpBreakdown.quizBonus).toBe(50);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.2);
        expect(result.appliedBonuses).toContain('7-day streak bonus (1.2x)');
      });

      it('should combine all bonuses: speed, quiz, streak, and first lesson', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 300; // Fast completion -> speed bonus
        const quizScore = 100; // Perfect quiz
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0); // First lesson today
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 30 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds, quizScore);

        // (100 base + 25 speed + 50 quiz) * 1.5 = 175 * 1.5 = 262.5 -> 262 (floor)
        // + 50 first lesson = 312
        expect(result.xpEarned).toBe(312);
        expect(result.xpBreakdown.base).toBe(100);
        expect(result.xpBreakdown.speedBonus).toBe(25);
        expect(result.xpBreakdown.quizBonus).toBe(50);
        expect(result.xpBreakdown.streakMultiplier).toBe(1.5);
        expect(result.xpBreakdown.firstLessonBonus).toBe(50);
        expect(result.appliedBonuses).toContain('30-day streak bonus (1.5x)');
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
      });
    });

    describe('Response format with appliedBonuses', () => {
      it('should return appliedBonuses array in response', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(0);
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 7 });
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        expect(result).toHaveProperty('appliedBonuses');
        expect(Array.isArray(result.appliedBonuses)).toBe(true);
        expect(result.appliedBonuses.length).toBeGreaterThan(0);
      });

      it('should return empty appliedBonuses when no bonuses applied', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.count.mockResolvedValue(1); // Not first lesson
        mockPrismaService.userProgress.findUnique.mockResolvedValue({ currentStreak: 3 }); // No streak multiplier
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        expect(result.appliedBonuses).toEqual([]);
      });

      it('should return enhanced xpBreakdown with all fields', async () => {
        const userId = 'user-id-1';
        const lessonId = 'lesson-id-1';
        const timeSpentSeconds = 1000;
        mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
        mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
        mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
        mockPrismaService.userProgress.update.mockResolvedValue({});
        mockUsersService.addXp.mockResolvedValue({});
        mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

        const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

        expect(result.xpBreakdown).toHaveProperty('base');
        expect(result.xpBreakdown).toHaveProperty('streakMultiplier');
        expect(result.xpBreakdown).toHaveProperty('firstLessonBonus');
        expect(result.xpBreakdown).toHaveProperty('quizBonus');
        expect(result.xpBreakdown).toHaveProperty('speedBonus');
        expect(result.xpBreakdown).toHaveProperty('total');
      });
    });
  });
});
