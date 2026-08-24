import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Validate, ValidateIf } from "class-validator";
import { Country } from "src/entities/country.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";

export class UserAddressDto {

    @ApiProperty()
    @IsNotEmpty()
    house_number: string

    @ApiProperty()
    @IsNotEmpty()
    street_name: string

    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Number)
    @Validate(IsExists, [Country, 'id'])
    country_id: number

    @ApiProperty()
    @IsNotEmpty()
    @ValidateIf(o => o.country_id === 229) // uae
    @Validate(IsExists, [City, 'id'])
    city_id: number

    @ApiProperty()
    @IsString()
    @IsOptional()
    state: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    city: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    zip_code: string
}