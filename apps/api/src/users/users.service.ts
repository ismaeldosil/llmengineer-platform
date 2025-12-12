import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel, getLevelTitle, getXpForNextLevel, getXpProgressInLevel } from '@llmengineer/shared';
import { UpdateProfileDto, UserStatsDto } from './dto';

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
      const quiz = completion.lesson.quiz as any;
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
}
