import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    description: 'Название мероприятия',
    example: 'Награждение победителей Всероссийского конкурса',
  })
  @IsString()
  eventName: string;

  @ApiProperty({ description: 'Имя организатора', example: 'Иванова И.И.' })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Почта организатора',
    example: 'ivanova@mail.ru',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Телефон организатора', example: '88005553535' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Место проведения',
    example: 'Попова 40, зал №1',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Платформа проведения',
    example: 'Мессенджер MAX',
  })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Аппаратура', example: 'микрофон и web-камера' })
  @IsString()
  devices: string;

  @ApiProperty({
    description: 'Комментарий',
    required: false,
    example: 'Принести дипломы победителей',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Начало мероприятия',
    example: '2025-08-12T12:30:00Z',
  })
  @IsISO8601()
  start: string;

  @ApiProperty({
    description: 'Конец мероприятия',
    example: '2025-08-12T13:00:00Z',
  })
  @IsISO8601()
  end: string;
}

export class AddMeetDto extends PartialType(CreateRequestDto) {
  @ApiProperty({
    description: 'Ссылка на комнату конференции',
    required: false,
    example: 'https://meet.com/ijimUmUjygynJNLJNM',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Короткая ссылка',
    required: false,
    example: 'https://short.com/1234',
  })
  @IsOptional()
  @IsUrl()
  shortUrl?: string;

  @ApiProperty({
    description: 'ID админисратора',
    required: false,
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @ApiProperty({
    description: 'Статус мероприятия',
    required: false,
    example: 'completed',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
