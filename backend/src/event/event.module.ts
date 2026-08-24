import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EnquiryCreatedListener } from './listeners/enquiry.created.listener';
import { EnquiryService } from 'src/user.form/enquiry/enquiry.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from 'src/entities/enquiry.entity';
import { OfferEnquiryCreatedListener } from './listeners/offer.enquiry.created.listener';
import { OfferEnquiryService } from 'src/user.form/offer.enquiry/offer.enquiry.service';
import { OfferEnquiry } from 'src/entities/offer.enquiry.entity';
import { LostFoundRequestCreatedListener } from './listeners/lost.found.request.created.listener';
import { LostFoundRequestService } from 'src/user.form/lost.found.request/lost.found.request.service';
import { LostFoundRequest } from 'src/entities/lost.found.request.entity';
import { MailResponse } from 'src/entities/mail.response.entity';
import { UserRegisteredListener } from './listeners/user.registered.listener';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entities/user.entity';
import { UserActivatedListener } from './listeners/user.activated.listener';
import { UserForgotPasswordListener } from './listeners/user.forgot.password.listener';
import { UserForgotPasswordService } from 'src/user/user.forgot.password.service';
import { UserForgotPassword } from 'src/entities/user.forgot.password.entity';
import { UserResetPasswordListener } from './listeners/user.reset.password.listener';
import { NewsletterSubscribedListener } from './listeners/newsletter.subscribed.listener';
import { NewsletterSubscriptionService } from 'src/user.form/newsletter.subscription/newsletter.subscription.service';
import { NewsletterSubscription } from 'src/entities/newsletter.subscription.entity';
import { SmsService } from 'src/mail/sms.service';
import { HttpModule } from '@nestjs/axios';
import { SmsResponse } from 'src/entities/sms.response.entity';
import { CareerJobApplicationListener } from './listeners/career.job.application.listener';
import { CareerJobApplicationStatusChangedListener } from './listeners/career.job.application.status.changed.listener';
import { CareerJobApplicationScreeningListener } from './listeners/career.job.application.screening.listener';
import { CvScreeningService } from 'src/admin/recruiting/screening/cv.screening.service';
import { RecruitingScreeningKeyword } from 'src/entities/recruiting.screening.keyword.entity';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { CareerJobApplicationAttachmentService } from 'src/cms/career.job/career.job.application.attachment.service';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';
import { ConfirmBookingListener } from './listeners/confirm.booking.listener';
import { BookingRepoService } from 'src/booking/services/booking.repo.service'; 
import { Booking } from 'src/entities/booking.entity';
import { EditBookingListener } from './listeners/edit.booking.listener';
import { ExtendBookingListener } from './listeners/extend.booking.listener';
import { CancelBookingListener } from './listeners/cancel.booking.listener';
import { ChauffeurEnquiry } from 'src/entities/chauffeur.enquiry.entity';
import { ChauffeurEnquiryService } from 'src/user.form/chauffeur.enquiry/chauffeur.enquiry.service';
import { ChauffeurEnquiryCreatedListener } from './listeners/chauffeur.enquiry.created.listener';
import { TeacherEnquiryCreatedListener } from './listeners/teacher.enquiry.created.listener';
import { TeacherEnquiryService } from 'src/user.form/teacher.enquiry/teacher.enquiry.service';
import { TeacherEnquiry } from 'src/entities/teacher.enquiry.entity';
import { EdcEnquiryCreatedListener } from './listeners/edc.enquiry.created.listener';
import { EdcVerificationSuccessListener } from './listeners/edc.verification.success.listener';
import { EdcEnquiryService } from 'src/user.form/edc.enquiry/edc.enquiry.service';
import { EdcVerificationService } from 'src/user.form/edc.verification/edc.verification.service';
import { EdcEnquiry } from 'src/entities/edc.enquiry.entity';
import { EdcVerification } from 'src/entities/edc.verification.entity';
import { AdjustService } from 'src/adjust/adjust.service';
import { AdminCreatedListener } from './listeners/admin.created.listener';
import { AdminPasswordChangedListener } from './listeners/admin.password.changed.listener';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/entities/admin.entity';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forFeature([
            Enquiry,
            OfferEnquiry,
            LostFoundRequest,
            MailResponse,
            User,
            UserForgotPassword,
            NewsletterSubscription,
            SmsResponse,
            CareerJobApplication,
            CareerJobApplicationAttachment,
            RecruitingScreeningKeyword,
            Booking,
            ChauffeurEnquiry,
            TeacherEnquiry,
            EdcEnquiry,
            EdcVerification,
            Admin
        ]),
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
          })
    ],
    providers: [
        MailService,
        EnquiryCreatedListener,
        EnquiryService,
        OfferEnquiryCreatedListener,
        OfferEnquiryService,
        LostFoundRequestCreatedListener,
        LostFoundRequestService,
        UserRegisteredListener,
        UserService,
        UserActivatedListener,
        UserForgotPasswordListener,
        UserForgotPasswordService,
        UserResetPasswordListener,
        NewsletterSubscribedListener,
        NewsletterSubscriptionService,
        SmsService,
        CareerJobApplicationListener,
        CareerJobApplicationStatusChangedListener,
        CareerJobApplicationScreeningListener,
        CvScreeningService,
        CareerJobApplicationService,
        CareerJobApplicationAttachmentService,
        ConfirmBookingListener,
        EditBookingListener,
        BookingRepoService,
        ExtendBookingListener,
        CancelBookingListener,
        ChauffeurEnquiryCreatedListener,
        ChauffeurEnquiryService,
        TeacherEnquiryCreatedListener,
        TeacherEnquiryService,
        EdcEnquiryCreatedListener,
        EdcVerificationSuccessListener,
        EdcEnquiryService,
        EdcVerificationService,
        AdjustService,
        AdminCreatedListener,
        AdminPasswordChangedListener,
        AdminService
    ],
    exports: [EventEmitterModule]
})
export class EventModule { }
