import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { CACHE_KEY_HOME_RATES, LANGS } from 'src/config/contants';
import { CityService } from 'src/city/city.service';

@Injectable()
export class CacheBustingService {

    constructor(
        @Inject(CityService) private cityService: CityService,
        @Inject(CacheService) private cacheService: CacheService
    ) { }

    async bustHomeRates() {
        const cities = await this.cityService.getAll({}, ['id']);

        for (const city of cities.data) {
            for (const lang of LANGS) {
                this.cacheService.delete(`${CACHE_KEY_HOME_RATES}${city.id}_${lang}`)
            }
        }
    }
}
