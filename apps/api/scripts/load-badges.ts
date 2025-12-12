#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BadgesLoaderService } from '../src/badges/badges-loader.service';
import * as path from 'path';

/**
 * CLI script to load badges from a JSON file into the database
 *
 * Usage:
 *   npm run badges:load                          # Load from default location
 *   npm run badges:load -- path/to/badges.json  # Load from specific file
 *
 * Or with ts-node:
 *   ts-node scripts/load-badges.ts
 *   ts-node scripts/load-badges.ts path/to/badges.json
 */
async function bootstrap() {
  console.log('🚀 Starting badges loader...\n');

  try {
    // Create NestJS application context (without HTTP server)
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get the BadgesLoaderService
    const badgesLoaderService = app.get(BadgesLoaderService);

    // Get file path from command line arguments or use default
    const args = process.argv.slice(2);
    const filePath = args[0];

    let result;
    if (filePath) {
      console.log(`📂 Loading badges from: ${filePath}\n`);
      result = await badgesLoaderService.loadBadgesFromFile(filePath);
    } else {
      const defaultPath = path.resolve(process.cwd(), 'prisma/content/badges.json');
      console.log(`📂 Loading badges from default location: ${defaultPath}\n`);
      result = await badgesLoaderService.loadDefaultBadges();
    }

    // Display results
    console.log('\n✅ Badges loaded successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${result.created}`);
    console.log(`   - Updated: ${result.updated}`);
    console.log(`   - Errors:  ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach((error) => {
        console.log(`   - ${error.slug}: ${error.error}`);
      });
    }

    console.log('\n🎉 Done!\n');

    // Close the application context
    await app.close();

    // Exit with error code if there were errors
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Failed to load badges:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    console.error('\n');
    process.exit(1);
  }
}

bootstrap();
