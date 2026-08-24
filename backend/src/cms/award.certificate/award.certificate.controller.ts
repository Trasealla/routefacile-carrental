import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { AwardCertificateDto } from '../dtos/award.certificate.dto';
import { AwardCertificateService } from './award.certificate.service';
import { AWARDS_CERTIFICATES_PATH } from 'src/config/contants';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { LangDto } from 'src/dtos/lang.dto';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('award/certificate')
export class AwardCertificateController {

    constructor(
        private awardCertificateService: AwardCertificateService
    ) { }


    @Get()
    async listing(@Query() query: AwardCertificateDto) {

        const lang = query.lang || LanguageTypes.ENGLISH;
        const path = process.env.FILE_SERVER + AWARDS_CERTIFICATES_PATH;

        const where = { type: query.type };
        const select = [`id`, `type`, `title_${lang}`, `description_${lang}`, `link`, `desktop`, `mobile`, `alt_text`];
        const response = await this.awardCertificateService.getAll(where, select);
        const response_update = this.awardCertificateService.removePostfix(response.data, { desktop: path, mobile: path })

        return { ...response, data: response_update };
    }

    @Get(':id')
    async detail(@Param() params: AwardCertificateDto, @Query() query: LangDto) {

        const lang = query.lang || LanguageTypes.ENGLISH;
        const path = process.env.FILE_SERVER + AWARDS_CERTIFICATES_PATH;

        const where = { type: params.type };
        const select = [`id`, `type`, `title_${lang}`, `description_${lang}`, `link`, `desktop`, `mobile`, `alt_text`];
        const response = await this.awardCertificateService.getOne(where, select);
        const response_update = this.awardCertificateService.removePostfix(response, { desktop: path, mobile: path })

        return response_update;
    }
}
