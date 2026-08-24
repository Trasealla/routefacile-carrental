import { IsNotEmpty, IsOptional } from "class-validator";

export class RateMonthlyDto {

    @IsNotEmpty()
    year: number
    
    @IsNotEmpty()
    city_ids: string

    @IsOptional()
    model_year: number
}
