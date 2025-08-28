import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';

@Module({
  controllers: [MeetsController],
  providers: [MeetsService, PrismaService, AppLogger, YandexApiService],
})
export class MeetsModule {}
