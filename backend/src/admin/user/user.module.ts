import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { NewsletterSubscriptionController } from './newsletter.subscription/newsletter.subscription.controller';
import { NewsletterSubscriptionService } from 'src/user.form/newsletter.subscription/newsletter.subscription.service';
import { NewsletterSubscription } from 'src/entities/newsletter.subscription.entity';
import { EnquiryController } from './enquiry/enquiry.controller';
import { EnquiryService } from 'src/user.form/enquiry/enquiry.service';
import { Enquiry } from 'src/entities/enquiry.entity';
import { OfferEnquiryService } from 'src/user.form/offer.enquiry/offer.enquiry.service';
import { OfferEnquiry } from 'src/entities/offer.enquiry.entity';
import { OfferEnquiryController } from './offer.enquiry/offer.enquiry.controller';
import { LostFoundRequestController } from './lost.found.request/lost.found.request.controller';
import { LostFoundRequest } from 'src/entities/lost.found.request.entity';
import { LostFoundRequestService } from 'src/user.form/lost.found.request/lost.found.request.service';
import { UserFeedbackController } from './user.feedback/user.feedback.controller';
import { UserFeedbackService } from 'src/user.form/user.feedback/user.feedback.service';
import { UserFeedback } from 'src/entities/user.feedback.entity';
import { UserService } from 'src/user/user.service';
import { UserDcoumentController } from './user.document/user.document.controller';
import { UserBookingController } from './user.booking/user.booking.controller';

@Module({
  controllers: [UserController, NewsletterSubscriptionController, EnquiryController, OfferEnquiryController, LostFoundRequestController, UserFeedbackController, UserDcoumentController, UserBookingController],
  imports: [TypeOrmModule.forFeature([User, NewsletterSubscription, Enquiry, OfferEnquiry, LostFoundRequest, UserFeedback])],
  providers: [NewsletterSubscriptionService, EnquiryService, OfferEnquiryService, LostFoundRequestService, UserFeedbackService, UserService]
})
export class UserModule {}
