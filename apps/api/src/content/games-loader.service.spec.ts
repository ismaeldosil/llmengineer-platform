import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GamesLoaderService, GameConfig } from './games-loader.service';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('GamesLoaderService', () => {
  let service: GamesLoaderService;
  const testGamesDir = join(process.cwd(), 'test-games');

  // Mock game configurations
  const validTokenTetrisConfig: GameConfig = {
    slug: 'token-tetris',
    name: 'Token Tetris',
    description: 'Optimiza tokens mientras juegas Tetris',
    icon: '🧱',
    isActive: true,
    levels: [
      {
        level: 1,
        name: 'Beginner',
        config: { speed: 1, tokenGoal: 50 },
      },
      {
        level: 2,
        name: 'Intermediate',
        config: { speed: 1.5, tokenGoal: 100 },
      },
    ],
    rewards: {
      xpPerLevel: 100,
      bonusForPerfect: 50,
    },
  };

  const validPromptGolfConfig: GameConfig = {
    slug: 'prompt-golf',
    name: 'Prompt Golf',
    description: 'Crea el prompt más corto que funcione',
    icon: '⛳',
    isActive: true,
    levels: [
      {
        level: 1,
        name: 'Par 3',
        config: { maxTokens: 30, targetOutput: 'basic', difficulty: 'easy' },
      },
    ],
    rewards: {
      xpPerLevel: 150,
      bonusForPerfect: 75,
    },
  };

  const inactiveGameConfig: GameConfig = {
    slug: 'test-game',
    name: 'Test Game',
    description: 'A test game',
    icon: '🎮',
    isActive: false,
    levels: [
      {
        level: 1,
        name: 'Level 1',
        config: { test: true },
      },
    ],
    rewards: {
      xpPerLevel: 100,
      bonusForPerfect: 50,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesLoaderService],
    }).compile();

    service = module.get<GamesLoaderService>(GamesLoaderService);

    // Override the gamesBasePath for testing
    (service as any).gamesBasePath = testGamesDir;

    // Create test directory
    await mkdir(testGamesDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await rm(testGamesDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('loadGameConfig', () => {
    it('should load a valid game configuration', async () => {
      // Setup: Create test game config file
      const gameDir = join(testGamesDir, 'token-tetris');
      await mkdir(gameDir, { recursive: true });
      await writeFile(
        join(gameDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );

      // Execute
      const config = await service.loadGameConfig('token-tetris');

      // Assert
      expect(config).toEqual(validTokenTetrisConfig);
      expect(config.slug).toBe('token-tetris');
      expect(config.name).toBe('Token Tetris');
      expect(config.levels).toHaveLength(2);
    });

    it('should throw NotFoundException for non-existent game', async () => {
      // Execute & Assert
      await expect(service.loadGameConfig('non-existent-game')).rejects.toThrow(NotFoundException);
    });

    it('should throw error for invalid JSON', async () => {
      // Setup: Create invalid JSON file
      const gameDir = join(testGamesDir, 'invalid-game');
      await mkdir(gameDir, { recursive: true });
      await writeFile(join(gameDir, 'config.json'), 'invalid json {');

      // Execute & Assert
      await expect(service.loadGameConfig('invalid-game')).rejects.toThrow();
    });

    it('should throw error for invalid config structure', async () => {
      // Setup: Create config with invalid structure
      const gameDir = join(testGamesDir, 'invalid-config');
      await mkdir(gameDir, { recursive: true });
      const invalidConfig = {
        slug: 'invalid-config',
        // Missing required fields
      };
      await writeFile(join(gameDir, 'config.json'), JSON.stringify(invalidConfig, null, 2));

      // Execute & Assert
      await expect(service.loadGameConfig('invalid-config')).rejects.toThrow();
    });
  });

  describe('loadAllGameConfigs', () => {
    it('should load all game configurations', async () => {
      // Setup: Create multiple game configs
      const tokenTetrisDir = join(testGamesDir, 'token-tetris');
      await mkdir(tokenTetrisDir, { recursive: true });
      await writeFile(
        join(tokenTetrisDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );

      const promptGolfDir = join(testGamesDir, 'prompt-golf');
      await mkdir(promptGolfDir, { recursive: true });
      await writeFile(
        join(promptGolfDir, 'config.json'),
        JSON.stringify(validPromptGolfConfig, null, 2)
      );

      // Execute
      const configs = await service.loadAllGameConfigs();

      // Assert
      expect(configs).toHaveLength(2);
      expect(configs.map((c) => c.slug)).toContain('token-tetris');
      expect(configs.map((c) => c.slug)).toContain('prompt-golf');
    });

    it('should return empty array when no games exist', async () => {
      // Execute
      const configs = await service.loadAllGameConfigs();

      // Assert
      expect(configs).toEqual([]);
    });

    it('should skip invalid game configs but load valid ones', async () => {
      // Setup: Create one valid and one invalid config
      const validDir = join(testGamesDir, 'valid-game');
      await mkdir(validDir, { recursive: true });
      await writeFile(
        join(validDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );

      const invalidDir = join(testGamesDir, 'invalid-game');
      await mkdir(invalidDir, { recursive: true });
      await writeFile(join(invalidDir, 'config.json'), 'invalid json');

      // Execute
      const configs = await service.loadAllGameConfigs();

      // Assert
      expect(configs).toHaveLength(1);
      expect(configs[0].slug).toBe('token-tetris');
    });
  });

  describe('loadActiveGameConfigs', () => {
    it('should load only active games', async () => {
      // Setup: Create active and inactive games
      const activeDir = join(testGamesDir, 'token-tetris');
      await mkdir(activeDir, { recursive: true });
      await writeFile(
        join(activeDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );

      const inactiveDir = join(testGamesDir, 'test-game');
      await mkdir(inactiveDir, { recursive: true });
      await writeFile(
        join(inactiveDir, 'config.json'),
        JSON.stringify(inactiveGameConfig, null, 2)
      );

      // Execute
      const configs = await service.loadActiveGameConfigs();

      // Assert
      expect(configs).toHaveLength(1);
      expect(configs[0].slug).toBe('token-tetris');
      expect(configs[0].isActive).toBe(true);
    });

    it('should return empty array when no active games exist', async () => {
      // Setup: Create only inactive game
      const inactiveDir = join(testGamesDir, 'test-game');
      await mkdir(inactiveDir, { recursive: true });
      await writeFile(
        join(inactiveDir, 'config.json'),
        JSON.stringify(inactiveGameConfig, null, 2)
      );

      // Execute
      const configs = await service.loadActiveGameConfigs();

      // Assert
      expect(configs).toEqual([]);
    });
  });

  describe('validateGameConfig', () => {
    it('should validate a correct game config', async () => {
      // Execute
      const isValid = await service.validateGameConfig(validTokenTetrisConfig);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject config with missing required fields', async () => {
      // Setup
      const invalidConfig = {
        slug: 'test-game',
        name: 'Test Game',
        // Missing description, icon, isActive, levels, rewards
      };

      // Execute
      const isValid = await service.validateGameConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject config with invalid slug format', async () => {
      // Setup
      const invalidConfig = {
        ...validTokenTetrisConfig,
        slug: 'Invalid Slug!', // Contains spaces and special characters
      };

      // Execute
      const isValid = await service.validateGameConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject config with non-sequential levels', async () => {
      // Setup
      const invalidConfig = {
        ...validTokenTetrisConfig,
        levels: [
          { level: 1, name: 'Level 1', config: {} },
          { level: 3, name: 'Level 3', config: {} }, // Skipped level 2
        ],
      };

      // Execute
      const isValid = await service.validateGameConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject config with invalid level structure', async () => {
      // Setup
      const invalidConfig = {
        ...validTokenTetrisConfig,
        levels: [
          { level: 1 }, // Missing name and config
        ],
      };

      // Execute
      const isValid = await service.validateGameConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject non-object config', async () => {
      // Execute
      const isValid = await service.validateGameConfig('not an object');

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject null config', async () => {
      // Execute
      const isValid = await service.validateGameConfig(null);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should accept config with valid slug formats', async () => {
      // Test various valid slug formats
      const validSlugs = ['game', 'token-tetris', 'prompt-golf-2', 'test123'];

      for (const slug of validSlugs) {
        const config = {
          ...validTokenTetrisConfig,
          slug,
        };

        const isValid = await service.validateGameConfig(config);
        expect(isValid).toBe(true);
      }
    });

    it('should reject config with invalid reward values', async () => {
      // Setup
      const invalidConfig = {
        ...validTokenTetrisConfig,
        rewards: {
          xpPerLevel: 'not a number', // Invalid type
          bonusForPerfect: 50,
        },
      };

      // Execute
      const isValid = await service.validateGameConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('getGameLevel', () => {
    beforeEach(async () => {
      // Setup: Create test game config
      const gameDir = join(testGamesDir, 'token-tetris');
      await mkdir(gameDir, { recursive: true });
      await writeFile(
        join(gameDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );
    });

    it('should get a specific level from a game', async () => {
      // Execute
      const level = await service.getGameLevel('token-tetris', 1);

      // Assert
      expect(level).toEqual({
        level: 1,
        name: 'Beginner',
        config: { speed: 1, tokenGoal: 50 },
      });
    });

    it('should get second level from a game', async () => {
      // Execute
      const level = await service.getGameLevel('token-tetris', 2);

      // Assert
      expect(level).toEqual({
        level: 2,
        name: 'Intermediate',
        config: { speed: 1.5, tokenGoal: 100 },
      });
    });

    it('should throw NotFoundException for non-existent level', async () => {
      // Execute & Assert
      await expect(service.getGameLevel('token-tetris', 99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent game', async () => {
      // Execute & Assert
      await expect(service.getGameLevel('non-existent', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGameRewards', () => {
    beforeEach(async () => {
      // Setup: Create test game config
      const gameDir = join(testGamesDir, 'token-tetris');
      await mkdir(gameDir, { recursive: true });
      await writeFile(
        join(gameDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );
    });

    it('should get rewards configuration for a game', async () => {
      // Execute
      const rewards = await service.getGameRewards('token-tetris');

      // Assert
      expect(rewards).toEqual({
        xpPerLevel: 100,
        bonusForPerfect: 50,
      });
    });

    it('should throw NotFoundException for non-existent game', async () => {
      // Execute & Assert
      await expect(service.getGameRewards('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game lifecycle', async () => {
      // Setup: Create game config
      const gameDir = join(testGamesDir, 'token-tetris');
      await mkdir(gameDir, { recursive: true });
      await writeFile(
        join(gameDir, 'config.json'),
        JSON.stringify(validTokenTetrisConfig, null, 2)
      );

      // Load game
      const config = await service.loadGameConfig('token-tetris');
      expect(config).toBeDefined();

      // Validate config
      const isValid = await service.validateGameConfig(config);
      expect(isValid).toBe(true);

      // Get specific level
      const level1 = await service.getGameLevel('token-tetris', 1);
      expect(level1.level).toBe(1);

      // Get rewards
      const rewards = await service.getGameRewards('token-tetris');
      expect(rewards.xpPerLevel).toBe(100);
    });

    it('should handle multiple games simultaneously', async () => {
      // Setup: Create multiple games
      const games = [validTokenTetrisConfig, validPromptGolfConfig];

      for (const game of games) {
        const gameDir = join(testGamesDir, game.slug);
        await mkdir(gameDir, { recursive: true });
        await writeFile(join(gameDir, 'config.json'), JSON.stringify(game, null, 2));
      }

      // Load all games
      const allConfigs = await service.loadAllGameConfigs();
      expect(allConfigs).toHaveLength(2);

      // Verify each game is accessible
      for (const game of games) {
        const config = await service.loadGameConfig(game.slug);
        expect(config.slug).toBe(game.slug);
      }
    });
  });
});
