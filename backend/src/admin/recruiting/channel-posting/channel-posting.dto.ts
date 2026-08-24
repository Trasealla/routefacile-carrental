import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';

export class RecruitingChannelPostingDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    career_job_id!: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['routefacile', 'indeed', 'linkedin', 'naukrigulf', 'facebook', 'instagram', 'tiktok'])
    channel_name!: string;

    @IsOptional()
    @IsString()
    external_post_id!: string;

    @IsOptional()
    @IsString()
    @IsIn(['queued', 'posted', 'failed', 'retrying'])
    posting_status!: string;

    @IsOptional()
    @IsString()
    status_message!: string;

    @IsOptional()
    last_synced_at!: Date;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status!: number;

    created_by!: number;
    updated_by!: number;
}

export class RecruitingChannelPostingUpdateDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id!: number;

    @IsOptional()
    @IsString()
    @IsIn(['routefacile', 'indeed', 'linkedin', 'naukrigulf', 'facebook', 'instagram', 'tiktok'])
    channel_name!: string;

    @IsOptional()
    @IsString()
    external_post_id!: string;

    @IsOptional()
    @IsString()
    @IsIn(['queued', 'posted', 'failed', 'retrying'])
    posting_status!: string;

    @IsOptional()
    @IsString()
    status_message!: string;

    @IsOptional()
    last_synced_at!: Date;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(BasicStatusTypes)
    status!: number;

    updated_by!: number;
}

export class RecruitingChannelPostingFilterDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id!: number;

    @IsOptional()
    @IsString()
    channel_name!: string;
}
