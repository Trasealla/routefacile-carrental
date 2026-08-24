import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from 'src/entities/enquiry.entity';
import { LostFoundRequest } from 'src/entities/lost.found.request.entity';
import { OfferEnquiry } from 'src/entities/offer.enquiry.entity';
import { EnquiryController } from './enquiry/enquiry.controller';
import { OfferEnquiryController } from './offer.enquiry/offer.enquiry.controller';
import { LostFoundRequestController } from './lost.found.request/lost.found.request.controller';
import { EnquiryService } from './enquiry/enquiry.service';
import { OfferEnquiryService } from './offer.enquiry/offer.enquiry.service';
import { LostFoundRequestService } from './lost.found.request/lost.found.request.service';
import { IsExists } from 'src/validators/exists.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NewsletterSubscriptionController } from './newsletter.subscription/newsletter.subscription.controller';
import { NewsletterSubscriptionService } from './newsletter.subscription/newsletter.subscription.service';
import { NewsletterSubscription } from 'src/entities/newsletter.subscription.entity';
import { UserFeedbackController } from './user.feedback/user.feedback.controller';
import { UserFeedbackService } from './user.feedback/user.feedback.service';
import { UserFeedbackService as  UserFeedbackServiceEntity} from 'src/entities/user.feedback.service.entity';
import { UserFeedbackOverallRatingService } from './user.feedback/user.feedback.overall.rating.service';
import { UserFeedbackRatingService } from './user.feedback/user.feedback.rating.service';
import { UserFeedbackRevertReasonService } from './user.feedback/user.feedback.revert.reason.service';
import { UserFeedbackServiceService } from './user.feedback/user.feedback.service.service';
import { UserFeedbackSourceService } from './user.feedback/user.feedback.source.service';
import { UserFeedback } from 'src/entities/user.feedback.entity';
import { UserFeedbackSource } from 'src/entities/user.feedback.source.entity';
import { UserFeedbackRevertReason } from 'src/entities/user.feedback.revert.reason.entity';
import { UserFeedbackRating } from 'src/entities/user.feedback.rating.entity';
import { UserFeedbackOverallRating } from 'src/entities/user.feedback.overall.rating.entity';
import { GoogleRecaptchaController } from './google.recaptcha/google.recaptcha.controller';
import { UserFeedbackServiceCategory } from 'src/entities/user.feedback.service.category.entity';
import { UserFeedbackServiceCategoryService } from './user.feedback/user.feedback.service.category.service';
import { ChauffeurEnquiry } from 'src/entities/chauffeur.enquiry.entity';
import { ChauffeurEnquiryController } from './chauffeur.enquiry/chauffeur.enquiry.controller';
import { ChauffeurEnquiryService } from './chauffeur.enquiry/chauffeur.enquiry.service';
import { TeacherEnquiryController } from './teacher.enquiry/teacher.enquiry.controller';
import { TeacherEnquiry } from 'src/entities/teacher.enquiry.entity';
import { TeacherEnquiryService } from './teacher.enquiry/teacher.enquiry.service';
import { UIVote } from 'src/entities/ui.vote.entity';
import { UIVoteController } from './ui.vote/ui.vote.controller';
import { UIVoteService } from './ui.vote/ui.vote.service';
import { EdcEnquiry } from 'src/entities/edc.enquiry.entity';
import { EdcVerification } from 'src/entities/edc.verification.entity';
import { EdcEnquiryController } from './edc.enquiry/edc.enquiry.controller';
import { EdcEnquiryService } from './edc.enquiry/edc.enquiry.service';
import { EdcVerificationController } from './edc.verification/edc.verification.controller';
import { EdcVerificationService } from './edc.verification/edc.verification.service';
import { EdcRatesController } from './edc.rates/edc.rates.controller';
import { RateTeacherService } from 'src/admin/rate/rate.teacher/rate.teacher.service';
import { RateTeacher } from 'src/entities/rate.teacher.entity';
import { EdcPromoService } from 'src/admin/edc/edc.promo.service';
import { EdcTermService } from 'src/admin/edc/edc.term.service';
import { EdcPromoConfig } from 'src/entities/edc.promo.config.entity';
import { EdcTerm } from 'src/entities/edc.term.entity';
import { KycSubmission } from 'src/entities/kyc.submission.entity';
import { KycSubmissionAttachment } from 'src/entities/kyc.submission.attachment.entity';
import { KycController } from './kyc/kyc.controller';
import { KycPublicAssetController } from './kyc/kyc.public-asset.controller';
import { KycSubmissionService } from './kyc/kyc.service';
import { MailModule } from 'src/mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from 'src/mail/sms.service';
import { SmsResponse } from 'src/entities/sms.response.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Enquiry,
            OfferEnquiry,
            LostFoundRequest,
            NewsletterSubscription,
            UserFeedback,
            UserFeedbackServiceEntity,
            UserFeedbackSource,
            UserFeedbackRevertReason,
            UserFeedbackRating,
            UserFeedbackOverallRating,
            UserFeedbackServiceCategory,
            ChauffeurEnquiry,
            TeacherEnquiry,
            UIVote,
            EdcEnquiry,
            EdcVerification,
            RateTeacher,
            EdcPromoConfig,
            EdcTerm,
            KycSubmission,
            KycSubmissionAttachment,
            SmsResponse,
        ]),
        ConfigModule,
        MailModule,
        HttpModule,
    ],
    controllers: [
        EnquiryController,
        OfferEnquiryController,
        LostFoundRequestController,
        NewsletterSubscriptionController,
        UserFeedbackController,
        GoogleRecaptchaController,
        ChauffeurEnquiryController,
        TeacherEnquiryController,
        UIVoteController,
        EdcEnquiryController,
        EdcVerificationController,
        EdcRatesController,
        KycController,
        KycPublicAssetController
    ],
    providers: [
        ConfigService,
        EnquiryService,
        OfferEnquiryService,
        LostFoundRequestService,
        IsExists,
        NewsletterSubscriptionService,
        UserFeedbackService,
        UserFeedbackOverallRatingService,
        UserFeedbackRatingService,
        UserFeedbackRevertReasonService,
        UserFeedbackServiceService,
        UserFeedbackSourceService,
        UserFeedbackServiceCategoryService,
        ChauffeurEnquiryService,
        TeacherEnquiryService,
        UIVoteService,
        EdcEnquiryService,
        EdcVerificationService,
        RateTeacherService,
        EdcPromoService,
        EdcTermService,
        SmsService,
        KycSubmissionService
    ]
})
export class UserFormModule { }
