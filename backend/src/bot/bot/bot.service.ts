import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

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
}
