import { Injectable } from '@nestjs/common';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import { PrismaService } from 'prisma/prisma.service';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { Meet, Prisma } from '@prisma/client';
import { Pagination } from 'src/shared/intefaces';
import { AppLogger } from 'src/app.logger';

export interface MeetsPagination {
    data: Meet[],
    pagination: Pagination
}

export interface SearchResults {
    data: Meet[],
    pagination: Pagination
}

@Injectable()
export class MeetsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger
    ) { }

    async create(dto: CreateRequestDto | AddMeetDto[]): Promise<Meet | Prisma.BatchPayload> {
        this.logger.debug('start', MeetsService.name, 'create')
        return Array.isArray(dto)
            ? await this.prisma.meet.createMany({
                data: dto.map(({ ...rest }) => ({
                    ...rest,
                })),
                skipDuplicates: true,
            })
            : await this.prisma.meet.create({
                data: dto
            })
    }

    async search(query: SearchQueryDto): Promise<SearchResults> {
        this.logger.debug('start', MeetsService.name, 'search')
        const { page, limit, searchTerm } = query

        const offset = (+page - 1) * +limit

        this.logger.debug(`
            page: ${page},
            limit: ${limit},
            term: ${searchTerm},
            offset: ${offset}`,
            MeetsService.name,
            'search'
        )

        const where = searchTerm ? {
            OR: [
                { eventName: { contains: searchTerm, mode: 'insensitive' } },
                { customerName: { contains: searchTerm, mode: 'insensitive' } },
                { shortUrl: { contains: searchTerm, mode: 'insensitive' } },
                { url: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
            ].filter(Boolean) as Prisma.MeetWhereInput[]
        } : {};

        this.logger.debug('get meets and total', MeetsService.name, 'search')
        const [meets, total] = await Promise.all([
            this.prisma.meet.findMany({
                where,
                skip: offset,
                take: +limit
            }),
            this.prisma.meet.count({
                where
            })
        ])
        this.logger.debug('meets and total queries is ok', MeetsService.name, 'search')

        const totalPages = Math.ceil(total / +limit);
        this.logger.debug(`total pages: ${totalPages}`, MeetsService.name, 'search')

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
    }

    async findAll(query: GetQueryMeetDto): Promise<MeetsPagination> {
        this.logger.debug(`start`, MeetsService.name, 'findAll')
        const { page, limit } = query

        const offset = (+page - 1) * +limit

        this.logger.debug(`page: ${page}, limit: ${limit}, offset: ${offset}`, MeetsService.name, 'findAll')

        const where = {
            status: query.status ? query.status : undefined,
        };

        this.logger.debug(`query status: ${where.status}`, MeetsService.name, 'findAll')

        const orderBy = query.sortBy ? { [query.sortBy]: query.order || 'asc' } : undefined;

        this.logger.debug(`order by: ${orderBy}`, MeetsService.name, 'findAll')

        const [meets, total] = await Promise.all([
            this.prisma.meet.findMany({
                where,
                orderBy,
                include: { admin: true },
                skip: offset,
                take: +limit
            }),
            this.prisma.meet.count({
                where
            })
        ])

        const totalPages = Math.ceil(total / +limit);

        this.logger.debug(`total pages: ${totalPages}`, MeetsService.name, 'findAll')

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
    }

    async update(id: string, dto: AddMeetDto): Promise<Meet> {
        this.logger.debug(`start`, MeetsService.name, 'update')

        this.logger.debug(`id: ${id}`, MeetsService.name, 'update')

        return await this.prisma.meet.update({
            where: { id },
            data:  dto 
        })
    }
}
