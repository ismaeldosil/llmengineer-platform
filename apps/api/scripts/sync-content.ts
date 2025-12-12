import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export interface LessonSection {
  title: string;
  content: string;
  keyPoints?: string[];
  codeExample?: string;
}

export interface LessonJSON {
  slug: string;
  title: string;
  description: string;
  week: number;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  estimatedMinutes: number;
  tags?: string[];
  prerequisites?: string[];
  sections: LessonSection[];
  quiz?: any;
  resources?: any[];
}

export interface BadgeJSON {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'completion' | 'mastery' | 'special';
  requirement: any;
  xpBonus: number;
  isSecret?: boolean;
}

// Default content repo path - can be overridden
export const DEFAULT_CONTENT_PATH = path.resolve(
  __dirname,
  '../../../..',
  'llmengineer-content'
);

export function validateLessonData(lesson: Partial<LessonJSON>): boolean {
  return !!(lesson.slug && lesson.title && lesson.week);
}

export function validateBadgeData(badge: Partial<BadgeJSON>): boolean {
  return !!(badge.slug && badge.name && badge.category);
}

export function normalizeDifficulty(
  difficulty: string | undefined
): Difficulty {
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (difficulty && validDifficulties.includes(difficulty)) {
    return difficulty as Difficulty;
  }
  return 'beginner';
}

export function getWeekDirectories(lessonsDir: string): string[] {
  if (!fs.existsSync(lessonsDir)) {
    return [];
  }

  return fs
    .readdirSync(lessonsDir)
    .filter((file) => {
      const fullPath = path.join(lessonsDir, file);
      return fs.statSync(fullPath).isDirectory() && file.startsWith('week-');
    })
    .sort();
}

export function getLessonFiles(weekDir: string): string[] {
  if (!fs.existsSync(weekDir)) {
    return [];
  }

  return fs.readdirSync(weekDir).filter((file) => file.endsWith('.json'));
}

export function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn(`Failed to read JSON file: ${filePath}`, error); // eslint-disable-line no-console
    return null;
  }
}

export async function syncLesson(
  prisma: PrismaClient,
  lessonData: LessonJSON
): Promise<boolean> {
  if (!validateLessonData(lessonData)) {
    console.warn(`Skipping invalid lesson: ${JSON.stringify(lessonData)}`); // eslint-disable-line no-console
    return false;
  }

  const difficulty = normalizeDifficulty(lessonData.difficulty);

  await prisma.lesson.upsert({
    where: { slug: lessonData.slug },
    update: {
      title: lessonData.title,
      description: lessonData.description || '',
      week: lessonData.week,
      order: lessonData.order || 1,
      difficulty,
      xpReward: lessonData.xpReward || 100,
      estimatedMinutes: lessonData.estimatedMinutes || 15,
      sections: JSON.parse(JSON.stringify(lessonData.sections || [])),
      isPublished: true,
    },
    create: {
      slug: lessonData.slug,
      title: lessonData.title,
      description: lessonData.description || '',
      week: lessonData.week,
      order: lessonData.order || 1,
      difficulty,
      xpReward: lessonData.xpReward || 100,
      estimatedMinutes: lessonData.estimatedMinutes || 15,
      sections: JSON.parse(JSON.stringify(lessonData.sections || [])),
      isPublished: true,
    },
  });

  return true;
}

export async function syncBadge(
  prisma: PrismaClient,
  badge: BadgeJSON
): Promise<boolean> {
  if (!validateBadgeData(badge)) {
    console.warn(`Skipping invalid badge: ${JSON.stringify(badge)}`); // eslint-disable-line no-console
    return false;
  }

  await prisma.badge.upsert({
    where: { slug: badge.slug },
    update: {
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon || '🏆',
      category: badge.category,
      requirement: badge.requirement || {},
      xpBonus: badge.xpBonus || 0,
      isSecret: badge.isSecret || false,
    },
    create: {
      slug: badge.slug,
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon || '🏆',
      category: badge.category,
      requirement: badge.requirement || {},
      xpBonus: badge.xpBonus || 0,
      isSecret: badge.isSecret || false,
    },
  });

  return true;
}

