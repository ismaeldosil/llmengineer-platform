import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    const newTotalXp = progress.totalXp + xp;
    const newLevel = this.calculateLevel(newTotalXp);
    const newTitle = this.getLevelTitle(newLevel);

    return this.prisma.userProgress.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: newLevel,
        levelTitle: newTitle,
        lastActiveAt: new Date(),
      },
    });
  }

  private calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
  }

  private getLevelTitle(level: number): string {
    const titles: Record<number, string> = {
      1: 'Prompt Curious',
      2: 'Prompt Apprentice',
      3: 'Token Tinkerer',
      4: 'Context Crafter',
      5: 'Embedding Explorer',
      6: 'RAG Rookie',
      7: 'Vector Voyager',
      8: 'Pipeline Pioneer',
      9: 'Agent Architect',
      10: 'LLM Engineer',
    };
    return titles[Math.min(level, 10)] || 'LLM Master';
  }
}
