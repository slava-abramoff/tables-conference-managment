import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create.dto";
import { IsUUID } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {}