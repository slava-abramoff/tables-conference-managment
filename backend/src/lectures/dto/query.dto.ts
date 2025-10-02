import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLecturesByYearMonth {
  @ApiProperty({ description: 'Год', example: '' })
  @IsString()
  year: string;

  @ApiProperty({ description: 'Месяц', example: '' })
  @IsString()
  month: string;
}

export class GetExcelLectures {
  @ApiProperty({ description: 'Начала диапозана' })
  @IsString()
  @IsOptional()
  start: string;

  @ApiProperty({ description: 'Начала диапозана' })
  @IsString()
  @IsOptional()
  end: string;

  @ApiProperty({ description: 'Название группы' })
  @IsString()
  @IsOptional()
  group: string;
}
