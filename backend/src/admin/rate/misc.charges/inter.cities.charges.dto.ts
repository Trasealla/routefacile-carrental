import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsOptional, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";

export class InterCitiesChargesDto {

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    pickup_city_id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    dropoff_city_id: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    charges: number

    created_by: number
    updated_by: number
}

