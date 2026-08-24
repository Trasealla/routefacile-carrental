import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { HomeBannerService } from './home.banner.service';
import { CacheService } from 'src/cache/cache.service';
import { BannerDto } from '../dtos/banner.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { HomeRateDto } from './dtos/home.rate.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { BANNERS_PATH, CACHE_KEY_BANNER, CACHE_KEY_HOME_RATES } from 'src/config/contants';
import { formatDate } from 'src/admin/utils/date.util';
import { MoreThan } from 'typeorm';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { homeRateQueryV2 } from './home.rates.query.v2';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@Controller('home')
export class HomeController {

    constructor(
        @Inject(HomeBannerService) private homeBannerService: HomeBannerService,
        @Inject(CacheService) private cacheService: CacheService,
        @Inject(SurgeService) private surgeService: SurgeService
    ) { }

    @Get('banner/:type')
    async get(@Param() params: BannerDto) {
        const cache_key = `${CACHE_KEY_BANNER}${params.type}`;

        const path = process.env.FILE_SERVER + BANNERS_PATH;

        const cacheResponse = await this.cacheService.get(cache_key);
        if (cacheResponse) {
            return cacheResponse;
        }
        const banners = await this.homeBannerService.getAll({ status: HomeBannerService.ACTIVE }, ['id', 'desktop', 'mobile', 'link', 'order'], {}, null, true, 1, 20, { column: 'entity.order', order: 'ASC' })
        const response_update = this.homeBannerService.removePostfix(banners.data, { mobile: path, desktop: path })
        this.cacheService.set(cache_key, response_update);

        return response_update;
    }

    @Get('rates')
    async rates(@Query() params: HomeRateDto) {

        const city_id = params.city_id || 1; // default dubai rates
        const lang = params.lang || LanguageTypes.ENGLISH;

         const cache_key = `${CACHE_KEY_HOME_RATES}${city_id}_${lang}`;

        // const cacheResponse = await this.cacheService.get(cache_key);
        // if (cacheResponse) {
        //     return cacheResponse;
        // }
        const current_date = new Date();
        const from_date = formatDate(new Date());
        const weekly_date = new Date(current_date);
        weekly_date.setDate(current_date.getDate() + 6);
        const to_date_for_daily = from_date
        const to_date_for_weekly = formatDate(weekly_date)
        const year = current_date.getFullYear();

        const surge_where = {
            end_date: MoreThan(from_date), // more than or equal
            status: SurgeService.ACTIVE
        }
        const surge = await this.surgeService.getOne(surge_where);

        const count_query = homeRateQueryV2(
            city_id,
            from_date,
            to_date_for_daily,
            to_date_for_weekly,
            year,
            surge,
            params.category_id,
            1,
            1000// unlimited cars
        );

        const query = homeRateQueryV2(
            city_id,
            from_date,
            to_date_for_daily,
            to_date_for_weekly,
            year,
            surge,
            params.category_id,
            params.page || 1,
            params.page_size || 10,
            params.lang || LanguageTypes.ENGLISH
        );

        const response = await this.homeBannerService.executeRawQuery(query);
        const count_response = await this.homeBannerService.executeRawQuery(count_query);

        await this.cacheService.set(cache_key, response);

        return {
            date: response,
            total_records: count_response.length
        };
    }
}
