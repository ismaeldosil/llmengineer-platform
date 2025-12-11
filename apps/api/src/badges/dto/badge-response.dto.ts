import { ApiProperty } from '@nestjs/swagger';
import { BadgeCategory } from '@prisma/client';

export class BadgeDto {
  @ApiProperty({ example: 'clk123abc', description: 'ID de la insignia' })
  id: string;

  @ApiProperty({ example: 'first-lesson', description: 'Slug de la insignia' })
  slug: string;

  @ApiProperty({ example: 'Primer Paso', description: 'Nombre de la insignia' })
  name: string;

  @ApiProperty({
    example: 'Completaste tu primera lección',
    description: 'Descripción de la insignia',
  })
  description: string;

  @ApiProperty({ example: '🎯', description: 'Icono emoji de la insignia' })
  icon: string;

  @ApiProperty({
    enum: BadgeCategory,
    example: BadgeCategory.progress,
    description: 'Categoría de la insignia',
  })
  category: BadgeCategory;
}

export class EarnedBadgeDto extends BadgeDto {
  @ApiProperty({ example: 50, description: 'Bonificación de XP de la insignia' })
  xpBonus: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha en que se obtuvo la insignia',
  })
  earnedAt: Date;
}

export class LockedBadgeDto extends BadgeDto {
  @ApiProperty({
    example: { lessonsCompleted: 1 },
    description: 'Requisitos para obtener la insignia',
  })
  requirement: Record<string, any>;
}

export class AllBadgesResponseDto {
  @ApiProperty({
    type: [EarnedBadgeDto],
    description: 'Insignias obtenidas por el usuario',
  })
  earned: EarnedBadgeDto[];

  @ApiProperty({
    type: [LockedBadgeDto],
    description: 'Insignias disponibles pero no obtenidas',
  })
  locked: LockedBadgeDto[];
}

export class UserBadgesResponseDto {
  @ApiProperty({
    type: [EarnedBadgeDto],
    description: 'Insignias obtenidas por el usuario',
  })
  badges: EarnedBadgeDto[];

  @ApiProperty({ example: 5, description: 'Total de insignias obtenidas' })
  total: number;
}
