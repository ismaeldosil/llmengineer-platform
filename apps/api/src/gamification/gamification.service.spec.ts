import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const baseDate = new Date('2024-01-15T12:00:00Z');

  const mockProgress = {
    id: 'progress-1',
    userId: mockUserId,
    totalXp: 600,
    level: 2,
    levelTitle: 'Prompt Apprentice',
    currentStreak: 5,
    longestStreak: 10,
    lessonsCompleted: 3,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBadge = {
    id: 'badge-1',
    slug: 'first-lesson',
    name: 'First Lesson',
    description: 'Complete your first lesson',
    icon: 'trophy',
    category: 'completion' as const,
    requirement: { lessonsCompleted: 1 },
    xpBonus: 50,
    isSecret: false,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    userProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    streakLog: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    badge: {
      findMany: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(baseDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(service.calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for 499 XP', () => {
      expect(service.calculateLevel(499)).toBe(1);
    });

    it('should return level 2 for exactly 500 XP', () => {
      expect(service.calculateLevel(500)).toBe(2);
    });

    it('should return correct level for high XP values', () => {
      expect(service.calculateLevel(1000)).toBe(3); // 1000 / 500 = 2, +1 = 3
      expect(service.calculateLevel(2500)).toBe(6); // 2500 / 500 = 5, +1 = 6
      expect(service.calculateLevel(5000)).toBe(11); // 5000 / 500 = 10, +1 = 11
    });

    it('should handle edge cases', () => {
      expect(service.calculateLevel(501)).toBe(2);
      expect(service.calculateLevel(999)).toBe(2);
      expect(service.calculateLevel(1500)).toBe(4);
      expect(service.calculateLevel(4999)).toBe(10);
    });

    it('should handle negative XP correctly', () => {
      // calculateLevel with negative XP returns 0 (Math.floor(-100/500) + 1 = 0)
      expect(service.calculateLevel(-100)).toBe(0);
    });
  });

  describe('addXp', () => {
    it('should add XP to user', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const updatedProgress = {
        ...mockProgress,
        totalXp: 700,
        level: 2,
        levelTitle: 'Prompt Apprentice',
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.addXp(mockUserId, 100);

      expect(result).toEqual({
        ...updatedProgress,
        leveledUp: false,
        xpAdded: 100,
      });

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          totalXp: 700,
          level: 2,
          levelTitle: 'Prompt Apprentice',
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should detect level up correctly', async () => {
      const progress = {
        ...mockProgress,
        totalXp: 950,
        level: 2,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progress);

      const updatedProgress = {
        ...progress,
        totalXp: 1050,
        level: 3,
        levelTitle: 'Token Tinkerer',
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.addXp(mockUserId, 100);

      expect(result.leveledUp).toBe(true);
      expect(result.level).toBe(3);
      expect(result.levelTitle).toBe('Token Tinkerer');
    });

    it('should return new level info on level up', async () => {
      const progress = {
        ...mockProgress,
        totalXp: 450,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progress);

      const updatedProgress = {
        ...progress,
        totalXp: 550,
        level: 2,
        levelTitle: 'Prompt Apprentice',
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.addXp(mockUserId, 100);

      expect(result.leveledUp).toBe(true);
      expect(result.level).toBe(2);
      expect(result.levelTitle).toBe('Prompt Apprentice');
      expect(result.totalXp).toBe(550);
      expect(result.xpAdded).toBe(100);
    });

    it('should not level up if not enough XP', async () => {
      const progress = {
        ...mockProgress,
        totalXp: 400,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progress);

      const updatedProgress = {
        ...progress,
        totalXp: 450,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.addXp(mockUserId, 50);

      expect(result.leveledUp).toBe(false);
      expect(result.level).toBe(1);
      expect(result.totalXp).toBe(450);
    });

    it('should return null if user progress not found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.addXp(mockUserId, 100);

      expect(result).toBeNull();
      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should handle multiple level ups with large XP gain', async () => {
      const progress = {
        ...mockProgress,
        totalXp: 400,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progress);

      const updatedProgress = {
        ...progress,
        totalXp: 1400,
        level: 3,
        levelTitle: 'Token Tinkerer',
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.addXp(mockUserId, 1000);

      expect(result.leveledUp).toBe(true);
      expect(result.level).toBe(3);
      expect(result.xpAdded).toBe(1000);
    });

    it('should update lastActiveAt timestamp', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);
      mockPrismaService.userProgress.update.mockResolvedValue(mockProgress);

      await service.addXp(mockUserId, 50);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastActiveAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('checkin', () => {
    it('should continue streak if check-in yesterday', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null) // No checkin today
        .mockResolvedValueOnce({
          // Yesterday checkin exists
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 10,
        });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const updatedProgress = {
        ...mockProgress,
        currentStreak: 6,
        longestStreak: 10,
        totalXp: 610,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result).toEqual({
        currentStreak: 6,
        streakBonusXp: 10,
        alreadyCheckedIn: false,
      });

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          currentStreak: 6,
          longestStreak: 10,
          totalXp: { increment: 10 },
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should reset streak if more than 1 day without check-in', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null) // No checkin today
        .mockResolvedValueOnce(null); // No checkin yesterday

      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const updatedProgress = {
        ...mockProgress,
        currentStreak: 1,
        longestStreak: 10,
        totalXp: 605,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result).toEqual({
        currentStreak: 1,
        streakBonusXp: 5,
        alreadyCheckedIn: false,
      });

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          currentStreak: 1,
          longestStreak: 10,
          totalXp: { increment: 5 },
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should start streak at 1 for first check-in', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const newUserProgress = {
        ...mockProgress,
        currentStreak: 0,
        longestStreak: 0,
        totalXp: 0,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrismaService.userProgress.findUnique.mockResolvedValue(newUserProgress);

      const updatedProgress = {
        ...newUserProgress,
        currentStreak: 1,
        longestStreak: 1,
        totalXp: 5,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result).toEqual({
        currentStreak: 1,
        streakBonusXp: 5,
        alreadyCheckedIn: false,
      });

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          totalXp: { increment: 5 },
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should not allow multiple check-ins same day', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      mockPrismaService.streakLog.findUnique.mockResolvedValueOnce({
        id: 'log-1',
        userId: mockUserId,
        date: today,
        checkedIn: true,
        bonusXp: 10,
      });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const result = await service.checkin(mockUserId);

      expect(result).toEqual({
        currentStreak: 5,
        streakBonusXp: 0,
        alreadyCheckedIn: true,
      });

      expect(prismaService.streakLog.create).not.toHaveBeenCalled();
      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should award streak badges', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWith2Streak = {
        ...mockProgress,
        currentStreak: 2,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 5,
        });

      const updatedProgress = {
        ...progressWith2Streak,
        currentStreak: 3,
        totalXp: 610,
      };

      // First call returns old progress, second call (in checkAndAwardBadges) returns updated
      mockPrismaService.userProgress.findUnique
        .mockResolvedValueOnce(progressWith2Streak)
        .mockResolvedValueOnce(updatedProgress);

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const streakBadge = {
        ...mockBadge,
        slug: 'streak-3',
        name: '3 Day Streak',
        requirement: { streak: 3 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([streakBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      await service.checkin(mockUserId);

      expect(prismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId: mockUserId, badgeId: streakBadge.id },
      });
    });

    it('should update longestStreak when current exceeds it', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWithLowerLongest = {
        ...mockProgress,
        currentStreak: 10,
        longestStreak: 10,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 10,
        });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithLowerLongest);

      const updatedProgress = {
        ...progressWithLowerLongest,
        currentStreak: 11,
        longestStreak: 11,
        totalXp: 625,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.currentStreak).toBe(11);
      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          currentStreak: 11,
          longestStreak: 11,
          totalXp: { increment: 25 },
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should calculate correct bonus for 7 day streak', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWith6Streak = {
        ...mockProgress,
        currentStreak: 6,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 10,
        });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWith6Streak);

      const updatedProgress = {
        ...progressWith6Streak,
        currentStreak: 7,
        totalXp: 625,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.streakBonusXp).toBe(25);
    });

    it('should calculate correct bonus for 14 day streak', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWith13Streak = {
        ...mockProgress,
        currentStreak: 13,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 25,
        });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWith13Streak);

      const updatedProgress = {
        ...progressWith13Streak,
        currentStreak: 14,
        totalXp: 650,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.streakBonusXp).toBe(50);
    });

    it('should calculate correct bonus for 30 day streak', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWith29Streak = {
        ...mockProgress,
        currentStreak: 29,
      };

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'log-1',
          userId: mockUserId,
          date: yesterday,
          checkedIn: true,
          bonusXp: 50,
        });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWith29Streak);

      const updatedProgress = {
        ...progressWith29Streak,
        currentStreak: 30,
        totalXp: 700,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.streakBonusXp).toBe(100);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should award correct badges based on requirements', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const lessonBadge = {
        ...mockBadge,
        slug: 'three-lessons',
        name: 'Three Lessons',
        requirement: { lessonsCompleted: 3 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([lessonBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('three-lessons');
      expect(prismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId: mockUserId, badgeId: lessonBadge.id },
      });
    });

    it('should not award already earned badges', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const lessonBadge = {
        ...mockBadge,
        slug: 'first-lesson',
        requirement: { lessonsCompleted: 1 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([lessonBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([
        { badgeId: lessonBadge.id },
      ]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(0);
      expect(prismaService.userBadge.create).not.toHaveBeenCalled();
    });

    it('should award multiple badges if eligible', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const badge1 = {
        ...mockBadge,
        id: 'badge-1',
        slug: 'one-lesson',
        requirement: { lessonsCompleted: 1 },
      };

      const badge2 = {
        ...mockBadge,
        id: 'badge-2',
        slug: 'three-lessons',
        requirement: { lessonsCompleted: 3 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([badge1, badge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(2);
      expect(prismaService.userBadge.create).toHaveBeenCalledTimes(2);
    });

    it('should handle lesson completion badges', async () => {
      const progressWithLessons = {
        ...mockProgress,
        lessonsCompleted: 5,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithLessons);

      const lessonBadge = {
        ...mockBadge,
        requirement: { lessonsCompleted: 5 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([lessonBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(1);
      expect(prismaService.userBadge.create).toHaveBeenCalled();
    });

    it('should handle streak badges', async () => {
      const progressWithStreak = {
        ...mockProgress,
        currentStreak: 7,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithStreak);

      const streakBadge = {
        ...mockBadge,
        requirement: { streak: 7 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([streakBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(1);
      expect(prismaService.userBadge.create).toHaveBeenCalled();
    });

    it('should handle XP milestone badges', async () => {
      const progressWithHighXp = {
        ...mockProgress,
        totalXp: 1000,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithHighXp);

      const xpBadge = {
        ...mockBadge,
        requirement: { totalXp: 1000 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([xpBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(1);
      expect(prismaService.userBadge.create).toHaveBeenCalled();
    });

    it('should award XP bonus when badge has xpBonus', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const badgeWithBonus = {
        ...mockBadge,
        xpBonus: 50,
        requirement: { lessonsCompleted: 3 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([badgeWithBonus]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      await service.checkAndAwardBadges(mockUserId);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: { totalXp: { increment: 50 } },
      });
    });

    it('should not award XP bonus when badge has no xpBonus', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const badgeWithoutBonus = {
        ...mockBadge,
        xpBonus: 0,
        requirement: { lessonsCompleted: 3 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([badgeWithoutBonus]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      await service.checkAndAwardBadges(mockUserId);

      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should return empty array if no progress found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toEqual([]);
      expect(prismaService.badge.findMany).not.toHaveBeenCalled();
    });

    it('should handle level requirement badges', async () => {
      const progressWithLevel = {
        ...mockProgress,
        level: 5,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithLevel);

      const levelBadge = {
        ...mockBadge,
        requirement: { level: 5 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([levelBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(1);
      expect(prismaService.userBadge.create).toHaveBeenCalled();
    });

    it('should not award badge if requirement not met', async () => {
      const progressWithFewLessons = {
        ...mockProgress,
        lessonsCompleted: 2,
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithFewLessons);

      const lessonBadge = {
        ...mockBadge,
        requirement: { lessonsCompleted: 5 },
      };

      mockPrismaService.badge.findMany.mockResolvedValue([lessonBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(mockUserId);

      expect(result).toHaveLength(0);
      expect(prismaService.userBadge.create).not.toHaveBeenCalled();
    });
  });

  describe('getProgress', () => {
    it('should return user progress', async () => {
      const progressWithUser = {
        ...mockProgress,
        user: {
          id: mockUserId,
          email: 'test@example.com',
          displayName: 'Test User',
          badges: [
            {
              id: 'user-badge-1',
              earnedAt: new Date(),
              badge: {
                id: 'badge-1',
                name: 'First Lesson',
                icon: 'trophy',
              },
            },
          ],
        },
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithUser);

      const result = await service.getProgress(mockUserId);

      expect(result).toEqual({
        totalXp: 600,
        level: 2,
        levelTitle: 'Prompt Apprentice',
        currentStreak: 5,
        longestStreak: 10,
        lessonsCompleted: 3,
        xpToNextLevel: 400, // 1000 (level 2 * 500) - 600
        xpInCurrentLevel: 100, // 600 % 500
        badges: [
          {
            id: 'badge-1',
            name: 'First Lesson',
            icon: 'trophy',
            earnedAt: expect.any(Date),
          },
        ],
      });
    });

    it('should calculate XP to next level correctly', async () => {
      const progressAtLevel1 = {
        ...mockProgress,
        totalXp: 250,
        level: 1,
        user: {
          id: mockUserId,
          badges: [],
        },
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressAtLevel1);

      const result = await service.getProgress(mockUserId);

      expect(result.xpToNextLevel).toBe(250); // 500 (level 1 * 500) - 250
      expect(result.xpInCurrentLevel).toBe(250); // 250 % 500
    });

    it('should return null if progress not found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.getProgress(mockUserId);

      expect(result).toBeNull();
    });

    it('should handle user with no badges', async () => {
      const progressWithNoBadges = {
        ...mockProgress,
        user: {
          id: mockUserId,
          badges: [],
        },
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithNoBadges);

      const result = await service.getProgress(mockUserId);

      expect(result.badges).toEqual([]);
    });

    it('should calculate progress for user at exact level boundary', async () => {
      const progressAtBoundary = {
        ...mockProgress,
        totalXp: 1000, // Exactly level 3 (1000 / 500 + 1 = 3)
        level: 3,
        user: {
          id: mockUserId,
          badges: [],
        },
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressAtBoundary);

      const result = await service.getProgress(mockUserId);

      expect(result.xpInCurrentLevel).toBe(0); // 1000 % 500
      expect(result.xpToNextLevel).toBe(500); // 1500 (level 3 * 500) - 1000
    });
  });
});
