import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminTypes } from 'src/entities/enums/admin.type';

/** HR staff that an HR Manager is allowed to create/manage. */
export const HR_STAFF_TYPES = [AdminTypes.HR_MANAGER, AdminTypes.HR_RECRUITMENT] as const;
export type HrStaffType = (typeof HR_STAFF_TYPES)[number];

/** DTO for creating an HR staff user (password optional — auto-generated if omitted). */
export class CreateHrStaffDto {
    @IsString() @IsNotEmpty() @MaxLength(50) first_name: string;
    @IsString() @IsNotEmpty() @MaxLength(50) last_name: string;
    @IsEmail() @IsNotEmpty() @MaxLength(62) email: string;
    @IsString() @IsNotEmpty() @MaxLength(4) country_code: string;
    @IsString() @IsNotEmpty() @MaxLength(15) phone_number: string;
    @IsOptional() @IsIn(HR_STAFF_TYPES as unknown as string[]) type?: HrStaffType;
    @IsOptional() @IsString() @MinLength(6) password?: string;
}

export class HrStaffFilterDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @IsIn(HR_STAFF_TYPES as unknown as string[]) type?: HrStaffType;
    @IsOptional() @Type(() => Number) @IsInt() status?: number;
}

export class UpdateHrStaffDto {
    @IsOptional() @IsString() @MaxLength(50) first_name?: string;
    @IsOptional() @IsString() @MaxLength(50) last_name?: string;
    @IsOptional() @IsEmail() @MaxLength(62) email?: string;
    @IsOptional() @IsString() @MaxLength(4) country_code?: string;
    @IsOptional() @IsString() @MaxLength(15) phone_number?: string;
    @IsOptional() @IsIn(HR_STAFF_TYPES as unknown as string[]) type?: HrStaffType;
}

export class HrStaffStatusDto {
    @Type(() => Number) @IsInt() @IsIn([0, 1]) status: number;
}

export class HrStaffResetPasswordDto {
    @IsOptional() @IsString() @MinLength(6) password?: string;
}
