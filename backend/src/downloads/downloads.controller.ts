import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DownloadsService } from './downloads.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Выгрузка данных')
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get('meets')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="meets.csv"')
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Дата начала диапазона (формат: YYYY-MM-DD)',
    example: '2025-01-01',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'Дата окончания диапазона (формат: YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'CSV-файл успешно сформирован и готов к скачиванию',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат дат или другие ошибки в запросе',
  })
  async getMeets(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const csvData = await this.downloadsService.getMeets(startDate, endDate);
    res.send('\uFEFF' + csvData); // Добавляем BOM для корректной кодировки UTF-8
  }

  @Get('lectures')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="lectures.csv"')
  @ApiOperation({
    summary: 'Скачать CSV-файл с данными лекций в кодировке UTF-8 с BOM',
    description:
      'Возвращает CSV-файл с данными лекций, отфильтрованных по диапазону дат в поле date, в кодировке UTF-8 с BOM для максимальной совместимости с Excel и другими приложениями.',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Дата начала диапазона (формат: YYYY-MM-DD)',
    example: '2025-01-01',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'Дата окончания диапазона (формат: YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'CSV-файл в кодировке UTF-8 с BOM успешно сформирован и готов к скачиванию',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат дат или другие ошибки в запросе',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  async get(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const csvData = await this.downloadsService.getLectures(startDate, endDate);
    res.send('\uFEFF' + csvData);
  }
}
