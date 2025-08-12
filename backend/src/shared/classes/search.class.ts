import { IsOptional, IsString } from "class-validator"
import { PaginationRequestDto } from "./pagination.class"
import { ApiProperty } from "@nestjs/swagger"

export class SearchDto extends PaginationRequestDto{

    @ApiProperty({ description: 'Термин', required: false, example: 'Награждение' })
    @IsString()
    @IsOptional()
    searchTerm: string
}