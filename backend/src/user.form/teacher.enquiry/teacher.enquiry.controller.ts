import { Body, Controller, Inject, NotFoundException, Post, Request, UseGuards } from '@nestjs/common';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OfferEnquiryCreatedEvent } from 'src/event/events/offer.enquiry.created.event';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeacherEnquiryService } from './teacher.enquiry.service';
import { TeacherEnquiryDto } from './teacher.enquiry.dto';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('teachers/enquiry')
export class TeacherEnquiryController {

    constructor(
        @Inject(TeacherEnquiryService) private teacherEnquiryService: TeacherEnquiryService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({ summary: 'Api to store teacher enquiry requests' })
    @Post()
    async store(@Body() body: TeacherEnquiryDto) {

        const response = await this.teacherEnquiryService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('teacher.enquiry.created', new OfferEnquiryCreatedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
