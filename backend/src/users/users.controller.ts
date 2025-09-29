import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { GetQueryUsersDto, SearchUsersTerm } from './dto/query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create User
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() user: CreateUserDto) {
    return await this.usersService.create(user);
  }

  /**
   * Get Users
   */
  @Get('find')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Get users list' })
  // @ApiQuery({ type: PaginationRequestDto })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async get(@Query() query: GetQueryUsersDto) {
    return await this.usersService.findMany(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ type: SearchUsersTerm })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async search(@Query() query: SearchUsersTerm) {
    return await this.usersService.search(query);
  }

  /**
   * Update User
   */
  @Patch('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Body() user: UpdateUserDto, @Param('id') id: string) {
    return await this.usersService.update(id, user);
  }

  /**
   * Remove User
   */
  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
