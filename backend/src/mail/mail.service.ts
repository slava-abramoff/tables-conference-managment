import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';
import { formatComplexDate } from 'src/shared/utils/dateTime';

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
          eventName: data.eventName,
          url: data.url,
          shortUrl: data.shortUrl,
          dateTime: formatComplexDate(data.dateTime),
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
          eventName: data.eventName,
          url: data.url,
          shortUrl: data.shortUrl,
          dateTime: formatComplexDate(data.dateTime),
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
