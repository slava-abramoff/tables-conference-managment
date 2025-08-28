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
      adminEmail?: string;
      customerEmail?: string;
      customerName?: string;
      eventName: string;
      place: string;
      url: string;
      shortUrl?: string;
      streamKey?: string;
      date: string;
    }>
  ) {
    console.log('Процесс');
    if (job.data.type === 'lecture') {
      await this.mailService.notificateAboutStartingSoon({
        adminEmail: job.data.adminEmail,
        eventName: job.data.eventName,
        place: job.data.place,
        url: job.data.url,
        shortUrl: job.data.shortUrl,
        streamKey: job.data.streamKey,
        date: job.data.date,
      });
      console.log('Процесс для лекций выполнился');
    }

    if (job.data.type === 'meet') {
      await this.mailService.notificateAboutStartingSoon({
        adminEmail: job.data.adminEmail,
        customerEmail: job.data.customerEmail,
        customerName: job.data.customerName,
        eventName: job.data.eventName,
        place: job.data.place,
        url: job.data.url,
        shortUrl: job.data.shortUrl,
        streamKey: job.data.streamKey,
        date: job.data.date,
      });
      console.log('Процесс для встреч выполнился');
    }

    console.log(
      `Notification sent for ${job.data.type} ${job.data.id} (${job.data.eventName})`
    );
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
