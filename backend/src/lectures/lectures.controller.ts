import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Лекции')
@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  /**
   * Create lecture
   */
  @Post()
  @ApiOperation({ summary: 'Создание лекции' })
  @ApiExtraModels(CreateLectureDto)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateLectureDto) },
        {
          type: 'array',
          items: { $ref: getSchemaPath(CreateLectureDto) },
        },
      ],
    },
  })
  @ApiResponse({ status: 200, description: 'Лекция создана' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async create(@Body() dto: CreateLectureDto) {
    return await this.lecturesService.create(dto);
  }

  /**
   * Create advanced lectures
   */
  @Post('advanced')
  @ApiOperation({ summary: 'Создание расписания лекций' })
  @ApiExtraModels(CreateLectureDto)
  @ApiBody({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CreateLectureDto) },
    },
  })
  @ApiResponse({ status: 200, description: 'Лекции созданы' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async createMany(@Body() dto: CreateLectureDto[]) {
    return await this.lecturesService.createMany(dto);
  }

  /**
   * Get info about available years and months
   */
  @Get('dates')
  @ApiOperation({ summary: 'Получение доступных месяцев в расписании' })
  @ApiResponse({ status: 200, description: 'Доступные месяца и года' })
  async getDates() {
    return await this.lecturesService.getDates();
  }

  /**
   * Get lectures by year and month
   */
  @Get('days')
  @ApiOperation({ summary: 'Вывод дней расписания по году и месяцу' })
  @ApiResponse({ status: 200, description: 'Список дней расписания' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async findAll(@Query() query: GetLecturesByYearMonth) {
    return await this.lecturesService.findAll(query);
  }

  /**
   * Get lectures by date
   */
  @Get('schedule/:date')
  @ApiOperation({ summary: 'Получение расписания на день' })
  @ApiParam({ name: 'date', type: 'string', description: 'Дата в расписании' })
  @ApiResponse({ status: 200, description: 'Мероприятие успешно обновлено' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
  async getByDate(@Param('date') date: string) {
    return await this.lecturesService.getByDate(date);
  }

  /**
   * Update lecture
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновление лекции' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID лекции' })
  @ApiBody({ type: CreateLectureDto })
  @ApiResponse({ status: 200, description: 'Лекция успешно обновлена' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Лекция не найдена' })
  async update(@Param('id') id: string, @Body() dto: CreateLectureDto) {
    return await this.lecturesService.update(id, dto);
  }

  /**
   * Remove lecture by id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удаление лекции' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID лекции' })
  @ApiResponse({ status: 200, description: 'Лекция успешно удалена' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Лекция не найдена' })
  async remove(@Param('id') id: string) {
    return await this.lecturesService.remove(id);
  }
}
