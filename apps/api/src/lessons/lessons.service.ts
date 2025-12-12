import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { calculateLessonXpWithBonuses, calculateXpWithMultipliers } from '@llmengineer/shared';
import { SearchResult } from './dto/search-lesson.dto';

interface LessonSection {
  title?: string;
  content?: string;
  keyPoints?: string[];
}

interface QuizOption {
  text?: string;
}

interface QuizQuestion {
  question?: string;
  options?: QuizOption[];
  explanation?: string;
}

interface Quiz {
  questions?: QuizQuestion[];
}

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

  async search(query: string, limit: number = 20, offset: number = 0): Promise<SearchResult[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { isPublished: true },
      orderBy: [{ week: 'asc' }, { order: 'asc' }],
    });

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const lesson of lessons) {
      // Search in title
      if (lesson.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          week: lesson.week,
          matchType: 'title',
          matchedText: lesson.title,
          contextBefore: '',
          contextAfter: lesson.description.substring(0, 150),
        });
      }

      // Search in description
      if (lesson.description.toLowerCase().includes(lowerQuery)) {
        const context = this.extractContext(lesson.description, lowerQuery);
        results.push({
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          week: lesson.week,
          matchType: 'description',
          matchedText: context.matched,
          contextBefore: context.before,
          contextAfter: context.after,
        });
      }

      // Search in sections
      const sections = lesson.sections as LessonSection[];
      if (Array.isArray(sections)) {
        sections.forEach((section: LessonSection, sectionIndex: number) => {
          // Section title
          if (section.title?.toLowerCase().includes(lowerQuery)) {
            results.push({
              lessonId: lesson.id,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              week: lesson.week,
              matchType: 'section',
              sectionTitle: section.title,
              sectionIndex,
              matchedText: section.title,
              contextBefore: '',
              contextAfter: section.content?.substring(0, 150) || '',
            });
          }

          // Section content
          if (section.content?.toLowerCase().includes(lowerQuery)) {
            const context = this.extractContext(section.content, lowerQuery);
            results.push({
              lessonId: lesson.id,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              week: lesson.week,
              matchType: 'section',
              sectionTitle: section.title,
              sectionIndex,
              matchedText: context.matched,
              contextBefore: context.before,
              contextAfter: context.after,
            });
          }

          // Key points
          if (Array.isArray(section.keyPoints)) {
            section.keyPoints.forEach((keyPoint: string) => {
              if (keyPoint.toLowerCase().includes(lowerQuery)) {
                const context = this.extractContext(keyPoint, lowerQuery);
                results.push({
                  lessonId: lesson.id,
                  lessonSlug: lesson.slug,
                  lessonTitle: lesson.title,
                  week: lesson.week,
                  matchType: 'keyPoint',
                  sectionTitle: section.title,
                  sectionIndex,
                  matchedText: context.matched,
                  contextBefore: context.before,
                  contextAfter: context.after,
                });
              }
            });
          }
        });
      }

      // Search in quiz
      const quiz = lesson.quiz as Quiz;
      if (quiz?.questions && Array.isArray(quiz.questions)) {
        quiz.questions.forEach((question: QuizQuestion, questionIndex: number) => {
          // Question text
          if (question.question?.toLowerCase().includes(lowerQuery)) {
            const context = this.extractContext(question.question, lowerQuery);
            results.push({
              lessonId: lesson.id,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              week: lesson.week,
              matchType: 'quiz',
              questionIndex,
              matchedText: context.matched,
              contextBefore: context.before,
              contextAfter: context.after,
            });
          }

          // Options
          if (Array.isArray(question.options)) {
            question.options.forEach((option: QuizOption | string) => {
              const optionText = typeof option === 'string' ? option : option.text;
              if (typeof optionText === 'string' && optionText.toLowerCase().includes(lowerQuery)) {
                const context = this.extractContext(optionText, lowerQuery);
                results.push({
                  lessonId: lesson.id,
                  lessonSlug: lesson.slug,
                  lessonTitle: lesson.title,
                  week: lesson.week,
                  matchType: 'quiz',
                  questionIndex,
                  matchedText: context.matched,
                  contextBefore: context.before,
                  contextAfter: context.after,
                });
              }
            });
          }

          // Explanation
          if (question.explanation?.toLowerCase().includes(lowerQuery)) {
            const context = this.extractContext(question.explanation, lowerQuery);
            results.push({
              lessonId: lesson.id,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              week: lesson.week,
              matchType: 'quiz',
              questionIndex,
              matchedText: context.matched,
              contextBefore: context.before,
              contextAfter: context.after,
            });
          }
        });
      }
    }

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  private extractContext(
    text: string,
    query: string,
    contextLines: number = 2
  ): { before: string; matched: string; after: string } {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return { before: '', matched: '', after: '' };
    }

    // Split text into lines
    const lines = text.split('\n');
    let currentIndex = 0;
    let matchLineIndex = 0;
    let matchCharInLine = 0;

    // Find which line contains the match
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentIndex + lineLength > matchIndex) {
        matchLineIndex = i;
        matchCharInLine = matchIndex - currentIndex;
        break;
      }
      currentIndex += lineLength;
    }

    // Get context lines
    const startLine = Math.max(0, matchLineIndex - contextLines);
    const endLine = Math.min(lines.length - 1, matchLineIndex + contextLines);

    const beforeLines = lines.slice(startLine, matchLineIndex);
    const matchLine = lines[matchLineIndex];
    const afterLines = lines.slice(matchLineIndex + 1, endLine + 1);

    // Extract the matched portion from the match line
    const matchStart = matchCharInLine;
    const matchEnd = matchStart + query.length;
    const matchedText = matchLine.substring(
      Math.max(0, matchStart - 30),
      Math.min(matchLine.length, matchEnd + 30)
    );

    return {
      before: beforeLines.join('\n').trim(),
      matched: matchedText.trim(),
      after: afterLines.join('\n').trim(),
    };
  }
}
