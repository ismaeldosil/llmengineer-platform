import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel, getLevelTitle } from '@llmengineer/shared';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate level based on total XP
   */
  calculateLevel(totalXp: number): number {
    return calculateLevel(totalXp);
  }

  /**
   * Add XP to user and detect level ups
   */
  async addXp(userId: string, xp: number) {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return null;
    }

    const oldLevel = progress.level;
    const newTotalXp = progress.totalXp + xp;
    const newLevel = this.calculateLevel(newTotalXp);
    const newTitle = getLevelTitle(newLevel);
    const leveledUp = newLevel > oldLevel;

    const updatedProgress = await this.prisma.userProgress.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: newLevel,
        levelTitle: newTitle,
        lastActiveAt: new Date(),
      },
    });

    return {
      ...updatedProgress,
      leveledUp,
      xpAdded: xp,
    };
  }

  /**
   * Check-in user for daily streak
   */
  async checkin(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingCheckin = await this.prisma.streakLog.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (existingCheckin) {
      const progress = await this.prisma.userProgress.findUnique({
        where: { userId },
      });
      return {
        currentStreak: progress?.currentStreak || 0,
        streakBonusXp: 0,
        alreadyCheckedIn: true,
      };
    }

    // Check if checked in yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCheckin = await this.prisma.streakLog.findUnique({
      where: {
        userId_date: { userId, date: yesterday },
      },
    });

    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    // Calculate new streak
    let newStreak: number;
    if (yesterdayCheckin) {
      newStreak = (progress?.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    // Calculate streak bonus
    const streakBonusXp = this.calculateStreakBonus(newStreak);

    // Create streak log
    await this.prisma.streakLog.create({
      data: {
        userId,
        date: today,
        bonusXp: streakBonusXp,
      },
    });

    // Update progress
    const updatedProgress = await this.prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(progress?.longestStreak || 0, newStreak),
        totalXp: { increment: streakBonusXp },
        lastActiveAt: new Date(),
      },
    });

    // Check for badge awards
    await this.checkAndAwardBadges(userId);

    return {
      currentStreak: updatedProgress.currentStreak,
      streakBonusXp,
      alreadyCheckedIn: false,
    };
  }

  /**
   * Calculate streak bonus based on streak length
   */
  private calculateStreakBonus(streak: number): number {
    if (streak >= 30) return 100;
    if (streak >= 14) return 50;
    if (streak >= 7) return 25;
    if (streak >= 3) return 10;
    return 5;
  }

  /**
   * Check user progress and award any earned badges
   */
  async checkAndAwardBadges(userId: string) {
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

    const newBadges = [];

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
      progress.lessonsCompleted >= (requirement.lessonsCompleted as number)
    ) {
      return true;
    }

    // Check streak requirement
    if (
      requirement.streak !== undefined &&
      progress.currentStreak >= (requirement.streak as number)
    ) {
      return true;
    }

    // Check level requirement
    if (requirement.level !== undefined && progress.level >= (requirement.level as number)) {
      return true;
    }

    // Check total XP requirement
    if (requirement.totalXp !== undefined && progress.totalXp >= (requirement.totalXp as number)) {
      return true;
    }

    return false;
  }

  /**
   * Get user progress
   */
  async getProgress(userId: string) {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            badges: {
              include: {
                badge: true,
              },
            },
          },
        },
      },
    });

    if (!progress) {
      return null;
    }

    const xpForNextLevel = progress.level * 500; // XP_PER_LEVEL = 500
    const xpInCurrentLevel = progress.totalXp % 500;
    const xpToNextLevel = xpForNextLevel - progress.totalXp;

    return {
      totalXp: progress.totalXp,
      level: progress.level,
      levelTitle: progress.levelTitle,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lessonsCompleted: progress.lessonsCompleted,
      xpToNextLevel,
      xpInCurrentLevel,
      badges: progress.user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
    };
  }
}
