import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BadgeCategory } from '@prisma/client';

describe('BadgesController', () => {
  let controller: BadgesController;
  let badgesService: BadgesService;

  const mockUser = { id: 'user-1' };

  const mockEarnedBadge = {
    id: 'badge-1',
    slug: 'first-lesson',
    name: 'Primer Paso',
    description: 'Completaste tu primera lección',
    icon: '🎯',
    category: BadgeCategory.progress,
    xpBonus: 50,
    earnedAt: new Date('2024-02-01'),
  };

  const mockLockedBadge = {
    id: 'badge-2',
    slug: 'streak-3',
    name: 'En Racha',
    description: '3 días consecutivos',
    icon: '⚡',
    category: BadgeCategory.streak,
    requirement: { streak: 3 },
  };

  const mockBadgesService = {
    findAll: jest.fn(),
    findUserBadges: jest.fn(),
    checkAndAwardBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [
        {
          provide: BadgesService,
          useValue: mockBadgesService,
        },
      ],
    }).compile();

    controller = module.get<BadgesController>(BadgesController);
    badgesService = module.get<BadgesService>(BadgesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all badges with earned/locked status', async () => {
      const mockResponse = {
        earned: [mockEarnedBadge],
        locked: [mockLockedBadge],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(badgesService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return empty arrays when user has no badges', async () => {
      const mockResponse = {
        earned: [],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned).toEqual([]);
      expect(result.locked).toEqual([]);
    });

    it('should call service with correct user ID', async () => {
      const differentUser = { id: 'user-2' };
      mockBadgesService.findAll.mockResolvedValue({ earned: [], locked: [] });

      await controller.findAll(differentUser);

      expect(badgesService.findAll).toHaveBeenCalledWith('user-2');
    });

    it('should return multiple earned badges', async () => {
      const mockResponse = {
        earned: [mockEarnedBadge, { ...mockEarnedBadge, id: 'badge-3' }],
        locked: [mockLockedBadge],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned).toHaveLength(2);
      expect(result.locked).toHaveLength(1);
    });

    it('should return multiple locked badges', async () => {
      const mockResponse = {
        earned: [mockEarnedBadge],
        locked: [mockLockedBadge, { ...mockLockedBadge, id: 'badge-4' }],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned).toHaveLength(1);
      expect(result.locked).toHaveLength(2);
    });

    it('should include all earned badge properties', async () => {
      const mockResponse = {
        earned: [mockEarnedBadge],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

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
      const mockResponse = {
        earned: [],
        locked: [mockLockedBadge],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.locked[0]).toHaveProperty('requirement');
      expect(result.locked[0].requirement).toEqual({ streak: 3 });
    });

    it('should handle service errors gracefully', async () => {
      mockBadgesService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll(mockUser)).rejects.toThrow('Database error');
    });

    it('should return all badge categories', async () => {
      const mockResponse = {
        earned: [
          { ...mockEarnedBadge, category: BadgeCategory.progress },
          { ...mockEarnedBadge, id: 'badge-2', category: BadgeCategory.streak },
          { ...mockEarnedBadge, id: 'badge-3', category: BadgeCategory.mastery },
        ],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      const categories = result.earned.map((b) => b.category);
      expect(categories).toContain(BadgeCategory.progress);
      expect(categories).toContain(BadgeCategory.streak);
      expect(categories).toContain(BadgeCategory.mastery);
    });
  });

  describe('integration', () => {
    it('should handle user with all badges earned', async () => {
      const mockResponse = {
        earned: [
          mockEarnedBadge,
          { ...mockEarnedBadge, id: 'badge-2' },
          { ...mockEarnedBadge, id: 'badge-3' },
        ],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned.length).toBeGreaterThan(0);
      expect(result.locked.length).toBe(0);
    });

    it('should handle new user with no badges', async () => {
      const mockResponse = {
        earned: [],
        locked: [
          mockLockedBadge,
          { ...mockLockedBadge, id: 'badge-2' },
          { ...mockLockedBadge, id: 'badge-3' },
        ],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned.length).toBe(0);
      expect(result.locked.length).toBeGreaterThan(0);
    });

    it('should preserve badge order from service', async () => {
      const badge1 = { ...mockEarnedBadge, id: 'badge-1', name: 'First' };
      const badge2 = { ...mockEarnedBadge, id: 'badge-2', name: 'Second' };
      const badge3 = { ...mockEarnedBadge, id: 'badge-3', name: 'Third' };
      const mockResponse = {
        earned: [badge1, badge2, badge3],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned[0].name).toBe('First');
      expect(result.earned[1].name).toBe('Second');
      expect(result.earned[2].name).toBe('Third');
    });
  });

  describe('edge cases', () => {
    it('should handle user ID as empty string gracefully', async () => {
      const emptyUser = { id: '' };
      mockBadgesService.findAll.mockResolvedValue({ earned: [], locked: [] });

      await controller.findAll(emptyUser);

      expect(badgesService.findAll).toHaveBeenCalledWith('');
    });

    it('should handle very large badge lists', async () => {
      const largeBadgeList = Array.from({ length: 100 }, (_, i) => ({
        ...mockEarnedBadge,
        id: `badge-${i}`,
      }));
      const mockResponse = {
        earned: largeBadgeList,
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned).toHaveLength(100);
    });

    it('should handle badges with special characters in name', async () => {
      const specialBadge = {
        ...mockEarnedBadge,
        name: 'Badge with émojis 🎉 & special chars!',
      };
      const mockResponse = {
        earned: [specialBadge],
        locked: [],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.earned[0].name).toBe('Badge with émojis 🎉 & special chars!');
    });

    it('should handle badges with complex requirement objects', async () => {
      const complexBadge = {
        ...mockLockedBadge,
        requirement: {
          lessonsCompleted: 10,
          streak: 7,
          level: 5,
          totalXp: 1000,
        },
      };
      const mockResponse = {
        earned: [],
        locked: [complexBadge],
      };
      mockBadgesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(result.locked[0].requirement).toEqual({
        lessonsCompleted: 10,
        streak: 7,
        level: 5,
        totalXp: 1000,
      });
    });
  });
});
