import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeCategory } from '@prisma/client';

describe('BadgesService', () => {
  let service: BadgesService;
  let prismaService: PrismaService;

  const mockBadge1 = {
    id: 'badge-1',
    slug: 'first-lesson',
    name: 'Primer Paso',
    description: 'Completaste tu primera lección',
    icon: '🎯',
    category: BadgeCategory.progress,
    requirement: { lessonsCompleted: 1 },
    xpBonus: 50,
    isSecret: false,
    createdAt: new Date('2024-01-01'),
  };

  const mockBadge2 = {
    id: 'badge-2',
    slug: 'streak-3',
    name: 'En Racha',
    description: '3 días consecutivos',
    icon: '⚡',
    category: BadgeCategory.streak,
    requirement: { streak: 3 },
    xpBonus: 25,
    isSecret: false,
    createdAt: new Date('2024-01-02'),
  };

  const mockBadge3 = {
    id: 'badge-3',
    slug: 'level-5',
    name: 'Nivel 5',
    description: 'Alcanzaste nivel 5',
    icon: '🧭',
    category: BadgeCategory.progress,
    requirement: { level: 5 },
    xpBonus: 100,
    isSecret: false,
    createdAt: new Date('2024-01-03'),
  };

  const mockSecretBadge = {
    id: 'badge-secret',
    slug: 'secret-badge',
    name: 'Secreto',
    description: 'Badge secreto',
    icon: '🔒',
    category: BadgeCategory.special,
    requirement: { special: true },
    xpBonus: 500,
    isSecret: true,
    createdAt: new Date('2024-01-04'),
  };

  const mockUserBadge1 = {
    id: 'user-badge-1',
    userId: 'user-1',
    badgeId: 'badge-1',
    earnedAt: new Date('2024-02-01'),
    badge: mockBadge1,
  };

  const mockUserProgress = {
    id: 'progress-1',
    userId: 'user-1',
    totalXp: 500,
    level: 3,
    levelTitle: 'Prompt Apprentice',
    currentStreak: 5,
    longestStreak: 10,
    lessonsCompleted: 5,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    badge: {
      findMany: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    userProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all non-secret badges with earned/locked status', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2, mockBadge3]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1]);

      const result = await service.findAll(userId);

      expect(prismaService.badge.findMany).toHaveBeenCalledWith({
        where: { isSecret: false },
        orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
      });
      expect(prismaService.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      });

      expect(result.earned).toHaveLength(1);
      expect(result.earned[0]).toMatchObject({
        id: 'badge-1',
        slug: 'first-lesson',
        name: 'Primer Paso',
        xpBonus: 50,
        earnedAt: mockUserBadge1.earnedAt,
      });

      expect(result.locked).toHaveLength(2);
      expect(result.locked).toContainEqual(
        expect.objectContaining({
          id: 'badge-2',
          slug: 'streak-3',
          requirement: { streak: 3 },
        }),
      );
    });

    it('should return all badges as locked when user has no badges', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result.earned).toHaveLength(0);
      expect(result.locked).toHaveLength(2);
    });

    it('should return all badges as earned when user has all badges', async () => {
      const userId = 'user-1';
      const userBadge2 = { ...mockUserBadge1, id: 'ub-2', badgeId: 'badge-2', badge: mockBadge2 };
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1, userBadge2]);

      const result = await service.findAll(userId);

      expect(result.earned).toHaveLength(2);
      expect(result.locked).toHaveLength(0);
    });

    it('should not include secret badges in the list', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      await service.findAll(userId);

      expect(prismaService.badge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isSecret: false },
        }),
      );
    });

    it('should order earned badges by earnedAt descending', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1]);

      await service.findAll(userId);

      expect(prismaService.userBadge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { earnedAt: 'desc' },
        }),
      );
    });

    it('should include all badge properties in response', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1]);

      const result = await service.findAll(userId);

      expect(result.earned[0]).toHaveProperty('id');
      expect(result.earned[0]).toHaveProperty('slug');
      expect(result.earned[0]).toHaveProperty('name');
      expect(result.earned[0]).toHaveProperty('description');
      expect(result.earned[0]).toHaveProperty('icon');
      expect(result.earned[0]).toHaveProperty('category');
      expect(result.earned[0]).toHaveProperty('xpBonus');
      expect(result.earned[0]).toHaveProperty('earnedAt');
    });

    it('should include requirement in locked badges', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result.locked[0]).toHaveProperty('requirement');
      expect(result.locked[0].requirement).toEqual({ lessonsCompleted: 1 });
    });
  });

  describe('findUserBadges', () => {
    it('should return only earned badges for a user', async () => {
      const userId = 'user-1';
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1]);

      const result = await service.findUserBadges(userId);

      expect(prismaService.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'badge-1',
        slug: 'first-lesson',
        name: 'Primer Paso',
        earnedAt: mockUserBadge1.earnedAt,
      });
    });

    it('should return empty array when user has no badges', async () => {
      const userId = 'user-1';
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.findUserBadges(userId);

      expect(result).toEqual([]);
    });

    it('should include earnedAt timestamp for each badge', async () => {
      const userId = 'user-1';
      mockPrismaService.userBadge.findMany.mockResolvedValue([mockUserBadge1]);

      const result = await service.findUserBadges(userId);

      expect(result[0].earnedAt).toBeDefined();
      expect(result[0].earnedAt).toEqual(mockUserBadge1.earnedAt);
    });

    it('should return multiple badges ordered by earnedAt', async () => {
      const userId = 'user-1';
      const userBadge2 = {
        ...mockUserBadge1,
        id: 'ub-2',
        badgeId: 'badge-2',
        badge: mockBadge2,
        earnedAt: new Date('2024-02-02'),
      };
      mockPrismaService.userBadge.findMany.mockResolvedValue([userBadge2, mockUserBadge1]);

      const result = await service.findUserBadges(userId);

      expect(result).toHaveLength(2);
      expect(result[0].earnedAt).toEqual(userBadge2.earnedAt);
      expect(result[1].earnedAt).toEqual(mockUserBadge1.earnedAt);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should return empty array when user has no progress', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toEqual([]);
      expect(prismaService.badge.findMany).not.toHaveBeenCalled();
    });

    it('should award badge when lessonsCompleted requirement is met', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue(mockUserBadge1);
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId, badgeId: 'badge-1' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockBadge1);
    });

    it('should award badge when streak requirement is met', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue({
        ...mockUserBadge1,
        badgeId: 'badge-2',
      });
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId, badgeId: 'badge-2' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockBadge2);
    });

    it('should award badge when level requirement is met', async () => {
      const userId = 'user-1';
      const progressLevel5 = { ...mockUserProgress, level: 5 };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(progressLevel5);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge3]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue({
        ...mockUserBadge1,
        badgeId: 'badge-3',
      });
      mockPrismaService.userProgress.update.mockResolvedValue(progressLevel5);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId, badgeId: 'badge-3' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockBadge3);
    });

    it('should award badge when totalXp requirement is met', async () => {
      const userId = 'user-1';
      const xpBadge = {
        ...mockBadge1,
        id: 'badge-xp',
        slug: 'xp-1000',
        requirement: { totalXp: 500 },
      };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([xpBadge]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue({
        ...mockUserBadge1,
        badgeId: 'badge-xp',
      });
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(xpBadge);
    });

    it('should not award badge when requirement is not met', async () => {
      const userId = 'user-1';
      const lowProgress = { ...mockUserProgress, lessonsCompleted: 0 };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(lowProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should not award badge that is already earned', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([{ badgeId: 'badge-1' }]);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should award XP bonus when badge has xpBonus', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue(mockUserBadge1);
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      await service.checkAndAwardBadges(userId);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId },
        data: { totalXp: { increment: 50 } },
      });
    });

    it('should not update XP when badge has no xpBonus', async () => {
      const userId = 'user-1';
      const badgeNoXp = { ...mockBadge1, xpBonus: 0 };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([badgeNoXp]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue(mockUserBadge1);

      await service.checkAndAwardBadges(userId);

      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should award multiple badges when multiple requirements are met', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create
        .mockResolvedValueOnce(mockUserBadge1)
        .mockResolvedValueOnce({ ...mockUserBadge1, badgeId: 'badge-2' });
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(prismaService.userBadge.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should check all badges in the database', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([
        mockBadge1,
        mockBadge2,
        mockBadge3,
        mockSecretBadge,
      ]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      await service.checkAndAwardBadges(userId);

      expect(prismaService.badge.findMany).toHaveBeenCalled();
    });

    it('should handle badge with threshold exactly met', async () => {
      const userId = 'user-1';
      const exactProgress = { ...mockUserProgress, lessonsCompleted: 1 };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(exactProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue(mockUserBadge1);
      mockPrismaService.userProgress.update.mockResolvedValue(exactProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toHaveLength(1);
    });

    it('should handle badge with threshold exceeded', async () => {
      const userId = 'user-1';
      const exceededProgress = { ...mockUserProgress, lessonsCompleted: 10 };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(exceededProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.create.mockResolvedValue(mockUserBadge1);
      mockPrismaService.userProgress.update.mockResolvedValue(exceededProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toHaveLength(1);
    });

    it('should return newly awarded badges only', async () => {
      const userId = 'user-1';
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1, mockBadge2]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([{ badgeId: 'badge-1' }]);
      mockPrismaService.userBadge.create.mockResolvedValue({
        ...mockUserBadge1,
        badgeId: 'badge-2',
      });
      mockPrismaService.userProgress.update.mockResolvedValue(mockUserProgress);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('badge-2');
    });
  });

  describe('edge cases', () => {
    it('should handle empty badge list', async () => {
      const userId = 'user-1';
      mockPrismaService.badge.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result.earned).toEqual([]);
      expect(result.locked).toEqual([]);
    });

    it('should handle badge with undefined requirement fields', async () => {
      const userId = 'user-1';
      const badgeEmptyReq = { ...mockBadge1, requirement: {} };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockUserProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([badgeEmptyReq]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toEqual([]);
    });

    it('should handle user with zero progress values', async () => {
      const userId = 'user-1';
      const zeroProgress = {
        ...mockUserProgress,
        lessonsCompleted: 0,
        currentStreak: 0,
        level: 1,
        totalXp: 0,
      };
      mockPrismaService.userProgress.findUnique.mockResolvedValue(zeroProgress);
      mockPrismaService.badge.findMany.mockResolvedValue([mockBadge1]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.checkAndAwardBadges(userId);

      expect(result).toEqual([]);
    });
  });
});
