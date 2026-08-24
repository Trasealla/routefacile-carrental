import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CarBrandService } from './car.brand.service';
import { CarBrandListingDto } from './dtos/car.brand.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { BRANDS_PATH, CACHE_KEY_BRAND } from 'src/config/contants';
import { CacheService } from 'src/cache/cache.service';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('car')
@UseGuards(ApiKeyAuthGuard)
@Controller('car-brand')
export class CarBrandController {

    constructor(
        @Inject(CarBrandService) private carBrandService: CarBrandService,
        @Inject(CacheService) private cacheService: CacheService
    ) { }

    @Get()
    async listing(@Query() params: CarBrandListingDto) {

        const cache_key = `${CACHE_KEY_BRAND}`;
        const cacheResponse = await this.cacheService.get(cache_key);
        if (cacheResponse) {
            return cacheResponse;
        }

        const path = `${process.env.FILE_SERVER}${BRANDS_PATH}`
        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = { status: CarBrandService.ACTIVE };
        const select = ['id', `name_${lang}`, `image`];

        const response = await this.carBrandService.getAll(where, select);
        const response_update = this.carBrandService.removePostfix(response.data, { image: path })
        this.cacheService.set(cache_key, response_update);

        return response_update
    }
}
