import { IsOptional, IsString } from "class-validator"
import { PaginationRequestDto } from "./pagination.class"

export class SearchDto extends PaginationRequestDto{
    @IsString()
    @IsOptional()
    searchTerm: string
}