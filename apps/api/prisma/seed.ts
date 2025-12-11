import { PrismaClient, BadgeCategory, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...'); // eslint-disable-line no-console

  // Seed Badges
  console.log('Seeding badges...'); // eslint-disable-line no-console
  await seedBadges();

  // Seed Lessons
  console.log('Seeding lessons...'); // eslint-disable-line no-console
  await seedLessons();

  // Seed Test User
  console.log('Seeding test user...'); // eslint-disable-line no-console
  const testUser = await seedTestUser();

  // Seed Sample Completions
  console.log('Seeding sample completions...'); // eslint-disable-line no-console
  await seedSampleCompletions(testUser.id);

  console.log('Database seed completed successfully!'); // eslint-disable-line no-console
}

async function seedBadges() {
  const badges = [
    {
      slug: 'first-lesson',
      name: 'Primer Paso',
      description: 'Completaste tu primera lección',
      icon: '🎯',
      category: BadgeCategory.progress,
      requirement: { lessonsCompleted: 1 },
      xpBonus: 50,
      isSecret: false,
    },
    {
      slug: 'streak-3',
      name: 'En Racha',
      description: '3 días consecutivos de aprendizaje',
      icon: '⚡',
      category: BadgeCategory.streak,
      requirement: { streak: 3 },
      xpBonus: 25,
      isSecret: false,
    },
    {
      slug: 'streak-7',
      name: 'Semana Perfecta',
      description: '7 días consecutivos de aprendizaje',
      icon: '🔥',
      category: BadgeCategory.streak,
      requirement: { streak: 7 },
      xpBonus: 75,
      isSecret: false,
    },
    {
      slug: 'streak-30',
      name: 'Dedicación Total',
      description: '30 días consecutivos de aprendizaje',
      icon: '💎',
      category: BadgeCategory.streak,
      requirement: { streak: 30 },
      xpBonus: 500,
      isSecret: false,
    },
    {
      slug: 'level-5',
      name: 'Embedding Explorer',
      description: 'Alcanzaste el nivel 5',
      icon: '🧭',
      category: BadgeCategory.progress,
      requirement: { level: 5 },
      xpBonus: 100,
      isSecret: false,
    },
    {
      slug: 'level-10',
      name: 'LLM Engineer',
      description: 'Alcanzaste el nivel máximo',
      icon: '🏆',
      category: BadgeCategory.mastery,
      requirement: { level: 10 },
      xpBonus: 500,
      isSecret: false,
    },
    {
      slug: 'week-1-complete',
      name: 'Fundamentos Dominados',
      description: 'Completaste todas las lecciones de la Semana 1',
      icon: '📚',
      category: BadgeCategory.completion,
      requirement: { weekComplete: 1 },
      xpBonus: 100,
      isSecret: false,
    },
    {
      slug: 'week-4-complete',
      name: 'Medio Camino',
      description: 'Completaste todas las lecciones de la Semana 4',
      icon: '🎯',
      category: BadgeCategory.completion,
      requirement: { weekComplete: 4 },
      xpBonus: 150,
      isSecret: false,
    },
    {
      slug: 'week-8-complete',
      name: 'Graduado LLM Engineer',
      description: 'Completaste todo el curso de 8 semanas',
      icon: '🎓',
      category: BadgeCategory.mastery,
      requirement: { allWeeksComplete: true },
      xpBonus: 1000,
      isSecret: false,
    },
    {
      slug: 'quiz-master',
      name: 'Maestro de Quizzes',
      description: 'Obtuviste 100% en 10 quizzes',
      icon: '🧠',
      category: BadgeCategory.mastery,
      requirement: { perfectQuizzes: 10 },
      xpBonus: 200,
      isSecret: false,
    },
    {
      slug: 'speed-learner',
      name: 'Aprendiz Veloz',
      description: 'Completaste 5 lecciones en un día',
      icon: '⚡',
      category: BadgeCategory.special,
      requirement: { lessonsInDay: 5 },
      xpBonus: 150,
      isSecret: false,
    },
    {
      slug: 'xp-1000',
      name: 'Coleccionista de XP',
      description: 'Alcanzaste 1000 puntos de experiencia',
      icon: '💫',
      category: BadgeCategory.progress,
      requirement: { totalXp: 1000 },
      xpBonus: 100,
      isSecret: false,
    },
    {
      slug: 'xp-5000',
      name: 'Maestro de XP',
      description: 'Alcanzaste 5000 puntos de experiencia',
      icon: '✨',
      category: BadgeCategory.mastery,
      requirement: { totalXp: 5000 },
      xpBonus: 500,
      isSecret: false,
    },
    {
      slug: 'game-winner',
      name: 'Maestro de Juegos',
      description: 'Ganaste en los 3 mini-juegos',
      icon: '🎮',
      category: BadgeCategory.special,
      requirement: { gamesWon: 3 },
      xpBonus: 150,
      isSecret: false,
    },
    {
      slug: 'prompt-golfer',
      name: 'Golfista de Prompts',
      description: 'Obtuviste par o mejor en Prompt Golf',
      icon: '⛳',
      category: BadgeCategory.special,
      requirement: { game: 'prompt-golf', score: 'par' },
      xpBonus: 100,
      isSecret: false,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }

  console.log(`✓ Seeded ${badges.length} badges`); // eslint-disable-line no-console
}

async function seedLessons() {
  const lessons = [
    {
      slug: 'intro-to-llms',
      title: 'Introducción a los LLMs',
      description:
        'Comprende qué son los Large Language Models, cómo funcionan y por qué son importantes para el desarrollo de aplicaciones de IA.',
      week: 1,
      order: 1,
      difficulty: Difficulty.beginner,
      xpReward: 100,
      estimatedMinutes: 15,
      sections: [
        {
          title: '¿Qué es un Large Language Model?',
          content:
            'Un Large Language Model (LLM) es un modelo de inteligencia artificial entrenado con enormes cantidades de texto para entender y generar lenguaje natural.',
          keyPoints: [
            'Entrenados con billones de tokens de texto',
            'Capaces de entender contexto y generar texto coherente',
            'Base para chatbots, asistentes y herramientas de desarrollo',
          ],
        },
      ],
      isPublished: true,
    },
    {
      slug: 'api-basics',
      title: 'Fundamentos de APIs de LLMs',
      description:
        'Aprende a comunicarte con LLMs mediante APIs REST, entendiendo requests, responses y parámetros clave.',
      week: 1,
      order: 2,
      difficulty: Difficulty.beginner,
      xpReward: 100,
      estimatedMinutes: 20,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'prompt-engineering-basics',
      title: 'Introducción al Prompt Engineering',
      description:
        'Descubre cómo escribir prompts efectivos para obtener mejores respuestas de los LLMs.',
      week: 1,
      order: 3,
      difficulty: Difficulty.beginner,
      xpReward: 100,
      estimatedMinutes: 25,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'temperature-and-sampling',
      title: 'Temperature y Parámetros de Sampling',
      description:
        'Aprende a controlar la creatividad y determinismo de las respuestas mediante parámetros.',
      week: 1,
      order: 4,
      difficulty: Difficulty.beginner,
      xpReward: 100,
      estimatedMinutes: 20,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'system-prompts',
      title: 'System Prompts y Roles',
      description:
        'Entiende cómo usar system prompts para definir el comportamiento del modelo.',
      week: 1,
      order: 5,
      difficulty: Difficulty.beginner,
      xpReward: 100,
      estimatedMinutes: 20,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'context-management',
      title: 'Gestión de Contexto',
      description:
        'Aprende a manejar conversaciones largas y optimizar el uso de tokens.',
      week: 2,
      order: 1,
      difficulty: Difficulty.beginner,
      xpReward: 150,
      estimatedMinutes: 25,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'structured-outputs',
      title: 'Outputs Estructurados',
      description:
        'Descubre cómo obtener respuestas en formatos específicos como JSON.',
      week: 2,
      order: 2,
      difficulty: Difficulty.intermediate,
      xpReward: 150,
      estimatedMinutes: 30,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'error-handling',
      title: 'Manejo de Errores y Rate Limits',
      description:
        'Aprende a manejar errores, timeouts y límites de rate de las APIs.',
      week: 2,
      order: 3,
      difficulty: Difficulty.intermediate,
      xpReward: 150,
      estimatedMinutes: 25,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'streaming-responses',
      title: 'Streaming de Respuestas',
      description:
        'Implementa streaming para obtener respuestas progresivas en tiempo real.',
      week: 2,
      order: 4,
      difficulty: Difficulty.intermediate,
      xpReward: 150,
      estimatedMinutes: 30,
      sections: [],
      isPublished: true,
    },
    {
      slug: 'cost-optimization',
      title: 'Optimización de Costos',
      description:
        'Estrategias para reducir costos de API manteniendo calidad de respuestas.',
      week: 2,
      order: 5,
      difficulty: Difficulty.intermediate,
      xpReward: 150,
      estimatedMinutes: 25,
      sections: [],
      isPublished: true,
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: lesson,
      create: lesson,
    });
  }

  console.log(`✓ Seeded ${lessons.length} lessons`); // eslint-disable-line no-console
}

