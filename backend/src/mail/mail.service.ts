import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: AppLogger
  ) {}

  async infoAboutMeeting(data: {
    email: string;
    eventName: string;
    url: string;
    shortUrl: string;
    dateTime: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Ссылки на мероприятие ${data.eventName}`,
        template: 'info-about-meeting',
        context: {
          url: data.url,
          shortUrl: data.shortUrl,
          dateTime: data.dateTime,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed send letter to: ${data.email}`,
        error.stack,
        MailService.name,
        'infoAboutMeeting'
      );
    }
  }

  async soonMeeting(data: {
    email: string;
    eventName: string;
    url: string;
    shortUrl: string;
    dateTime: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Осталось 30 минут до начала ${data.eventName}`,
        template: 'soon-meeting',
        context: {
          url: data.url,
          shortUrl: data.shortUrl,
          dateTime: data.dateTime,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed send letter to: ${data.email}`,
        error.stack,
        MailService.name,
        'soonMeeting'
      );
    }
  }
}
