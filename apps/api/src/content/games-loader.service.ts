import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { GameValidationDto } from './dto/game-validation.dto';

export interface GameLevel {
  level: number;
  name: string;
  config: Record<string, any>;
}

export interface GameRewards {
  xpPerLevel: number;
  bonusForPerfect: number;
}

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  levels: GameLevel[];
  rewards: GameRewards;
}

@Injectable()
export class GamesLoaderService {
  private readonly logger = new Logger(GamesLoaderService.name);
  private readonly gamesBasePath: string;

  constructor() {
    // Path to games config directory
    this.gamesBasePath = join(__dirname, '../../prisma/content/games');
  }

  /**
   * Loads a single game configuration by slug
   * @param gameSlug The slug of the game to load
   * @returns Promise<GameConfig>
   * @throws NotFoundException if game config not found
   */
  async loadGameConfig(gameSlug: string): Promise<GameConfig> {
    try {
      const configPath = join(this.gamesBasePath, gameSlug, 'config.json');
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content) as GameConfig;

      // Validate the config
      const isValid = await this.validateGameConfig(config);
      if (!isValid) {
        throw new Error(`Invalid configuration for game: ${gameSlug}`);
      }

      this.logger.log(`Successfully loaded game config: ${gameSlug}`);
      return config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException(`Game config not found: ${gameSlug}`);
      }
      this.logger.error(`Error loading game config ${gameSlug}:`, error);
      throw error;
    }
  }

  /**
   * Loads all available game configurations
   * @returns Promise<GameConfig[]>
   */
  async loadAllGameConfigs(): Promise<GameConfig[]> {
    try {
      const gameConfigs: GameConfig[] = [];

      // Read all directories in the games folder
      const gameDirs = await readdir(this.gamesBasePath, { withFileTypes: true });
      const directories = gameDirs.filter((dirent) => dirent.isDirectory());

      for (const dir of directories) {
        try {
          const config = await this.loadGameConfig(dir.name);
          gameConfigs.push(config);
        } catch (error) {
          // Log error but continue loading other games
          this.logger.warn(`Failed to load game config for ${dir.name}:`, error);
        }
      }

      this.logger.log(`Successfully loaded ${gameConfigs.length} game configurations`);
      return gameConfigs;
    } catch (error) {
      this.logger.error('Error loading game configs:', error);
      throw error;
    }
  }

  /**
   * Loads only active game configurations
   * @returns Promise<GameConfig[]>
   */
  async loadActiveGameConfigs(): Promise<GameConfig[]> {
    const allConfigs = await this.loadAllGameConfigs();
    return allConfigs.filter((config) => config.isActive);
  }

  /**
   * Validates a game configuration against the schema
   * @param config The game configuration to validate
   * @returns boolean indicating if the config is valid
   */
  async validateGameConfig(config: unknown): Promise<boolean> {
    try {
      // Check if config is an object
      if (!config || typeof config !== 'object') {
        this.logger.error('Game config must be an object');
        return false;
      }

      // Transform plain object to DTO instance
      const gameDto = plainToInstance(GameValidationDto, config);

      // Validate using class-validator
      const validationErrors = await validate(gameDto);

      if (validationErrors.length > 0) {
        this.logger.error('Game config validation failed:', validationErrors);
        return false;
      }

      // Additional custom validation
      const gameConfig = config as GameConfig;

      // Validate levels are sequential
      const levels = gameConfig.levels;
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].level !== i + 1) {
          this.logger.error(
            `Level numbers must be sequential. Expected ${i + 1}, got ${levels[i].level}`
          );
          return false;
        }
      }

      // Validate slug format (lowercase, hyphens only)
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(gameConfig.slug)) {
        this.logger.error(
          `Invalid slug format: ${gameConfig.slug}. Must be lowercase with hyphens only.`
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error validating game config:', error);
      return false;
    }
  }

  /**
   * Gets a specific level configuration from a game
   * @param gameSlug The slug of the game
   * @param level The level number
   * @returns Promise<GameLevel>
   * @throws NotFoundException if game or level not found
   */
  async getGameLevel(gameSlug: string, level: number): Promise<GameLevel> {
    const config = await this.loadGameConfig(gameSlug);
    const levelConfig = config.levels.find((l) => l.level === level);

    if (!levelConfig) {
      throw new NotFoundException(`Level ${level} not found for game: ${gameSlug}`);
    }

    return levelConfig;
  }

  /**
   * Gets the rewards configuration for a game
   * @param gameSlug The slug of the game
   * @returns Promise<GameRewards>
   */
  async getGameRewards(gameSlug: string): Promise<GameRewards> {
    const config = await this.loadGameConfig(gameSlug);
    return config.rewards;
  }
}
