import { Type } from 'class-transformer';
import {
    IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString,
    Matches, Max, MaxLength, Min,
} from 'class-validator';

const PHONE_REGEX = /^[0-9+\-() ]{4,20}$/;

/**
 * Public application submission DTO.
 *
 * Accepts either `country_code` (spec) or `phone_code` (legacy entity column).
 * The controller maps them into the entity column `phone_code`.
 */
export class PublicCareerApplicationDto {
    @IsInt() @Type(() => Number) @Min(1)
    career_job_id: number;

    @IsString() @IsNotEmpty() @MaxLength(50)
    first_name: string;

    @IsString() @IsNotEmpty() @MaxLength(50)
    last_name: string;

    @IsEmail() @MaxLength(62)
    email: string;

    /** Spec name. Falls back to `phone_code` if the client posts the legacy field. */
    @IsOptional() @IsString() @MaxLength(5)
    country_code?: string;

    @IsOptional() @IsString() @MaxLength(5)
    phone_code?: string;

    @IsString() @Matches(PHONE_REGEX, { message: 'phone_number must be 4-20 digits/+/-/space/parens' }) @MaxLength(15)
    phone_number: string;

    @IsOptional() @IsString() @MaxLength(120)
    current_location?: string;

    @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999)
    expected_salary?: number;

    @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(365)
    notice_period_days?: number;

    @IsOptional()
    @IsIn(['routefacile', 'indeed', 'linkedin', 'naukrigulf', 'facebook', 'instagram', 'tiktok', 'glassdoor', 'direct', 'referral'])
    source_channel?: string;

    /** JSON-encoded `[{ question_id: number, answer: string|string[] }]`. */
    @IsOptional() @IsString()
    answers?: string;
}
