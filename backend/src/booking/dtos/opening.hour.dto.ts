import { ApiParam, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, Max } from "class-validator";
import { BaseLocationTypes } from "src/entities/enums/base.location.type";


export class OpeningHourDto {

    @ApiProperty({
        description: 'location or city',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(BaseLocationTypes)
    type: string
    
    @ApiProperty({
        description: 'Day from 1 to 7',
        type: String,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(7)
    @Type(() => Number)
    day: number

    @ApiProperty({
        description: 'id of location or city',
        type: String,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    entity_id: number

    @ApiProperty({
        description: 'Shift 1 or 2 for location, 1 for cities',
        type: String,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(2)
    @Type(() => Number)
    shift: number
}