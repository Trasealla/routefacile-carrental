import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBrokerDto {
    @IsString() @IsNotEmpty() @MaxLength(255) name: string;
    @IsString() @IsNotEmpty() @MaxLength(100) username: string;
    @IsString() @IsNotEmpty() @MinLength(6) password: string;
    @IsOptional() @IsEmail() @MaxLength(255) contact_email?: string;

    created_by: number;
}

export class UpdateBrokerDto {
    @IsOptional() @IsString() @MaxLength(255) name?: string;
    @IsOptional() @IsEmail() @MaxLength(255) contact_email?: string;
    @IsOptional() @IsString() @MinLength(6) password?: string;
    @IsOptional() @Type(() => Number) @IsInt() @IsIn([0, 1]) status?: number;

    updated_by: number;
}

export class BrokerFilterDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @Type(() => Number) @IsInt() status?: number;
    @IsOptional() @Type(() => Number) @IsInt() page?: number;
    @IsOptional() @Type(() => Number) @IsInt() page_size?: number;
}
