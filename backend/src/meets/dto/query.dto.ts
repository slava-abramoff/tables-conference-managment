import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationRequestDto } from "src/shared/classes";
import { SearchDto } from "src/shared/classes";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetQueryMeetDto extends PaginationRequestDto {

    @ApiProperty({ description: 'Статус мероприятия', required: false, example: 'new' })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @ApiProperty({ description: 'Поля сортировки', required: false, example: 'eventName' })
    @IsOptional()
    @IsString()
    sortBy?: 'eventName' | 'customerName' | 'email' | 'phone' | 'location' | 'platform' | 'devices' | 'url' | 'shortUrl' | 'status' | 'description' | 'adminId' | 'start' | 'end' | 'createdAt' | 'updatedAt';

    @ApiProperty({ description: 'Порядок сортировки', required: false, example: 'asc' })
    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder;
}

export class SearchQueryDto extends SearchDto { }
