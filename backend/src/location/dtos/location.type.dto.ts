import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { LocationTypes } from "src/entities/enums/location.type";

export class LocationTypeDto {
    @IsString()
    @IsNotEmpty()
    @IsEnum(LocationTypes)
    type: string
}