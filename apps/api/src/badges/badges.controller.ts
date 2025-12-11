import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AllBadgesResponseDto } from './dto/badge-response.dto';

@ApiTags('badges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las insignias con estado earned/locked',
    description:
      'Retorna todas las insignias disponibles, separadas en obtenidas y bloqueadas para el usuario actual',
  })
  @ApiOkResponse({
    type: AllBadgesResponseDto,
    description: 'Lista de insignias obtenidas y bloqueadas',
  })
  async findAll(@CurrentUser() user: { id: string }): Promise<AllBadgesResponseDto> {
    return this.badgesService.findAll(user.id);
  }
}
