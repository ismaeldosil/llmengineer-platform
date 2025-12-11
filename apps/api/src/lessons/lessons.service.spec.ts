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
    },
    userProgress: {
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
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([
        { lessonId: 'lesson-id-1' },
      ]);

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
        }),
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
          OR: [
            { id: lessonId },
            { slug: lessonId },
          ],
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
          OR: [
            { id: slug },
            { slug: slug },
          ],
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
        'Lección no encontrada',
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
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(prismaService.lessonCompletion.create).toHaveBeenCalledWith({
        data: {
          userId,
          lessonId,
          timeSpentSeconds,
          xpEarned: mockLesson.xpReward,
        },
      });
      expect(result).toEqual({
        lessonId,
        xpEarned: mockLesson.xpReward,
        completedAt: mockCompletion.completedAt,
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
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue(mockCompletion);
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(usersService.addXp).toHaveBeenCalledWith(userId, mockLesson.xpReward);
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

      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow(NotFoundException);
      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow('Lección no encontrada');
    });

    it('should throw ConflictException when lesson is already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow(ConflictException);
      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow('Lección ya completada');

      // Should not create duplicate completion
      expect(prismaService.lessonCompletion.create).not.toHaveBeenCalled();
    });

    it('should not increment lessonsCompleted if already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow(ConflictException);

      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should not award XP if lesson already completed', async () => {
      const userId = 'user-id-1';
      const lessonId = 'lesson-id-1';
      const timeSpentSeconds = 300;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(mockCompletion);

      await expect(
        lessonsService.complete(lessonId, userId, timeSpentSeconds),
      ).rejects.toThrow(ConflictException);

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
      const timeSpentSeconds = 600;
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson2);
      mockPrismaService.lessonCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.lessonCompletion.create.mockResolvedValue({
        ...mockCompletion,
        xpEarned: mockLesson2.xpReward,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, timeSpentSeconds);

      expect(result.xpEarned).toBe(200);
      expect(usersService.addXp).toHaveBeenCalledWith(userId, 200);
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
      expect(callOrder).toEqual([
        'create_completion',
        'update_progress',
        'add_xp',
        'check_badges',
      ]);
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
        xpEarned: 0,
      });
      mockPrismaService.userProgress.update.mockResolvedValue({});
      mockUsersService.addXp.mockResolvedValue({});
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await lessonsService.complete(lessonId, userId, 300);

      expect(result.xpEarned).toBe(0);
      expect(usersService.addXp).toHaveBeenCalledWith(userId, 0);
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
  });
});
