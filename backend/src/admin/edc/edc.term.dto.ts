import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested, Min } from "class-validator";

export class CreateEdcTermDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Term text in English', example: 'Valid EDC Student ID required' })
    text_en: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Term text in Arabic', required: false })
    text_ar?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: 'Whether term is active', default: true })
    is_active?: boolean;

    created_by?: number;
}

export class UpdateEdcTermDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Term text in English' })
    text_en?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Term text in Arabic' })
    text_ar?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: 'Whether term is active' })
    is_active?: boolean;

    updated_by?: number;
}

export class ReorderTermDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ description: 'Term ID' })
    id: number;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ description: 'New sort order' })
    sort_order: number;
}

export class ReorderTermsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderTermDto)
    @ApiProperty({ type: [ReorderTermDto], description: 'Array of term IDs with new sort orders' })
    order: ReorderTermDto[];
}







