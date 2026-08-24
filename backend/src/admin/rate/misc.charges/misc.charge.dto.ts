import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsOptional, Validate } from "class-validator";

export class MiscChargeDto {

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    id: number

    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    key: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    rate: number

    created_by: number
    updated_by: number
}

