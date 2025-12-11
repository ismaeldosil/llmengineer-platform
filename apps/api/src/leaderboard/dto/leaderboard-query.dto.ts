import { IsEnum, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum LeaderboardType {
  GLOBAL = 'global',
  WEEKLY = 'weekly',
}

export class LeaderboardQueryDto {
  @ApiProperty({
    enum: LeaderboardType,
    example: LeaderboardType.GLOBAL,
    description: 'Tipo de ranking',
    default: LeaderboardType.GLOBAL,
  })
  @IsEnum(LeaderboardType, { message: 'El tipo debe ser global o weekly' })
  @IsOptional()
  type: LeaderboardType = LeaderboardType.GLOBAL;

  @ApiProperty({
    example: 50,
    description: 'Límite de resultados',
    minimum: 1,
    maximum: 100,
    default: 50,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  @IsOptional()
  limit: number = 50;

  @ApiProperty({
    example: 0,
    description: 'Offset para paginación',
    minimum: 0,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset debe ser al menos 0' })
  @IsOptional()
  offset: number = 0;
}
