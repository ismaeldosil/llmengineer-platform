import { Module } from '@nestjs/common';
import { EmbeddingMatchService } from './embedding-match.service';
import { EmbeddingMatchController } from './embedding-match.controller';

@Module({
  controllers: [EmbeddingMatchController],
  providers: [EmbeddingMatchService],
  exports: [EmbeddingMatchService],
})
export class EmbeddingMatchModule {}
