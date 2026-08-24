import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { OfferEnquiryDto } from './offer.enquiry.dto';
import { OfferEnquiryService } from 'src/user.form/offer.enquiry/offer.enquiry.service';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user-offer-enquiry')
export class OfferEnquiryController {
    constructor(
        @Inject(OfferEnquiryService) private offerEnquiryService: OfferEnquiryService
    ) { }

    @Get()
    async listing(@Query() params: OfferEnquiryDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const relations = {
            offer: {
                columns: [`title_${lang}`]
            }
        }

        const where = {};

        if (params.email) {
            where['email'] = params.email;
        }

        if (params.offer_id) {
            where['offer_id'] = params.offer_id;
        }

        return await this.offerEnquiryService.getAll(where, [], relations, null, true, params.page, params.page_size, { column: 'entity.id', order: 'DESC' })
    }
}
