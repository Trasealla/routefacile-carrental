import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApplicationStatusTypes } from "src/entities/enums/application.status.type";

export class RecruitingStatusHistoryDto {

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    application_id: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(ApplicationStatusTypes)
    from_status: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(ApplicationStatusTypes)
    to_status: number;

    @IsOptional()
    @IsString()
    notes: string;

    changed_by: number;
}
