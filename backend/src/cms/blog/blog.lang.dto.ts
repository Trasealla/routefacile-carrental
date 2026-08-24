import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEnum, IsOptional } from "class-validator";
import { BlogLanguageTypes } from "src/entities/enums/blog.language.type";

// Standalone (does NOT extend the shared LangDto) so it carries only the
// blog-scoped language enum — see blog.language.type.ts for why.
const normaliseLegacyArabic = ({ value }) => (value === 'ae' ? 'ar' : value);

export class BlogLangDto {
    @ApiProperty({
        title: 'Language',
        format: 'string',
        required: false,
        default: BlogLanguageTypes.ENGLISH,
        enum: BlogLanguageTypes,
    })
    @IsOptional()
    @Transform(normaliseLegacyArabic)
    @IsString()
    @IsEnum(BlogLanguageTypes)
    lang: string;
}
