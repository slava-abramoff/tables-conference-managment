import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import { PrismaService } from 'prisma/prisma.service';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { Meet, Prisma } from '@prisma/client';
import { Pagination } from 'src/shared/intefaces';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksService } from 'src/tasks/tasks.service';
import { MailService } from 'src/mail/mail.service';
import { BotService } from 'src/bot/bot/bot.service';

export interface MeetsPagination {
  data: Meet[];
  pagination: Pagination;
}

export interface SearchResults {
  data: Meet[];
  pagination: Pagination;
}

@Injectable()
export class MeetsService {
  private handleError(error: any, context: string, method: string): never {
    this.logger.error(
      `Error in ${method}: ${error.message}`,
      error.stack,
      context,
      method
    );
    throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly api: YandexApiService,
    private readonly tasksService: TasksService,
    private readonly mailService: MailService,
    private readonly bot: BotService
  ) {}

  async create(dto: CreateRequestDto): Promise<Meet> {
    try {
      const result = await this.prisma.meet.create({
        data: dto,
      });

      await this.bot.sendMessageToGroup(`
        Новая конференция!
        Название: ${result.eventName},
        ФИО: ${result.customerName},
        Почта: ${result.email},
        Телефон: ${result.phone},
        Место: ${result.location},
        Время: ${String(result.start)},
        `);

      return result;
    } catch (error) {
      this.handleError(error, MeetsService.name, 'create');
    }
  }

  async createMany(dto: AddMeetDto[]) {
    try {
      const result = await this.prisma.meet.createManyAndReturn({
        data: [...dto],
      });
      return result;
    } catch (error) {
      this.handleError(error, MeetsService.name, 'createMany');
    }
  }

  async search(query: SearchQueryDto): Promise<SearchResults> {
    try {
      const { page, limit, searchTerm } = query;

      const offset = (+page - 1) * +limit;

      const where = searchTerm
        ? {
            OR: [
              { eventName: { contains: searchTerm, mode: 'insensitive' } },
              { customerName: { contains: searchTerm, mode: 'insensitive' } },
              { shortUrl: { contains: searchTerm, mode: 'insensitive' } },
              { url: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm, mode: 'insensitive' } },
            ].filter(Boolean) as Prisma.MeetWhereInput[],
          }
        : {};

      const [meets, total] = await Promise.all([
        this.prisma.meet.findMany({
          where,
          skip: offset,
          take: +limit,
          include: {
            admin: {
              select: {
                id: true,
                login: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.meet.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(total / +limit);

      return {
        data: meets,
        pagination: {
          currentPage: +page,
          totalPages,
          totalItems: total,
          itemsPerPage: +limit,
          hasNextPage: +page < totalPages,
          hasPreviousPage: +page > 1,
        },
      };
    } catch (error) {
      this.handleError(error, MeetsService.name, 'search');
    }
  }

  async findAll(query: GetQueryMeetDto): Promise<MeetsPagination> {
    try {
      const { page, limit } = query;

      const offset = (+page - 1) * +limit;

      const where = {
        status: query.status ? query.status : undefined,
      };

      const orderBy = query.sortBy
        ? { [query.sortBy]: query.order || 'asc' }
        : undefined;

      this.logger.debug(`order by: ${orderBy}`, MeetsService.name, 'findAll');

      const [meets, total] = await Promise.all([
        this.prisma.meet.findMany({
          where,
          orderBy,
          include: {
            admin: {
              select: {
                id: true,
                login: true,
                name: true,
              },
            },
          },
          skip: offset,
          take: +limit,
        }),
        this.prisma.meet.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(total / +limit);

      return {
        data: meets,
        pagination: {
          currentPage: +page,
          totalPages,
          totalItems: total,
          itemsPerPage: +limit,
          hasNextPage: +page < totalPages,
          hasPreviousPage: +page > 1,
        },
      };
    } catch (error) {
      this.handleError(error, MeetsService.name, 'findAll');
    }
  }

  async update(id: string, dto: AddMeetDto): Promise<Meet> {
    try {
      const shortUrl = dto.url ? await this.api.shortenUrl(dto.url) : undefined;

      const updatedMeet = await this.prisma.meet.update({
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

      if (dto.url && updatedMeet.email && updatedMeet.url) {
        await this.mailService.infoAboutMeeting({
          email: updatedMeet.email,
          eventName: updatedMeet.eventName || 'Не указано',
          url: updatedMeet.url,
          shortUrl: updatedMeet.shortUrl || 'Не указано',
          dateTime: String(updatedMeet.start),
        });

        await this.tasksService.scheduleEmailForMeet(updatedMeet.id);
      }

      return updatedMeet;
    } catch (error) {
      this.handleError(error, MeetsService.name, 'update');
    }
  }
}
