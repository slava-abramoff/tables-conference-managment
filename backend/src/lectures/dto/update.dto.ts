import { PartialType } from "@nestjs/mapped-types";
import { CreateLectureDto } from "./create.dto";
import { IsUUID } from "class-validator";

export class UpdateLectureDto extends PartialType(CreateLectureDto) {
    @IsUUID()
    id: string
}