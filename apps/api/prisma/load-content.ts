import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadLessonContent() {
  const lessonsDir = path.join(__dirname, 'content/lessons');

  if (!fs.existsSync(lessonsDir)) {
    console.log('No lessons directory found');
    return;
  }

  const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} lesson content files`);

  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`Loading content for: ${content.slug}`);

    try {
      await prisma.lesson.update({
        where: { slug: content.slug },
        data: {
          sections: content.sections,
          quiz: content.quiz || null,
        },
      });
      console.log(`  ✓ Updated ${content.slug}`);
    } catch (error) {
      console.error(`  ✗ Error updating ${content.slug}:`, error);
    }
  }
}

async function main() {
  console.log('Loading lesson content...\n');
  await loadLessonContent();
  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
