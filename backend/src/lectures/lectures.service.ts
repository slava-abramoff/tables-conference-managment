import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/create.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksService } from 'src/tasks/tasks.service';
import { MailService } from 'src/mail/mail.service';
import { UpdateLinksDto } from './dto/update.dto';

@Injectable()
export class LecturesService {
  private static readonly MONTH_ORDER = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ];

  private static readonly MONTH_MAP = {
    january: { number: 1, en: 'January', ru: 'январь' },
    february: { number: 2, en: 'February', ru: 'февраль' },
    march: { number: 3, en: 'March', ru: 'март' },
    april: { number: 4, en: 'April', ru: 'апрель' },
    may: { number: 5, en: 'May', ru: 'май' },
    june: { number: 6, en: 'June', ru: 'июнь' },
    july: { number: 7, en: 'July', ru: 'июль' },
    august: { number: 8, en: 'August', ru: 'август' },
    september: { number: 9, en: 'September', ru: 'сентябрь' },
    october: { number: 10, en: 'October', ru: 'октябрь' },
    november: { number: 11, en: 'November', ru: 'ноябрь' },
    december: { number: 12, en: 'December', ru: 'декабрь' },
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly api: YandexApiService,
    private readonly tasksService: TasksService,
    private readonly mailService: MailService
  ) {}

  private handleError(error: any, context: string, method: string): never {
    this.logger.error(
      `Error in ${method}: ${error.message}`,
      error.stack,
      context,
      method
    );
    throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private convertMonth(
    month: string,
    toNumber: boolean
  ): number | string | null {
    const key = month.trim().toLowerCase();

    if (toNumber) {
      // русский → номер месяца
      const found = Object.values(LecturesService.MONTH_MAP).find(
        m => m.ru === key
      );
      return found?.number ?? null;
    }

    // английский → русский
    return LecturesService.MONTH_MAP[key]?.ru ?? null;
  }

  async create(dto: CreateLectureDto) {
    try {
      const result = await this.prisma.lecture.create({ data: dto });
      this.logger.log(`Lecture created`, LecturesService.name, 'create');

      return result;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'create');
    }
  }

  async createMany(dto: CreateLectureDto[]) {
    try {
      const result = await this.prisma.lecture.createManyAndReturn({
        data: [...dto],
      });
      return result;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'createMany');
    }
  }

  async createManyLinks(data: UpdateLinksDto) {
    try {
      const shortUrl = await this.api.shortenUrl(data.url);

      const result = await this.prisma.$executeRaw`
        UPDATE "Lecture"
        SET
          "url" = ${data.url},
          "shortUrl" = ${shortUrl ?? null}
        WHERE (
          ',' || REPLACE(LOWER("group"), ' ', '') || ',' ILIKE ${`%,${data.groupName.toLowerCase()},%`}
        )
        AND ("url" IS NULL OR "url" <> ${data.url})
      `;
      return result;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'createManyLinks');
    }
  }

  async getDates() {
    try {
      const result: Array<{ year: number; months: string[] }> = await this
        .prisma.$queryRaw`
          SELECT
            EXTRACT(YEAR FROM date) AS year,
            array_agg(DISTINCT TO_CHAR(date, 'Month')) AS months
          FROM "Lecture"
          GROUP BY EXTRACT(YEAR FROM date)
          ORDER BY year;
        `;

      const formattedResult = {
        data: {
          years: result.map(row => ({
            year: Number(row.year),
            months: row.months
              .map(month => this.convertMonth(month, false))
              .filter((m): m is string => Boolean(m)) // type guard
              .sort(
                (a, b) =>
                  LecturesService.MONTH_ORDER.indexOf(a) -
                  LecturesService.MONTH_ORDER.indexOf(b)
              ),
          })),
        },
      };

      this.logger.log(
        `Fetched available years and months`,
        LecturesService.name,
        'getDates'
      );
      return formattedResult;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'getDates');
    }
  }

  async findAll(input: GetLecturesByYearMonth) {
    try {
      const monthNumber = this.convertMonth(input.month, true) as number | null;

      if (!monthNumber) {
        this.logger.error(
          `Invalid month: ${input.month}`,
          undefined,
          LecturesService.name,
          'findAll'
        );
        throw new HttpException(
          `Month ${input.month} is not valid`,
          HttpStatus.BAD_REQUEST
        );
      }

      const startDate = new Date(Number(input.year), monthNumber - 1, 1);
      const endDate = new Date(Number(input.year), monthNumber, 1);

      const lectures = await this.prisma.lecture.findMany({
        where: { date: { gte: startDate, lt: endDate } },
      });

      const formattedDays = Object.values(
        lectures.reduce(
          (acc, { date, lector, group }) => {
            const dateKey = date.toISOString().split('T')[0];
            acc[dateKey] ??= { date: dateKey, lectors: [], groups: [] };

            if (lector) acc[dateKey].lectors.push(lector);
            if (group) acc[dateKey].groups.push(group);

            return acc;
          },
          {} as Record<
            string,
            { date: string; lectors: string[]; groups: string[] }
          >
        )
      );

      this.logger.log(
        `Fetched lectures for ${input.year} ${input.month}`,
        LecturesService.name,
        'findAll'
      );
      return formattedDays;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'findAll');
    }
  }

  async getByDate(date: string) {
    try {
      const result = await this.prisma.$queryRaw<
        Array<{
          id: string;
          group: string | null;
          lector: string | null;
          platform: string | null;
          unit: string | null;
          location: string | null;
          url: string | null;
          shortUrl: string | null;
          streamKey: string | null;
          description: string | null;
          adminId: string | null;
          login: string | null;
          name: string | null;
          date: Date;
          start: Date | null;
          end: Date | null;
          abnormalTime: string | null;
          createdAt: Date;
          updatedAt: Date | null;
        }>
      >`
        SELECT
          l.*,
          u.id AS "adminId",
          u.login AS "login",
          u.name AS "name"
        FROM "Lecture" AS l
        LEFT JOIN "User" AS u ON u.id = l."adminId"
        WHERE DATE(l."date") = ${date}::date
      `;

      // Преобразуем результат в нужную структуру
      const formatted = result.map(lecture => {
        const { adminId, login, name, ...rest } = lecture;
        return {
          ...rest,
          admin: adminId ? { id: adminId, login, name } : null, // если нет admin, возвращаем null
        };
      });

      this.logger.log(
        `Fetched lectures for date ${date}`,
        LecturesService.name,
        'getByDate'
      );

      return formatted;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'getByDate');
    }
  }

  async update(id: string, dto: UpdateLectureDto) {
    try {
      const shortUrl = dto.url ? await this.api.shortenUrl(dto.url) : undefined;

      const result = await this.prisma.lecture.update({
        where: { id },
        data: { ...dto, ...(shortUrl && { shortUrl }) },
        include: {
          admin: {
            select: {
              id: true,
              login: true,
              name: true,
            },
          },
        },
      });

      // if (shortUrl && result) {
      //   await this.tasksService.scheduleEmailForLecture(result.id);
      // }

      // if (dto.start && result) {
      //   await this.tasksService.cancelEmailTask('lecture', result.id);
      //   await this.tasksService.scheduleEmailForLecture(result.id);
      // }

      this.logger.log(
        `Updated lecture ID: ${id}`,
        LecturesService.name,
        'update'
      );
      return result;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'update');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.lecture.delete({ where: { id } });
      this.logger.log(
        `Deleted lecture ID: ${id}`,
        LecturesService.name,
        'remove'
      );

      if (result) {
        await this.tasksService.cancelEmailTask('lecture', result.id);
      }

      return result;
    } catch (error) {
      this.handleError(error, LecturesService.name, 'remove');
    }
  }
}
