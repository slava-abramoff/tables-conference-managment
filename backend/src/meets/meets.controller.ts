import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import { UpdateMeetDto } from './dto/update.dto';

@Controller('meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService) {}

  /**
   * Create Meet
   */
  @Post()
  async create(@Body() dto: CreateRequestDto | AddMeetDto[]) {
    return await this.meetsService.create(dto);
  }

  /**
   * Get Meets
   */
  @Get('find')
  async findAll(@Query() query: GetQueryMeetDto) {
    return await this.meetsService.findAll(query);
  }

  @Get('search')
  async search(@Query() query: SearchQueryDto) {
    return await this.meetsService.search(query);
  }

  /**
   * Update Meets
   */
  @Patch()
  async update(@Body() dto: UpdateMeetDto) {
    return await this.meetsService.update(dto);
  }
}
