import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { Transform } from "class-transformer";

export class LocationListingDto extends PaginationDto {

    @ApiProperty({
        title: 'Filter by virtual location',
        format: 'boolean',
        required: false,
        description: 'Filter locations by is_virtual field. Accepts true or false'
    })
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (value === 'true' || value === true || value === 1 || value === '1') return true;
        if (value === 'false' || value === false || value === 0 || value === '0') return false;
        return undefined;
    })
    @IsOptional()
    @IsBoolean()
    is_virtual?: boolean;
}

