import { Body, Controller, Inject, NotFoundException, Post, Request, UseGuards } from '@nestjs/common';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OfferEnquiryCreatedEvent } from 'src/event/events/offer.enquiry.created.event';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChauffeurEnquiryService } from './chauffeur.enquiry.service';
import { ChauffeurEnquiryDto } from './chauffeur.enquiry.dto';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('chauffeur/enquiry')
export class ChauffeurEnquiryController {

    constructor(
        @Inject(ChauffeurEnquiryService) private chauffeurEnquiryService: ChauffeurEnquiryService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({ summary: 'Api to store chauffeur enquiry requests' })
    @Post()
    async store(@Body() body: ChauffeurEnquiryDto) {

        const response = await this.chauffeurEnquiryService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('chauffeur.enquiry.created', new OfferEnquiryCreatedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
