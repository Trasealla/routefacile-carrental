import { IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class RateRangeDto {

    @IsNotEmpty()
    city_ids: string

    location_ids: string

    @IsOptional()
    @IsDateString()
    start_date: string  // Format: YYYY-MM-DD

    @IsOptional()
    @IsDateString()
    end_date: string    // Format: YYYY-MM-DD
}
