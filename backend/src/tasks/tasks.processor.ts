import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { BotService } from 'src/bot/bot.service';

export interface MeetJob {
  type: 'meet';
  id: string;
  email: string;
  eventName: string;
  location: string;
  url: string;
  shortUrl: string;
  dateTime: string;
}

export interface LectureJob {
  type: 'lecture';
  id: string;
  lector: string;
  group: string;
  url: string;
  unit: string;
  location: string;
  shortUrl: string;
  dateTime: string;
}

@Processor('email-queue')
export class TasksProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly bot: BotService
  ) {
    super();
  }

  async process(job: Job<MeetJob | LectureJob>) {
    if (job.data.type === 'meet') {
      await this.mailService.soonMeeting({
        email: job.data.email,
        eventName: job.data.eventName,
        url: job.data.url,
        shortUrl: job.data.shortUrl,
        dateTime: job.data.dateTime,
      });

      await this.bot.sendNotificate(job.data);
    } else if (job.data.type === 'lecture') {
      await this.bot.sendNotificate(job.data);
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
