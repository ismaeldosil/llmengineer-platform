import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BadgesService } from '../badges/badges.service';
import { UserBadgesResponseDto } from '../badges/dto/badge-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private badgesService: BadgesService
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener usuario actual' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findById(user.id);
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
}
