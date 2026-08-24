import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber } from "class-validator";
import { LocationTypes } from "src/entities/enums/location.type";

export class LocationDetailDto {
    @IsString()
    @IsNotEmpty()
    @IsEnum(LocationTypes)
    type: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    id: number
}