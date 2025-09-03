import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as csv from 'csv-stringify/sync';
import { Status } from '@prisma/client';

@Injectable()
export class DownloadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeets(startDate: string, endDate: string) {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException(
          'Не указаны даты начала или конца диапазона'
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'Неверный формат дат. Используйте YYYY-MM-DD'
        );
      }

      // Запрос к базе с фильтрацией по диапазону дат
      const data = await this.prisma.meet.findMany({
        where: {
          start: {
            gte: start, // >= startDate
            lte: end, // <= endDate
          },
          status: Status.completed,
        },
        select: {
          eventName: true,
          customerName: true,
          email: true,
          phone: true,
          location: true,
          platform: true,
          devices: true,
          url: true,
          shortUrl: true,
          description: true,
          admin: {
            select: { name: true }, // Получаем имя администратора
          },
          start: true,
          end: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Определяем заголовки CSV
      const columns = {
        eventName: 'Название мероприятия',
        customerName: 'ФИО',
        email: 'Email',
        phone: 'Телефон',
        location: 'Место проведения',
        platform: 'Платформа',
        devices: 'Оборудование',
        url: 'Ссылка',
        shortUrl: 'Короткая ссылка',
        description: 'Комментарий',
        adminName: 'Исполнитель',
        start: 'Начало',
        end: 'Конец',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      };

      // Форматируем данные для CSV
      const formattedData = data.map(item => ({
        ...item,
        adminName: item.admin?.name || '',
        start: item.start?.toISOString() || '',
        end: item.end?.toISOString() || '',
        createdAt: item.createdAt?.toISOString() || '',
        updatedAt: item.updatedAt?.toISOString() || '',
      }));

      // Генерируем CSV
      const csvOutput = csv.stringify(formattedData, {
        header: true,
        columns,
        delimiter: ',',
      });

      return csvOutput;
    } catch (error) {
      throw new HttpException(
        `Server error ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getLectures(startDate: string, endDate: string): Promise<string> {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException(
          'Не указаны даты начала или конца диапазона'
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'Неверный формат дат. Используйте YYYY-MM-DD'
        );
      }

      const data = await this.prisma.lecture.findMany({
        where: {
          date: {
            gte: start, // >= startDate
            lte: end, // <= endDate
          },
          adminId: { not: { in: null } },
        },
        select: {
          group: true,
          lector: true,
          platform: true,
          unit: true,
          location: true,
          url: true,
          shortUrl: true,
          streamKey: true,
          description: true,
          admin: {
            select: { name: true },
          },
          date: true,
          start: true,
          end: true,
          abnormalTime: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Определяем заголовки CSV
      const columns = {
        group: 'Группа',
        lector: 'Лектор',
        platform: 'Платформа',
        unit: 'Корпус',
        location: 'Место проведения',
        url: 'Ссылка',
        shortUrl: 'Короткая ссылка',
        streamKey: 'Ключ для стрима',
        description: 'Комментарий',
        adminName: 'Администратор',
        date: 'Дата проведения',
        start: 'Начало',
        end: 'Конец',
        abnormalTime: 'Время не по графику',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      };

      const formattedData = data.map(item => ({
        ...item,
        adminName: item.admin?.name || '',
        date: item.date?.toISOString() || '',
        start: item.start?.toISOString() || '',
        end: item.end?.toISOString() || '',
        createdAt: item.createdAt?.toISOString() || '',
        updatedAt: item.updatedAt?.toISOString() || '',
      }));

      const csvOutput = csv.stringify(formattedData, {
        header: true,
        columns,
        delimiter: ',',
      });

      return csvOutput;
    } catch (error) {
      throw new BadRequestException(`Ошибка при генерации CSV: ${error}`);
    }
  }
}
