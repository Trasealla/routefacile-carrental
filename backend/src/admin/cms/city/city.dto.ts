import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsArray, IsInt, ValidateNested, ArrayMaxSize, ArrayMinSize, Min, Max } from "class-validator";

class WorkingHourDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(7)
    day: number;

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

export class CityDto {

    @IsString()
    @IsNotEmpty()
    name_en: string

    @IsString()
    @IsNotEmpty()
    name_ar: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    status: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    buffer_hours: number

    @IsNotEmpty()
    @IsArray()
    recipients: object

    @IsString()
    @IsNotEmpty()
    contact_number: string

    @IsArray()
    @ValidateNested()
    @ArrayMaxSize(7)
    @ArrayMinSize(7)
    @Type(() => WorkingHourDto)
    city_opening_hours: WorkingHourDto[]

    created_by: number

    updated_by: number
}