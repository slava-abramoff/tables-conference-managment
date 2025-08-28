import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async test() {
    // return await this.mailService.notificateAboutCreationLink(
    //   'vyachik005@gmail.com',
    //   'Иванова В.А.',
    //   'Тестовое',
    //   '12:30',
    //   '1 зал',
    //   'https://medium.com/@sangimed/complete-guide-to-sending-emails-through-an-smtp-server-with-nestjs-d75972dee394',
    //   'https://medium.com/@sangimed/complete-guide-to-sending-emails-through-an-smtp-server-with-nestjs-d75972dee394'
    // );
    // return await this.mailService.notificateAboutStartingSoon({
    //   adminEmail: 'kixofes377@elobits.com',
    //   customerEmail: 'kixofes377@elobits.com',
    //   customerName: 'Иванова В.А.',
    //   eventName: 'Тестовое',
    //   place: '1 зал',
    //   url: 'https://medium.com/@sangimed/complete-guide-to-sending-emails-through-an-smtp-server-with-nestjs-d75972dee394',
    //   shortUrl:'https://medium.com/@sangimed/complete-guide-to-sending-emails-through-an-smtp-server-with-nestjs-d75972dee394',
    //   streamKey: 'https://medium.com/@sangimed/complete-guide-to-sending-emails-through-an-smtp-server-with-nestjs-d75972dee394',
    //   date: '12:30'
    // })
  }
}
