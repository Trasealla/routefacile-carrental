import { Module } from '@nestjs/common';
import { HomeBannerController } from './home.banner/home.banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeBanner } from 'src/entities/home.banner.entity';
import { HomeBannerService } from 'src/cms/home/home.banner.service';
import { BlogController } from './blog/blog.controller';
import { BlogService } from 'src/cms/blog/blog.service';
import { Blog } from 'src/entities/blog.entity';
import { BlogTagService } from './blog/blog.tag.service';
import { BlogCategoryService } from './blog/blog.category.service';
import { BlogTag } from 'src/entities/blog.tag.entity';
import { BlogCategory } from 'src/entities/blog.category.entity';
import { CityPageController } from './city.page/city.page.controller';
import { CityPageService } from 'src/cms/city.page/city.page.service';
import { CityPage } from 'src/entities/city.page.entity';
import { OfferController } from './offer/offer.controller';
import { OfferService } from 'src/cms/offer/offer.service';
import { Offer } from 'src/entities/offer.entity';
import { LocationController } from './location/location.controller';
import { LocationService } from 'src/location/location.service';
import { Location } from 'src/entities/location.entity';
import { LocationOpeningHourService } from 'src/location/location.opening.hour.service';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { FaqController } from './faq/faq.controller';
import { FaqCategoryController } from './faq/faq.category.controller';
import { FaqCategoryService } from 'src/cms/faq/faq.category.service';
import { FaqCategory } from 'src/entities/faq.category.entity';
import { FaqService } from 'src/cms/faq/faq.service';
import { Faq } from 'src/entities/faq.entity';
import { CityController } from './city/city.controller';
import { City } from 'src/entities/city.entity';
import { CityService } from 'src/city/city.service';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { PageController } from './page/page.controller';
import { PageService } from 'src/cms/page/page.service';
import { Page } from 'src/entities/page.entity';
import { CareerJobController } from './career.job/career.job.controller';
import { CareerJobService } from 'src/cms/career.job/career.job.service';
import { CareerJob } from 'src/entities/career.job.entity';
import { AwardCertificateController } from './award.certificate/award.certificate.controller'; 
import { AwardCertificate } from 'src/entities/award.certificate.entity';
import { AwardCertificateService } from 'src/cms/award.certificate/award.certificate.service';
import { LocationOpeningHourExceptionController } from './location/location.opening.hour.exception.controller';
import { LocationOpeningHourExceptionService } from 'src/location/location.opening.hour.exception.service';
import { LocationOpeningHourException } from 'src/entities/location.opening.hour.exception.entity';
import { PromoTickerController } from './promo.ticker/promo.ticker.controller';
import { PromoTickerService } from 'src/cms/promo.ticker/promo.ticker.service';
import { PromoTicker } from 'src/entities/promo.ticker.entity';
import { CacheService } from 'src/cache/cache.service';
import { CareerJobApplicationController } from './career.job.application/career.job.application.controller';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { CareerJobApplicationAttachmentService } from 'src/cms/career.job/career.job.application.attachment.service';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';

@Module({
  controllers: [HomeBannerController, BlogController, CityPageController, OfferController, LocationController, FaqController, FaqCategoryController, CityController, PageController, CareerJobController, CareerJobApplicationController, AwardCertificateController, LocationOpeningHourExceptionController, PromoTickerController],
  imports: [TypeOrmModule.forFeature([
    HomeBanner,
    Blog,
    BlogTag,
    BlogCategory,
    CityPage,
    Offer,
    Location,
    LocationOpeningHour,
    FaqCategory,
    Faq,
    City,
    CityOpeningHour,
    Page,
    CareerJob,
    CareerJobApplication,
    CareerJobApplicationAttachment,
    AwardCertificate,
    LocationOpeningHourException,
    PromoTicker
  ])],
  providers: [
    HomeBannerService,
    BlogService,
    BlogTagService,
    BlogCategoryService,
    CityPageService,
    OfferService,
    LocationService,
    LocationOpeningHourService,
    FaqCategoryService,
    FaqService,
    CityService,
    CityOpeningHourService,
    PageService,
    CareerJobService,
    CareerJobApplicationService,
    CareerJobApplicationAttachmentService,
    AwardCertificateService,
    LocationOpeningHourExceptionService,
    PromoTickerService,
    CacheService
  ]
})
export class CmsModule { }
