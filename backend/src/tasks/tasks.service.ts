import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Планирование уведомления за час до начала лекции
   */
  // async scheduleEmailForLecture(lectureId: string) {
  //   const lecture = await this.prisma.lecture.findUnique({
  //     where: { id: lectureId },
  //     include: { admin: true },
  //   });

  //   if (!lecture || !lecture.start || !lecture.admin?.email) return;

  //   // Получаем текущее локальное время сервера
  //   const currentLocalTime = new Date().getTime();

  //   // Переводим дату встречи в локальное время сервера
  //   const lectureStartLocal = new Date(
  //     lecture.start.getTime() + new Date().getTimezoneOffset() * 60000
  //   );

  //   // Время уведомления за 30 минуты до старта
  //   const notificationTime = lectureStartLocal.getTime() - 30 * 60 * 1000;

  //   // Вычисляем задержку
  //   const delay = notificationTime - currentLocalTime;

  //   await this.emailQueue.add(
  //     `lecture-email-${lectureId}`,
  //     {
  //       type: 'lecture',
  //       id: lectureId,
  //       adminEmail: lecture.admin.email,
  //       eventName: lecture.group || 'Без группы',
  //       place: lecture.location || lecture.platform || 'Не указано',
  //       url: lecture.url || '',
  //       shortUrl: lecture.shortUrl || '',
  //       streamKey: lecture.streamKey || '',
  //       date: lecture.start.toLocaleString(),
  //     },
  //     {
  //       delay,
  //       jobId: `lecture-email-${lectureId}`, // уникальный ID для задачи
  //     }
  //   );
  // }

  /**
   * Планирование уведомления за час до начала мероприятия
   */
  async scheduleEmailForMeet(meetId: string) {
    const meet = await this.prisma.meet.findUnique({
      where: { id: meetId },
      include: { admin: true },
    });

    if (!meet || !meet.start) return;

    const currentLocalTime = Date.now();

    // Время уведомления за 30 минут до начала
    const notificationTime = meet.start.getTime() - 30 * 60 * 1000;

    // Вычисляем задержку
    const delay = notificationTime - currentLocalTime;
    if (delay <= 0) {
      return;
    }

    return this.emailQueue.add(
      `meet-email-${meetId}`,
      {
        type: 'meet',
        id: meetId,
        email: meet.email,
        eventName: meet.eventName || 'Без названия',
        url: meet.url || '',
        shortUrl: meet.shortUrl || '',
        dateTime: meet.start,
      },
      {
        delay,
        jobId: `meet-email-${meetId}`,
      }
    );
  }

  /**
   * Отмена задачи на отправку письма
   */
  async cancelEmailTask(type: 'lecture' | 'meet', id: string) {
    await this.emailQueue.remove(`${type}-email-${id}`);
  }
}
