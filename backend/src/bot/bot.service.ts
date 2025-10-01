import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { LectureJob, MeetJob } from 'src/tasks/tasks.processor';
import { Lecture, Meet } from '@prisma/client';
import {
  formatComplexDate,
  formatDateToRussian,
} from 'src/shared/utils/dateTime';

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

  async sendNewEvent(type: 'meet' | 'lecture', event: Meet | Lecture) {
    if (type === 'meet') {
      await this.sendMessageToGroup(`
        **Создана заявка на ВКС!** 📅
        - Место: *${event.location}* 🚪
        - Время: *${formatComplexDate(String(event.start))}* ⏰
        - Платформа: *${event.platform}* 🖥️
        `);
    } else if (type === 'lecture' && 'date' in event) {
      await this.sendMessageToGroup(`
        **Создана лекция на ${formatDateToRussian(event.date)}**
        *Создайте ссылки*
        `);
    }
  }

  async sendNotificate(event: MeetJob | LectureJob) {
    if (event.type === 'meet') {
      await this.sendMessageToGroup(`
        **ВКС ${event.eventName} через 30 минут!** ⏰
        - Место: *${event.location}* 🚪
        - Ссылка: ${event.shortUrl} 📶
        - Время: *${formatComplexDate(event.dateTime)}* 🕒
      `);
    } else {
      await this.sendMessageToGroup(`
        **Лекция через 30 минут!** ⏰
        - Лектор: *${event.lector}* 🎓
        - Группа: *${event.group}* 👤
        - Корпус: *${event.unit}* 🏢
        - Место: *${event.location}* 🚪
        - Ссылка: ${event.shortUrl} 📶
        - Время: *${formatComplexDate(event.dateTime)}* 🕒
        `);
    }
  }
}
