import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator';

const PHONE_CODE_REGEX = /^\+?\d{1,5}$/;
const PHONE_NUMBER_REGEX = /^\d{4,15}$/;

export class StartKycDto {
    @ApiProperty({ example: '+971' })
    @IsString()
    @IsNotEmpty()
    @Matches(PHONE_CODE_REGEX, { message: 'contact_mobile_code must be a country dial code (e.g. +971).' })
    contact_mobile_code: string;

    @ApiProperty({ example: '501234567' })
    @IsString()
    @IsNotEmpty()
    @Matches(PHONE_NUMBER_REGEX, { message: 'contact_mobile_number must be 4-15 digits.' })
    contact_mobile_number: string;

    @ApiProperty({ example: 'customer@example.com' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(191)
    email: string;
}

export class StartKycResponseDto {
    @ApiProperty({ example: 'success' })
    status: string;

    @ApiProperty({ example: 'KYC-9F2A11C7B0' })
    reference_token: string;

    @ApiProperty({ example: 'OTPs sent to phone and email.' })
    message: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: 'KYC-9F2A11C7B0' })
    @IsString()
    @IsNotEmpty()
    reference_token: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    @Length(4, 8)
    otp: string;
}

export class ResendOtpDto {
    @ApiProperty({ example: 'KYC-9F2A11C7B0' })
    @IsString()
    @IsNotEmpty()
    reference_token: string;
}

export class SubmitKycDto {
    @ApiProperty({ example: 'KYC-9F2A11C7B0' })
    @IsString()
    @IsNotEmpty()
    reference_token: string;

    @ApiProperty({ required: false, example: 'Flat 101, Building 12, Al Barsha, Dubai' })
    @IsOptional()
    @IsString()
    residential_address?: string;

    @ApiProperty({ required: false, example: '+97142345678' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_CODE_REGEX, { message: 'contact_landline_code must be a country dial code.' })
    contact_landline_code?: string;

    @ApiProperty({ required: false, example: '42345678' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_NUMBER_REGEX, { message: 'contact_landline_number must be 4-15 digits.' })
    contact_landline_number?: string;

    @ApiProperty({ required: false, example: 'Acme LLC' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    company_name?: string;

    @ApiProperty({ required: false, example: 'Office 502, Sheikh Zayed Road, Dubai' })
    @IsOptional()
    @IsString()
    company_address?: string;

    @ApiProperty({ required: false, example: '+971' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_CODE_REGEX, { message: 'company_phone_code must be a country dial code.' })
    company_phone_code?: string;

    @ApiProperty({ required: false, example: '42345678' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_NUMBER_REGEX, { message: 'company_phone_number must be 4-15 digits.' })
    company_phone_number?: string;

    /** Multipart sends 'true' as a string – accept boolean-like values. */
    @ApiProperty({ example: true, description: 'Customer agrees to the AECB credit-check consent statement.' })
    @IsNotEmpty()
    consent_given: boolean | string;

    /** Data URL (data:image/png;base64,...) produced by signature_pad or the typed-name renderer. */
    @ApiProperty({
        required: false,
        description: 'Base64 PNG of the customer signature (data URL).',
    })
    @IsOptional()
    @IsString()
    signature_image?: string;

    @ApiProperty({
        required: false,
        enum: ['drawn', 'typed'],
        description: "How the signature was produced: 'drawn' (pad) or 'typed' (script-rendered name).",
    })
    @IsOptional()
    @IsString()
    signature_method?: string;

    @ApiProperty({ required: false, description: 'Typed name when signature_method = typed.' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    signature_typed_text?: string;
}
