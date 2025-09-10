import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/classes';

export class GetQueryUsersDto extends PaginationRequestDto {}

export class SearchUsersTerm {
  @ApiProperty({ description: 'term for search' })
  @IsString()
  searchTerm: string;
}
