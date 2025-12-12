import { Test, TestingModule } from '@nestjs/testing';
import { BadgesLoaderService, BadgeData } from './badges-loader.service';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs module
jest.mock('fs/promises');

describe('BadgesLoaderService', () => {
  let service: BadgesLoaderService;
  let prismaService: PrismaService;

  const mockValidBadge: BadgeData = {
    slug: 'first-lesson',
    name: 'Primera Lección',
    description: 'Completa tu primera lección',
    icon: '🎯',
    category: 'progress',
    requirement: {
      type: 'lessons_completed',
      value: 1,
    },
    xpReward: 50,
  };

  const mockSecretBadge: BadgeData = {
    slug: 'secret-badge',
    name: 'Badge Secreto',
    description: 'Un badge secreto',
    icon: '🔒',
    category: 'special',
    requirement: {
      type: 'special',
      value: 'secret',
    },
    xpReward: 100,
    isSecret: true,
  };

  const mockExistingBadge = {
    id: 'badge-1',
    slug: 'first-lesson',
    name: 'First Lesson (Old)',
    description: 'Old description',
    icon: '🎯',
    category: 'progress' as const,
    requirement: { lessonsCompleted: 1 },
    xpBonus: 25,
    isSecret: false,
    createdAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    badge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesLoaderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BadgesLoaderService>(BadgesLoaderService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateBadgeStructure', () => {
    it('should return true for valid badge structure', () => {
      const isValid = service.validateBadgeStructure(mockValidBadge);
      expect(isValid).toBe(true);
    });

    it('should return true for valid badge with isSecret=true', () => {
      const isValid = service.validateBadgeStructure(mockSecretBadge);
      expect(isValid).toBe(true);
    });

    it('should return false when badge is null or undefined', () => {
      expect(service.validateBadgeStructure(null)).toBe(false);
      expect(service.validateBadgeStructure(undefined)).toBe(false);
    });

    it('should return false when badge is not an object', () => {
      expect(service.validateBadgeStructure('not an object')).toBe(false);
      expect(service.validateBadgeStructure(123)).toBe(false);
      expect(service.validateBadgeStructure([])).toBe(false);
    });

    it('should return false when slug is missing', () => {
      const badge = { ...mockValidBadge, slug: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when name is missing', () => {
      const badge = { ...mockValidBadge, name: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when description is missing', () => {
      const badge = { ...mockValidBadge, description: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when icon is missing', () => {
      const badge = { ...mockValidBadge, icon: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when category is missing', () => {
      const badge = { ...mockValidBadge, category: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when category is invalid', () => {
      const badge = { ...mockValidBadge, category: 'invalid_category' };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return true for all valid categories', () => {
      const validCategories = ['progress', 'streak', 'completion', 'mastery', 'special'];
      validCategories.forEach((category) => {
        const badge = { ...mockValidBadge, category };
        expect(service.validateBadgeStructure(badge)).toBe(true);
      });
    });

    it('should return false when xpReward is missing', () => {
      const badge = { ...mockValidBadge, xpReward: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when xpReward is not a number', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const badge = { ...mockValidBadge, xpReward: '50' as any };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when xpReward is negative', () => {
      const badge = { ...mockValidBadge, xpReward: -50 };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return true when xpReward is 0', () => {
      const badge = { ...mockValidBadge, xpReward: 0 };
      expect(service.validateBadgeStructure(badge)).toBe(true);
    });

    it('should return false when requirement is missing', () => {
      const badge = { ...mockValidBadge, requirement: undefined };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when requirement.type is missing', () => {
      const badge = {
        ...mockValidBadge,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requirement: { value: 1 } as any,
      };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return false when requirement.value is missing', () => {
      const badge = {
        ...mockValidBadge,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requirement: { type: 'lessons_completed' } as any,
      };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return true for requirement.value as number', () => {
      const badge = {
        ...mockValidBadge,
        requirement: { type: 'lessons_completed', value: 5 },
      };
      expect(service.validateBadgeStructure(badge)).toBe(true);
    });

    it('should return true for requirement.value as string', () => {
      const badge = {
        ...mockValidBadge,
        requirement: { type: 'special', value: 'early_bird' },
      };
      expect(service.validateBadgeStructure(badge)).toBe(true);
    });

    it('should return true for requirement.value as boolean', () => {
      const badge = {
        ...mockValidBadge,
        requirement: { type: 'all_weeks_completed', value: true },
      };
      expect(service.validateBadgeStructure(badge)).toBe(true);
    });

    it('should return false when isSecret is not a boolean', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const badge = { ...mockValidBadge, isSecret: 'yes' as any };
      expect(service.validateBadgeStructure(badge)).toBe(false);
    });

    it('should return true when isSecret is undefined', () => {
      const badge = { ...mockValidBadge };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (badge as any).isSecret;
      expect(service.validateBadgeStructure(badge)).toBe(true);
    });
  });

  describe('upsertBadge', () => {
    it('should create new badge when it does not exist', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      const isUpdate = await service.upsertBadge(mockValidBadge);

      expect(isUpdate).toBe(false);
      expect(prismaService.badge.findUnique).toHaveBeenCalledWith({
        where: { slug: 'first-lesson' },
      });
      expect(prismaService.badge.create).toHaveBeenCalledWith({
        data: {
          slug: 'first-lesson',
          name: 'Primera Lección',
          description: 'Completa tu primera lección',
          icon: '🎯',
          category: 'progress',
          requirement: mockValidBadge.requirement,
          xpBonus: 50,
          isSecret: false,
        },
      });
      expect(prismaService.badge.update).not.toHaveBeenCalled();
    });

    it('should update existing badge when it exists', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(mockExistingBadge);
      mockPrismaService.badge.update.mockResolvedValue({
        ...mockExistingBadge,
        name: 'Primera Lección',
      });

      const isUpdate = await service.upsertBadge(mockValidBadge);

      expect(isUpdate).toBe(true);
      expect(prismaService.badge.findUnique).toHaveBeenCalledWith({
        where: { slug: 'first-lesson' },
      });
      expect(prismaService.badge.update).toHaveBeenCalledWith({
        where: { slug: 'first-lesson' },
        data: {
          slug: 'first-lesson',
          name: 'Primera Lección',
          description: 'Completa tu primera lección',
          icon: '🎯',
          category: 'progress',
          requirement: mockValidBadge.requirement,
          xpBonus: 50,
          isSecret: false,
        },
      });
      expect(prismaService.badge.create).not.toHaveBeenCalled();
    });

    it('should set isSecret to true when provided', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue({
        ...mockExistingBadge,
        isSecret: true,
      });

      await service.upsertBadge(mockSecretBadge);

      expect(prismaService.badge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isSecret: true,
        }),
      });
    });

    it('should default isSecret to false when not provided', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      await service.upsertBadge(mockValidBadge);

      expect(prismaService.badge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isSecret: false,
        }),
      });
    });

    it('should map xpReward to xpBonus field', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      await service.upsertBadge(mockValidBadge);

      expect(prismaService.badge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          xpBonus: 50,
        }),
      });
    });
  });

  describe('loadBadgesFromFile', () => {
    const validJsonContent = JSON.stringify({
      badges: [mockValidBadge, mockSecretBadge],
    });

    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue(validJsonContent);
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);
    });

    it('should load badges from a valid JSON file', async () => {
      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/badges.json', 'utf-8');
      expect(result.created).toBe(2);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle relative paths', async () => {
      const relativePath = 'prisma/content/badges.json';
      const expectedPath = path.resolve(process.cwd(), relativePath);

      await service.loadBadgesFromFile(relativePath);

      expect(fs.readFile).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });

    it('should handle absolute paths', async () => {
      const absolutePath = '/absolute/path/to/badges.json';

      await service.loadBadgesFromFile(absolutePath);

      expect(fs.readFile).toHaveBeenCalledWith(absolutePath, 'utf-8');
    });

    it('should count created badges correctly', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(2);
      expect(result.updated).toBe(0);
    });

    it('should count updated badges correctly', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(mockExistingBadge);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(0);
      expect(result.updated).toBe(2);
    });

    it('should count both created and updated badges', async () => {
      mockPrismaService.badge.findUnique
        .mockResolvedValueOnce(null) // First badge - create
        .mockResolvedValueOnce(mockExistingBadge); // Second badge - update

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(1);
      expect(result.updated).toBe(1);
    });

    it('should collect errors for invalid badges', async () => {
      const invalidJson = JSON.stringify({
        badges: [
          mockValidBadge,
          { slug: 'invalid-badge', name: 'Invalid' }, // Missing required fields
        ],
      });
      (fs.readFile as jest.Mock).mockResolvedValue(invalidJson);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        slug: 'invalid-badge',
        error: 'Invalid badge structure',
      });
    });

    it('should continue processing after encountering an error', async () => {
      const mixedJson = JSON.stringify({
        badges: [
          mockValidBadge,
          { slug: 'invalid' }, // Invalid
          mockSecretBadge, // Valid
        ],
      });
      (fs.readFile as jest.Mock).mockResolvedValue(mixedJson);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create
        .mockResolvedValueOnce(mockExistingBadge)
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        slug: 'secret-badge',
        error: 'Database error',
      });
    });

    it('should throw error when file does not exist', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(service.loadBadgesFromFile('/nonexistent/file.json')).rejects.toThrow(
        'Failed to load badges'
      );
    });

    it('should throw error when JSON is invalid', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('invalid json {');

      await expect(service.loadBadgesFromFile('/path/to/badges.json')).rejects.toThrow(
        'Failed to load badges'
      );
    });

    it('should throw error when badges array is missing', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ invalid: 'structure' }));

      await expect(service.loadBadgesFromFile('/path/to/badges.json')).rejects.toThrow(
        'Invalid JSON structure: "badges" array not found'
      );
    });

    it('should throw error when badges is not an array', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: 'not an array' }));

      await expect(service.loadBadgesFromFile('/path/to/badges.json')).rejects.toThrow(
        'Invalid JSON structure: "badges" array not found'
      );
    });

    it('should handle empty badges array', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: [] }));

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle badge with unknown slug in error', async () => {
      const badgeWithoutSlug = { name: 'No Slug' };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: [badgeWithoutSlug] }));

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].slug).toBe('unknown');
    });
  });

  describe('loadDefaultBadges', () => {
    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: [mockValidBadge] }));
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);
    });

    it('should load from default path', async () => {
      const expectedPath = path.resolve(process.cwd(), 'prisma/content/badges.json');

      await service.loadDefaultBadges();

      expect(fs.readFile).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });

    it('should return result from loadBadgesFromFile', async () => {
      const result = await service.loadDefaultBadges();

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large badge files', async () => {
      const largeBadgeArray = Array.from({ length: 100 }, (_, i) => ({
        ...mockValidBadge,
        slug: `badge-${i}`,
      }));
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: largeBadgeArray }));
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(100);
    });

    it('should handle badges with all categories', async () => {
      const badges = [
        { ...mockValidBadge, slug: 'badge-1', category: 'progress' },
        { ...mockValidBadge, slug: 'badge-2', category: 'streak' },
        { ...mockValidBadge, slug: 'badge-3', category: 'completion' },
        { ...mockValidBadge, slug: 'badge-4', category: 'mastery' },
        { ...mockValidBadge, slug: 'badge-5', category: 'special' },
      ];
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges }));
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(5);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle special characters in badge fields', async () => {
      const specialBadge = {
        ...mockValidBadge,
        name: 'Badge with "quotes" and \'apostrophes\'',
        description: 'Description with\nnewlines\tand\ttabs',
        icon: '🎯🏆🔥',
      };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ badges: [specialBadge] }));
      mockPrismaService.badge.findUnique.mockResolvedValue(null);
      mockPrismaService.badge.create.mockResolvedValue(mockExistingBadge);

      const result = await service.loadBadgesFromFile('/path/to/badges.json');

      expect(result.created).toBe(1);
      expect(result.errors).toHaveLength(0);
    });
  });
});
