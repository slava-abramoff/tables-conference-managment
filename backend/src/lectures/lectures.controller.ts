import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';
import { UpdateLectureDto } from './dto/update.dto';

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  /**
   * Create lecture
   */
  @Post()
  async create(@Body() dto: CreateLectureDto | CreateLectureDto[]) {
    return await this.lecturesService.create(dto)
  }

  /**
   * Get info about available years and months
   */
  @Get('dates')
  async getDates() {
    return await this.lecturesService.getDates()
  }

  /**
   * Get lectures by year and month
   */
  @Get('days')
  async findAll(@Query() query: GetLecturesByYearMonth) {
    return await this.lecturesService.findAll(query)
  }

  /**
   * Get lectures by date
   */
  @Get('schedule/:date')
  async getByDate(@Param('date') date: string) {
    return await this.lecturesService.getByDate(date)
  }

  /**
   * Update lecture
   */
  @Patch()
  async update(@Body() dto: UpdateLectureDto) {
    return await this.lecturesService.update(dto)
  }

  /**
   * Remove lecture by id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.lecturesService.remove(id)
  }
}
