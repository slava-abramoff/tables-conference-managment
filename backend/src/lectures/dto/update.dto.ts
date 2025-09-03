import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdateLinksDto {
  @ApiProperty({
    description: 'Название группы',
    required: true,
    example: '18КП1',
  })
  @IsString()
  groupName: string;

  @ApiProperty({
    description: 'Ссылка на лекцию',
    required: true,
    example: 'https://meet.com/ijimUmUjygynJNLJNM',
  })
  @IsUrl()
  url: string;
}
