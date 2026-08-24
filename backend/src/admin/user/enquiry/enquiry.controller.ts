import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { EnquiryService } from 'src/user.form/enquiry/enquiry.service';
import { EnquiryDto } from './enquiry.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user-enquiry')
export class EnquiryController {
    constructor(
        @Inject(EnquiryService) private enquiryService: EnquiryService
    ) { }

    @Get()
    async listing(@Query() params: EnquiryDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const relations = {
            city: {
                columns: ['id', `name_${lang}`]
            },
            car: {
                columns: ['id', `name_${lang}`]
            }
        }

        const where = {};

        if (params.email) {
            where['email'] = params.email;
        }

        if (params.type) {
            where['type'] = params.type;
        }

        if (params.duration) {
            where['duration'] = params.duration;
        }

        if (params.city_id) {
            where['city_id'] = params.city_id;
        }

        if (params.car_id) {
            where['car_id'] = params.car_id;
        }

        return await this.enquiryService.getAll(where, [], relations, EnquiryService.LEFT_JOIN, true, params.page, params.page_size, { column: 'entity.id', order: 'DESC' })
    }
}
