import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CityHourDetailDto {

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    day: number
}