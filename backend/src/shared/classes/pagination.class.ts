import { IsNumberString, ValidateIf } from "class-validator"

export class PaginationRequestDto {
    @ValidateIf((o) => !isNaN(Number(o.page)))
    @IsNumberString()
    page: string

    @ValidateIf((o) => !isNaN(Number(o.page)))
    @IsNumberString()
    limit: string

}