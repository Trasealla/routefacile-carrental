import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { LangDto } from 'src/dtos/lang.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { TeachersPageService } from './teachers.page.service';
import { RateTeacherService } from 'src/admin/rate/rate.teacher/rate.teacher.service';
import { CARS_PATH, TEACHERS_PAGE_PATH } from 'src/config/contants';

/**
 * Public CMS endpoint that powers the Teachers Rental page.
 *
 *   GET /teachers-page?lang=en|ae
 *
 * Returns a single consolidated payload:
 *   {
 *     seo: {...},
 *     hero: {..., background_image_url},
 *     hero_price_card: {...},
 *     stats: [...],
 *     benefits: {...},
 *     eligibility: {..., promotion_end_date},
 *     referral: {...},
 *     fleet_section: {...},
 *     closing_quote: "...",
 *     enquiry_form: {...},
 *     cars: [ ...extended fleet shape... ]
 *   }
 *
 * The frontend should stop wrapping these strings in t() — they are already
 * localized server-side based on the ?lang query.
 */
@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('teachers-page')
export class TeachersPagePublicController {
  constructor(
    @Inject(TeachersPageService)
    private teachersPageService: TeachersPageService,
    @Inject(RateTeacherService)
    private rateTeacherService: RateTeacherService,
  ) {}

  @ApiOperation({
    summary: 'Get full Teachers Rental page payload (SEO + sections + cars).',
  })
  @Get()
  async detail(@Query() params: LangDto) {
    const lang = params.lang || LanguageTypes.ENGLISH;

    // ----- 1. Page CMS row (singleton) ---------------------------------------
    const page = await this.teachersPageService.getOne(
      { status: 1 },
      [
        'id',
        // SEO
        `seo_title_${lang}`,
        `seo_description_${lang}`,
        `seo_meta_tags_${lang}`,
        `seo_meta_description_${lang}`,
        'og_image',
        'canonical_url',
        // Sections
        `hero_${lang}`,
        'hero_background_image',
        `hero_price_card_${lang}`,
        `stats_${lang}`,
        `benefits_${lang}`,
        `eligibility_${lang}`,
        'promotion_end_date',
        `referral_${lang}`,
        `fleet_section_${lang}`,
        `closing_quote_${lang}`,
        `enquiry_form_${lang}`,
      ],
    );

    const fileServer = process.env.FILE_SERVER || '';

    // Strip _en/_ar suffixes and prefix image paths.
    const pagePayload = page
      ? this.teachersPageService.removePostfix(page, {
          hero_background_image: fileServer + TEACHERS_PAGE_PATH,
          og_image: fileServer + TEACHERS_PAGE_PATH,
        })
      : null;

    // ----- 2. Cars / fleet ---------------------------------------------------
    const carsResp = await this.rateTeacherService.getAll(
      {},
      [],
      {
        car: { columns: [`name_${lang}`, 'image'] },
      },
      RateTeacherService.LEFT_JOIN,
      true,
      1,
      100,
      { column: 'entity.display_order', order: 'ASC' },
    );

    const cars = this.rateTeacherService.removePostfix(carsResp.data, {
      image: fileServer + CARS_PATH,
    });

    return {
      seo: pagePayload
        ? {
            seo_title: pagePayload.seo_title,
            seo_description: pagePayload.seo_description,
            seo_meta_tags: pagePayload.seo_meta_tags,
            seo_meta_description: pagePayload.seo_meta_description,
            og_image: pagePayload.og_image,
            canonical_url: pagePayload.canonical_url,
          }
        : null,
      hero: pagePayload?.hero
        ? {
            ...pagePayload.hero,
            background_image_url: pagePayload.hero_background_image || null,
          }
        : null,
      hero_price_card: pagePayload?.hero_price_card || null,
      stats: pagePayload?.stats || [],
      benefits: pagePayload?.benefits || null,
      eligibility: pagePayload?.eligibility
        ? {
            ...pagePayload.eligibility,
            promotion_end_date: pagePayload.promotion_end_date || null,
          }
        : null,
      referral: pagePayload?.referral || null,
      fleet_section: pagePayload?.fleet_section || null,
      closing_quote: pagePayload?.closing_quote || null,
      enquiry_form: pagePayload?.enquiry_form || null,
      cars,
    };
  }
}
