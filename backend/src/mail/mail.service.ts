import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';

@Injectable()
export class MailService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly logger: AppLogger
    ) { }

    async notificateAboutCreationLink(
        email: string,
        customer: string,
        event: string,
        startTime: string,
        place: string,
        url: string,
        shortUrl?: string
    ) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: `Ссылка для подключения ${event}`,
                template: 'meeting-creation-notification',
                context: {
                    customer,
                    event,
                    place,
                    startTime,
                    url,
                    shortUrl: shortUrl ?? '',
                },
            });
            this.logger.log(`Letter send to ${email}`, MailService.name, 'notificateAboutCreationLink')
        } catch (error) {
            this.logger.error(
                `Failed send letter to: ${email}`,
                error.stack,
                MailService.name,
                'notificateAboutCreationLink'
            )
        }
    }

    async notificateAboutStartingSoon(letterInfo: {
        adminEmail?: string;
        customerEmail?: string;
        customerName?: string;
        eventName: string;
        place: string;
        url: string;
        shortUrl?: string;
        streamKey?: string;
        date: string;
    }) {
        if (letterInfo.customerEmail && letterInfo.customerName) {
            try {
                await this.mailerService.sendMail({
                    to: letterInfo.adminEmail,
                    subject: `1 час до подключения ${letterInfo.eventName}`,
                    template: 'starting-soon-for-admin',
                    context: {
                        event: letterInfo.eventName,
                        url: letterInfo.url,
                        place: letterInfo.place,
                        shortUrl: letterInfo.shortUrl ?? 'Отсутствует',
                        streamKey: letterInfo.streamKey ?? 'Отсутствует',
                        date: letterInfo.date,
                    },
                });
                this.logger.log(`Letter send to ${letterInfo.adminEmail}`, MailService.name, 'notificateAboutStartingSoon')
            } catch (error) {
                this.logger.error(
                    `Failed send letter to: ${letterInfo.adminEmail}`,
                    error.stack,
                    MailService.name,
                    'notificateAboutStartingSoon'
                )
            }
        }

        if (letterInfo.adminEmail) {
            try {
                await this.mailerService.sendMail({
                    to: letterInfo.customerEmail,
                    subject: `1 час до начала ${letterInfo.eventName}`,
                    template: 'starting-soon-for-customer',
                    context: {
                        customer: letterInfo.customerName,
                        event: letterInfo.eventName,
                        url: letterInfo.url,
                        place: letterInfo.place,
                        shortUrl: letterInfo.shortUrl ?? 'Отсутствует',
                        streamKey: letterInfo.streamKey ?? 'Отсутствует',
                        date: letterInfo.date,
                    },
                });
                this.logger.log(`Letter send to ${letterInfo.customerEmail}`, MailService.name, 'notificateAboutStartingSoon')
            } catch (error) {
                this.logger.error(
                    `Failed send letter to: ${letterInfo.customerEmail}`,
                    error.stack,
                    MailService.name,
                    'notificateAboutStartingSoon'
                )
            }
        }
    }
}
