import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Validate, IsArray, IsInt, ValidateNested, ArrayMaxSize, ArrayMinSize, Min, Max } from "class-validator";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";



class WorkingHourDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(7)
    day: number;

    @Min(1)
    @Max(2)
    @IsNotEmpty()
    @IsInt()
    shift: number;

    @Min(0)
    @Max(23)
    @IsNotEmpty()
    @IsInt()
    from_hours: number;

    @Min(0)
    @Max(24)
    @IsNotEmpty()
    @IsInt()
    to_hours: number;
    
    @Min(0)
    @Max(1)
    @IsNotEmpty()
    @IsInt()
    is_closed: number;
}

export class LocationDto {

    @IsString()
    @IsNotEmpty()
    name_en: string

    @IsString()
    @IsNotEmpty()
    name_ar: string

    @IsString()
    @IsNotEmpty()
    address_en: string

    @IsString()
    @IsNotEmpty()
    address_ar: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    status: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    buffer_hours: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    pickup: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    dropoff: number

    @IsNotEmpty()
    @IsArray()
    recipients: object

    @IsString()
    @IsNotEmpty()
    lat: string

    @IsString()
    @IsNotEmpty()
    long: string

    @IsString()
    @IsNotEmpty()
    contact_number: string

    @IsString()
    @IsNotEmpty()
    timing_detail_ar: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    parking_charges: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    city_id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    is_virtual: number

    @IsArray()
    @ValidateNested()
    @ArrayMaxSize(14)
    @ArrayMinSize(14)
    @Type(() => WorkingHourDto)
    location_opening_hours: WorkingHourDto[]

    created_by: number

    updated_by: number
}