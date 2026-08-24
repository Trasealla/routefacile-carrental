import { Module } from '@nestjs/common';
import { HomeController } from './home/home.controller';
import { HomeBannerService } from './home/home.banner.service';
import { HomeBanner } from 'src/entities/home.banner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CityPageController } from './city.page/city.page.controller';
import { CityPageService } from './city.page/city.page.service';
import { CityPage } from 'src/entities/city.page.entity';
import { CacheService } from 'src/cache/cache.service';
import { AwardCertificateController } from './award.certificate/award.certificate.controller';
import { AwardCertificateService } from './award.certificate/award.certificate.service';
import { AwardCertificate } from 'src/entities/award.certificate.entity';
import { OfferController } from './offer/offer.controller';
import { OfferService } from './offer/offer.service';
import { Offer } from 'src/entities/offer.entity';
import { IsExists } from 'src/validators/exists.validator';
import { FaqController } from './faq/faq.controller';
import { FaqService } from './faq/faq.service';
import { FaqCategoryService } from './faq/faq.category.service';
import { Faq } from 'src/entities/faq.entity';
import { FaqCategory } from 'src/entities/faq.category.entity';
import { BlogController } from './blog/blog.controller';
import { BlogService } from './blog/blog.service';
import { Blog } from 'src/entities/blog.entity';
import { CareerJobController } from './career.job/career.job.controller';
import { CareerJobService } from './career.job/career.job.service';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { CareerJob } from 'src/entities/career.job.entity';
import { CareerJobApplicationService } from './career.job/career.job.application.service';
import { CareerJobApplicationAttachmentService } from './career.job/career.job.application.attachment.service';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';
import { CountryController } from './country/country.controller';
import { CountryService } from './country/country.service';
import { Country } from 'src/entities/country.entity';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { Surge } from 'src/entities/surge.entity';
import { PageController } from './page/page.controller';
import { PageService } from './page/page.service';
import { Page } from 'src/entities/page.entity';
import { RateTeacher } from 'src/entities/rate.teacher.entity';
import { RateTeacherService } from 'src/admin/rate/rate.teacher/rate.teacher.service';
import { PromoTickerPublicController } from './promo.ticker/promo.ticker.controller';
import { PromoTickerService } from './promo.ticker/promo.ticker.service';
import { PromoTicker } from 'src/entities/promo.ticker.entity';
import { RecruitingQuestionnaire } from 'src/entities/recruiting.questionnaire.entity';
import { RecruitingQuestionnaireService } from 'src/recruiting/recruiting.questionnaire.service';
import { CareerJobApplicationAnswer } from 'src/entities/career.job.application.answer.entity';
import { CareerJobView } from 'src/entities/career.job.view.entity';
import { PublicCareerController } from './career.job/public.career.controller';


@Module({
  controllers: [
    HomeController,
    CityPageController,
    AwardCertificateController,
    OfferController,
    FaqController,
    BlogController,
    CareerJobController,
    PublicCareerController,
    CountryController,
    PageController,
    PromoTickerPublicController,
  ],
  imports: [
    TypeOrmModule.forFeature([
      HomeBanner,
      CityPage,
      AwardCertificate,
      Offer,
      Faq,
      FaqCategory,
      Blog,
      CareerJob,
      CareerJobApplication,
      CareerJobApplicationAttachment,
      Country,
      Surge,
      Page,
      RateTeacher,
      PromoTicker,
      RecruitingQuestionnaire,
      CareerJobApplicationAnswer,
      CareerJobView
    ]),
    ConfigModule],
  providers: [
    HomeBannerService,
    ConfigService,
    CityPageService,
    CacheService,
    AwardCertificateService,
    OfferService,
    IsExists,
    FaqService,
    FaqCategoryService,
    BlogService,
    CareerJobService,
    CareerJobApplicationService,
    CareerJobApplicationAttachmentService,
    CountryService,
    SurgeService,
    PageService,
    RateTeacherService,
    RecruitingQuestionnaireService,
    PromoTickerService
  ]
})
export class CmsModule { }
