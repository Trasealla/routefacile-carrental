import { IsDateString, IsEnum, IsNotEmpty, IsOptional, Validate } from "class-validator"
import { CarBrand } from "src/entities/car.brand.entity"
import { CarCategory } from "src/entities/car.category.entity"
import { CarFuelType } from "src/entities/car.fuel.type.entity"
import { CarGroup } from "src/entities/car.group.entity"
import { CarTag } from "src/entities/car.tag.entity"
import { CarTransmission } from "src/entities/car.transmission.entity"
import { BasicStatusTypes } from "src/entities/enums/basic.status.type"
import { IsExists } from "src/validators/exists.validator"

export class CarDto {
    @IsNotEmpty()
    name_en: string

    @IsNotEmpty()
    name_ar: string

    @IsNotEmpty()
    description_en: string

    @IsNotEmpty()
    description_ar: string

    // @IsNotEmpty()
    // @IsDateString({ strict: true }, { message: 'availability_date must be in the format YYYY-MM-DD' })
    // availability_date: string;

    image: string
    banner_image: string
    images: string[]

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    status: number

    @IsNotEmpty()
    doors_en: string

    @IsNotEmpty()
    doors_ar: string

    @IsNotEmpty()
    passengers_en: string

    @IsNotEmpty()
    passengers_ar: string

    @IsNotEmpty()
    suit_cases_en: string

    @IsNotEmpty()
    suit_cases_ar: string

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    air_bags: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    parking_sensors: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    rear_camera: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    infotainment_system: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    bluetooth: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    sunroof: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    cruise_control: number

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    electric: number

    // @IsEnum(BasicStatusTypes)
    featured: number


    abs: number

    ac: number

    fuel_avg: number

    hp: number

    year: number

    @IsNotEmpty()
    @Validate(IsExists, [CarGroup, 'id'])
    group_id: number;

    @IsNotEmpty()
    @Validate(IsExists, [CarFuelType, 'id'])
    fuel_type_id: number;

    @IsNotEmpty()
    @Validate(IsExists, [CarCategory, 'id'])
    category_id: number;

    @IsNotEmpty()
    @Validate(IsExists, [CarBrand, 'id'])
    brand_id: number;

    @IsOptional()
    @Validate(IsExists, [CarTag, 'id'])
    tag_id: number;

    @IsNotEmpty()
    @Validate(IsExists, [CarTransmission, 'id'])
    transmission_id: number;

    // Special Rates Feature - show special image in selected cities
    // JSON format: { all: true } or { all: false, ids: [1, 2, 3] }
    @IsOptional()
    special_rates_cities: string | { all: boolean, ids?: number[] };

    // Special image that replaces main car image in selected cities
    special_rates_image: string;

    created_by: number
    updated_by: number
}