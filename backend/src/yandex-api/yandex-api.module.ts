import { Module } from '@nestjs/common';
import { YandexApiService } from './yandex-api.service';

@Module({
  controllers: [],
  providers: [YandexApiService],
  exports: [YandexApiService],
})
export class YandexApiModule {}
