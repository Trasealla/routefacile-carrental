import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';

export class RecruitingKeywordDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    career_job_id!: number;

    @IsString()
    @IsNotEmpty()
    keyword!: string;

    @IsOptional()
    @IsString()
    @IsIn(['must_have', 'optional', 'exclude'])
    keyword_type!: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    weight!: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status!: number;

    created_by!: number;
    updated_by!: number;
}

export class RecruitingKeywordUpdateDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id!: number;

    @IsOptional()
    @IsString()
    keyword!: string;

    @IsOptional()
    @IsString()
    @IsIn(['must_have', 'optional', 'exclude'])
    keyword_type!: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    weight!: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(BasicStatusTypes)
    status!: number;

    updated_by!: number;
}

export class RecruitingKeywordFilterDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id!: number;
}
