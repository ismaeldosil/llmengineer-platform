import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  LeaderboardQueryDto,
  LeaderboardResponseDto,
  LeaderboardType,
} from './dto';

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener ranking global o semanal',
    description:
      'Devuelve el ranking de usuarios ordenado por XP. Soporta ranking global (XP total) y semanal (XP de esta semana). Incluye el ranking del usuario actual incluso si no está en el top.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking obtenido exitosamente',
    type: LeaderboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
    @CurrentUser() user: { id: string },
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(
      user.id,
      query.type || LeaderboardType.GLOBAL,
      query.limit || 50,
      query.offset || 0,
    );
  }
}
