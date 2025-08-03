import { Status } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetQueryMeetDto {

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