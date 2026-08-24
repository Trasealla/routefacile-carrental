import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { PageService } from './page.service';
import { LangDto } from 'src/dtos/lang.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RateTeacherService } from 'src/admin/rate/rate.teacher/rate.teacher.service';
import { CARS_PATH } from 'src/config/contants';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('page')
export class PageController {
    constructor(
        @Inject(RateTeacherService) private RateTeacherService: RateTeacherService,
        @Inject(PageService) private pageService: PageService
    ) { }

    @ApiParam({
        name: 'type',
        type: 'string',
        description: 'privacy_policy, terms_and_conditions, corporate_leasing',
    })
    @Get(':type')
    async detail(@Param('type') type: string, @Query() param: LangDto) {
        const lang = param.lang || LanguageTypes.ENGLISH;
        const select = ['id', `title_${lang}`, `content_${lang}`, 'type', `seo_meta_tags_${lang}`, `seo_meta_description_${lang}`, 'seo_title', 'seo_description'];
        const respone = await this.pageService.getOne({ type }, select);

        if (respone) {
            return this.pageService.removePostfix(respone);
        }

        throw new NotFoundException();
    }


    @Get('teachers/rate')
    async listing(@Query() params: PaginationDto) {

        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = {};

        const relations = {
            car: {
                columns: [`name_${lang}`, 'image']
            }
        }

        const response = await this.RateTeacherService.getAll(where, [], relations, RateTeacherService.LEFT_JOIN, true, params.page, 100);
        const path = process.env.FILE_SERVER + CARS_PATH;
        return this.RateTeacherService.removePostfix(response.data, { image: path })
    }
}
