import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService, PrismaService, AppLogger],
})
export class LecturesModule {}
