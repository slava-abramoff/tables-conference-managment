import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { MailService } from 'src/mail/mail.service';
import { BotModule } from 'src/bot/bot.module';
import { BotService } from 'src/bot/bot.service';

@Module({
  controllers: [MeetsController],
  providers: [
    MeetsService,
    PrismaService,
    AppLogger,
    YandexApiService,
    MailService,
    BotService,
  ],
  imports: [TasksModule, BotModule],
})
export class MeetsModule {}
