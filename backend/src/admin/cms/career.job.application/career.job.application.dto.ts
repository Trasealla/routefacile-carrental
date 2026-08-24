import { Type } from "class-transformer";
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApplicationStatusTypes } from "src/entities/enums/application.status.type";

export class CareerJobApplicationFilterDto {

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    career_job_id: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(ApplicationStatusTypes)
    status: number

    @IsOptional()
    @IsString()
    @IsIn(['routefacile', 'indeed', 'linkedin', 'naukrigulf', 'facebook', 'instagram', 'tiktok'])
    source_channel: string

    @IsOptional()
    @IsString()
    @IsIn(['qualified', 'not_qualified', 'no_keywords', 'no_cv'])
    ai_status: string

    @IsOptional()
    @IsString()
    @IsIn(['created_at', 'ai_score', 'ai_screened_at'])
    sort_by: string

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sort_order: string
}

export class CareerJobApplicationUpdateDto {

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(ApplicationStatusTypes)
    status: number

    @IsOptional()
    @IsString()
    admin_notes: string

    reviewed_by: number
}
