import { IsOptional, IsString, IsUUID } from "class-validator"

export class CreateLectureDto {
    @IsOptional()
    @IsString()
    group: string

    @IsOptional()
    @IsString()
    lector: string

    @IsOptional()
    @IsString()
    platform: string

    @IsOptional()
    @IsString()
    unit: string

    @IsOptional()
    @IsString()
    location: string

    @IsOptional()
    @IsString()
    url: string

    @IsOptional()
    @IsString()
    shortUrl: string

    @IsOptional()
    @IsString()
    streamKey: string

    @IsOptional()
    @IsString()
    description: string

    @IsOptional()
    @IsUUID()
    adminId: string

    @IsString()
    date: string

    @IsOptional()
    @IsString()
    start: string

    @IsOptional()
    @IsString()
    end: string

    @IsOptional()
    @IsString()
    abnormalTime: string
}