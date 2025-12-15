import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProgress = {
    id: 'progress-1',
    userId: 'user-1',
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

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    lessonCompletion: {
      findMany: jest.fn(),
    },
    streakLog: {
      findMany: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
      });

      const result = await service.findById('user-1');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should call prisma with correct parameters', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findById('user-1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      email: 'new@example.com',
      password: 'hashedPassword',
      displayName: 'New User',
    };

    it('should create user with initial progress', async () => {
      const expectedUser = {
        id: 'new-user-id',
        email: createData.email,
        displayName: createData.displayName,
        createdAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createData);

      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          password: createData.password,
          displayName: createData.displayName,
          progress: {
            create: {
              totalXp: 0,
              level: 1,
              levelTitle: 'Prompt Curious',
            },
          },
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    });
  });

  describe('getProgress', () => {
    it('should return user progress with badges', async () => {
      const mockProgressWithUser = {
        ...mockProgress,
        user: {
          ...mockUser,
          badges: [
            {
              badge: {
                id: 'badge-1',
                name: 'First Steps',
                icon: 'star',
              },
              earnedAt: new Date('2024-01-01'),
            },
          ],
        },
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgressWithUser);

      const result = await service.getProgress('user-1');

      expect(result).toEqual({
        totalXp: mockProgress.totalXp,
        level: mockProgress.level,
        levelTitle: mockProgress.levelTitle,
        currentStreak: mockProgress.currentStreak,
        longestStreak: mockProgress.longestStreak,
        lessonsCompleted: mockProgress.lessonsCompleted,
        badges: [
          {
            id: 'badge-1',
            name: 'First Steps',
            icon: 'star',
            earnedAt: mockProgressWithUser.user.badges[0].earnedAt,
          },
        ],
      });
    });

    it('should return null when progress not found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.getProgress('user-1');

      expect(result).toBeNull();
    });
  });

  describe('updateLastActive', () => {
    it('should update lastActiveAt timestamp', async () => {
      const updatedProgress = { ...mockProgress, lastActiveAt: new Date() };
      mockPrismaService.userProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.updateLastActive('user-1');

      expect(result).toEqual(updatedProgress);
      expect(prismaService.userProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          lastActiveAt: expect.any(Date),
        },
      });
    });
  });

  describe('addXp', () => {
    it('should add XP and return updated progress', async () => {
      const initialProgress = {
        ...mockProgress,
        totalXp: 400,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(initialProgress);
      mockPrismaService.userProgress.update.mockResolvedValue({
        ...initialProgress,
        totalXp: 600,
        level: 2,
        levelTitle: 'Prompt Apprentice',
      });

      const result = await service.addXp('user-1', 200);

      expect(result).toBeDefined();
      expect(result?.totalXp).toBe(600);
      expect(result?.level).toBe(2);
      expect(result?.levelTitle).toBe('Prompt Apprentice');
      expect(result?.leveledUp).toBe(true);
      expect(result?.xpAdded).toBe(200);
    });

    it('should detect level up when crossing threshold', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 400,
        level: 1,
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 600,
        level: 2,
      });

      const result = await service.addXp('user-1', 200);

      expect(result?.leveledUp).toBe(true);
    });

    it('should not level up when staying in same level', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 100,
        level: 1,
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 200,
        level: 1,
      });

      const result = await service.addXp('user-1', 100);

      expect(result?.leveledUp).toBe(false);
      expect(result?.level).toBe(1);
    });

    it('should update level title when leveling up', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 1400,
        level: 3,
        levelTitle: 'Token Tinkerer',
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 1600,
        level: 4,
        levelTitle: 'Context Crafter',
      });

      const result = await service.addXp('user-1', 200);

      expect(result?.levelTitle).toBe('Context Crafter');
      expect(result?.leveledUp).toBe(true);
    });

    it('should return null when progress not found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.addXp('user-1', 100);

      expect(result).toBeNull();
      expect(prismaService.userProgress.update).not.toHaveBeenCalled();
    });

    it('should calculate correct level from XP (500 XP per level)', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 0,
        level: 1,
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 1000,
        level: 3,
      });

      const result = await service.addXp('user-1', 1000);

      expect(result?.level).toBe(3); // 1000 XP / 500 = level 3
    });

    it('should handle multiple level ups in one XP addition', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 100,
        level: 1,
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 1600,
        level: 4,
        levelTitle: 'Context Crafter',
      });

      const result = await service.addXp('user-1', 1500);

      expect(result?.leveledUp).toBe(true);
      expect(result?.level).toBe(4);
    });

    it('should update lastActiveAt when adding XP', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);
      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 700,
        lastActiveAt: new Date(),
      });

      await service.addXp('user-1', 100);

      expect(prismaService.userProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastActiveAt: expect.any(Date),
          }),
        })
      );
    });

    it('should cap level at 10 with title "LLM Engineer"', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 4400,
        level: 9,
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 4600,
        level: 10,
        levelTitle: 'LLM Engineer',
      });

      const result = await service.addXp('user-1', 200);

      expect(result?.level).toBe(10);
      expect(result?.levelTitle).toBe('LLM Engineer');
    });

    it('should handle going beyond level 10', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        ...mockProgress,
        totalXp: 5000,
        level: 11,
        levelTitle: 'LLM Master',
      });

      mockPrismaService.userProgress.update.mockResolvedValue({
        ...mockProgress,
        totalXp: 5500,
        level: 12,
        levelTitle: 'LLM Master',
      });

      const result = await service.addXp('user-1', 500);

      // Should still return "LLM Master" for levels beyond 10
      expect(result?.levelTitle).toBe('LLM Master');
    });
  });

  describe('updateProfile', () => {
    const userId = 'test-user-id';

    it('should update displayName successfully', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: 'Updated Name',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        displayName: 'Updated Name',
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          displayName: 'Updated Name',
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    });

    it('should trim displayName before updating', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: '  Trimmed Name  ',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        displayName: 'Trimmed Name',
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.updateProfile(userId, updateDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          displayName: 'Trimmed Name',
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    });

    it('should reject empty displayName after trimming', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: '   ',
      };

      await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(
        'El nombre no puede estar vacío'
      );

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should handle empty update DTO', async () => {
      const updateDto: UpdateProfileDto = {};

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        displayName: 'Original Name',
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(existingUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result).toEqual(existingUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {},
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    });

    it('should not expose password in response', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: 'New Name',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        displayName: 'New Name',
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result).not.toHaveProperty('password');
      // Verify that password is not in the select object
      const callArgs = (prismaService.user.update as jest.Mock).mock.calls[0][0];
      expect(callArgs.select).not.toHaveProperty('password');
      expect(callArgs.select).toEqual({
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      });
    });

    it('should handle update with valid alphanumeric name with spaces', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: 'John Doe 123',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        displayName: 'John Doe 123',
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result.displayName).toBe('John Doe 123');
    });

    it('should update only displayName and not other fields', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: 'New Name',
      };

      const updatedUser = {
        id: userId,
        email: 'original@example.com',
        displayName: 'New Name',
        createdAt: new Date('2024-01-01'),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.updateProfile(userId, updateDto);

      // Verify that only displayName is in the data field
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            displayName: 'New Name',
          },
        })
      );
    });
  });

  describe('getStats', () => {
    const userId = 'user-123';

    const mockProgress = {
      id: 'progress-1',
      userId,
      totalXp: 1750,
      level: 4,
      levelTitle: 'Context Crafter',
      currentStreak: 7,
      longestStreak: 15,
      lessonsCompleted: 10,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompletions = [
      {
        id: 'comp-1',
        userId,
        lessonId: 'lesson-1',
        timeSpentSeconds: 900, // 15 minutes
        xpEarned: 150,
        completedAt: new Date('2024-01-15T10:00:00Z'),
        lesson: {
          week: 1,
          quiz: { score: 100 },
        },
      },
      {
        id: 'comp-2',
        userId,
        lessonId: 'lesson-2',
        timeSpentSeconds: 1200, // 20 minutes
        xpEarned: 200,
        completedAt: new Date('2024-01-16T10:00:00Z'),
        lesson: {
          week: 1,
          quiz: { score: 85 },
        },
      },
      {
        id: 'comp-3',
        userId,
        lessonId: 'lesson-3',
        timeSpentSeconds: 1800, // 30 minutes
        xpEarned: 180,
        completedAt: new Date('2024-01-17T10:00:00Z'),
        lesson: {
          week: 2,
          quiz: { score: 90 },
        },
      },
    ];

    const mockStreakLogs = [
      {
        id: 'streak-1',
        userId,
        date: new Date('2024-01-15'),
        checkedIn: true,
        bonusXp: 0,
      },
      {
        id: 'streak-2',
        userId,
        date: new Date('2024-01-16'),
        checkedIn: true,
        bonusXp: 0,
      },
      {
        id: 'streak-3',
        userId,
        date: new Date('2024-01-17'),
        checkedIn: true,
        bonusXp: 10,
      },
    ];

    beforeEach(() => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(mockProgress);
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(mockCompletions);
      mockPrismaService.streakLog.findMany.mockResolvedValue(mockStreakLogs);
    });

    it('should return comprehensive user statistics', async () => {
      const result = await service.getStats(userId);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalStudyTime');
      expect(result).toHaveProperty('lessonsPerWeek');
      expect(result).toHaveProperty('quizAverage');
      expect(result).toHaveProperty('xpHistory');
      expect(result).toHaveProperty('streakHistory');
      expect(result).toHaveProperty('totalLessonsCompleted');
      expect(result).toHaveProperty('totalQuizzesTaken');
      expect(result).toHaveProperty('perfectQuizzes');
      expect(result).toHaveProperty('currentLevel');
      expect(result).toHaveProperty('currentXp');
      expect(result).toHaveProperty('xpToNextLevel');
    });

    it('should calculate total study time correctly', async () => {
      const result = await service.getStats(userId);

      // Total: 900 + 1200 + 1800 = 3900 seconds = 65 minutes
      expect(result.totalStudyTime).toBe(65);
    });

    it('should group lessons by week correctly', async () => {
      const result = await service.getStats(userId);

      expect(result.lessonsPerWeek).toHaveLength(2);
      expect(result.lessonsPerWeek).toEqual([
        { week: 1, count: 2 },
        { week: 2, count: 1 },
      ]);
    });

    it('should calculate quiz average correctly', async () => {
      const result = await service.getStats(userId);

      // Average: (100 + 85 + 90) / 3 = 91.67
      expect(result.quizAverage).toBe(91.67);
      expect(result.totalQuizzesTaken).toBe(3);
    });

    it('should count perfect quizzes correctly', async () => {
      const result = await service.getStats(userId);

      expect(result.perfectQuizzes).toBe(1); // Only one 100% score
    });

    it('should generate XP history by date', async () => {
      const result = await service.getStats(userId);

      expect(result.xpHistory).toHaveLength(3);
      expect(result.xpHistory).toEqual([
        { date: '2024-01-15', xp: 150 },
        { date: '2024-01-16', xp: 200 },
        { date: '2024-01-17', xp: 180 },
      ]);
    });

    it('should generate streak history from logs', async () => {
      const result = await service.getStats(userId);

      expect(result.streakHistory).toHaveLength(3);
      expect(result.streakHistory[0]).toHaveProperty('date');
      expect(result.streakHistory[0]).toHaveProperty('streak');
    });

    it('should return current level and XP', async () => {
      const result = await service.getStats(userId);

      expect(result.currentLevel).toBe(4);
      expect(result.currentXp).toBe(1750);
    });

    it('should calculate XP to next level correctly', async () => {
      const result = await service.getStats(userId);

      // Level 4: 1750 XP total
      // XP in current level: 1750 % 500 = 250
      // XP for next level: 4 * 500 = 2000
      // XP to next level: 2000 - 250 = 1750? No, let me recalculate
      // Actually: 250 XP progress in level, need 500 total, so 250 more needed
      expect(result.xpToNextLevel).toBe(250);
    });

    it('should return lessons completed from progress', async () => {
      const result = await service.getStats(userId);

      expect(result.totalLessonsCompleted).toBe(10);
    });

    it('should throw error when progress not found', async () => {
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      await expect(service.getStats(userId)).rejects.toThrow(BadRequestException);
      await expect(service.getStats(userId)).rejects.toThrow('User progress not found');
    });

    it('should handle user with no completions', async () => {
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([]);
      mockPrismaService.streakLog.findMany.mockResolvedValue([]);

      const result = await service.getStats(userId);

      expect(result.totalStudyTime).toBe(0);
      expect(result.lessonsPerWeek).toEqual([]);
      expect(result.quizAverage).toBe(0);
      expect(result.xpHistory).toEqual([]);
      expect(result.streakHistory).toEqual([]);
      expect(result.totalQuizzesTaken).toBe(0);
      expect(result.perfectQuizzes).toBe(0);
    });

    it('should handle completions without quizzes', async () => {
      const completionsWithoutQuiz = [
        {
          id: 'comp-1',
          userId,
          lessonId: 'lesson-1',
          timeSpentSeconds: 900,
          xpEarned: 150,
          completedAt: new Date('2024-01-15T10:00:00Z'),
          lesson: {
            week: 1,
            quiz: null,
          },
        },
      ];

      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(completionsWithoutQuiz);

      const result = await service.getStats(userId);

      expect(result.quizAverage).toBe(0);
      expect(result.totalQuizzesTaken).toBe(0);
      expect(result.perfectQuizzes).toBe(0);
    });

    it('should aggregate XP from multiple completions on same date', async () => {
      const completionsSameDay = [
        {
          id: 'comp-1',
          userId,
          lessonId: 'lesson-1',
          timeSpentSeconds: 900,
          xpEarned: 100,
          completedAt: new Date('2024-01-15T09:00:00Z'),
          lesson: { week: 1, quiz: null },
        },
        {
          id: 'comp-2',
          userId,
          lessonId: 'lesson-2',
          timeSpentSeconds: 900,
          xpEarned: 150,
          completedAt: new Date('2024-01-15T14:00:00Z'),
          lesson: { week: 1, quiz: null },
        },
      ];

      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(completionsSameDay);

      const result = await service.getStats(userId);

      expect(result.xpHistory).toHaveLength(1);
      expect(result.xpHistory[0]).toEqual({
        date: '2024-01-15',
        xp: 250, // 100 + 150
      });
    });

    it('should handle level 1 user correctly', async () => {
      const level1Progress = {
        ...mockProgress,
        totalXp: 100,
        level: 1,
        levelTitle: 'Prompt Curious',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(level1Progress);

      const result = await service.getStats(userId);

      expect(result.currentLevel).toBe(1);
      expect(result.currentXp).toBe(100);
      // XP in level: 100, need 500 for next level, so 400 more needed
      expect(result.xpToNextLevel).toBe(400);
    });

    it('should handle high level user (level 10+)', async () => {
      const highLevelProgress = {
        ...mockProgress,
        totalXp: 5500,
        level: 12,
        levelTitle: 'LLM Master',
      };

      mockPrismaService.userProgress.findUnique.mockResolvedValue(highLevelProgress);

      const result = await service.getStats(userId);

      expect(result.currentLevel).toBe(12);
      expect(result.currentXp).toBe(5500);
    });

    it('should filter out non-checked-in streak logs', async () => {
      const mixedStreakLogs = [
        {
          id: 'streak-1',
          userId,
          date: new Date('2024-01-15'),
          checkedIn: true,
          bonusXp: 0,
        },
        {
          id: 'streak-2',
          userId,
          date: new Date('2024-01-16'),
          checkedIn: false,
          bonusXp: 0,
        },
        {
          id: 'streak-3',
          userId,
          date: new Date('2024-01-17'),
          checkedIn: true,
          bonusXp: 10,
        },
      ];

      mockPrismaService.streakLog.findMany.mockResolvedValue(mixedStreakLogs);

      const result = await service.getStats(userId);

      // Should only include checked-in days
      expect(result.streakHistory).toHaveLength(2);
    });

    it('should round quiz average to 2 decimal places', async () => {
      const completionsWithVariedScores = [
        {
          id: 'comp-1',
          userId,
          lessonId: 'lesson-1',
          timeSpentSeconds: 900,
          xpEarned: 150,
          completedAt: new Date('2024-01-15T10:00:00Z'),
          lesson: { week: 1, quiz: { score: 88 } },
        },
        {
          id: 'comp-2',
          userId,
          lessonId: 'lesson-2',
          timeSpentSeconds: 900,
          xpEarned: 150,
          completedAt: new Date('2024-01-16T10:00:00Z'),
          lesson: { week: 1, quiz: { score: 77 } },
        },
      ];

      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(completionsWithVariedScores);

      const result = await service.getStats(userId);

      // (88 + 77) / 2 = 82.5
      expect(result.quizAverage).toBe(82.5);
    });

    it('should call prisma methods with correct parameters', async () => {
      await service.getStats(userId);

      expect(prismaService.userProgress.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(prismaService.lessonCompletion.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          lesson: {
            select: {
              week: true,
              quiz: true,
            },
          },
        },
        orderBy: {
          completedAt: 'asc',
        },
      });

      expect(prismaService.streakLog.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: {
          date: 'asc',
        },
      });
    });
  });

  describe('getXpHistory', () => {
    const userId = 'user-123';

    const mockCompletions = [
      {
        id: 'comp-1',
        userId,
        lessonId: 'lesson-1',
        timeSpentSeconds: 900,
        xpEarned: 100,
        completedAt: new Date('2024-01-15T10:00:00Z'),
        lesson: {
          title: 'Introduction to Prompts',
          xpReward: 100,
          quiz: { score: 95 },
        },
      },
      {
        id: 'comp-2',
        userId,
        lessonId: 'lesson-2',
        timeSpentSeconds: 1200,
        xpEarned: 150,
        completedAt: new Date('2024-01-16T14:00:00Z'),
        lesson: {
          title: 'Advanced Techniques',
          xpReward: 150,
          quiz: null,
        },
      },
      {
        id: 'comp-3',
        userId,
        lessonId: 'lesson-3',
        timeSpentSeconds: 600,
        xpEarned: 50,
        completedAt: new Date('2024-01-15T16:00:00Z'),
        lesson: {
          title: 'Quick Tips',
          xpReward: 50,
          quiz: null,
        },
      },
    ];

    const mockStreakLogs = [
      {
        id: 'streak-1',
        userId,
        date: new Date('2024-01-15'),
        checkedIn: true,
        bonusXp: 10,
      },
      {
        id: 'streak-2',
        userId,
        date: new Date('2024-01-16'),
        checkedIn: true,
        bonusXp: 0,
      },
    ];

    const mockBadges = [
      {
        id: 'ub-1',
        userId,
        badgeId: 'badge-1',
        earnedAt: new Date('2024-01-15T12:00:00Z'),
        badge: {
          name: 'First Steps',
          xpBonus: 50,
        },
      },
    ];

    beforeEach(() => {
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(mockCompletions);
      mockPrismaService.streakLog.findMany.mockResolvedValue(mockStreakLogs);
      mockPrismaService.userBadge.findMany.mockResolvedValue(mockBadges);
    });

    it('should return XP history with default 30 days', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('history');
      expect(result).toHaveProperty('totalThisWeek');
      expect(result).toHaveProperty('totalThisMonth');
      expect(result).toHaveProperty('averagePerDay');
      expect(result).toHaveProperty('bestDay');
    });

    it('should aggregate XP by date correctly', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      expect(result.history).toHaveLength(2);

      // Jan 15: 100 (comp-1) + 50 (comp-3) + 10 (streak) + 50 (badge) = 210
      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      expect(jan15).toBeDefined();
      expect(jan15?.xp).toBe(210);
      expect(jan15?.sources).toContain('lesson');
      expect(jan15?.sources).toContain('quiz');
      expect(jan15?.sources).toContain('streak');
      expect(jan15?.sources).toContain('badge');

      // Jan 16: 150 (comp-2) = 150
      const jan16 = result.history.find((h) => h.date === '2024-01-16');
      expect(jan16).toBeDefined();
      expect(jan16?.xp).toBe(150);
      expect(jan16?.sources).toContain('lesson');
    });

    it('should include detailed breakdown of XP sources', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      expect(jan15?.details).toBeDefined();
      expect(jan15?.details?.length).toBeGreaterThan(0);

      // Should have lesson details
      const lessonDetail = jan15?.details?.find((d) => d.source === 'lesson');
      expect(lessonDetail).toBeDefined();
      expect(lessonDetail?.description).toContain('Completed lesson:');

      // Should have streak detail
      const streakDetail = jan15?.details?.find((d) => d.source === 'streak');
      expect(streakDetail).toBeDefined();
      expect(streakDetail?.xp).toBe(10);

      // Should have badge detail
      const badgeDetail = jan15?.details?.find((d) => d.source === 'badge');
      expect(badgeDetail).toBeDefined();
      expect(badgeDetail?.description).toContain('Earned badge:');
    });

    it('should identify best day correctly', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      expect(result.bestDay.date).toBe('2024-01-15');
      expect(result.bestDay.xp).toBe(210);
    });

    it('should calculate average per day correctly', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      // Total XP: 210 + 150 = 360
      // Days with activity: 2
      // Average: 360 / 2 = 180
      expect(result.averagePerDay).toBe(180);
    });

    it('should accept custom date range', async () => {
      const query = {
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await service.getXpHistory(userId, query);

      expect(prismaService.lessonCompletion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            completedAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });

    it('should throw error when start date is after end date', async () => {
      const query = {
        startDate: '2024-01-20',
        endDate: '2024-01-15',
      };

      await expect(service.getXpHistory(userId, query)).rejects.toThrow(BadRequestException);
      await expect(service.getXpHistory(userId, query)).rejects.toThrow(
        'Start date must be before end date'
      );
    });

    it('should throw error when date range exceeds 90 days', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-05-01', // More than 90 days
      };

      await expect(service.getXpHistory(userId, query)).rejects.toThrow(BadRequestException);
      await expect(service.getXpHistory(userId, query)).rejects.toThrow(
        'Date range cannot exceed 90 days'
      );
    });

    it('should handle days parameter correctly', async () => {
      const query = { days: 7 };

      await service.getXpHistory(userId, query);

      const callArgs = (prismaService.lessonCompletion.findMany as jest.Mock).mock.calls[0][0];
      const startDate = callArgs.where.completedAt.gte;
      const endDate = callArgs.where.completedAt.lte;

      // Calculate difference in days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      expect(diffDays).toBeGreaterThanOrEqual(7);
      expect(diffDays).toBeLessThanOrEqual(8); // Allow some tolerance for time boundaries
    });

    it('should return empty history when no data exists', async () => {
      mockPrismaService.lessonCompletion.findMany.mockResolvedValue([]);
      mockPrismaService.streakLog.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.getXpHistory(userId, { days: 30 });

      expect(result.history).toEqual([]);
      expect(result.totalThisWeek).toBe(0);
      expect(result.totalThisMonth).toBe(0);
      expect(result.averagePerDay).toBe(0);
      expect(result.bestDay).toEqual({ date: '', xp: 0 });
    });

    it('should only include streak bonus when bonusXp > 0', async () => {
      const streakLogsWithZero = [
        {
          id: 'streak-1',
          userId,
          date: new Date('2024-01-15'),
          checkedIn: true,
          bonusXp: 0, // No bonus
        },
      ];

      mockPrismaService.streakLog.findMany.mockResolvedValue(streakLogsWithZero);

      const result = await service.getXpHistory(userId, { days: 30 });

      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      const streakDetail = jan15?.details?.find((d) => d.source === 'streak');

      expect(streakDetail).toBeUndefined();
    });

    it('should only include badge XP when xpBonus > 0', async () => {
      const badgesWithZero = [
        {
          id: 'ub-1',
          userId,
          badgeId: 'badge-1',
          earnedAt: new Date('2024-01-15T12:00:00Z'),
          badge: {
            name: 'Zero Badge',
            xpBonus: 0, // No XP bonus
          },
        },
      ];

      mockPrismaService.userBadge.findMany.mockResolvedValue(badgesWithZero);

      const result = await service.getXpHistory(userId, { days: 30 });

      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      const badgeDetail = jan15?.details?.find((d) => d.source === 'badge');

      expect(badgeDetail).toBeUndefined();
    });

    it('should mark quiz as source when lesson has quiz', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      expect(jan15?.sources).toContain('quiz');
    });

    it('should not mark quiz as source when lesson has no quiz', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      const jan16 = result.history.find((h) => h.date === '2024-01-16');
      expect(jan16?.sources).not.toContain('quiz');
    });

    it('should sort history by date ascending', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      expect(result.history).toHaveLength(2);
      expect(result.history[0].date).toBe('2024-01-15');
      expect(result.history[1].date).toBe('2024-01-16');
    });

    it('should call all necessary prisma methods', async () => {
      await service.getXpHistory(userId, { days: 30 });

      expect(prismaService.lessonCompletion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            completedAt: expect.any(Object),
          }),
          include: expect.objectContaining({
            lesson: expect.objectContaining({
              select: expect.objectContaining({
                title: true,
                xpReward: true,
                quiz: true,
              }),
            }),
          }),
        })
      );

      expect(prismaService.streakLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            date: expect.any(Object),
            checkedIn: true,
          }),
        })
      );

      expect(prismaService.userBadge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            earnedAt: expect.any(Object),
          }),
          include: expect.objectContaining({
            badge: expect.objectContaining({
              select: expect.objectContaining({
                name: true,
                xpBonus: true,
              }),
            }),
          }),
        })
      );
    });

    it('should use default days value when not provided', async () => {
      await service.getXpHistory(userId, {});

      // Should use default 30 days
      const callArgs = (prismaService.lessonCompletion.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.completedAt).toBeDefined();
      expect(callArgs.where.completedAt.gte).toBeInstanceOf(Date);
      expect(callArgs.where.completedAt.lte).toBeInstanceOf(Date);
    });

    it('should aggregate multiple completions on same day', async () => {
      const result = await service.getXpHistory(userId, { days: 30 });

      // Jan 15 should have 2 lesson completions (100 + 50)
      const jan15 = result.history.find((h) => h.date === '2024-01-15');
      const lessonDetails = jan15?.details?.filter((d) => d.source === 'lesson');

      expect(lessonDetails?.length).toBe(2);
    });

    it('should round average per day to 2 decimal places', async () => {
      // Mock data that would create a decimal average
      const oddCompletions = [
        {
          id: 'comp-1',
          userId,
          lessonId: 'lesson-1',
          timeSpentSeconds: 900,
          xpEarned: 100,
          completedAt: new Date('2024-01-15T10:00:00Z'),
          lesson: {
            title: 'Test Lesson',
            xpReward: 100,
            quiz: null,
          },
        },
        {
          id: 'comp-2',
          userId,
          lessonId: 'lesson-2',
          timeSpentSeconds: 900,
          xpEarned: 100,
          completedAt: new Date('2024-01-16T10:00:00Z'),
          lesson: {
            title: 'Test Lesson 2',
            xpReward: 100,
            quiz: null,
          },
        },
        {
          id: 'comp-3',
          userId,
          lessonId: 'lesson-3',
          timeSpentSeconds: 900,
          xpEarned: 100,
          completedAt: new Date('2024-01-17T10:00:00Z'),
          lesson: {
            title: 'Test Lesson 3',
            xpReward: 100,
            quiz: null,
          },
        },
      ];

      mockPrismaService.lessonCompletion.findMany.mockResolvedValue(oddCompletions);
      mockPrismaService.streakLog.findMany.mockResolvedValue([]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([]);

      const result = await service.getXpHistory(userId, { days: 30 });

      // 300 / 3 = 100.00
      expect(result.averagePerDay).toBe(100);
      expect(
        Number.isInteger(result.averagePerDay) ||
          result.averagePerDay.toString().split('.')[1]?.length <= 2
      ).toBe(true);
    });
  });
});
