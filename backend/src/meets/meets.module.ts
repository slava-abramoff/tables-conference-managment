import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';

@Module({
  controllers: [MeetsController],
  providers: [MeetsService, PrismaService, AppLogger],
})
export class MeetsModule {}
