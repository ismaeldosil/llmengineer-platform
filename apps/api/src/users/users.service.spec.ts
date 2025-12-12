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
          createdAt: true,
        },
      });
    });

    it('should reject empty displayName after trimming', async () => {
      const updateDto: UpdateProfileDto = {
        displayName: '   ',
      };

      await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(
        'El nombre no puede estar vacío',
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
        }),
      );
    });
  });
});