async function seedTestUser() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      displayName: 'Test User',
      progress: {
        create: {
          totalXp: 300,
          level: 2,
          levelTitle: 'Prompt Apprentice',
          currentStreak: 2,
          longestStreak: 3,
          lessonsCompleted: 3,
        },
      },
    },
    include: {
      progress: true,
    },
  });

  console.log(`✓ Created test user: ${user.email}`); // eslint-disable-line no-console
  return user;
}

async function seedSampleCompletions(userId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { week: { in: [1, 2] } },
    take: 3,
    orderBy: { order: 'asc' },
  });

  const completions = lessons.map((lesson, index) => ({
    userId,
    lessonId: lesson.id,
    timeSpentSeconds: 900 + index * 300,
    xpEarned: lesson.xpReward,
  }));

  for (const completion of completions) {
    await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: completion.userId,
          lessonId: completion.lessonId,
        },
      },
      update: completion,
      create: completion,
    });
  }

  // Crear algunos StreakLog entries
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.streakLog.upsert({
    where: {
      userId_date: {
        userId,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId,
      date: yesterday,
      checkedIn: true,
      bonusXp: 10,
    },
  });

  await prisma.streakLog.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {},
    create: {
      userId,
      date: today,
      checkedIn: true,
      bonusXp: 10,
    },
  });

  console.log(`✓ Created ${completions.length} sample completions`); // eslint-disable-line no-console
  console.log(`✓ Created 2 streak log entries`); // eslint-disable-line no-console
}

main()
  .catch((e) => {
    console.error('Error during seed:', e); // eslint-disable-line no-console
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
