import { Type } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Validate } from "class-validator";
import { CareerJob } from "src/entities/career.job.entity";
import { IsExists } from "src/validators/exists.validator";

export class CareerJobApplicationDto  {

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    phone_code: string;

    @IsNotEmpty()
    phone_number: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [CareerJob, 'id'])
    career_job_id: number

    @IsOptional()
    @IsString()
    @IsIn(['routefacile', 'indeed', 'linkedin', 'naukrigulf', 'facebook', 'instagram', 'tiktok'])
    source_channel: string

    cv: string
}