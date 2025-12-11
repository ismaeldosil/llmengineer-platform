import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StreaksService } from './streaks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('streaks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streaks')
export class StreaksController {
  constructor(private streaksService: StreaksService) {}

  @Post('checkin')
  @ApiOperation({ summary: 'Registrar check-in diario' })
  async checkin(@CurrentUser() user: { id: string }) {
    return this.streaksService.checkin(user.id);
  }
}
