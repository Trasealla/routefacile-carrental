import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEnum, IsOptional } from "class-validator";
import { OfferLanguageTypes } from "src/entities/enums/offer.language.type";

// Standalone (does NOT extend the shared LangDto) so it carries only the
// offer-scoped language enum — see offer.language.type.ts for why.
// Arabic used to be requested as `lang=ae` — the UAE country code, inherited
// from the previous business. It is now `ar`, but a browser tab still running a
// cached copy of the old JavaScript keeps sending `ae`, and without this it
// would fail validation with a 400 and show an empty Arabic page. Normalising
// before validation keeps those sessions working; nothing new ever emits `ae`.
const normaliseLegacyArabic = ({ value }) => (value === 'ae' ? 'ar' : value);

export class OfferLangDto {
    @ApiProperty({
        title: 'Language',
        format: 'string',
        required: false,
        default: OfferLanguageTypes.ENGLISH,
        enum: OfferLanguageTypes,
    })
    @IsOptional()
    @Transform(normaliseLegacyArabic)
    @IsString()
    @IsEnum(OfferLanguageTypes)
    lang: string;
}
