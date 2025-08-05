import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService, PrismaService],
})
export class LecturesModule {}
