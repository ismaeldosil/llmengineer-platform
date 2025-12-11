import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Badge } from '@prisma/client';

export interface BadgeWithEarnedAt extends Badge {
  earnedAt: Date;
}

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all badges with earned/locked status for a user
   */
  async findAll(userId: string) {
    const allBadges = await this.prisma.badge.findMany({
      where: { isSecret: false },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });

    const earnedBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    const earnedIds = new Set(earnedBadges.map((ub) => ub.badgeId));

    return {
      earned: earnedBadges.map((ub) => ({
        id: ub.badge.id,
        slug: ub.badge.slug,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        category: ub.badge.category,
        xpBonus: ub.badge.xpBonus,
        earnedAt: ub.earnedAt,
      })),
      locked: allBadges
        .filter((b) => !earnedIds.has(b.id))
        .map((b) => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          description: b.description,
          icon: b.icon,
          category: b.category,
          requirement: b.requirement,
        })),
    };
  }

  /**
   * Get only earned badges for a user
   */
  async findUserBadges(userId: string): Promise<BadgeWithEarnedAt[]> {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));
  }

  /**
   * Check user progress and award any earned badges
   * Returns newly awarded badges
   */
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) return [];

    const badges = await this.prisma.badge.findMany();
    const earnedBadgeIds = (
      await this.prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      })
    ).map((ub) => ub.badgeId);

    const newBadges: Badge[] = [];

    for (const badge of badges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      const requirement = badge.requirement as Record<string, unknown>;
      const earned = this.checkBadgeRequirement(requirement, progress);

      if (earned) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        newBadges.push(badge);

        // Award XP bonus if applicable
        if (badge.xpBonus > 0) {
          await this.prisma.userProgress.update({
            where: { userId },
            data: { totalXp: { increment: badge.xpBonus } },
          });
        }
      }
    }

    return newBadges;
  }

  /**
   * Check if a badge requirement is met
   * @private
   */
  private checkBadgeRequirement(
    requirement: Record<string, unknown>,
    progress: {
      lessonsCompleted: number;
      currentStreak: number;
      level: number;
      totalXp: number;
    }
  ): boolean {
    // Check lessons completed requirement
    if (
      requirement.lessonsCompleted !== undefined &&
      progress.lessonsCompleted >= requirement.lessonsCompleted
    ) {
      return true;
    }

    // Check streak requirement
    if (requirement.streak !== undefined && progress.currentStreak >= requirement.streak) {
      return true;
    }

    // Check level requirement
    if (requirement.level !== undefined && progress.level >= requirement.level) {
      return true;
    }

    // Check total XP requirement
    if (requirement.totalXp !== undefined && progress.totalXp >= requirement.totalXp) {
      return true;
    }

    // Future: Add support for weekComplete, allWeeksComplete, etc.
    // These would require additional database queries

    return false;
  }
}
