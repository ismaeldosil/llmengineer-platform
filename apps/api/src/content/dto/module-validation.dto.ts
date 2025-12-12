import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class ModuleValidationDto {
  @IsString({ message: 'slug debe ser una cadena de texto' })
  slug!: string;

  @IsString({ message: 'title debe ser una cadena de texto' })
  title!: string;

  @IsString({ message: 'description debe ser una cadena de texto' })
  description!: string;

  @IsNumber({}, { message: 'week debe ser un número' })
  @IsInt({ message: 'week debe ser un número entero' })
  @Min(1, { message: 'week debe ser al menos 1' })
  @Max(12, { message: 'week no puede ser mayor a 12' })
  week!: number;

  @IsNumber({}, { message: 'order debe ser un número' })
  @IsInt({ message: 'order debe ser un número entero' })
  @Min(1, { message: 'order debe ser al menos 1' })
  order!: number;
}
