import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';
import { CacheService } from 'src/cache/cache.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { LangDto } from 'src/dtos/lang.dto';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CityHourDetailDto } from './city.hours.detail.dto';
import { CityOpeningHourService } from './city.opening_hour.service';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('city')
export class CityController {

    private CACHE_KEY_PREFIX = 'cities';

    constructor(
        @Inject(CityService) private cityService: CityService,
        @Inject(CityOpeningHourService) private cityOpeningHourService: CityOpeningHourService,
        @Inject(CacheService) private cacheService: CacheService
    ) { }

    @Get()
    async listing(@Query() query: LangDto) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const cache_key = `${this.CACHE_KEY_PREFIX}_${lang}`
        const cacheResponse = await this.cacheService.get(cache_key);

        if (cacheResponse) {
            return cacheResponse;
        }
        const select = ['id', `name_${lang}`, `buffer_hours`];

        const response = await this.cityService.getAll({ status: 1 }, select);
        const response_update = this.cityService.removePostfix(response.data);
        this.cacheService.set(cache_key, response_update);

        return response_update;
    }

    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'city id',
    })
    @ApiParam({
        name: 'day',
        type: 'number',
        description: 'Day from 1 to 7',
    })
    @Get('hours/:id/:day')
    async hoursDetails(@Param() params: CityHourDetailDto) {
        const where = { city_id: params.id, day: params.day };

        const select = ['day', 'from_hours', 'to_hours', 'shift'];
        const response = await this.cityOpeningHourService.getAll(where, select);
        if (!response) {
            throw new NotFoundException()
        }

        return response.data;
    }
}
