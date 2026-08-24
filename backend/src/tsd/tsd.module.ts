import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { TsdController } from './tsd.controller';

// Services
import { XmlService } from './services/xml.service';
import { TsdAvailabilityService } from './services/tsd.availability.service';
import { TsdReservationService } from './services/tsd.reservation.service';
import { TsdLocationService } from './services/tsd.location.service';

// Entities
import { Car } from 'src/entities/car.entity';
import { Location } from 'src/entities/location.entity';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { Booking } from 'src/entities/booking.entity';
import { User } from 'src/entities/user.entity';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { Surge } from 'src/entities/surge.entity';
import { MiscCharge } from 'src/entities/misc.charge.entity';
import { City } from 'src/entities/city.entity';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { BookingMonthlyInstallment } from 'src/entities/booking.monthly.installment.entity';
import { DiscountRange } from 'src/entities/discount.range.entity';

// Existing Services from other modules
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { LocationService } from 'src/location/location.service';
import { BookingService } from 'src/booking/services/booking.service';
import { CancelBookingService } from 'src/booking/services/cancel.booking.service';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { CacheService } from 'src/cache/cache.service';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { BookingMonthlyInstallmentService } from 'src/booking/services/booking.monthly.installment.service';
import { DiscountRangeService } from 'src/booking/car.search/discount.range.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Car,
      Location,
      LocationOpeningHour,
      Booking,
      User,
      DiscountCoupon,
      Surge,
      MiscCharge,
      City,
      RateMonthlyV2,
      BookingMonthlyInstallment,
      DiscountRange
    ])
  ],
  controllers: [TsdController],
  providers: [
    // TSD Services
    XmlService,
    TsdAvailabilityService,
    TsdReservationService,
    TsdLocationService,
    
    // Existing Services (dependencies)
    DiscountCouponService,
    SurgeService,
    MiscChargeService,
    LocationService,
    BookingService,
    CancelBookingService,
    BookingRepoService,
    CacheService,
    RateMonthlyV2Service,
    BookingMonthlyInstallmentService,
    DiscountRangeService
  ],
  exports: [
    XmlService,
    TsdAvailabilityService,
    TsdReservationService,
    TsdLocationService
  ]
})
export class TsdModule {}

