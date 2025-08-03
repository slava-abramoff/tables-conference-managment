import { PartialType } from "@nestjs/mapped-types"
import { IsOptional, IsString, IsUrl, IsUUID } from "class-validator"

class CreateRequestDto {
    @IsString()
    eventName: string

    @IsString()
    customerName: string

    @IsString()
    email: string

    @IsString()
    phone: string

    @IsString()
    location: string

    @IsString()
    platform: string

    @IsString()
    devices: string

    @IsString()
    description: string

    @IsString()
    start: string

    @IsString()
    end: string
}

export class AddMeetDto extends PartialType(CreateRequestDto) {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsUrl()
  shortUrl?: string;

  @IsOptional()
  @IsUUID()
  adminId?: string;

  @IsString()
  start: string;

  @IsString()
  end: string;
}