import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { LectureJob, MeetJob } from 'src/tasks/tasks.processor';

@Injectable()
export class BotService {
  private readonly groupChatId: string;

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly configService: ConfigService
  ) {
    const chatId = this.configService.get<string>('GROUP_CHAT_ID');
    if (!chatId) {
      throw new Error('GROUP_CHAT_ID is not defined in .env');
    }
    this.groupChatId = chatId;
  }

  async sendMessageToGroup(text: string) {
    await this.bot.telegram.sendMessage(this.groupChatId, text, {
      parse_mode: 'Markdown',
    });
  }

  async sendNewEvent() {}

  async sendNotificate(event: MeetJob | LectureJob) {
    if (event.type === 'meet') {
      await this.sendMessageToGroup(`
        **ВКС ${event.eventName} через 30 минут!⏰**
        - Место: *${event.location}* 🚪
        - Ссылка: ${event.shortUrl} 📶
        - Время: *${event.dateTime}* 🕒
      `);
    } else if (event.type === 'lecture') {
      await this.sendMessageToGroup(`
        **Лекция через 30 минут!⏰**
        - Лектор: *${event.lector}* 🎓
        - Группа: *${event.group}* 👤
        - Корпус: *${event.unit}* 🏢
        - Место: *${event.location}* 🚪
        - Ссылка: ${event.shortUrl} 📶
        - Время: *${event.dateTime}* 🕒
        `);
    } else {
      return;
    }
  }
}
