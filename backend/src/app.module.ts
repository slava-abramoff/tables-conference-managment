import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MeetsModule } from './meets/meets.module';
import { LecturesModule } from './lectures/lectures.module';
import { DownloadsModule } from './downloads/downloads.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppLogger } from './app.logger';
import { MailModule } from './mail/mail.module';
import { YandexApiModule } from './yandex-api/yandex-api.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MeetsModule,
    LecturesModule,
    DownloadsModule,
    MailModule,
    YandexApiModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    BotModule,
  ],
  controllers: [],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export class LoggerModule {}
