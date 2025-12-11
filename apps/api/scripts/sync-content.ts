import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Ruta al repositorio de contenido
const CONTENT_REPO_PATH = path.resolve(
  __dirname,
  '../../../..',
  'llmengineer-content'
);

interface LessonSection {
  title: string;
  content: string;
  keyPoints?: string[];
  codeExample?: string;
}

interface LessonJSON {
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

interface BadgeJSON {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'completion' | 'mastery' | 'special';
  requirement: any;
  xpBonus: number;
  isSecret?: boolean;
}

async function syncLessons() {
  console.log('Syncing lessons from content repository...');

  const lessonsDir = path.join(CONTENT_REPO_PATH, 'lessons');

  if (!fs.existsSync(lessonsDir)) {
    throw new Error(
      `Lessons directory not found: ${lessonsDir}\nMake sure llmengineer-content repository exists at: ${CONTENT_REPO_PATH}`
    );
  }

  let totalLessons = 0;

  // Leer todas las semanas
  const weekDirs = fs
    .readdirSync(lessonsDir)
    .filter(
      (file) =>
        fs.statSync(path.join(lessonsDir, file)).isDirectory() &&
        file.startsWith('week-')
    )
    .sort();

  for (const weekDir of weekDirs) {
    const weekPath = path.join(lessonsDir, weekDir);
    const lessonFiles = fs
      .readdirSync(weekPath)
      .filter((file) => file.endsWith('.json'));

    console.log(`\nProcessing ${weekDir} (${lessonFiles.length} lessons)...`);

    for (const lessonFile of lessonFiles) {
      const lessonPath = path.join(weekPath, lessonFile);
      const lessonData: LessonJSON = JSON.parse(
        fs.readFileSync(lessonPath, 'utf-8')
      );

      // Validar datos requeridos
      if (!lessonData.slug || !lessonData.title || !lessonData.week) {
        console.warn(`⚠ Skipping invalid lesson file: ${lessonFile}`);
        continue;
      }

      // Mapear dificultad
      const difficulty = lessonData.difficulty || 'beginner';
      if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
        console.warn(
          `⚠ Invalid difficulty for ${lessonData.slug}, using 'beginner'`
        );
      }

      // Upsert en base de datos
      await prisma.lesson.upsert({
        where: { slug: lessonData.slug },
        update: {
          title: lessonData.title,
          description: lessonData.description || '',
          week: lessonData.week,
          order: lessonData.order || 1,
          difficulty: difficulty as Difficulty,
          xpReward: lessonData.xpReward || 100,
          estimatedMinutes: lessonData.estimatedMinutes || 15,
          sections: lessonData.sections || [],
          isPublished: true,
        },
        create: {
          slug: lessonData.slug,
          title: lessonData.title,
          description: lessonData.description || '',
          week: lessonData.week,
          order: lessonData.order || 1,
          difficulty: difficulty as Difficulty,
          xpReward: lessonData.xpReward || 100,
          estimatedMinutes: lessonData.estimatedMinutes || 15,
          sections: lessonData.sections || [],
          isPublished: true,
        },
      });

      console.log(`  ✓ Synced: ${lessonData.slug}`);
      totalLessons++;
    }
  }

  console.log(`\n✓ Successfully synced ${totalLessons} lessons`);
}

async function syncBadges() {
  console.log('\nSyncing badges from content repository...');

  const badgesFile = path.join(CONTENT_REPO_PATH, 'badges', 'badges.json');

  if (!fs.existsSync(badgesFile)) {
    throw new Error(`Badges file not found: ${badgesFile}`);
  }

  const badgesData = JSON.parse(fs.readFileSync(badgesFile, 'utf-8'));
  const badges: BadgeJSON[] = badgesData.badges || [];

  for (const badge of badges) {
    // Validar datos requeridos
    if (!badge.slug || !badge.name || !badge.category) {
      console.warn(`⚠ Skipping invalid badge: ${JSON.stringify(badge)}`);
      continue;
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

    console.log(`  ✓ Synced: ${badge.slug}`);
  }

  console.log(`\n✓ Successfully synced ${badges.length} badges`);
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Content Synchronization Script');
    console.log('='.repeat(60));
    console.log(`Content Repository: ${CONTENT_REPO_PATH}\n`);

    // Verificar que el repositorio de contenido existe
    if (!fs.existsSync(CONTENT_REPO_PATH)) {
      throw new Error(
        `Content repository not found at: ${CONTENT_REPO_PATH}\n` +
          `Please clone llmengineer-content repository to the parent directory.`
      );
    }

    // Sincronizar badges
    await syncBadges();

    // Sincronizar lecciones
    await syncLessons();

    console.log('\n' + '='.repeat(60));
    console.log('✓ Content synchronization completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error during content sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
