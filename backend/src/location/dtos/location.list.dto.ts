import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsNumber, Validate } from "class-validator";
import { LangDto } from "src/dtos/lang.dto";
import { City } from "src/entities/city.entity";
import { Location } from "src/entities/location.entity";
import { IsExists } from "src/validators/exists.validator";

export class LocationListDto extends LangDto{
    @ApiProperty({
        minimum: 1,
        title: 'Emirete id',
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'Pickup location id - used to filter dropoff locations based on pickup location type',
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Validate(IsExists, [Location, 'id'])
    pickup_location_id: number;
}