import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsDateString, Validate, ValidateIf } from "class-validator";
import { Country } from "src/entities/country.entity";
import { City } from "src/entities/city.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";
import { Genders } from "src/entities/enums/gender";
import { IsExists } from "src/validators/exists.validator";

export class UpdateUserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    first_name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last_name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string

    @ApiProperty({ example: 'male or female' })
    @IsString()
    @IsNotEmpty()
    @IsEnum(Genders)
    gender: string

    @ApiProperty()
    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'Date of birth must be in the format YYYY-MM-DD' })
    dob: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(IsExists, [Country, 'phone_code'])
    phone_code: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone_number: string

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

    @ApiProperty({ example: '1 or 0' })
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number

}