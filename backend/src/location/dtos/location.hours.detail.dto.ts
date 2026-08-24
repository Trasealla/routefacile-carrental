import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber } from "class-validator";

export class LocationHourDetailDto {

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    day: number
}