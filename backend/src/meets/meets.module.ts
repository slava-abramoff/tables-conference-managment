import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';

@Module({
  controllers: [MeetsController],
  providers: [MeetsService],
})
export class MeetsModule {}
