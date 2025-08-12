import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class GetLecturesByYearMonth {
    @ApiProperty({ description: 'Год', example: ''})
    @IsString()
    year: string

    @ApiProperty({ description: 'Месяц', example: ''})
    @IsString()
    month: string
}