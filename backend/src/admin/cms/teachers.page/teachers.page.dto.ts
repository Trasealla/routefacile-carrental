import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';

/**
 * Body for PUT /admin/teachers-page (singleton upsert).
 *
 * All fields optional so the admin UI can submit partial updates section by
 * section. The image fields (hero_background_image, og_image) are populated
 * by the file interceptor when a multipart upload is sent.
 */
export class TeachersPageDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsEnum(BasicStatusTypes)
  status: number;

  // ---------- SEO ----------
  @IsOptional() @IsString() seo_title_en: string;
  @IsOptional() @IsString() seo_title_ar: string;
  @IsOptional() @IsString() seo_description_en: string;
  @IsOptional() @IsString() seo_description_ar: string;
  @IsOptional() @IsString() seo_meta_tags_en: string;
  @IsOptional() @IsString() seo_meta_tags_ar: string;
  @IsOptional() @IsString() seo_meta_description_en: string;
  @IsOptional() @IsString() seo_meta_description_ar: string;
  @IsOptional() @IsString() canonical_url: string;

  // Image filenames - populated by FileInterceptor in the controller.
  @IsOptional() @IsString() og_image: string;
  @IsOptional() @IsString() hero_background_image: string;

  // ---------- Sectional JSON blobs ----------
  @IsOptional() @IsObject() hero_en: Record<string, any>;
  @IsOptional() @IsObject() hero_ar: Record<string, any>;

  @IsOptional() @IsObject() hero_price_card_en: Record<string, any>;
  @IsOptional() @IsObject() hero_price_card_ar: Record<string, any>;

  @IsOptional() @IsArray() stats_en: any[];
  @IsOptional() @IsArray() stats_ar: any[];

  @IsOptional() @IsObject() benefits_en: Record<string, any>;
  @IsOptional() @IsObject() benefits_ar: Record<string, any>;

  @IsOptional() @IsObject() eligibility_en: Record<string, any>;
  @IsOptional() @IsObject() eligibility_ar: Record<string, any>;

  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'promotion_end_date must be in the format YYYY-MM-DD' },
  )
  promotion_end_date: string;

  @IsOptional() @IsObject() referral_en: Record<string, any>;
  @IsOptional() @IsObject() referral_ar: Record<string, any>;

  @IsOptional() @IsObject() fleet_section_en: Record<string, any>;
  @IsOptional() @IsObject() fleet_section_ar: Record<string, any>;

  @IsOptional() @IsString() closing_quote_en: string;
  @IsOptional() @IsString() closing_quote_ar: string;

  @IsOptional() @IsObject() enquiry_form_en: Record<string, any>;
  @IsOptional() @IsObject() enquiry_form_ar: Record<string, any>;

  // Audit (set in controller).
  created_by: number;
  updated_by: number;
}
