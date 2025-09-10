import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { GetQueryUsersDto, SearchUsersTerm } from './dto/query.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchUsersTerm) {
    const { searchTerm } = query;

    const where = searchTerm
      ? {
          OR: [
            { login: { contains: searchTerm, mode: 'insensitive' } },
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ].filter(Boolean) as Prisma.UserWhereInput[],
        }
      : {};

    const users = await this.prisma.user.findMany({
      where,
    });

    return { data: users };
  }

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: dto,
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return user;
  }

  async getOne(login: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { login },
    });
  }

  async getById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }

  async findMany(query: GetQueryUsersDto) {
    const { page, limit } = query;

    const offset = (+page - 1) * +limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: offset,
        take: +limit,
      }),
      this.prisma.user.count({}),
    ]);

    const totalPages = Math.ceil(total / +limit);

    return {
      data: users,
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
}
