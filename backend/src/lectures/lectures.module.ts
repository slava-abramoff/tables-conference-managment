import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { MailService } from 'src/mail/mail.service';
import { BotModule } from 'src/bot/bot.module';
import { BotService } from 'src/bot/bot.service';
import { ExcelModule } from 'src/excel/excel.module';
import { ExcelService } from 'src/excel/excel.service';

@Module({
  controllers: [LecturesController],
  providers: [
    LecturesService,
    PrismaService,
    AppLogger,
    YandexApiService,
    MailService,
    BotService,
    ExcelService,
  ],
  imports: [TasksModule, BotModule, ExcelModule],
})
export class LecturesModule {}
