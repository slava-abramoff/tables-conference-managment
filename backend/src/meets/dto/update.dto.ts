import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsUUID } from "class-validator";
import { AddMeetDto } from "./create.dto";

export class UpdateMeetDto extends PartialType(AddMeetDto) {
  @IsUUID()
  id: string
}