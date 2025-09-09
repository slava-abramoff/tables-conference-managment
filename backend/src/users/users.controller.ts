import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { GetQueryUsersDto } from './dto/query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Create User
   */
  @Post()
  async create(@Body() user: CreateUserDto) {
    return await this.usersService.create(user);
  }

  /**
   * Get Users
   */
  @Get()
  async get(@Query() query: GetQueryUsersDto) {
    return query;
  }

  /**
   * Update Users
   */
  @Patch('/:id')
  async update(@Body() user: UpdateUserDto, @Param('id') id: string) {
    return await this.usersService.update(id, user);
  }

  /**
   * Remove User
   */
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
