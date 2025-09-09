import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async search(searchTerm: string) {
    const where = searchTerm
      ? {
        OR: [
          { login: { contains: searchTerm, mode: 'insensitive' } },
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ].filter(Boolean) as Prisma.UserWhereInput[],
      }
      : {}

    const users = await this.prisma.user.findMany({
      where
    })

    return { data: users }
  }

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: dto
    })

    return user
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto
    })

    return user
  }

  async findMany() {}

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
      where: { id }
    })

    return user
  }
}
