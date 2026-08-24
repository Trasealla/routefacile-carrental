import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { RateTeacherService } from 'src/admin/rate/rate.teacher/rate.teacher.service';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CARS_PATH } from 'src/config/contants';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('edc')
@UseGuards(ApiKeyAuthGuard)
@Controller('edc')
export class EdcRatesController {
    constructor(
        @Inject(RateTeacherService) private rateTeacherService: RateTeacherService
    ) { }

    @ApiOperation({ 
        summary: 'Get EDC exclusive car rental rates',
        description: 'Returns special car rental rates for EDC members. Currently uses the same rates as Teachers program.'
    })
    @ApiQuery({ name: 'lang', required: false, enum: LanguageTypes })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'page_size', required: false, type: Number })
    @Get('rates')
    async getRates(@Query() params: PaginationDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = {};

        const relations = {
            car: {
                columns: [`name_${lang}`, 'image']
            }
        }

        const response = await this.rateTeacherService.getAll(
            where, 
            [], 
            relations, 
            RateTeacherService.LEFT_JOIN, 
            true, 
            params.page || 1, 
            params.page_size || 100
        );

        const path = process.env.FILE_SERVER + CARS_PATH;
        
        return {
            status: 'success',
            data: this.rateTeacherService.removePostfix(response.data, { image: path }),
            total_records: response.total_records,
            page: params.page || 1,
            page_size: params.page_size || 100
        };
    }
}




