import { Role } from "@prisma/client"
import { IsEnum, IsOptional, IsString } from "class-validator"

export class CreateUserDto {
    @IsString()
    login: string

    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    email: string

    @IsOptional()
    @IsEnum(Role)
    role: Role

    @IsString()
    password: string
}