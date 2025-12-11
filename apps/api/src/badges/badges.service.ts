import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const allBadges = await this.prisma.badge.findMany({
      where: { isSecret: false },
      orderBy: { category: 'asc' },
    });

    const earnedBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    const earnedIds = new Set(earnedBadges.map((ub) => ub.badgeId));

    return {
      earned: earnedBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        category: ub.badge.category,
        earnedAt: ub.earnedAt,
      })),
      locked: allBadges
        .filter((b) => !earnedIds.has(b.id))
        .map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          category: b.category,
        })),
    };
  }

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

      const requirement = badge.requirement as Record<string, number>;
      let earned = false;

      if (requirement.lessonsCompleted && progress.lessonsCompleted >= requirement.lessonsCompleted) {
        earned = true;
      }
      if (requirement.streak && progress.currentStreak >= requirement.streak) {
        earned = true;
      }
      if (requirement.level && progress.level >= requirement.level) {
        earned = true;
      }
      if (requirement.totalXp && progress.totalXp >= requirement.totalXp) {
        earned = true;
      }

      if (earned) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        newBadges.push(badge);

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
}
