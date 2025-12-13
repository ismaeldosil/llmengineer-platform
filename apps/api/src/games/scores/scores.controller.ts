import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ScoresService } from './scores.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import {
  SubmitGameScoreDto,
  GameScoreResponseDto,
  GameLeaderboardResponseDto,
  UserPersonalBestsResponseDto,
  GetLeaderboardQueryDto,
} from './dto';

@ApiTags('games/scores')
@Controller('games/scores')
export class ScoresController {
  constructor(private scoresService: ScoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a game score' })
  @ApiResponse({
    status: 201,
    description: 'Score submitted successfully',
    type: GameScoreResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async submitScore(
    @CurrentUser() user: { userId: string },
    @Body() dto: SubmitGameScoreDto
  ): Promise<GameScoreResponseDto> {
    return this.scoresService.submitScore(user.userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's personal best scores for all games" })
  @ApiResponse({
    status: 200,
    description: 'Personal bests retrieved successfully',
    type: UserPersonalBestsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async getPersonalBests(
    @CurrentUser() user: { userId: string }
  ): Promise<UserPersonalBestsResponseDto> {
    return this.scoresService.getUserPersonalBests(user.userId);
  }

  @Get(':gameType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top scores for a specific game (leaderboard)' })
  @ApiParam({
    name: 'gameType',
    description: 'Type of game (e.g., embedding-match, token-tetris, prompt-golf)',
    example: 'embedding-match',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: GameLeaderboardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Throttle({ default: { ttl: 60000, limit: 50 } })
  async getLeaderboard(
    @Param('gameType') gameType: string,
    @CurrentUser() user: { userId: string },
    @Query() query: GetLeaderboardQueryDto
  ): Promise<GameLeaderboardResponseDto> {
    return this.scoresService.getLeaderboardByUniqueUsers(
      gameType,
      user.userId,
      query.limit,
      query.offset,
      query.level
    );
  }
}
