import { Update, Ctx, Start, On, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('Бот запущен!');
  }

  @Command('whats_the_id')
  async whatId(@Ctx() ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.reply('Не удалось получить ID чата.');
      return;
    }
    await ctx.reply(`${chatId}`);
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId || !ctx.message) return;

    // Проверяем, что это текстовое сообщение
    if ('text' in ctx.message && typeof ctx.message.text === 'string') {
      const text = ctx.message.text;

      if (text === '/send_to_group') {
        await this.botService.sendMessageToGroup('Сообщение из бота!');
      }
    }
  }
}
