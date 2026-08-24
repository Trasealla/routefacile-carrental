import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { FaqCategoryService } from './faq.category.service';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { FaqDto } from '../dtos/faq.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@UseGuards(ApiKeyAuthGuard)
@ApiTags('cms')
@Controller('faq')
export class FaqController {

    constructor(
        @Inject(FaqService) private faqService: FaqService,
        @Inject(FaqCategoryService) private faqCategoryService: FaqCategoryService
    ) { }

    @Get()
    async listing(@Query() params: FaqDto) {
        const where = params.faq_category_id ? { category_id: params.faq_category_id } : {};
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `question_${lang}`, `answer_${lang}`, 'category_id']
        const relation = {
            category: {
                columns: [`name_${lang}`]
            }
        }
        const response = await this.faqService.getAll(where, select, relation, FaqService.INNER_JOIN, true, params.page, params.page_size);
        return this.faqService.removePostfix(response);
    }

    @Get('/category')
    async categoryListing(@Query() params: PaginationDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response =  await this.faqCategoryService.getAll({}, select);

        return this.faqCategoryService.removePostfix(response);
    }
}
