import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";
import { IsExists } from "src/validators/exists.validator";
import { OfferLangDto } from "./offer.lang.dto";

// Extends OfferLangDto (offer-scoped lang, supports 'fr') instead of the
// shared PaginationDto/LangDto — see offer.language.type.ts for why.
export class OfferListDto extends OfferLangDto {

    @ApiProperty({
        minimum: 1,
        maximum: 10000,
        title: 'Page',
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
        format: 'int32',
        default: 10,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page_size: number = 10;

    @ApiProperty({
        minimum: 0,
        maximum: 1,
        title: 'Featured Flag',
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        format: 'int32',
        default: 0,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(BasicStatusTypes)
    featured: number;

    @ApiProperty({
        minimum: 1,
        title: 'Emirete id',
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        format: 'int32',
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    city_id: number;
}
