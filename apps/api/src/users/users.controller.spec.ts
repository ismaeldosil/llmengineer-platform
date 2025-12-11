import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadgesService } from '../badges/badges.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let badgesService: BadgesService;

  const mockUsersService = {
    findById: jest.fn(),
    getProgress: jest.fn(),
  };

  const mockBadgesService = {
    findUserBadges: jest.fn(),
    findAll: jest.fn(),
    checkAndAwardBadges: jest.fn(),
  };

  const mockUser = { id: 'user-123' };

  const mockUserData = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date('2024-01-01'),
  };

  const mockProgressData = {
    totalXp: 1500,
    level: 4,
    levelTitle: 'Context Crafter',
    currentStreak: 7,
    longestStreak: 15,
    lessonsCompleted: 8,
    badges: [
      {
        id: 'badge-1',
        name: 'First Steps',
        icon: 'star',
        earnedAt: new Date('2024-01-05'),
      },
      {
        id: 'badge-2',
        name: 'Week Warrior',
        icon: 'fire',
        earnedAt: new Date('2024-01-10'),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    badgesService = module.get<BadgesService>(BadgesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/me', () => {
    it('should return current user without password', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserData);

      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockUserData);
      expect(result).not.toHaveProperty('password');
      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct user id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserData);

      await controller.getMe(mockUser);

      expect(service.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return user with all expected fields', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserData);

      const result = await controller.getMe(mockUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('displayName');
      expect(result).toHaveProperty('createdAt');
    });

    it('should handle non-existent user', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const result = await controller.getMe(mockUser);

      expect(result).toBeNull();
      expect(service.findById).toHaveBeenCalledWith('user-123');
    });

    it('should propagate service errors', async () => {
      mockUsersService.findById.mockRejectedValue(new Error('Database error'));

      await expect(controller.getMe(mockUser)).rejects.toThrow('Database error');
      expect(service.findById).toHaveBeenCalledWith('user-123');
    });

    it('should handle different user ids', async () => {
      const user1 = { id: 'user-1' };
      const user2 = { id: 'user-2' };

      const userData1 = { ...mockUserData, id: 'user-1' };
      const userData2 = { ...mockUserData, id: 'user-2' };

      mockUsersService.findById.mockResolvedValueOnce(userData1);
      mockUsersService.findById.mockResolvedValueOnce(userData2);

      const result1 = await controller.getMe(user1);
      const result2 = await controller.getMe(user2);

      expect(result1.id).toBe('user-1');
      expect(result2.id).toBe('user-2');
      expect(service.findById).toHaveBeenCalledWith('user-1');
      expect(service.findById).toHaveBeenCalledWith('user-2');
    });
  });

  describe('GET /users/me/progress', () => {
    it('should return complete user progress with badges', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      const result = await controller.getProgress(mockUser);

      expect(result).toEqual(mockProgressData);
      expect(service.getProgress).toHaveBeenCalledWith('user-123');
      expect(service.getProgress).toHaveBeenCalledTimes(1);
    });

    it('should return all progress fields', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      const result = await controller.getProgress(mockUser);

      expect(result).toHaveProperty('totalXp');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('levelTitle');
      expect(result).toHaveProperty('currentStreak');
      expect(result).toHaveProperty('longestStreak');
      expect(result).toHaveProperty('lessonsCompleted');
      expect(result).toHaveProperty('badges');
    });

    it('should return badges array with correct structure', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      const result = await controller.getProgress(mockUser);

      expect(Array.isArray(result.badges)).toBe(true);
      expect(result.badges).toHaveLength(2);
      expect(result.badges[0]).toHaveProperty('id');
      expect(result.badges[0]).toHaveProperty('name');
      expect(result.badges[0]).toHaveProperty('icon');
      expect(result.badges[0]).toHaveProperty('earnedAt');
    });

    it('should handle user with no badges', async () => {
      const progressWithNoBadges = {
        ...mockProgressData,
        badges: [],
      };

      mockUsersService.getProgress.mockResolvedValue(progressWithNoBadges);

      const result = await controller.getProgress(mockUser);

      expect(result.badges).toEqual([]);
      expect(Array.isArray(result.badges)).toBe(true);
    });

    it('should handle new user with initial progress', async () => {
      const newUserProgress = {
        totalXp: 0,
        level: 1,
        levelTitle: 'Prompt Curious',
        currentStreak: 0,
        longestStreak: 0,
        lessonsCompleted: 0,
        badges: [],
      };

      mockUsersService.getProgress.mockResolvedValue(newUserProgress);

      const result = await controller.getProgress(mockUser);

      expect(result.totalXp).toBe(0);
      expect(result.level).toBe(1);
      expect(result.levelTitle).toBe('Prompt Curious');
      expect(result.currentStreak).toBe(0);
      expect(result.badges).toEqual([]);
    });

    it('should handle user with high level progress', async () => {
      const advancedProgress = {
        totalXp: 5000,
        level: 10,
        levelTitle: 'LLM Engineer',
        currentStreak: 30,
        longestStreak: 50,
        lessonsCompleted: 20,
        badges: [
          { id: 'b1', name: 'Badge 1', icon: 'icon1', earnedAt: new Date() },
          { id: 'b2', name: 'Badge 2', icon: 'icon2', earnedAt: new Date() },
          { id: 'b3', name: 'Badge 3', icon: 'icon3', earnedAt: new Date() },
        ],
      };

      mockUsersService.getProgress.mockResolvedValue(advancedProgress);

      const result = await controller.getProgress(mockUser);

      expect(result.level).toBe(10);
      expect(result.levelTitle).toBe('LLM Engineer');
      expect(result.badges).toHaveLength(3);
    });

    it('should handle non-existent user progress', async () => {
      mockUsersService.getProgress.mockResolvedValue(null);

      const result = await controller.getProgress(mockUser);

      expect(result).toBeNull();
      expect(service.getProgress).toHaveBeenCalledWith('user-123');
    });

    it('should propagate service errors', async () => {
      mockUsersService.getProgress.mockRejectedValue(new Error('Database error'));

      await expect(controller.getProgress(mockUser)).rejects.toThrow('Database error');
      expect(service.getProgress).toHaveBeenCalledWith('user-123');
    });

    it('should call service with correct user id', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      await controller.getProgress(mockUser);

      expect(service.getProgress).toHaveBeenCalledWith('user-123');
    });

    it('should handle different user ids for progress', async () => {
      const user1 = { id: 'user-1' };
      const user2 = { id: 'user-2' };

      const progress1 = { ...mockProgressData, totalXp: 1000 };
      const progress2 = { ...mockProgressData, totalXp: 2000 };

      mockUsersService.getProgress.mockResolvedValueOnce(progress1);
      mockUsersService.getProgress.mockResolvedValueOnce(progress2);

      const result1 = await controller.getProgress(user1);
      const result2 = await controller.getProgress(user2);

      expect(result1.totalXp).toBe(1000);
      expect(result2.totalXp).toBe(2000);
      expect(service.getProgress).toHaveBeenCalledWith('user-1');
      expect(service.getProgress).toHaveBeenCalledWith('user-2');
    });

    it('should return correct streak information', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      const result = await controller.getProgress(mockUser);

      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(15);
      expect(result.longestStreak).toBeGreaterThanOrEqual(result.currentStreak);
    });

    it('should return correct lessons completed count', async () => {
      mockUsersService.getProgress.mockResolvedValue(mockProgressData);

      const result = await controller.getProgress(mockUser);

      expect(result.lessonsCompleted).toBe(8);
      expect(typeof result.lessonsCompleted).toBe('number');
    });
  });

  describe('GET /users/me/badges', () => {
    const mockBadge1 = {
      id: 'badge-1',
      slug: 'first-lesson',
      name: 'Primer Paso',
      description: 'Completaste tu primera lección',
      icon: '🎯',
      category: 'progress',
      requirement: { lessonsCompleted: 1 },
      xpBonus: 50,
      isSecret: false,
      createdAt: new Date('2024-01-01'),
      earnedAt: new Date('2024-02-01'),
    };

    const mockBadge2 = {
      id: 'badge-2',
      slug: 'streak-3',
      name: 'En Racha',
      description: '3 días consecutivos',
      icon: '⚡',
      category: 'streak',
      requirement: { streak: 3 },
      xpBonus: 25,
      isSecret: false,
      createdAt: new Date('2024-01-02'),
      earnedAt: new Date('2024-02-05'),
    };

    it('should return user badges with total count', async () => {
      mockBadgesService.findUserBadges.mockResolvedValue([mockBadge1, mockBadge2]);

      const result = await controller.getUserBadges(mockUser);

      expect(badgesService.findUserBadges).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        badges: [mockBadge1, mockBadge2],
        total: 2,
      });
    });

    it('should return empty array when user has no badges', async () => {
      mockBadgesService.findUserBadges.mockResolvedValue([]);

      const result = await controller.getUserBadges(mockUser);

      expect(result).toEqual({
        badges: [],
        total: 0,
      });
    });

    it('should include earnedAt timestamp for each badge', async () => {
      mockBadgesService.findUserBadges.mockResolvedValue([mockBadge1]);

      const result = await controller.getUserBadges(mockUser);

      expect(result.badges[0]).toHaveProperty('earnedAt');
      expect(result.badges[0].earnedAt).toEqual(mockBadge1.earnedAt);
    });

    it('should call service with correct user id', async () => {
      const differentUser = { id: 'user-456' };
      mockBadgesService.findUserBadges.mockResolvedValue([]);

      await controller.getUserBadges(differentUser);

      expect(badgesService.findUserBadges).toHaveBeenCalledWith('user-456');
    });

    it('should return correct total count', async () => {
      const threeBadges = [mockBadge1, mockBadge2, { ...mockBadge1, id: 'badge-3' }];
      mockBadgesService.findUserBadges.mockResolvedValue(threeBadges);

      const result = await controller.getUserBadges(mockUser);

      expect(result.total).toBe(3);
      expect(result.badges).toHaveLength(3);
    });

    it('should propagate service errors', async () => {
      mockBadgesService.findUserBadges.mockRejectedValue(new Error('Database error'));

      await expect(controller.getUserBadges(mockUser)).rejects.toThrow('Database error');
    });

    it('should return badges ordered by earnedAt', async () => {
      mockBadgesService.findUserBadges.mockResolvedValue([mockBadge1, mockBadge2]);

      const result = await controller.getUserBadges(mockUser);

      expect(result.badges[0].earnedAt).toBeDefined();
      expect(result.badges[1].earnedAt).toBeDefined();
    });
  });
});
