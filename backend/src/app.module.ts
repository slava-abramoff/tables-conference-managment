import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MeetsModule } from './meets/meets.module';
import { LecturesModule } from './lectures/lectures.module';
import { DownloadsModule } from './downloads/downloads.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppLogger } from './app.logger';

@Module({
  imports: [UsersModule, AuthModule, MeetsModule, LecturesModule, DownloadsModule,],
  controllers: [],
  providers: [AppLogger],
  exports: [AppLogger]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // для всех маршрутов
  }
}

export class LoggerModule {}
