import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class GameLevelDto {
  @IsNumber()
  level: number;

  @IsString()
  name: string;

  @IsObject()
  config: Record<string, any>;
}

export class GameRewardsDto {
  @IsNumber()
  xpPerLevel: number;

  @IsNumber()
  bonusForPerfect: number;
}

export class GameValidationDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameLevelDto)
  levels: GameLevelDto[];

  @ValidateNested()
  @Type(() => GameRewardsDto)
  rewards: GameRewardsDto;
}
