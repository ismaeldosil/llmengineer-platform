import { Module } from '@nestjs/common';
import { ContentValidatorService } from './content-validator.service';
import { GamesLoaderService } from './games-loader.service';

@Module({
  providers: [ContentValidatorService, GamesLoaderService],
  exports: [ContentValidatorService, GamesLoaderService],
})
export class ContentModule {}
