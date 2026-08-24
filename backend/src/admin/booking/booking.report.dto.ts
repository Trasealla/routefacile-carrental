import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class BookingReportDto {

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    from: number

}