import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { CarGroup } from "src/entities/car.group.entity";
import { City } from "src/entities/city.entity";
import { Location } from "src/entities/location.entity";
import { IsExists } from "src/validators/exists.validator";

export class RateRangeListingDto extends PaginationDto {

    @ApiProperty({
        minimum: 1,
        title: 'Group id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarGroup, 'id'])
    group_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'City id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'Location id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [Location, 'id'])
    location_id: number;

    @ApiProperty({
        title: 'Start date',
        format: 'string',
        required: false
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    start_date: string;

    @ApiProperty({
        title: 'End date',
        format: 'string',
        required: false
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    end_date: string;

}
