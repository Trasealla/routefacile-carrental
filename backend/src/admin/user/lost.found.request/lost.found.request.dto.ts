import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class LostFoundRequestDto extends PaginationDto {

    @ApiProperty()
    @IsString()
    @IsEmail()
    @IsOptional()
    email: string

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @IsOptional()
    city_id: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    reference_number: string
}
