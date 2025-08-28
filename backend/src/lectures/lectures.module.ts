import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [LecturesController],
  providers: [
    LecturesService,
    PrismaService,
    AppLogger,
    YandexApiService,
    MailService,
  ],
  imports: [TasksModule],
})
export class LecturesModule {}
