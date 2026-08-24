import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { InterviewStatusTypes } from "src/entities/enums/interview.status.type";

export class RecruitingInterviewDto {

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    application_id: number;

    @IsNotEmpty()
    @IsDateString()
    interview_date: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    interview_type: string; // in-person, phone, video

    @IsOptional()
    @IsString()
    notes: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    interviewer_id: number;

    created_by: number;
}

export class RecruitingInterviewUpdateDto {

    @IsOptional()
    @IsDateString()
    interview_date: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    interview_type: string;

    @IsOptional()
    @IsString()
    notes: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(InterviewStatusTypes)
    status: number;

    @IsOptional()
    @IsString()
    feedback: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    interviewer_id: number;
}

export class RecruitingInterviewFilterDto {

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    application_id: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    interviewer_id: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(InterviewStatusTypes)
    status: number;
}
