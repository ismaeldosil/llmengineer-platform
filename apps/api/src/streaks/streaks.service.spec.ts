import { Test, TestingModule } from '@nestjs/testing';
import { StreaksService } from './streaks.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';

describe('StreaksService', () => {
  let service: StreaksService;
  let prismaService: PrismaService;
  let badgesService: BadgesService;

  const mockUserId = 'user-123';
  const baseDate = new Date('2024-01-15T12:00:00Z');

  const mockProgress = {
    id: 'progress-1',
    userId: mockUserId,
    totalXp: 500,
    level: 2,
    levelTitle: 'Prompt Apprentice',
    currentStreak: 5,
    longestStreak: 10,
    lessonsCompleted: 3,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    streakLog: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockBadgesService = {
    checkAndAwardBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreaksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BadgesService,
          useValue: mockBadgesService,
        },
      ],
    }).compile();

    service = module.get<StreaksService>(StreaksService);
    prismaService = module.get<PrismaService>(PrismaService);
    badgesService = module.get<BadgesService>(BadgesService);

    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(baseDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkin', () => {
    it('should return existing streak when user already checked in today', async () => {
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

      expect(prismaService.streakLog.findUnique).toHaveBeenCalledWith({
        where: {
          userId_date: { userId: mockUserId, date: today },
        },
      });

      expect(prismaService.streakLog.create).not.toHaveBeenCalled();
      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should increment streak when user checked in yesterday', async () => {
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
        totalXp: 510,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result).toEqual({
        currentStreak: 6,
        streakBonusXp: 10,
        alreadyCheckedIn: false,
      });

      expect(prismaService.streakLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          date: today,
          bonusXp: 10,
        },
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

      expect(badgesService.checkAndAwardBadges).toHaveBeenCalledWith(mockUserId);
    });

    it('should reset streak to 1 when user missed yesterday', async () => {
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
        totalXp: 505,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

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
        .mockResolvedValueOnce(null) // No checkin today
        .mockResolvedValueOnce({
          // Yesterday checkin
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
        totalXp: 510,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

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

    it('should not update longestStreak when current is lower', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const progressWithHigherLongest = {
        ...mockProgress,
        currentStreak: 3,
        longestStreak: 20,
      };

      mockPrismaService.streakLog.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 'log-1',
        userId: mockUserId,
        date: yesterday,
        checkedIn: true,
        bonusXp: 10,
      });

      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressWithHigherLongest);

      const updatedProgress = {
        ...progressWithHigherLongest,
        currentStreak: 4,
        longestStreak: 20,
        totalXp: 510,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await service.checkin(mockUserId);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          currentStreak: 4,
          longestStreak: 20,
          totalXp: { increment: 10 },
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it('should handle null progress gracefully', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const newProgress = {
        id: 'new-progress',
        userId: mockUserId,
        totalXp: 5,
        level: 1,
        levelTitle: 'Prompt Curious',
        currentStreak: 1,
        longestStreak: 1,
        lessonsCompleted: 0,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.userProgress.update.mockResolvedValue(newProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.streakBonusXp).toBe(5);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should return 5 XP for streak 1-2 days', () => {
      const service = new StreaksService(prismaService, badgesService);
      expect(service['calculateStreakBonus'](1)).toBe(5);
      expect(service['calculateStreakBonus'](2)).toBe(5);
    });

    it('should return 10 XP for streak 3-6 days', () => {
      const service = new StreaksService(prismaService, badgesService);
      expect(service['calculateStreakBonus'](3)).toBe(10);
      expect(service['calculateStreakBonus'](4)).toBe(10);
      expect(service['calculateStreakBonus'](5)).toBe(10);
      expect(service['calculateStreakBonus'](6)).toBe(10);
    });

    it('should return 25 XP for streak 7-13 days', () => {
      const service = new StreaksService(prismaService, badgesService);
      expect(service['calculateStreakBonus'](7)).toBe(25);
      expect(service['calculateStreakBonus'](10)).toBe(25);
      expect(service['calculateStreakBonus'](13)).toBe(25);
    });

    it('should return 50 XP for streak 14-29 days', () => {
      const service = new StreaksService(prismaService, badgesService);
      expect(service['calculateStreakBonus'](14)).toBe(50);
      expect(service['calculateStreakBonus'](20)).toBe(50);
      expect(service['calculateStreakBonus'](29)).toBe(50);
    });

    it('should return 100 XP for streak 30+ days', () => {
      const service = new StreaksService(prismaService, badgesService);
      expect(service['calculateStreakBonus'](30)).toBe(100);
      expect(service['calculateStreakBonus'](50)).toBe(100);
      expect(service['calculateStreakBonus'](100)).toBe(100);
    });
  });

  describe('checkin - edge cases', () => {
    it('should handle checkin at midnight', async () => {
      const midnight = new Date('2024-01-15T00:00:00Z');
      jest.setSystemTime(midnight);

      const today = new Date(midnight);
      today.setHours(0, 0, 0, 0);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const updatedProgress = {
        ...mockProgress,
        currentStreak: 1,
        totalXp: 505,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.alreadyCheckedIn).toBe(false);
      expect(prismaService.streakLog.create).toHaveBeenCalled();
    });

    it('should handle checkin at end of day', async () => {
      const endOfDay = new Date('2024-01-15T23:59:59Z');
      jest.setSystemTime(endOfDay);

      const today = new Date(endOfDay);
      today.setHours(0, 0, 0, 0);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);

      const updatedProgress = {
        ...mockProgress,
        currentStreak: 1,
        totalXp: 505,
      };

      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      const result = await service.checkin(mockUserId);

      expect(result.alreadyCheckedIn).toBe(false);
      expect(prismaService.streakLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          date: today,
          bonusXp: 5,
        },
      });
    });

    it('should call badgesService after successful checkin', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);
      mockPrismaService.userProgress.update.mockResolvedValue(mockProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await service.checkin(mockUserId);

      expect(badgesService.checkAndAwardBadges).toHaveBeenCalledTimes(1);
      expect(badgesService.checkAndAwardBadges).toHaveBeenCalledWith(mockUserId);
    });

    it('should update lastActiveAt with current timestamp', async () => {
      const today = new Date(baseDate);
      today.setHours(0, 0, 0, 0);

      mockPrismaService.streakLog.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);
      mockPrismaService.userProgress.update.mockResolvedValue(mockProgress);
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

      await service.checkin(mockUserId);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastActiveAt: expect.any(Date),
          }),
        })
      );
    });

    it('should handle first ever checkin correctly', async () => {
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
      mockBadgesService.checkAndAwardBadges.mockResolvedValue([]);

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
  });
});
