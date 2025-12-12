import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LeaderboardType,
  LeaderboardResponseDto,
  LeaderboardEntryDto,
  RankChangeDirection,
} from './dto';
import { LeaderboardSnapshotType } from '@prisma/client';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

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

    // Get yesterday's snapshots for rank comparison
    const yesterday = this.getYesterdayDate();
    const userIds = topUsers.map((u) => u.user.id);
    const snapshots = await this.getSnapshotsForUsers(
      userIds,
      yesterday,
      LeaderboardSnapshotType.GLOBAL
    );

    // Format entries with proper ranking (considering offset)
    const entries: LeaderboardEntryDto[] = topUsers.map((entry, index) => {
      const currentRank = offset + index + 1;
      const snapshot = snapshots.get(entry.user.id);
      const rankChangeData = this.calculateRankChange(currentRank, snapshot);

      return {
        rank: currentRank,
        userId: entry.user.id,
        displayName: entry.user.displayName,
        avatarUrl: null, // Can be extended in the future
        totalXp: entry.totalXp,
        level: entry.level,
        isCurrentUser: entry.user.id === userId,
        ...rankChangeData,
      };
    });

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

        // Get yesterday's snapshot for this user
        const userSnapshot = await this.getSnapshotForUser(
          userId,
          yesterday,
          LeaderboardSnapshotType.GLOBAL
        );
        const rankChangeData = this.calculateRankChange(currentUserRank, userSnapshot);

        currentUserEntry = {
          rank: currentUserRank,
          userId: userProgress.user.id,
          displayName: userProgress.user.displayName,
          avatarUrl: null,
          totalXp: userProgress.totalXp,
          level: userProgress.level,
          isCurrentUser: true,
          ...rankChangeData,
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

    // Get yesterday's snapshots for rank comparison
    const yesterday = this.getYesterdayDate();
    const weeklyUserIds = paginatedData.map((w) => w.userId);
    const snapshots = await this.getSnapshotsForUsers(
      weeklyUserIds,
      yesterday,
      LeaderboardSnapshotType.WEEKLY
    );

    // Format entries with proper ranking
    const entries: LeaderboardEntryDto[] = paginatedData.map((w, index) => {
      const user = userMap.get(w.userId);
      const currentRank = offset + index + 1;
      const snapshot = snapshots.get(w.userId);
      const rankChangeData = this.calculateRankChange(currentRank, snapshot);

      return {
        rank: currentRank,
        userId: user?.id || '',
        displayName: user?.displayName || 'Unknown',
        avatarUrl: null,
        totalXp: w._sum.xpEarned || 0,
        level: user?.progress?.level || 1,
        isCurrentUser: user?.id === userId,
        ...rankChangeData,
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
          // Get yesterday's snapshot for this user
          const userSnapshot = await this.getSnapshotForUser(
            userId,
            yesterday,
            LeaderboardSnapshotType.WEEKLY
          );
          const rankChangeData = this.calculateRankChange(currentUserRank, userSnapshot);

          currentUserEntry = {
            rank: currentUserRank,
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: null,
            totalXp: userXp,
            level: user.progress?.level || 1,
            isCurrentUser: true,
            ...rankChangeData,
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

  private getYesterdayDate(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }

  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Get snapshots for multiple users on a specific date
   */
  private async getSnapshotsForUsers(
    userIds: string[],
    date: Date,
    type: LeaderboardSnapshotType
  ): Promise<Map<string, { rank: number; xp: number }>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const snapshots = await this.prisma.leaderboardSnapshot.findMany({
      where: {
        userId: { in: userIds },
        date,
        type,
      },
    });

    return new Map(snapshots.map((s) => [s.userId, { rank: s.rank, xp: s.xp }]));
  }

  /**
   * Get snapshot for a single user on a specific date
   */
  private async getSnapshotForUser(
    userId: string,
    date: Date,
    type: LeaderboardSnapshotType
  ): Promise<{ rank: number; xp: number } | null> {
    const snapshot = await this.prisma.leaderboardSnapshot.findUnique({
      where: {
        userId_date_type: {
          userId,
          date,
          type,
        },
      },
    });

    return snapshot ? { rank: snapshot.rank, xp: snapshot.xp } : null;
  }

  /**
   * Calculate rank change based on current rank and previous snapshot
   */
  private calculateRankChange(
    currentRank: number,
    snapshot: { rank: number; xp: number } | null | undefined
  ): { rankChange: number; rankChangeDirection: RankChangeDirection } {
    if (!snapshot) {
      // New entry (no previous snapshot)
      return {
        rankChange: 0,
        rankChangeDirection: 'new',
      };
    }

    const previousRank = snapshot.rank;
    // Lower rank number = better position
    // If current rank is lower than previous, they moved up
    const change = previousRank - currentRank;

    if (change > 0) {
      return {
        rankChange: change,
        rankChangeDirection: 'up',
      };
    } else if (change < 0) {
      return {
        rankChange: Math.abs(change),
        rankChangeDirection: 'down',
      };
    } else {
      return {
        rankChange: 0,
        rankChangeDirection: 'same',
      };
    }
  }

  /**
   * Create daily snapshots for all users in the leaderboard
   * This should be called by a cron job at midnight
   */
  async createDailySnapshots(): Promise<void> {
    const today = this.getTodayDate();

    try {
      this.logger.log('Starting daily leaderboard snapshot creation...');

      // Create global leaderboard snapshots
      await this.createSnapshotsForType(today, LeaderboardSnapshotType.GLOBAL);

      // Create weekly leaderboard snapshots
      await this.createSnapshotsForType(today, LeaderboardSnapshotType.WEEKLY);

      this.logger.log('Daily leaderboard snapshots created successfully');
    } catch (error) {
      this.logger.error('Failed to create daily snapshots', error);
      throw error;
    }
  }

  /**
   * Create snapshots for a specific leaderboard type
   */
  private async createSnapshotsForType(date: Date, type: LeaderboardSnapshotType): Promise<void> {
    if (type === LeaderboardSnapshotType.GLOBAL) {
      // Get all users ordered by total XP
      const users = await this.prisma.userProgress.findMany({
        orderBy: { totalXp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      const snapshots = users.map((user, index) => ({
        userId: user.user.id,
        rank: index + 1,
        xp: user.totalXp,
        type,
        date,
      }));

      // Batch insert snapshots
      if (snapshots.length > 0) {
        await this.prisma.leaderboardSnapshot.createMany({
          data: snapshots,
          skipDuplicates: true,
        });
        this.logger.log(`Created ${snapshots.length} global snapshots`);
      }
    } else if (type === LeaderboardSnapshotType.WEEKLY) {
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

      const snapshots = weeklyXpData.map((data, index) => ({
        userId: data.userId,
        rank: index + 1,
        xp: data._sum.xpEarned || 0,
        type,
        date,
      }));

      // Batch insert snapshots
      if (snapshots.length > 0) {
        await this.prisma.leaderboardSnapshot.createMany({
          data: snapshots,
          skipDuplicates: true,
        });
        this.logger.log(`Created ${snapshots.length} weekly snapshots`);
      }
    }
  }
}
