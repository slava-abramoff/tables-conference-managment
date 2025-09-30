import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot/bot.service';
import { BotUpdate } from './bot/bot.update';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('BOT_TOKEN');
        if (!token) {
          throw new Error('BOT_TOKEN is not defined');
        }
        return { token };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
