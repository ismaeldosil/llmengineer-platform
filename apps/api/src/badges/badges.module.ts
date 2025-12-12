import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { BadgesLoaderService } from './badges-loader.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BadgesController],
  providers: [BadgesService, BadgesLoaderService],
  exports: [BadgesService, BadgesLoaderService],
})
export class BadgesModule {}
