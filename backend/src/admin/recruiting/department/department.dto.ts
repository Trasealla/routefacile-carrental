import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";

export class RecruitingDepartmentDto {

    @IsString()
    @IsNotEmpty()
    name_en: string;

    @IsString()
    @IsNotEmpty()
    name_ar: string;

    @IsOptional()
    @IsString()
    description_en: string;

    @IsOptional()
    @IsString()
    description_ar: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number;

    created_by: number;
    updated_by: number;
}
