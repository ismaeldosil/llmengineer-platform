import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardType, LeaderboardResponseDto, LeaderboardEntryDto } from './dto';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(
    userId: string,
    type: LeaderboardType,
    limit: number = 50,
    offset: number = 0
  ): Promise<LeaderboardResponseDto> {
    if (type === LeaderboardType.GLOBAL) {
      return this.getGlobalLeaderboard(userId, limit, offset);
    } else {
      return this.getWeeklyLeaderboard(userId, limit, offset);
    }
  }

  private async getGlobalLeaderboard(
    userId: string,
    limit: number,
    offset: number
  ): Promise<LeaderboardResponseDto> {
    // Get top users with pagination
    const topUsers = await this.prisma.userProgress.findMany({
      orderBy: { totalXp: 'desc' },
      skip: offset,
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

    // Format entries with proper ranking (considering offset)
    const entries: LeaderboardEntryDto[] = topUsers.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.user.id,
      displayName: entry.user.displayName,
      avatarUrl: null, // Can be extended in the future
      totalXp: entry.totalXp,
      level: entry.level,
      isCurrentUser: entry.user.id === userId,
    }));

    // Check if current user is in the list
    const userInList = entries.find((e) => e.isCurrentUser);
    let currentUserRank = 0;
    let currentUserEntry: LeaderboardEntryDto | null = null;

    if (userInList) {
      currentUserRank = userInList.rank;
    } else {
      // User not in current page, get their actual rank and data
      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });

      if (userProgress) {
        // Calculate rank by counting users with more XP
        const rank = await this.prisma.userProgress.count({
          where: { totalXp: { gt: userProgress.totalXp } },
        });
        currentUserRank = rank + 1;

        currentUserEntry = {
          rank: currentUserRank,
          userId: userProgress.user.id,
          displayName: userProgress.user.displayName,
          avatarUrl: null,
          totalXp: userProgress.totalXp,
          level: userProgress.level,
          isCurrentUser: true,
        };
      }
    }

    return {
      entries,
      currentUserRank,
      currentUserEntry,
      total: entries.length,
      offset,
    };
  }

  private async getWeeklyLeaderboard(
    userId: string,
    limit: number,
    offset: number
  ): Promise<LeaderboardResponseDto> {
    const startOfWeek = this.getStartOfWeek();

    // Get weekly XP aggregated by user
    const weeklyXpData = await this.prisma.lessonCompletion.groupBy({
      by: ['userId'],
      _sum: { xpEarned: true },
      where: {
        completedAt: { gte: startOfWeek },
      },
      orderBy: {
        _sum: { xpEarned: 'desc' },
      },
    });

    // Apply pagination to the aggregated data
    const paginatedData = weeklyXpData.slice(offset, offset + limit);
    const userIds = paginatedData.map((w) => w.userId);

    // Get user details and progress
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        progress: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Format entries with proper ranking
    const entries: LeaderboardEntryDto[] = paginatedData.map((w, index) => {
      const user = userMap.get(w.userId);
      return {
        rank: offset + index + 1,
        userId: user?.id || '',
        displayName: user?.displayName || 'Unknown',
        avatarUrl: null,
        totalXp: w._sum.xpEarned || 0,
        level: user?.progress?.level || 1,
        isCurrentUser: user?.id === userId,
      };
    });

    // Check if current user is in the list
    const userInList = entries.find((e) => e.isCurrentUser);
    let currentUserRank = 0;
    let currentUserEntry: LeaderboardEntryDto | null = null;

    if (userInList) {
      currentUserRank = userInList.rank;
    } else {
      // Get current user's weekly XP
      const userWeeklyXp = await this.prisma.lessonCompletion.aggregate({
        _sum: { xpEarned: true },
        where: {
          userId,
          completedAt: { gte: startOfWeek },
        },
      });

      const userXp = userWeeklyXp._sum.xpEarned || 0;

      if (userXp > 0) {
        // Calculate rank by counting users with more weekly XP
        const rank = weeklyXpData.findIndex((w) => w.userId === userId);
        currentUserRank = rank >= 0 ? rank + 1 : 0;

        // Get user details
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { progress: true },
        });

        if (user) {
          currentUserEntry = {
            rank: currentUserRank,
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: null,
            totalXp: userXp,
            level: user.progress?.level || 1,
            isCurrentUser: true,
          };
        }
      }
    }

    return {
      entries,
      currentUserRank,
      currentUserEntry,
      total: entries.length,
      offset,
    };
  }

  private getStartOfWeek(): Date {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Set to start of week (Sunday)
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
}
