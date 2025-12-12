import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'clk123abc',
    description: 'ID del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre para mostrar del usuario',
  })
  displayName: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;
}
