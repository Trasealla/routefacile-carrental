import { BadRequestException, Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { CityPageService } from './city.page.service';
import { CITIES_PATH, LANDMARKS_PATH, NEIGHBOURHOODS_PATH } from 'src/config/contants';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { LangDto } from 'src/dtos/lang.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { CityPageTypes } from 'src/entities/enums/city.page.type';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('city/page')
export class CityPageController {

    constructor(@Inject(CityPageService) private cityPageService: CityPageService) { }

    @Get(':type/:id')
    async get(@Param('type') type: string, @Param('id') id: number, @Query() query: LangDto) {

        const lang = query.lang || LanguageTypes.ENGLISH;
        const select_main = ['id', `title_${lang}`, `content_${lang}`, 'image', 'type', `seo_meta_tags_${lang}`, `seo_meta_description_${lang}`, 'seo_title', 'seo_description'];
        const select_child = ['id', `title_${lang}`, `content_${lang}`, 'image', 'type', 'seo_title', 'seo_description'];
        const city_path = process.env.FILE_SERVER + CITIES_PATH;
        const landmark_path = process.env.FILE_SERVER + LANDMARKS_PATH;
        const neighbourhood_path = process.env.FILE_SERVER + NEIGHBOURHOODS_PATH;
        switch (type) {
            case CityPageTypes.CITY:
                const city = await this.cityPageService.getOne({ 'city_id': id, type }, select_main);
                const landmarks = await this.cityPageService.getAll({ 'city_id': id, type: CityPageTypes.LANDMARK }, select_child);
                const neighbourhoods = await this.cityPageService.getAll({ 'city_id': id, type: CityPageTypes.NEIGHBHOURHOOD }, select_child);
                return {
                    city: this.cityPageService.removePostfix(city, { image: city_path }),
                    landmarks: this.cityPageService.removePostfix(landmarks.data, { image: landmark_path }),
                    neighbourhoods: this.cityPageService.removePostfix(neighbourhoods.data, { image: neighbourhood_path }),
                };
            case CityPageTypes.LANDMARK:
                const landmark = await this.cityPageService.getOne({ id, type }, select_main);
                return { landmark: this.cityPageService.removePostfix(landmark, { image: landmark_path }) };
            case CityPageTypes.NEIGHBHOURHOOD:
                const neighbourhood = await this.cityPageService.getOne({ id, type }, select_main);
                return { neighbourhood: this.cityPageService.removePostfix(neighbourhood, { image: neighbourhood_path }) };
            default:
                throw new BadRequestException('Wrong inputs')
        }
    }
}
