import { Type } from 'class-transformer';
import {
  IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl,
  ValidateNested, MaxLength,
} from 'class-validator';

/**
 * Shape of the SearchAtlas content-engine payload.
 *
 * Only the fields the platform actually stores are declared. Anything else in
 * the payload is ignored rather than rejected, so the sender can add fields
 * without breaking delivery — `forbidNonWhitelisted` is deliberately NOT used
 * here, unlike the customer-facing DTOs.
 *
 * Lengths mirror the database columns. Without them a 600-character meta
 * description would reach MySQL and be truncated silently, or throw, depending
 * on strict mode — better to reject it at the edge with a clear message.
 */

class OpenGraphDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image_url?: string;
  @IsOptional() @IsString() type?: string;
}

class SeoDto {
  @IsOptional() @IsString() @MaxLength(255) meta_title?: string;
  @IsOptional() @IsString() @MaxLength(255) meta_description?: string;
  @IsOptional() @IsString() @MaxLength(500) canonical_url?: string;
  @IsOptional() @IsString() @MaxLength(255) primary_keyword?: string;
  @IsOptional() @IsArray() secondary_keywords?: string[];
  @IsOptional() @ValidateNested() @Type(() => OpenGraphDto) open_graph?: OpenGraphDto;
}

class ContentDto {
  /* The rendered article. Required: an article with no body is not publishable.
     Sanitised on the way in — see ArticleWebhookController. */
  @IsString() @IsNotEmpty() html: string;

  @IsOptional() @IsString() markdown?: string;
  @IsOptional() @IsString() @MaxLength(500) excerpt?: string;
}

class FeaturedImageDto {
  @IsOptional() @IsString() @MaxLength(500) url?: string;
  @IsOptional() @IsString() @MaxLength(500) alt_text?: string;
  @IsOptional() @IsString() @MaxLength(500) caption?: string;
}

class MediaDto {
  @IsOptional() @ValidateNested() @Type(() => FeaturedImageDto) featured_image?: FeaturedImageDto;
}

class TaxonomyDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() tags?: string[];
}

class SchemaDto {
  @IsOptional() @IsObject() article_json_ld?: Record<string, any>;
  @IsOptional() @IsObject() faq_json_ld?: Record<string, any>;
}

class ArticleDto {
  /* The engine's own identifier. Upsert key: a re-delivered webhook must update
     the existing row, not create a second copy. */
  @IsString() @IsNotEmpty() @MaxLength(100) id: string;

  @IsString() @IsNotEmpty() @MaxLength(255) title: string;

  /* Owns the public URL, so it is required and must be unique. */
  @IsString() @IsNotEmpty() @MaxLength(255) slug: string;

  /* en | fr | ar only. The blogs table now has a column set for each. Anything
     else is rejected with a clear error rather than silently stored as English —
     a French article filed as English is worse than a failed delivery. */
  @IsString() @IsIn(['en', 'fr', 'ar']) language: string;

  @IsOptional() @IsInt() @Type(() => Number) word_count?: number;

  @ValidateNested() @Type(() => SeoDto) @IsNotEmpty() seo: SeoDto;
  @IsOptional() @ValidateNested() @Type(() => SchemaDto) schema?: SchemaDto;
  @ValidateNested() @Type(() => ContentDto) @IsNotEmpty() content: ContentDto;
  @IsOptional() @ValidateNested() @Type(() => MediaDto) media?: MediaDto;
  @IsOptional() @ValidateNested() @Type(() => TaxonomyDto) taxonomy?: TaxonomyDto;
}

export class ArticleWebhookDto {
  /* Only article.published is handled today. Other events are accepted and
     acknowledged without action, so the sender does not retry them forever. */
  @IsOptional() @IsString() event?: string;

  @IsOptional() @IsString() project_domain?: string;
  @IsOptional() @IsString() timestamp?: string;

  @ValidateNested() @Type(() => ArticleDto) @IsNotEmpty() article: ArticleDto;
}
