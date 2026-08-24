import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewsletterSubscription } from 'src/entities/newsletter.subscription.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class NewsletterSubscriptionService extends BaseService<NewsletterSubscription> {
    constructor(
        @InjectRepository(NewsletterSubscription) private newsletterSubscriptionRepository: Repository<NewsletterSubscription>) {
        super(newsletterSubscriptionRepository)
    }
}
