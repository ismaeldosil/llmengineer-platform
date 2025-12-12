import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  calculateLevel,
  getLevelTitle,
  getXpProgressInLevel,
} from '@llmengineer/shared';
import {
  UpdateProfileDto,
  UserStatsDto,
  XpHistoryQueryDto,
  XpHistoryResponseDto,
  XpHistoryItemDto,
  XpHistoryDetailDto,
} from './dto';

interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserData) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        progress: {
          create: {
            totalXp: 0,
            level: 1,
            levelTitle: 'Prompt Curious',
          },
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });
    return user;
  }

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

    return {
      totalXp: progress.totalXp,
      level: progress.level,
      levelTitle: progress.levelTitle,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lessonsCompleted: progress.lessonsCompleted,
      badges: progress.user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
    };
  }

  async updateLastActive(userId: string) {
    return this.prisma.userProgress.update({
      where: { userId },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  async addXp(userId: string, xp: number) {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return null;
    }

    const oldLevel = progress.level;
    const newTotalXp = progress.totalXp + xp;
    const newLevel = calculateLevel(newTotalXp);
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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Validate that displayName is provided and not empty
    if (dto.displayName !== undefined) {
      const trimmedName = dto.displayName.trim();
      if (trimmedName.length === 0) {
        throw new BadRequestException('El nombre no puede estar vacío');
      }
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName.trim() }),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async getStats(userId: string): Promise<UserStatsDto> {
    // Get user progress for current level and XP
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      throw new BadRequestException('User progress not found');
    }

    // Get all lesson completions for the user
    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            week: true,
            quiz: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Calculate total study time (convert seconds to minutes)
    const totalStudyTime = Math.round(
      completions.reduce((sum, c) => sum + c.timeSpentSeconds, 0) / 60
    );

    // Group lessons by week
    const lessonsPerWeekMap = new Map<number, number>();
    completions.forEach((completion) => {
      const week = completion.lesson.week;
      lessonsPerWeekMap.set(week, (lessonsPerWeekMap.get(week) || 0) + 1);
    });

    const lessonsPerWeek = Array.from(lessonsPerWeekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week - b.week);

    // Calculate quiz statistics
    // Note: Quiz scores are stored in the lesson.quiz JSON field
    // We need to extract quiz results from completions
    let totalQuizScore = 0;
    let totalQuizzesTaken = 0;
    let perfectQuizzes = 0;

    completions.forEach((completion) => {
      const quiz = completion.lesson.quiz as { score?: number } | null;
      if (quiz && quiz.score !== undefined) {
        totalQuizScore += quiz.score;
        totalQuizzesTaken++;
        if (quiz.score === 100) {
          perfectQuizzes++;
        }
      }
    });

    const quizAverage = totalQuizzesTaken > 0 ? totalQuizScore / totalQuizzesTaken : 0;

    // Get XP history - group completions by date
    const xpHistoryMap = new Map<string, number>();
    completions.forEach((completion) => {
      const date = completion.completedAt.toISOString().split('T')[0];
      xpHistoryMap.set(date, (xpHistoryMap.get(date) || 0) + completion.xpEarned);
    });

    const xpHistory = Array.from(xpHistoryMap.entries())
      .map(([date, xp]) => ({ date, xp }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get streak history from StreakLog
    const streakLogs = await this.prisma.streakLog.findMany({
      where: { userId },
      orderBy: {
        date: 'asc',
      },
    });

    // Build streak history - calculate cumulative streak
    const streakHistory = streakLogs
      .filter((log) => log.checkedIn)
      .map((log, index) => ({
        date: log.date.toISOString().split('T')[0],
        streak: index + 1, // Simple incremental streak
      }));

    // Calculate XP to next level
    const currentLevel = progress.level;
    const currentXp = progress.totalXp;
    const xpProgressInLevel = getXpProgressInLevel(currentXp);
    const xpToNextLevel = 500 - xpProgressInLevel; // XP_PER_LEVEL is 500

    return {
      totalStudyTime,
      lessonsPerWeek,
      quizAverage: Math.round(quizAverage * 100) / 100, // Round to 2 decimal places
      xpHistory,
      streakHistory,
      totalLessonsCompleted: progress.lessonsCompleted,
      totalQuizzesTaken,
      perfectQuizzes,
      currentLevel,
      currentXp,
      xpToNextLevel,
    };
  }

  async getXpHistory(userId: string, query: XpHistoryQueryDto): Promise<XpHistoryResponseDto> {
    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (query.startDate && query.endDate) {
      // Use provided date range
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);

      // Validate date range
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check if range exceeds 90 days
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 90) {
        throw new BadRequestException('Date range cannot exceed 90 days');
      }
    } else {
      // Use days parameter (default: 30)
      const days = query.days || 30;
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // End of today
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0); // Start of day
    }

    // Get all lesson completions within date range
    const completions = await this.prisma.lessonCompletion.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lesson: {
          select: {
            title: true,
            xpReward: true,
            quiz: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Get streak logs within date range for bonus XP
    const streakLogs = await this.prisma.streakLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        checkedIn: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get user badges earned within date range
    const badges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        earnedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        badge: {
          select: {
            name: true,
            xpBonus: true,
          },
        },
      },
      orderBy: {
        earnedAt: 'asc',
      },
    });

    // Build daily XP history with details
    const historyMap = new Map<
      string,
      {
        xp: number;
        sources: Set<string>;
        details: XpHistoryDetailDto[];
      }
    >();

    // Process lesson completions
    completions.forEach((completion) => {
      const date = completion.completedAt.toISOString().split('T')[0];

      if (!historyMap.has(date)) {
        historyMap.set(date, { xp: 0, sources: new Set(), details: [] });
      }

      const dayData = historyMap.get(date)!;
      dayData.xp += completion.xpEarned;
      dayData.sources.add('lesson');

      // Add detail for lesson completion
      dayData.details.push({
        source: 'lesson',
        xp: completion.xpEarned,
        description: `Completed lesson: ${completion.lesson.title}`,
      });

      // Check if there was a quiz
      const quiz = completion.lesson.quiz as { score?: number } | null;
      if (quiz && quiz.score !== undefined) {
        dayData.sources.add('quiz');
        // Quiz XP is already included in lesson XP, but we mark it as a source
      }
    });

    // Process streak bonuses
    streakLogs.forEach((log) => {
      const date = log.date.toISOString().split('T')[0];

      if (log.bonusXp > 0) {
        if (!historyMap.has(date)) {
          historyMap.set(date, { xp: 0, sources: new Set(), details: [] });
        }

        const dayData = historyMap.get(date)!;
        dayData.xp += log.bonusXp;
        dayData.sources.add('streak');

        dayData.details.push({
          source: 'streak',
          xp: log.bonusXp,
          description: `Streak bonus`,
        });
      }
    });

    // Process badge XP
    badges.forEach((userBadge) => {
      const date = userBadge.earnedAt.toISOString().split('T')[0];

      if (userBadge.badge.xpBonus > 0) {
        if (!historyMap.has(date)) {
          historyMap.set(date, { xp: 0, sources: new Set(), details: [] });
        }

        const dayData = historyMap.get(date)!;
        dayData.xp += userBadge.badge.xpBonus;
        dayData.sources.add('badge');

        dayData.details.push({
          source: 'badge',
          xp: userBadge.badge.xpBonus,
          description: `Earned badge: ${userBadge.badge.name}`,
        });
      }
    });

    // Convert map to sorted array
    const history: XpHistoryItemDto[] = Array.from(historyMap.entries())
      .map(([date, data]) => ({
        date,
        xp: data.xp,
        sources: Array.from(data.sources),
        details: data.details,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate statistics
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalThisWeek = 0;
    let totalThisMonth = 0;
    let totalXp = 0;
    let bestDay = { date: '', xp: 0 };

    history.forEach((item) => {
      const itemDate = new Date(item.date);
      totalXp += item.xp;

      // Check if in current week
      if (itemDate >= currentWeekStart) {
        totalThisWeek += item.xp;
      }

      // Check if in current month
      if (itemDate >= currentMonthStart) {
        totalThisMonth += item.xp;
      }

      // Track best day
      if (item.xp > bestDay.xp) {
        bestDay = { date: item.date, xp: item.xp };
      }
    });

    // Calculate average per day (only for days with activity)
    const averagePerDay =
      history.length > 0 ? Math.round((totalXp / history.length) * 100) / 100 : 0;

    return {
      history,
      totalThisWeek,
      totalThisMonth,
      averagePerDay,
      bestDay: bestDay.xp > 0 ? bestDay : { date: '', xp: 0 },
    };
  }
}
