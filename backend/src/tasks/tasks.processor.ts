import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email-queue')
export class TasksProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(
    job: Job<{
      type: 'lecture' | 'meet';
      id: string;
      email: string;
      eventName: string;
      url: string;
      shortUrl: string;
      dateTime: string;
    }>
  ) {
    if (job.data.type === 'meet') {
      await this.mailService.soonMeeting({
        email: job.data.email,
        eventName: job.data.eventName,
        url: job.data.url,
        shortUrl: job.data.shortUrl,
        dateTime: job.data.dateTime,
      });
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
