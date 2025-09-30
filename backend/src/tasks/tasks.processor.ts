import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { BotService } from 'src/bot/bot.service';

@Processor('email-queue')
export class TasksProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly bot: BotService
  ) {
    super();
  }

  async process(
    job: Job<
      | {
          type: 'meet';
          id: string;
          email: string;
          eventName: string;
          url: string;
          shortUrl: string;
          dateTime: string;
        }
      | {
          type: 'lecture';
          id: string;
          lector: string;
          group: string;
          url: string;
          unit: string;
          place: string;
          shortUrl: string;
          dateTime: string;
        }
    >
  ) {
    if (job.data.type === 'meet') {
      await this.mailService.soonMeeting({
        email: job.data.email,
        eventName: job.data.eventName,
        url: job.data.url,
        shortUrl: job.data.shortUrl,
        dateTime: job.data.dateTime,
      });

      await this.bot.sendMessageToGroup(`
        Через 30 минут начнется ВКС ${job.data.eventName}
        Почта организатора: ${job.data.email}
        Cсылка: ${job.data.shortUrl}
        `);
    } else {
      await this.bot.sendMessageToGroup(`
        Лекция начнется через 30 минут
        Лектор: ${job.data.lector}
        Группа: ${job.data.group}
        Корпус: ${job.data.unit}
        Кабинет: ${job.data.place}
        ссылка: ${job.data.shortUrl}
        `);
    }
  }

  onModuleInit() {
    this.worker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job: Job, error: Error) => {
      console.error(`Job ${job.id} failed with error:`, error);
    });
  }
}
