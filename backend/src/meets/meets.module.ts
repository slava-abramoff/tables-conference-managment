import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [MeetsController],
  providers: [MeetsService, PrismaService],
})
export class MeetsModule {}
