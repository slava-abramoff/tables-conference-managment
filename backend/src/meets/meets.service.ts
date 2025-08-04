import { Injectable } from '@nestjs/common';
import { GetQueryMeetDto, SearchQueryDto } from './dto/query.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateMeetDto } from './dto/update.dto';
import { AddMeetDto, CreateRequestDto } from './dto/create.dto';
import { Meet, Prisma } from '@prisma/client';
import { Pagination } from 'src/shared/intefaces';

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
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateRequestDto | AddMeetDto[]): Promise<Meet | Prisma.BatchPayload> {
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
        const { page, limit, searchTerm } = query

        const offset = (+page - 1) * +limit

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
    }

    async findAll(query: GetQueryMeetDto): Promise<MeetsPagination> {
        const { page, limit } = query

        const offset = (+page - 1) * +limit

        const where = {
            status: query.status ? query.status : undefined,
        };

        const orderBy = query.sortBy ? { [query.sortBy]: query.order || 'asc' } : undefined;

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

    async update(dto: UpdateMeetDto): Promise<Meet> {
        const { id, ...rest } = dto
        return await this.prisma.meet.update({
            where: { id },
            data: { ...rest }
        })
    }
}
