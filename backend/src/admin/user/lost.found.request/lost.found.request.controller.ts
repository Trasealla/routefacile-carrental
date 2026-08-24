import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { LostFoundRequestService } from 'src/user.form/lost.found.request/lost.found.request.service';
import { LostFoundRequestDto } from './lost.found.request.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user-lost-found-request')
export class LostFoundRequestController {

    constructor(
        @Inject(LostFoundRequestService) private lostFoundRequestService: LostFoundRequestService
    ) { }

    @Get()
    async listing(@Query() params: LostFoundRequestDto) {
        
        const lang = params.lang || LanguageTypes.ENGLISH;
        const relations = {
            city: {
                columns: [`name_${lang}`]
            }
        }
        const where = {};

        if (params.email) {
            where['email'] = params.email;
        }

        if (params.city_id) {
            where['city_id'] = params.city_id;
        }

        if (params.reference_number) {
            where['reference_number'] = params.reference_number;
        }
 
        return await this.lostFoundRequestService.getAll(where, [], relations, null, true, params.page, params.page_size, { column: 'entity.id', order: 'DESC' })
    }
}
