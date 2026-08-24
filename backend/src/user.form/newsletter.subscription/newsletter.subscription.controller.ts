import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { NewsletterSubscriptionService } from './newsletter.subscription.service';
import { NewsletterSubscriptionDto } from './newsletter.subscription.dto';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NewsletterSubscribedEvent } from 'src/event/events/newsletter.subscribed.event';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyAuthGuard)
@Controller('newsletter/subscription')
export class NewsletterSubscriptionController {

    constructor(
        @Inject(NewsletterSubscriptionService) private newsletterSubscriptionService: NewsletterSubscriptionService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({summary: 'Api to store newsletter subscription requests'})
    @Post()
    async store(@Body() body: NewsletterSubscriptionDto) {

        const response = await this.newsletterSubscriptionService.insert(body)

        if (response.status == NewsletterSubscriptionService.SUCCESS) {
            this.eventEmitter.emit('newsletter.subscribed', new NewsletterSubscribedEvent(response.response.identifiers[0]?.id));
        }

        return response;
    }
}
