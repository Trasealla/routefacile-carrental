import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class RecruitingApplicationRatingDto {

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    application_id: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comments: string;

    rated_by: number;
}

export class RecruitingApplicationRatingUpdateDto {

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comments: string;
}
