import { Status } from "@prisma/client";
import { IsEnum, IsOptional, IsString} from "class-validator";
import { PaginationRequestDto } from "src/shared/classes";
import { SearchDto } from "src/shared/classes";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetQueryMeetDto extends PaginationRequestDto {

    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @IsOptional()
    @IsString()
    sortBy?: 'eventName' | 'customerName' | 'email' | 'phone' | 'location' | 'platform' | 'devices' | 'url' | 'shortUrl' | 'status' | 'description' | 'adminId' | 'start' | 'end' | 'createdAt' | 'updatedAt';

    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder;
}

export class SearchQueryDto extends SearchDto {}
