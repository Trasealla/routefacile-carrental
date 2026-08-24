import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsDateString, IsNumber, IsObject, IsBoolean, IsArray, ArrayNotEmpty, Validate, IsNotEmptyObject, IsDefined, ValidateNested } from "class-validator";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class SurgeDto {

    @IsString()
    @IsNotEmpty()
    name_en: string

    @IsString()
    @IsNotEmpty()
    name_ar: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    rate: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    cdw: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    scdw: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    pai: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    gps: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    driver: number


    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    status: number

    @IsObject()
    @IsNotEmpty()
    car_ids: object

    @IsNotEmptyObject()
    @IsObject()
    city_ids: object

    @IsObject()
    @IsNotEmptyObject()
    group_ids: object

    @IsObject()
    @IsNotEmptyObject()
    location_ids: object

    created_by: number
    updated_by: number
}

