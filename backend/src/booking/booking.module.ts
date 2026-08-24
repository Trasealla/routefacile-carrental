import { Module } from '@nestjs/common';
import { BookingFormController } from './booking.form.controller';
import { LocationService } from 'src/location/location.service';
import { LocationOpeningHourService } from 'src/location/location.opening.hour.service';
import { CityService } from 'src/city/city.service';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { Location } from 'src/entities/location.entity';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { City } from 'src/entities/city.entity';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationModule } from 'src/location/location.module';
import { CacheService } from 'src/cache/cache.service';
import { CarSearchController } from './car.search/car.search.controller';
import { CarService } from 'src/car/car.service';
import { Car } from 'src/entities/car.entity';
import { DiscountCouponService } from './car.search/discount.coupon.service';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { SurgeService } from './car.search/surge.service';
import { Surge } from 'src/entities/surge.entity';
import { MiscChargeService } from './car.search/misc.charge.service';
import { MiscCharge } from 'src/entities/misc.charge.entity';
import { CarExtraController } from './car.extra/car.extra.controller';
import { TimeValidationService } from './services/time.validation.service'; 
import { DiscountCouponValid } from 'src/validators/discount.coupon.validator';
import { ConfirmBookingController } from './confirm.booking/confirm.booking.controller';
import { ConfirmBookingService } from './confirm.booking/confirm.booking.service';
import { GuestBookingController } from './confirm.booking/guest.booking.controller';
import { GuestCustomerService } from './confirm.booking/guest.customer.service';
import { UserBookingService } from 'src/user/user.booking/user.booking.service';
import { BookingService } from './services/booking.service'; 
import { Booking } from 'src/entities/booking.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { BookingRepoService } from './services/booking.repo.service'; 
import { CmiController } from './payment/cmi/cmi.controller';
import { CmiService } from './payment/cmi/cmi.service';
import { HttpModule } from '@nestjs/axios';
import { EditBookingController } from './edit.booking/edit.booking.controller';
import { EditBookingService } from './services/edit.booking.service'; 
import { CarSearchService } from './car.search/car.search.service';
import { ExtendBookingController } from './extend.booking/extend.booking.controller';
import { ExtendBookingService } from './services/extend.booking.service'; 
import { BookingPaymentTransactionService } from './payment/booking.payment.transaction.service';
import { BookingPaymentTransaction } from 'src/entities/booking.payment.transaction.entity';
import { CancelBookingController } from './cancel.booking/cancel.booking.controller';
import { CancelBookingService } from './services/cancel.booking.service'; 
import { CancellationPolicyService } from './services/cancellation.policy.service';
import { CancellationAudit } from 'src/entities/cancellation.audit.entity';
import { MonthlyKMPlan } from 'src/entities/monthly.km.plan.entity';
import { MailService } from 'src/mail/mail.service';
import { MailResponse } from 'src/entities/mail.response.entity';
import { MonthlyUpgradeController } from './monthly.upgrade/monthly.upgrade.controller';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { MonthlyInstallmentController } from './monthly.installment/monthly.installment.controller';
import { BookingMonthlyInstallment } from 'src/entities/booking.monthly.installment.entity';
import { BookingMonthlyInstallmentService } from './services/booking.monthly.installment.service';
import { BookingFormSubmissionService } from './services/booking.form.submission.service';
import { BookingFormSubmission } from 'src/entities/booking.form.submission.entity';
import { DiscountRangeService } from './car.search/discount.range.service';
import { DiscountRange } from 'src/entities/discount.range.entity';
import { LocationOpeningHourExceptionService } from 'src/location/location.opening.hour.exception.service';
import { LocationOpeningHourException } from 'src/entities/location.opening.hour.exception.entity';
import { PublicBookingController } from './public.booking.controller';
import { PublicExtendBookingController } from './public.extend.booking/public.extend.booking.controller';

@Module({
  controllers: [BookingFormController, CarSearchController, CarExtraController, ConfirmBookingController, GuestBookingController, CmiController, EditBookingController, ExtendBookingController, CancelBookingController, MonthlyUpgradeController, MonthlyInstallmentController, PublicBookingController, PublicExtendBookingController],
  imports: [HttpModule, LocationModule, TypeOrmModule.forFeature([
    Location,
    LocationOpeningHour,
    City,
    CityOpeningHour,
    Car,
    DiscountCoupon,
    Surge,
    MiscCharge,
    Booking,
    User,
    BookingPaymentTransaction,
    MonthlyKMPlan,
    MailResponse,
    RateMonthlyV2,
    BookingMonthlyInstallment,
    BookingFormSubmission,
    DiscountRange,
    LocationOpeningHourException,
    CancellationAudit
  ])],
  providers: [
    LocationService,
    LocationOpeningHourService,
    CityService,
    CityOpeningHourService, 
    CacheService,
    CarService,
    DiscountCouponService,
    SurgeService,
    MiscChargeService,
    TimeValidationService,
    DiscountCouponValid,
    BookingService,
    ConfirmBookingService,
    GuestCustomerService,
    UserBookingService,
    UserService,
    BookingRepoService,
    CmiService,
    EditBookingService,
    CarSearchService,
    ExtendBookingService,
    BookingPaymentTransactionService,
    CancelBookingService,
    CancellationPolicyService,
    MailService,
    RateMonthlyV2Service,
    BookingMonthlyInstallmentService,
    BookingFormSubmissionService,
    DiscountRangeService,
    LocationOpeningHourExceptionService
  ]
})
export class BookingModule { }
