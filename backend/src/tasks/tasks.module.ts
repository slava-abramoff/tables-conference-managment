import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksService } from './tasks.service';
import { MailModule } from '../mail/mail.module';
import { TasksProcessor } from './tasks.processor';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    MailModule,
  ],
  providers: [TasksService, TasksProcessor, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}
