import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { OfferService } from './offer.service';
import { OFFERS_PATH } from 'src/config/contants';
import { OfferDto } from '../dtos/offer.dto';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { OfferLanguageTypes } from 'src/entities/enums/offer.language.type';
import { OfferLangDto } from './offer.lang.dto';
import { OfferListDto } from './offer.list.dto';

// `cities` only has name_en/name_ar (no French column yet) — fall back to
// English for the joined city name when the offer itself is shown in French.
const citySelectLang = (lang: string) => (lang === OfferLanguageTypes.FRENCH ? OfferLanguageTypes.ENGLISH : lang);

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('offer')
export class OfferController {

    constructor(
        @Inject(OfferService) private offerService: OfferService
    ) { }

    @Get()
    async listing(@Query() params: OfferListDto) {
        const path = `${process.env.FILE_SERVER}${OFFERS_PATH}`;
        const lang = params.lang || OfferLanguageTypes.ENGLISH;

        const select = ['id', `title_${lang}`, `description_${lang}`, 'status', 'city_id',
            'start_date', 'featured', 'end_date', 'mobile', 'desktop', 'image_alt_text', 'updated_at'];
        const relation = {
            city: {
                columns: ['id', `name_${citySelectLang(lang)}`]
            }
        }
        const where = { status: OfferService.ACTIVE };
        if (params.featured) {
            where['featured'] = params.featured;
        }

        if (params.city_id) {
            where['city_id'] = params.city_id;
        }

        const response = await this.offerService.getAll(where, select, relation, OfferService.LEFT_JOIN, true, params.page, params.page_size, { column: 'entity_updated_at', order: 'DESC' });
        const response_update = this.offerService.removePostfix(response, { mobile: path, desktop: path })

        return response_update;
    }

    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'offer id',
    })
    @Get('/:id')
    async detail(@Param() params: OfferDto, @Query() query: OfferLangDto) {
        const path = `${process.env.FILE_SERVER}${OFFERS_PATH}`;
        const lang = query.lang || OfferLanguageTypes.ENGLISH;
        const select = ['id', `title_${lang}`, `description_${lang}`, 'status', 'city_id',
            'start_date', 'end_date', 'mobile', 'desktop', 'image_alt_text', `seo_meta_tags_${lang}`, `seo_meta_description_${lang}`];
        const relation = {
            city: {
                columns: ['id', `name_${citySelectLang(lang)}`]
            }
        }
        const response = await this.offerService.getOne({ id: params.id }, select, relation);
        const response_update = this.offerService.removePostfix(response, { mobile: path, desktop: path });
        if (response) {

            return response_update;
        }
        throw new NotFoundException();
    }
}
