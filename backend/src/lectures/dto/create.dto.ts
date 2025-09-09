import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateLectureDto {
  @ApiProperty({
    description: 'Название группы',
    required: false,
    example: '18КП1',
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({
    description: 'Имя лектора',
    required: false,
    example: 'Иванова И.И.',
  })
  @IsOptional()
  @IsString()
  lector?: string;

  @ApiProperty({
    description: 'Название платформы',
    required: false,
    example: 'rutube.com',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({
    description: 'Здание проведения лекции',
    required: false,
    example: 'Корпус №1',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Место проведения лекции',
    required: false,
    example: 'Кабинет 228',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Ссылка на лекцию',
    required: false,
    example: 'https://meet.com/ijimUmUjygynJNLJNM',
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  url?: string;

  @ApiProperty({
    description: 'Короткая ссылка на лекцию',
    required: false,
    example: 'https://short.com/1234',
  })
  @IsOptional()
  @IsString()
  shortUrl?: string;

  @ApiProperty({
    description: 'Ключ потока',
    required: false,
    example: 'gfsdgseafvrfgdadsgsdfgfsd',
  })
  @IsOptional()
  @IsString()
  streamKey?: string;

  @ApiProperty({
    description: 'Комментарий',
    required: false,
    example: 'Принести микрофон из первого зала',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID админисратора',
    required: false,
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @ApiProperty({
    description: 'Дата проведения',
    example: '2025-08-12T12:30:00Z',
  })
  @IsISO8601()
  date: string;

  @ApiProperty({
    description: 'Начало проведения',
    example: '2025-08-12T12:30:00Z',
  })
  @IsOptional()
  @IsISO8601()
  start?: string;

  @ApiProperty({
    description: 'Конец проведения',
    example: '2025-08-12T12:30:00Z',
  })
  @IsOptional()
  @IsISO8601()
  end?: string;

  @ApiProperty({ description: 'Время не по расписанию', example: '14:20' })
  @IsOptional()
  @IsString()
  abnormalTime?: string;
}

export class UpdateLectureDto extends PartialType(CreateLectureDto) {}
