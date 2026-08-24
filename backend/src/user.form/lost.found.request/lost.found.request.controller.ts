import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { LostFoundRequestService } from './lost.found.request.service';
import { LostFoundRequestDto } from './lost.found.request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LostFoundRequestCreatedEvent } from 'src/event/events/lost.found.request.created.event';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyAuthGuard)
@Controller('lost/found/request')
export class LostFoundRequestController {

    constructor(
        @Inject(LostFoundRequestService) private lostFoundRequestService: LostFoundRequestService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({summary: 'Api to store lost and found requests'})
    @Post()
    async store(@Body() body: LostFoundRequestDto) {
        const response = await this.lostFoundRequestService.insert(body);

        if (response.status == 'success') {
            this.eventEmitter.emit('lost.found.request.created', new LostFoundRequestCreatedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
