import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';

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

  async findOne(id: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    const completion = await this.prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: { userId, lessonId: id },
      },
    });

    return {
      ...lesson,
      isCompleted: !!completion,
    };
  }

  async complete(lessonId: string, userId: string, timeSpentSeconds: number) {
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

    const completion = await this.prisma.lessonCompletion.create({
      data: {
        userId,
        lessonId,
        timeSpentSeconds,
        xpEarned: lesson.xpReward,
      },
    });

    await this.prisma.userProgress.update({
      where: { userId },
      data: {
        lessonsCompleted: { increment: 1 },
      },
    });

    await this.usersService.addXp(userId, lesson.xpReward);

    await this.badgesService.checkAndAwardBadges(userId);

    return {
      lessonId,
      xpEarned: lesson.xpReward,
      completedAt: completion.completedAt,
    };
  }
}
