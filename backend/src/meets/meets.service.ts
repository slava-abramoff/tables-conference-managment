import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import { PrismaService } from 'prisma/prisma.service';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { Meet, Prisma, Status } from '@prisma/client';
import { Pagination } from 'src/shared/intefaces';
import { AppLogger } from 'src/app.logger';
import { YandexApiService } from 'src/yandex-api/yandex-api.service';
import { TasksService } from 'src/tasks/tasks.service';
import { MailService } from 'src/mail/mail.service';
import { tryCatch } from 'bullmq';

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
    private readonly mailService: MailService
  ) { }

  async create(dto: CreateRequestDto): Promise<Meet> {
    try {
      const result = await this.prisma.meet.create({
        data: dto,
      });

      return result;
    } catch (error) {
      this.handleError(error, MeetsService.name, 'create');
    }
  }

  async createMany() {
    try {

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
          include: { admin: true },
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
      const { url, ...rest } = dto;

      let shortUrl: string | undefined;
      if (url) {
        this.logger.debug(`Shortening URL: ${url}`);
        shortUrl = await this.api.shortenUrl(url);
      }

      const updateData: AddMeetDto = { ...rest };
      if (shortUrl) {
        updateData.shortUrl = shortUrl;
        updateData.status = Status.processed;
      }

      const updatedMeet = await this.prisma.meet.update({
        where: { id },
        data: updateData,
      });

      if (dto.start) {
        await this.tasksService.cancelEmailTask('meet', updatedMeet.id);
        await this.tasksService.scheduleEmailForMeet(updatedMeet.id);
      }

      if (dto.status === Status.rejected) {
        await this.tasksService.cancelEmailTask('meet', updatedMeet.id);
      }

      if (shortUrl && updatedMeet.email && updatedMeet.start && updatedMeet.url) {
        await this.mailService.notificateAboutCreationLink({
          email: updatedMeet.email,
          customer: updatedMeet.customerName ?? 'заказчик',
          event: updatedMeet.eventName ?? 'Мероприятие',
          startTime: String(updatedMeet.start),
          place: updatedMeet.location ?? 'Не указано',
          url: updatedMeet.url,
          shortUrl: shortUrl,
        });
        await this.tasksService.scheduleEmailForMeet(updatedMeet.id);
      }

      return updatedMeet;
    } catch (error) {
      this.handleError(error, MeetsService.name, 'update');
    }
  }
}
