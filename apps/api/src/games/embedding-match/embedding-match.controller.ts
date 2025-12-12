import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EmbeddingMatchService } from './embedding-match.service';
import { GetLevelResponseDto, VerifyMatchDto, VerifyMatchResponseDto, SubmitScoreDto } from './dto';

@ApiTags('games/embedding-match')
@Controller('games/embedding-match')
export class EmbeddingMatchController {
  constructor(private embeddingMatchService: EmbeddingMatchService) {}

  @Get('level/:level')
  @ApiOperation({ summary: 'Get level configuration with shuffled cards' })
  @ApiParam({
    name: 'level',
    description: 'Level number (1-3)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Level configuration retrieved successfully',
    type: GetLevelResponseDto,
    schema: {
      example: {
        level: 1,
        timeLimit: 60,
        cards: [
          {
            id: 'card-1-0',
            text: 'machine learning',
            pairId: '1',
          },
          {
            id: 'card-1-1',
            text: 'artificial intelligence',
            pairId: '1',
          },
          {
            id: 'card-1-2',
            text: 'vector database',
            pairId: '2',
          },
          {
            id: 'card-1-3',
            text: 'embedding storage',
            pairId: '2',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Level not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  getLevel(@Param('level', ParseIntPipe) level: number): GetLevelResponseDto {
    return this.embeddingMatchService.getLevel(level);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify if two cards match' })
  @ApiResponse({
    status: 200,
    description: 'Match verification completed',
    type: VerifyMatchResponseDto,
    schema: {
      example: {
        isMatch: true,
        similarity: 0.85,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid card IDs or same card selected',
  })
  @ApiResponse({
    status: 404,
    description: 'One or both cards not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @Throttle({ default: { ttl: 60000, limit: 100 } })
  verifyMatch(@Body() dto: VerifyMatchDto): VerifyMatchResponseDto {
    return this.embeddingMatchService.verifyMatch(dto.cardId1, dto.cardId2);
  }

  @Post('score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit game score' })
  @ApiResponse({
    status: 200,
    description: 'Score submitted successfully',
    schema: {
      example: {
        success: true,
        score: 850,
        level: 1,
        timeRemaining: 45,
        message: 'Score submitted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid score data',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  submitScore(@Body() dto: SubmitScoreDto) {
    // For now, just acknowledge the score
    // In production, this would save to database and update leaderboard
    return {
      success: true,
      score: dto.score,
      level: dto.level,
      timeRemaining: dto.timeRemaining,
      message: 'Score submitted successfully',
    };
  }
}
