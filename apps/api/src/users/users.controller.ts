import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BadgesService } from '../badges/badges.service';
import { UserBadgesResponseDto } from '../badges/dto/badge-response.dto';
import { UpdateProfileDto, UserResponseDto, UserStatsDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 429, description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' })
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private badgesService: BadgesService
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@CurrentUser() user: { id: string }): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Perfil actualizado exitosamente',
  })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/progress')
  @ApiOperation({ summary: 'Obtener progreso del usuario' })
  async getProgress(@CurrentUser() user: { id: string }) {
    return this.usersService.getProgress(user.id);
  }

  @Get('me/badges')
  @ApiOperation({
    summary: 'Obtener insignias del usuario',
    description: 'Retorna todas las insignias obtenidas por el usuario actual',
  })
  @ApiOkResponse({
    type: UserBadgesResponseDto,
    description: 'Insignias obtenidas por el usuario',
  })
  async getUserBadges(@CurrentUser() user: { id: string }): Promise<UserBadgesResponseDto> {
    const badges = await this.badgesService.findUserBadges(user.id);
    return {
      badges,
      total: badges.length,
    };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get detailed user statistics' })
  @ApiOkResponse({
    type: UserStatsDto,
    description: 'Detailed user statistics including study time, quizzes, and XP history',
  })
  async getStats(@CurrentUser() user: { id: string }): Promise<UserStatsDto> {
    return this.usersService.getStats(user.id);
  }
}
