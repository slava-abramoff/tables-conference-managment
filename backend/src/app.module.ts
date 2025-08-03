import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MeetsModule } from './meets/meets.module';
import { LecturesModule } from './lectures/lectures.module';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [UsersModule, AuthModule, MeetsModule, LecturesModule, DownloadsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
