import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [DownloadsController],
  providers: [DownloadsService, PrismaService],
})
export class DownloadsModule {}
