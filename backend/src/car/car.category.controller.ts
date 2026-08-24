import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { CarCategoryService } from './car.category.service';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CarCategoryListingDto } from './dtos/car.category.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CATEGORY_PATH } from 'src/config/contants';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('car')
@UseGuards(ApiKeyAuthGuard)
@Controller('car-category')
export class CarCategoryController {

    constructor(
        @Inject(CarCategoryService) private carCategoryService: CarCategoryService
    ) { }

    @Get()
    async listing(@Query() params: CarCategoryListingDto) {
        const path = process.env.FILE_SERVER + CATEGORY_PATH;
        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = { status: CarCategoryService.ACTIVE };
        const select = ['id', 'name_en', `name_${lang}`, 'image'];
        
        const page = params.page || 1;
        const page_size = params.page_size || 10;

        const response = await this.carCategoryService.getAll(where, select, {}, null, true, page, page_size, { column: 'entity.sort_order', order: 'ASC' });
        response.data = this.carCategoryService.removePostfix(response.data, { image: path });

        return response;
    }
}
