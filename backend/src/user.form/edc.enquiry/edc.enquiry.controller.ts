import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EdcEnquiryService } from './edc.enquiry.service';
import { EdcEnquiryDto } from './edc.enquiry.dto';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('edc')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('edc/enquiry')
export class EdcEnquiryController {

    constructor(
        @Inject(EdcEnquiryService) private edcEnquiryService: EdcEnquiryService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({ summary: 'Submit an EDC member enquiry for car rental' })
    @Post()
    async store(@Body() body: EdcEnquiryDto) {

        const response = await this.edcEnquiryService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('edc.enquiry.created', {
                id: response.response.identifiers[0]?.id,
                ...body
            });
        }

        return response;
    }
}







