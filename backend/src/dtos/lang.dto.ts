import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEnum, IsOptional } from "class-validator";
import { LanguageTypes } from "src/entities/enums/language.type";

// Arabic used to be requested as `lang=ae` — the UAE country code, inherited
// from the previous business. It is now `ar`, but a browser tab still running a
// cached copy of the old JavaScript keeps sending `ae`, and without this it
// would fail validation with a 400 and show an empty Arabic page. Normalising
// before validation keeps those sessions working; nothing new ever emits `ae`.
const normaliseLegacyArabic = ({ value }) => (value === 'ae' ? 'ar' : value);

export class LangDto {

    @ApiProperty({
        title: 'Language',
        format: 'string',
        required: false,
        default: LanguageTypes.ENGLISH
    })
    @IsOptional()
    @Transform(normaliseLegacyArabic)
    @IsString()
    @IsEnum(LanguageTypes)
    lang: string;
}