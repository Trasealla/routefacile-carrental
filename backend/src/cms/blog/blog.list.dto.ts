import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";
import { BlogTypes } from "src/entities/enums/blog.type";
import { IsExists } from "src/validators/exists.validator";
import { BlogLangDto } from "./blog.lang.dto";

// Extends BlogLangDto (blog-scoped lang, supports 'fr') instead of the
// shared PaginationDto/LangDto — see blog.language.type.ts for why.
export class BlogListDto extends BlogLangDto {

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
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @ApiProperty({
        title: 'other or about_uae',
        required: false
    })
    @IsOptional()
    @IsEnum(BlogTypes)
    type: number;
    
}