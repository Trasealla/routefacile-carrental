import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CountryService } from './country.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('country')
export class CountryController {

    constructor(@Inject(CountryService) private countryService: CountryService) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', 'code', `name_${lang}`, 'phone_code'];
        const where = { status: CountryService.ACTIVE }
        const response = await this.countryService.getAll(where, select, {}, null, true, params.page, params.page_size);
        const response_update = this.countryService.removePostfix(response.data);
        
        return { ...response, data: response_update }

    }
}
