import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { KycSubmissionStatus } from 'src/entities/enums/kyc.submission.status';

export class AdminKycListQueryDto {
    @ApiPropertyOptional({ enum: KycSubmissionStatus })
    @IsOptional()
    @IsEnum(KycSubmissionStatus)
    status?: KycSubmissionStatus;

    @ApiPropertyOptional({ description: 'Search by email, mobile, reference token or company name' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filter from this date (YYYY-MM-DD or ISO)' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'Filter up to this date (YYYY-MM-DD or ISO)' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}

/**
 * Same filters as the list endpoint, minus pagination – the export streams
 * everything matching the filters.
 */
export class AdminKycExportQueryDto {
    @ApiPropertyOptional({ enum: KycSubmissionStatus })
    @IsOptional()
    @IsEnum(KycSubmissionStatus)
    status?: KycSubmissionStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;
}

const REVIEW_STATUSES = [
    KycSubmissionStatus.UNDER_REVIEW,
    KycSubmissionStatus.APPROVED,
    KycSubmissionStatus.REJECTED,
] as const;

export class UpdateKycStatusDto {
    @ApiProperty({
        enum: REVIEW_STATUSES,
        description: 'New review status. Must be under_review, approved or rejected.',
    })
    @IsNotEmpty()
    @IsEnum(KycSubmissionStatus)
    status: KycSubmissionStatus;

    @ApiPropertyOptional({ description: 'Internal notes from the reviewer.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;

    @ApiPropertyOptional({ description: 'Required when status = rejected.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    rejection_reason?: string;
}

