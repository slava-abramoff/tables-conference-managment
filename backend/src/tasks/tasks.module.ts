import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksService } from './tasks.service';
import { MailModule } from '../mail/mail.module';
import { TasksProcessor } from './tasks.processor';
import { PrismaService } from 'prisma/prisma.service';
import { BotModule } from 'src/bot/bot.module';
import { BotService } from 'src/bot/bot.service';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    MailModule,
    BotModule,
  ],
  providers: [TasksService, TasksProcessor, PrismaService, BotService],
  exports: [TasksService],
})
export class TasksModule {}
