import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { EnquiryDto } from './enquiry.dto';
import { EnquiryService } from './enquiry.service';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnquiryCreatedEvent } from 'src/event/events/enquiry.created.event';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('enquiry')
export class EnquiryController {
    constructor(
        @Inject(EnquiryService) private enquiryService: EnquiryService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({ summary: 'Api to store enquiry requests' })
    @Post()
    async store(@Body() body: EnquiryDto) {

        const response = await this.enquiryService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('enquiry.created', new EnquiryCreatedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
