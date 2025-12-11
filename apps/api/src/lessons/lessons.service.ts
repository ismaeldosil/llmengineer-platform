import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { calculateLessonXpWithBonuses } from '@llmengineer/shared/constants/xp';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private badgesService: BadgesService,
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
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
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

  async complete(
    lessonId: string,
    userId: string,
    timeSpentSeconds: number,
    quizScore?: number
  ) {
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

    // Calcular XP con bonificaciones
    const xpResult = calculateLessonXpWithBonuses({
      baseXp: lesson.xpReward,
      timeSpentSeconds,
      estimatedMinutes: lesson.estimatedMinutes,
      quizScore,
      currentStreak,
    });

    const completion = await this.prisma.lessonCompletion.create({
      data: {
        userId,
        lessonId,
        timeSpentSeconds,
        xpEarned: xpResult.totalXp,
      },
    });

    await this.prisma.userProgress.update({
      where: { userId },
      data: {
        lessonsCompleted: { increment: 1 },
      },
    });

    const addXpResult = await this.usersService.addXp(userId, xpResult.totalXp);

    await this.badgesService.checkAndAwardBadges(userId);

    return {
      lessonId,
      xpEarned: xpResult.totalXp,
      xpBreakdown: xpResult.breakdown,
      completedAt: completion.completedAt,
      leveledUp: addXpResult?.leveledUp || false,
      newLevel: addXpResult?.level,
      newLevelTitle: addXpResult?.levelTitle,
    };
  }
}
