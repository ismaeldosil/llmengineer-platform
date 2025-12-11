import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(
    userId: string,
    type: 'global' | 'weekly',
    limit: number = 10,
  ) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let entries;

    if (type === 'global') {
      entries = await this.prisma.userProgress.findMany({
        orderBy: { totalXp: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });
    } else {
      const weeklyXp = await this.prisma.lessonCompletion.groupBy({
        by: ['userId'],
        _sum: { xpEarned: true },
        where: {
          completedAt: { gte: startOfWeek },
        },
        orderBy: {
          _sum: { xpEarned: 'desc' },
        },
        take: limit,
      });

      const userIds = weeklyXp.map((w) => w.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { progress: true },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      entries = weeklyXp.map((w) => {
        const user = userMap.get(w.userId) as any;
        return {
          user: {
            id: user?.id,
            displayName: user?.displayName,
          },
          totalXp: w._sum.xpEarned || 0,
          level: user?.progress?.level || 1,
        };
      });
    }

    const formattedEntries =
      type === 'global'
        ? entries.map((entry, index) => ({
            rank: index + 1,
            userId: entry.user.id,
            displayName: entry.user.displayName,
            totalXp: entry.totalXp,
            level: entry.level,
            isCurrentUser: entry.user.id === userId,
          }))
        : entries.map((entry, index) => ({
            rank: index + 1,
            userId: entry.user?.id,
            displayName: entry.user?.displayName,
            totalXp: entry.totalXp,
            level: entry.level,
            isCurrentUser: entry.user?.id === userId,
          }));

    const userInList = formattedEntries.find((e) => e.isCurrentUser);
    let userRank = userInList?.rank;

    if (!userRank) {
      if (type === 'global') {
        const userProgress = await this.prisma.userProgress.findUnique({
          where: { userId },
        });
        if (userProgress) {
          const rank = await this.prisma.userProgress.count({
            where: { totalXp: { gt: userProgress.totalXp } },
          });
          userRank = rank + 1;
        }
      }
    }

    return {
      entries: formattedEntries,
      userRank: userRank || 0,
    };
  }
}
