import { IsString } from "class-validator"

export class GetLecturesByYearMonth {
    @IsString()
    year: string

    @IsString()
    month: string
}