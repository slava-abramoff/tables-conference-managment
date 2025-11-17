import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/create.dto';
import { GetExcelLectures, GetLecturesByYearMonth } from './dto/query.dto';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateLinksDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ExcelService } from 'src/excel/excel.service';
import { Response } from 'express';

@ApiTags('Лекции')
@Controller('lectures')
export class LecturesController {
  constructor(
    private readonly lecturesService: LecturesService,
    private readonly excel: ExcelService
  ) {}

  /**
   * Create lecture
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.moderator)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.moderator)
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

  /*
   * Update many links
   */
  @Post('links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.moderator)
  @ApiOperation({ summary: 'Создание ссылок для групп' })
  @ApiExtraModels(UpdateLinksDto)
  @ApiBody({
    schema: {
      items: { $ref: getSchemaPath(UpdateLinksDto) },
    },
  })
  @ApiResponse({ status: 200, description: 'Ссылки созданы' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async createManyLinks(@Body() dto: UpdateLinksDto) {
    return await this.lecturesService.createManyLinks(dto);
  }

  /**
   * Get info about available years and months
   */
  @Get('dates')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получение доступных месяцев в расписании' })
  @ApiResponse({ status: 200, description: 'Доступные месяца и года' })
  async getDates() {
    return await this.lecturesService.getDates();
  }

  /**
   * Get lectures by year and month
   */
  @Get('days')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.moderator)
  @ApiOperation({ summary: 'Обновление лекции' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID лекции' })
  @ApiBody({ type: CreateLectureDto })
  @ApiResponse({ status: 200, description: 'Лекция успешно обновлена' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Лекция не найдена' })
  async update(@Param('id') id: string, @Body() dto: UpdateLectureDto) {
    return await this.lecturesService.update(id, dto);
  }

  @Get('export')
  async exportExcel(@Query() dto: GetExcelLectures, @Res() res: Response) {
    const data = await this.lecturesService.exportExcel(dto);
    const columns: { header: string; key: keyof (typeof data)[0] }[] = [
      { header: 'Дата', key: 'date' },
      { header: 'Начало', key: 'start' },
      { header: 'Конец', key: 'end' },
      { header: 'Группа', key: 'group' },
      { header: 'Лектор', key: 'lector' },
      { header: 'Платформа', key: 'platform' },
      { header: 'Корпус', key: 'unit' },
      { header: 'Место', key: 'location' },
      { header: 'Админ', key: 'name' },
      { header: 'Ссылка', key: 'url' },
    ];
    return await this.excel.generateExcelFile(
      data,
      columns,
      'lectures_export',
      res
    );
  }

  /**
   * Remove lecture by id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.moderator)
  @ApiOperation({ summary: 'Удаление лекции' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID лекции' })
  @ApiResponse({ status: 200, description: 'Лекция успешно удалена' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Лекция не найдена' })
  async remove(@Param('id') id: string) {
    return await this.lecturesService.remove(id);
  }
}
