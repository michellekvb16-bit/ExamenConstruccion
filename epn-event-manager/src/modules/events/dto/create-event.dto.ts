import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'auth-service', description: 'Origen del evento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string;

  @ApiProperty({ example: 'User', description: 'Entidad afectada' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  entity: string;

  @ApiProperty({
    example: 'CREATE',
    description: 'Acción realizada (CREATE, UPDATE, DELETE, QUERY)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiProperty({
    example: 'User Created',
    description: 'Título corto del evento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'A new user was registered in the system',
    description: 'Detalle del evento',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    example: { userId: 123 },
    description: 'Datos adicionales del evento',
    required: false,
  })
  @IsObject()
  @IsOptional()
  payload: any;
}
