import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique login for user',
    example: 'john_doe',
  })
  @IsString()
  login: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Email of the user',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'Role of the user',
    enum: Role,
    example: Role.moderator,
  })
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  password: string;
}
