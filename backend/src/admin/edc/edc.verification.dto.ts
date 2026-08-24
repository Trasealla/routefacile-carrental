import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Min } from "class-validator";
import { EdcMemberType, EdcVerificationStatus } from "src/entities/edc.verification.entity";

export class VerificationListQueryDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Page number', default: 1 })
    page?: number = 1;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Items per page', default: 20 })
    limit?: number = 20;

    @IsEnum(EdcVerificationStatus)
    @IsOptional()
    @ApiProperty({ enum: EdcVerificationStatus, required: false })
    status?: EdcVerificationStatus;

    @IsEnum(EdcMemberType)
    @IsOptional()
    @ApiProperty({ enum: EdcMemberType, required: false })
    member_type?: EdcMemberType;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Search by name, email, or student ID', required: false })
    search?: string;
}

export class RevokeVerificationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Reason for revocation', example: 'Fraudulent ID submitted' })
    reason: string;
}







