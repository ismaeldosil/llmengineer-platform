import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeCategory } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Badge data structure from JSON file
 */
export interface BadgeData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: {
    type: string;
    value: number | string | boolean;
  };
  xpReward: number;
  isSecret?: boolean;
}

/**
 * Result of badge loading operation
 */
export interface BadgeLoadResult {
  created: number;
  updated: number;
  errors: Array<{ slug: string; error: string }>;
}

@Injectable()
export class BadgesLoaderService {
  private readonly logger = new Logger(BadgesLoaderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Load badges from a JSON file and upsert them to the database
   * @param filePath - Absolute or relative path to badges.json
   * @returns Result summary with counts of created/updated badges
   */
  async loadBadgesFromFile(filePath: string): Promise<BadgeLoadResult> {
    this.logger.log(`Loading badges from file: ${filePath}`);

    const result: BadgeLoadResult = {
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      // Read and parse JSON file
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);

      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const data = JSON.parse(fileContent);

      if (!data.badges || !Array.isArray(data.badges)) {
        throw new Error('Invalid JSON structure: "badges" array not found');
      }

      this.logger.log(`Found ${data.badges.length} badges to process`);

      // Process each badge
      for (const badgeData of data.badges) {
        try {
          // Validate badge structure
          if (!this.validateBadgeStructure(badgeData)) {
            result.errors.push({
              slug: badgeData.slug || 'unknown',
              error: 'Invalid badge structure',
            });
            continue;
          }

          // Upsert badge
          const isUpdate = await this.upsertBadge(badgeData);
          if (isUpdate) {
            result.updated++;
          } else {
            result.created++;
          }

          this.logger.debug(`${isUpdate ? 'Updated' : 'Created'} badge: ${badgeData.slug}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            slug: badgeData.slug || 'unknown',
            error: errorMessage,
          });
          this.logger.error(`Error processing badge ${badgeData.slug}: ${errorMessage}`);
        }
      }

      // Log summary
      this.logger.log(
        `Badges loaded successfully. Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors.length}`
      );

      if (result.errors.length > 0) {
        this.logger.warn(`Errors encountered:`);
        result.errors.forEach((err) => {
          this.logger.warn(`  - ${err.slug}: ${err.error}`);
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load badges from file: ${errorMessage}`);
      throw new Error(`Failed to load badges: ${errorMessage}`);
    }
  }

  /**
   * Validate that a badge object has all required fields and correct types
   * @param badge - Badge data object to validate
   * @returns true if valid, false otherwise
   */
  validateBadgeStructure(badge: unknown): badge is BadgeData {
    if (!badge || typeof badge !== 'object') {
      return false;
    }

    const b = badge as Record<string, unknown>;

    // Check required string fields
    if (
      typeof b.slug !== 'string' ||
      typeof b.name !== 'string' ||
      typeof b.description !== 'string' ||
      typeof b.icon !== 'string' ||
      typeof b.category !== 'string'
    ) {
      return false;
    }

    // Check category is valid
    const validCategories: string[] = ['progress', 'streak', 'completion', 'mastery', 'special'];
    if (!validCategories.includes(b.category)) {
      this.logger.warn(
        `Invalid category for badge ${b.slug}: ${b.category}. Valid categories: ${validCategories.join(', ')}`
      );
      return false;
    }

    // Check xpReward is a number
    if (typeof b.xpReward !== 'number' || b.xpReward < 0) {
      return false;
    }

    // Check requirement structure
    if (!b.requirement || typeof b.requirement !== 'object') {
      return false;
    }

    const req = b.requirement as Record<string, unknown>;
    if (typeof req.type !== 'string' || req.value === undefined) {
      return false;
    }

    // Check isSecret is boolean if provided
    if (b.isSecret !== undefined && typeof b.isSecret !== 'boolean') {
      return false;
    }

    return true;
  }

  /**
   * Upsert a single badge to the database
   * @param badge - Badge data to upsert
   * @returns true if badge was updated, false if created
   */
  async upsertBadge(badge: BadgeData): Promise<boolean> {
    // Check if badge already exists
    const existing = await this.prisma.badge.findUnique({
      where: { slug: badge.slug },
    });

    const badgeCategory = badge.category as BadgeCategory;

    const badgeInput = {
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badgeCategory,
      requirement: badge.requirement,
      xpBonus: badge.xpReward,
      isSecret: badge.isSecret || false,
    };

    if (existing) {
      // Update existing badge
      await this.prisma.badge.update({
        where: { slug: badge.slug },
        data: badgeInput,
      });
      return true;
    } else {
      // Create new badge
      await this.prisma.badge.create({
        data: badgeInput,
      });
      return false;
    }
  }

  /**
   * Load badges from the default location (prisma/content/badges.json)
   * @returns Result summary with counts of created/updated badges
   */
  async loadDefaultBadges(): Promise<BadgeLoadResult> {
    const defaultPath = path.resolve(process.cwd(), 'prisma/content/badges.json');
    return this.loadBadgesFromFile(defaultPath);
  }
}
