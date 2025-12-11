import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel, getLevelTitle } from '@llmengineer/shared';

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
}
