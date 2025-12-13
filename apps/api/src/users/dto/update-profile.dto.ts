import { IsOptional, IsString, MinLength, MaxLength, Matches, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre para mostrar del usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'El nombre solo puede contener letras, números y espacios',
  })
  displayName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL del avatar del usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL del avatar debe ser una URL válida' })
  @MaxLength(500, { message: 'La URL del avatar no puede tener más de 500 caracteres' })
  avatarUrl?: string;

  @ApiProperty({
    example: 'Apasionado desarrollador de aplicaciones con LLMs',
    description: 'Biografía del usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La biografía no puede tener más de 500 caracteres' })
  bio?: string;
}
