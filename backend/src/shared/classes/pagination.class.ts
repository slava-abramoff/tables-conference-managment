import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, ValidateIf } from 'class-validator';

export class PaginationRequestDto {
  @ApiProperty({ description: 'Страница', example: '1' })
  @ValidateIf(o => !isNaN(Number(o.page)))
  @IsNumberString()
  page: string;

  @ApiProperty({ description: 'Лимит записей на странице', example: '15' })
  @ValidateIf(o => !isNaN(Number(o.page)))
  @IsNumberString()
  limit: string;
}
