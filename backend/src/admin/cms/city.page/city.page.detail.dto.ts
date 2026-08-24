import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, Validate, IsArray, ArrayNotEmpty, ArrayMinSize } from "class-validator";

import { CityPageTypes } from "src/entities/enums/city.page.type";

export class CityPageDetailDto {

    @IsString()
    @IsEnum(CityPageTypes)
    type: string

    @IsString()
    @IsNotEmpty()
    id: string
}