import { IsNotEmpty } from "class-validator";

export class RateDailyDto {

    @IsNotEmpty()
    year: number
    
    @IsNotEmpty()
    city_ids: string
}