export async function syncLessons(
  prisma: PrismaClient,
  contentPath: string
): Promise<number> {
  console.log('Syncing lessons from content repository...'); // eslint-disable-line no-console

  const lessonsDir = path.join(contentPath, 'lessons');

  if (!fs.existsSync(lessonsDir)) {
    throw new Error(
      `Lessons directory not found: ${lessonsDir}\nMake sure llmengineer-content repository exists at: ${contentPath}`
    );
  }

  let totalLessons = 0;
  const weekDirs = getWeekDirectories(lessonsDir);

  for (const weekDir of weekDirs) {
    const weekPath = path.join(lessonsDir, weekDir);
    const lessonFiles = getLessonFiles(weekPath);

    console.log(`\nProcessing ${weekDir} (${lessonFiles.length} lessons)...`); // eslint-disable-line no-console

    for (const lessonFile of lessonFiles) {
      const lessonPath = path.join(weekPath, lessonFile);
      const lessonData = readJsonFile<LessonJSON>(lessonPath);

      if (lessonData) {
        const success = await syncLesson(prisma, lessonData);
        if (success) {
          console.log(`  ✓ Synced: ${lessonData.slug}`); // eslint-disable-line no-console
          totalLessons++;
        }
      }
    }
  }

  console.log(`\n✓ Successfully synced ${totalLessons} lessons`); // eslint-disable-line no-console
  return totalLessons;
}

export async function syncBadges(
  prisma: PrismaClient,
  contentPath: string
): Promise<number> {
  console.log('\nSyncing badges from content repository...'); // eslint-disable-line no-console

  const badgesFile = path.join(contentPath, 'badges', 'badges.json');

  if (!fs.existsSync(badgesFile)) {
    throw new Error(`Badges file not found: ${badgesFile}`);
  }

  const badgesData = readJsonFile<{ badges: BadgeJSON[] }>(badgesFile);

  if (!badgesData || !badgesData.badges) {
    throw new Error(`Invalid badges file format: ${badgesFile}`);
  }

  let syncedCount = 0;

  for (const badge of badgesData.badges) {
    const success = await syncBadge(prisma, badge);
    if (success) {
      console.log(`  ✓ Synced: ${badge.slug}`); // eslint-disable-line no-console
      syncedCount++;
    }
  }

  console.log(`\n✓ Successfully synced ${syncedCount} badges`); // eslint-disable-line no-console
  return syncedCount;
}

export async function syncContent(
  prisma: PrismaClient,
  contentPath: string = DEFAULT_CONTENT_PATH
): Promise<{ lessons: number; badges: number }> {
  console.log('='.repeat(60)); // eslint-disable-line no-console
  console.log('Content Synchronization Script'); // eslint-disable-line no-console
  console.log('='.repeat(60)); // eslint-disable-line no-console
  console.log(`Content Repository: ${contentPath}\n`); // eslint-disable-line no-console

  if (!fs.existsSync(contentPath)) {
    throw new Error(
      `Content repository not found at: ${contentPath}\n` +
        `Please clone llmengineer-content repository to the parent directory.`
    );
  }

  const badges = await syncBadges(prisma, contentPath);
  const lessons = await syncLessons(prisma, contentPath);

  console.log('\n' + '='.repeat(60)); // eslint-disable-line no-console
  console.log('✓ Content synchronization completed successfully!'); // eslint-disable-line no-console
  console.log('='.repeat(60)); // eslint-disable-line no-console

  return { lessons, badges };
}

// Main CLI function - exported for testing
export async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await syncContent(prisma);
  } catch (error) {
    console.error('\n❌ Error during content sync:', error); // eslint-disable-line no-console
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run main when executed directly
/* istanbul ignore next */
if (require.main === module) {
  main().catch(() => process.exit(1));
}
