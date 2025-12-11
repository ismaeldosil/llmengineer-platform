import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lecciones' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.lessonsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lección' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.lessonsService.findOne(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Marcar lección como completada' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteLessonDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.lessonsService.complete(id, user.id, dto.timeSpentSeconds);
  }
}
