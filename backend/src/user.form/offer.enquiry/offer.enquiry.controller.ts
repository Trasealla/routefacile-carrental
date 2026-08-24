import { Body, Controller, Inject, NotFoundException, Post, Request, UseGuards } from '@nestjs/common';
import { OfferEnquiryService } from './offer.enquiry.service';
import { OfferEnquiryDto } from './offer.enquiry.dto';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OfferEnquiryCreatedEvent } from 'src/event/events/offer.enquiry.created.event';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('offer/enquiry')
export class OfferEnquiryController {

    constructor(
        @Inject(OfferEnquiryService) private offerEnquiryService: OfferEnquiryService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({summary: 'Api to store offer enquiry requests'})
    @Post()
    async store(@Body() body: OfferEnquiryDto) {

        const response = await this.offerEnquiryService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('offer.enquiry.created', new OfferEnquiryCreatedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
