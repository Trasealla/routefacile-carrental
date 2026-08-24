import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { NewsletterSubscribedEvent } from '../events/newsletter.subscribed.event';
import { NewsletterSubscriptionService } from 'src/user.form/newsletter.subscription/newsletter.subscription.service';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { MARKETING_RECEPIENT } from 'src/config/contants';

@Injectable()
export class NewsletterSubscribedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(NewsletterSubscriptionService) private newsletterSubscriptionService: NewsletterSubscriptionService
    ) { }

    @OnEvent('newsletter.subscribed')
    async handleNewsletterSubscribedEvent(event: NewsletterSubscribedEvent) {

        const where = { id: event.newsletter_subscription_id };

        const newsletter_subscription_record = await this.newsletterSubscriptionService.getOne(where);

        const context = { 
            newsletter_subscription_record,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
         }

        await this.mailService.send(
            newsletter_subscription_record.email,
            'Newsletter Subscription',
            'newsletter_subscribe',
            context,
            [MARKETING_RECEPIENT],
            newsletter_subscription_record.id
        )
    }
}
