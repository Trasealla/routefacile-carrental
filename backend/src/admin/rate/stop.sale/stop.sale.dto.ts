
import { IsNotEmpty, IsDateString, IsObject, Validate, IsOptional } from "class-validator";
import { City } from "src/entities/city.entity";
import { Location } from "src/entities/location.entity";
import { IsExists } from "src/validators/exists.validator";

export class StopSaleDto {

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @IsOptional()
    @Validate(IsExists, [Location, 'id'])
    location_id: number;

    @IsObject()
    @IsNotEmpty()
    car_ids: object

    created_by: number
    updated_by: number
}

