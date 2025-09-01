import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MeetsService } from './meets.service';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiExtraModels,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Мероприятия и онлайн встречи')
@Controller('meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService) {}

  /**
   * Create Meet
   */
  @Post()
  @ApiOperation({ summary: 'Создание нового мероприятия' })
  @ApiExtraModels(CreateRequestDto, AddMeetDto)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateRequestDto) },
        {
          type: 'array',
          items: { $ref: getSchemaPath(AddMeetDto) },
        },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Заявка на планирование мероприятия отправлена',
  })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async create(@Body() dto: CreateRequestDto) {
    return await this.meetsService.create(dto);
  }

  /**
   * Advanced create Meets
   */
  @Post('advanced')
  async createMany() {
    return 'test'
  }

  /**
   * Get Meets
   */
  @Get('find')
  @ApiOperation({ summary: 'Вывод мероприятий' })
  @ApiResponse({ status: 200, description: 'Список мероприятий' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async findAll(@Query() query: GetQueryMeetDto) {
    return await this.meetsService.findAll(query);
  }

  /**
   * Search Meets
   */
  @Get('search')
  @ApiOperation({ summary: 'Поиск мероприятий мероприятий' })
  @ApiResponse({ status: 200, description: 'Список мероприятий' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  async search(@Query() query: SearchQueryDto) {
    return await this.meetsService.search(query);
  }

  /**
   * Update Meets
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновление мероприятия' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID встречи' })
  @ApiBody({ type: AddMeetDto })
  @ApiResponse({ status: 200, description: 'Мероприятие успешно обновлено' })
  @ApiResponse({ status: 400, description: 'Неверный формат данных' })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
  async update(@Param('id') id: string, @Body() dto: AddMeetDto) {
    return await this.meetsService.update(id, dto);
  }
}
