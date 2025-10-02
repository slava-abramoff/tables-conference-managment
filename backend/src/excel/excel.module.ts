import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Module({
  controllers: [],
  providers: [ExcelService],
})
export class ExcelModule {}
