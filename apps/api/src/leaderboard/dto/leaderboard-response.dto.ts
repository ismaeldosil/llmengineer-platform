import { ApiProperty } from '@nestjs/swagger';

export type RankChangeDirection = 'up' | 'down' | 'same' | 'new';

export class LeaderboardEntryDto {
  @ApiProperty({ example: 1, description: 'Posición en el ranking' })
  rank: number;

  @ApiProperty({ example: 'cuid123', description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre de usuario' })
  displayName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL del avatar',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({ example: 1500, description: 'Total de XP (global) o XP semanal (weekly)' })
  totalXp: number;

  @ApiProperty({ example: 3, description: 'Nivel del usuario' })
  level: number;

  @ApiProperty({ example: false, description: 'Indica si es el usuario actual' })
  isCurrentUser: boolean;

  @ApiProperty({
    example: 3,
    description:
      'Cambio de posición desde el día anterior (positivo = subió, negativo = bajó, 0 = sin cambio)',
    required: false,
  })
  rankChange?: number;

  @ApiProperty({
    example: 'up',
    description: 'Dirección del cambio de ranking',
    enum: ['up', 'down', 'same', 'new'],
    required: false,
  })
  rankChangeDirection?: RankChangeDirection;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    type: [LeaderboardEntryDto],
    description: 'Lista de entradas del ranking',
  })
  entries: LeaderboardEntryDto[];

  @ApiProperty({
    example: 15,
    description: 'Posición del usuario actual en el ranking (0 si no tiene ranking)',
  })
  currentUserRank: number;

  @ApiProperty({
    type: LeaderboardEntryDto,
    description: 'Datos del usuario actual si no está en el top',
    nullable: true,
  })
  currentUserEntry: LeaderboardEntryDto | null;

  @ApiProperty({ example: 50, description: 'Total de entradas devueltas' })
  total: number;

  @ApiProperty({ example: 0, description: 'Offset aplicado' })
  offset: number;
}
