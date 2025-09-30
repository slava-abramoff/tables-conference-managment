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

  combineDateWithTime(date: Date, time: Date): Date {
    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const seconds = time.getUTCSeconds();
    const milliseconds = time.getUTCMilliseconds();

    // Создаем новую дату с исходной датой и временем из второго параметра
    const result = new Date(date);
    result.setUTCHours(hours, minutes, seconds, milliseconds);

    return result;
  }

  /**
   * Планирование уведомления за 30 минут до начала лекции
   */
  async scheduleEmailForLecture(lectureId: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { admin: true },
    });

    if (!lecture || !lecture.start) return;

    const currentLocalTime = Date.now();

    const start = this.combineDateWithTime(lecture.date, lecture.start);

    // Время уведомления за 30 минут до начала
    const notificationTime = start.getTime() - 30 * 60 * 1000;

    // Вычисляем задержку
    const delay = notificationTime - currentLocalTime;
    if (delay <= 0) {
      return;
    }

    return this.emailQueue.add(
      `lecture-email-${lectureId}`,
      {
        type: 'lecture',
        id: lectureId,
        lector: lecture.lector ?? 'Не указан',
        group: lecture.group ?? 'Не указан',
        url: lecture.url ?? 'Не указан',
        unit: lecture.unit ?? 'Не указан',
        location: lecture.location ?? 'Не указан',
        shortUrl: lecture.shortUrl ?? 'Не указан',
        dateTime: lecture.start,
      },
      {
        delay,
        jobId: `lecture-email-${lectureId}`,
      }
    );
  }

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
        location: meet.location,
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
