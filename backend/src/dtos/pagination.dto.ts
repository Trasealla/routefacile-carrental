import { IsNumber, IsOptional, IsString } from "class-validator";
import { LangDto } from "./lang.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PaginationDto extends LangDto {

    @ApiProperty({
        minimum: 1,
        maximum: 10000,
        title: 'Page',
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        format: 'int32',
        default: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @ApiProperty({
        minimum: 1,
        maximum: 500,
        title: 'Page size',
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        format: 'int32',
        default: 10,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page_size: number = 10;
}