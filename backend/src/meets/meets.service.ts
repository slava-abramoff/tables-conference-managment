import { Injectable } from '@nestjs/common';
import { GetQueryMeetDto } from './dto/query.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateMeetDto } from './dto/update.dto';

@Injectable()
export class MeetsService {
    constructor(private prisma: PrismaService) { }
    /**
     * TODO:
     * - Запрос на создание
     * - Создать много
     * - Изменить
     */

    async create() {}
    
    async add() {}

    async findAll(query: GetQueryMeetDto) {
        const where = {
            status: query.status ? query.status : undefined,
        };

        const orderBy = query.sortBy ? { [query.sortBy]: query.order || 'asc' } : undefined;

        return await this.prisma.meet.findMany({
            where,
            orderBy,
            include: { admin: true }, 
        });
    }

    async update(dto: UpdateMeetDto) {}
}
