import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { calculateLessonXpWithBonuses, calculateXpWithMultipliers } from '@llmengineer/shared';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private badgesService: BadgesService
  ) {}

  async findAll(userId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { isPublished: true },
      orderBy: [{ week: 'asc' }, { order: 'asc' }],
    });

    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId },
      select: { lessonId: true },
    });

    const completedIds = new Set(completions.map((c) => c.lessonId));

    return lessons.map((lesson) => ({
      ...lesson,
      isCompleted: completedIds.has(lesson.id),
    }));
  }

  async findOne(idOrSlug: string, userId: string) {
    // Try to find by ID first, then by slug
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    const completion = await this.prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: { userId, lessonId: lesson.id },
      },
    });

    return {
      ...lesson,
      isCompleted: !!completion,
    };
  }

  async complete(lessonId: string, userId: string, timeSpentSeconds: number, quizScore?: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    const existingCompletion = await this.prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (existingCompletion) {
      throw new ConflictException('Lección ya completada');
    }

    // Obtener racha actual del usuario
    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    const currentStreak = userProgress?.currentStreak || 0;

    // Check if this is the first lesson completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCompletions = await this.prisma.lessonCompletion.count({
      where: {
        userId,
        completedAt: {
          gte: today,
        },
      },
    });

    const isFirstLessonToday = todayCompletions === 0;

    // Calcular XP con bonificaciones (speed and quiz bonuses)
    // Note: Pass currentStreak as 0 to prevent old streak multiplier from being applied
    // We'll apply the new GAME-010 multiplier system separately
    const xpResult = calculateLessonXpWithBonuses({
      baseXp: lesson.xpReward,
      timeSpentSeconds,
      estimatedMinutes: lesson.estimatedMinutes,
      quizScore,
      currentStreak: 0, // Don't apply old streak multiplier
    });

    // Apply GAME-010 multipliers (7+ and 30+ day streak multiplier + first lesson bonus)
    const multiplierResult = calculateXpWithMultipliers(
      xpResult.totalXp,
      currentStreak,
      isFirstLessonToday
    );

    const completion = await this.prisma.lessonCompletion.create({
      data: {
        userId,
        lessonId,
        timeSpentSeconds,
        xpEarned: multiplierResult.totalXp,
      },
    });

    await this.prisma.userProgress.update({
      where: { userId },
      data: {
        lessonsCompleted: { increment: 1 },
      },
    });

    const addXpResult = await this.usersService.addXp(userId, multiplierResult.totalXp);

    await this.badgesService.checkAndAwardBadges(userId);

    return {
      lessonId,
      xpEarned: multiplierResult.totalXp,
      xpBreakdown: {
        base: xpResult.breakdown.base,
        streakMultiplier: multiplierResult.multiplier,
        firstLessonBonus: isFirstLessonToday ? 50 : 0,
        quizBonus: xpResult.breakdown.quizBonus,
        speedBonus: xpResult.breakdown.speedBonus,
        total: multiplierResult.totalXp,
      },
      appliedBonuses: multiplierResult.appliedBonuses,
      completedAt: completion.completedAt,
      leveledUp: addXpResult?.leveledUp || false,
      newLevel: addXpResult?.level,
      newLevelTitle: addXpResult?.levelTitle,
    };
  }
}
