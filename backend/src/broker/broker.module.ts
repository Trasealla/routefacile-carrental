import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrokerApiController } from './broker.controller';
import { BrokerCredentialsGuard } from './guards/broker-credentials.guard';
import { BrokerXmlBodyMiddleware } from './middleware/broker-xml-body.middleware';
import { BrokerModule as AdminBrokerModule } from 'src/admin/broker/broker.module';

import { LocationService } from 'src/location/location.service';
import { LocationOpeningHourService } from 'src/location/location.opening.hour.service';
import { LocationOpeningHourExceptionService } from 'src/location/location.opening.hour.exception.service';
import { CityService } from 'src/city/city.service';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { CarService } from 'src/car/car.service';
import { TimeValidationService } from 'src/booking/services/time.validation.service';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { CarSearchService } from 'src/booking/car.search/car.search.service';
import { BookingService } from 'src/booking/services/booking.service';
import { EditBookingService } from 'src/booking/services/edit.booking.service';
import { CancelBookingService } from 'src/booking/services/cancel.booking.service';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { BookingMonthlyInstallmentService } from 'src/booking/services/booking.monthly.installment.service';
import { DiscountRangeService } from 'src/booking/car.search/discount.range.service';
import { CacheService } from 'src/cache/cache.service';

import { Car } from 'src/entities/car.entity';
import { Location } from 'src/entities/location.entity';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { LocationOpeningHourException } from 'src/entities/location.opening.hour.exception.entity';
import { City } from 'src/entities/city.entity';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { MiscCharge } from 'src/entities/misc.charge.entity';
import { Surge } from 'src/entities/surge.entity';
import { Booking } from 'src/entities/booking.entity';
import { User } from 'src/entities/user.entity';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { BookingMonthlyInstallment } from 'src/entities/booking.monthly.installment.entity';
import { DiscountRange } from 'src/entities/discount.range.entity';

@Module({
  imports: [
    AdminBrokerModule,
    TypeOrmModule.forFeature([
      Car,
      Location,
      LocationOpeningHour,
      LocationOpeningHourException,
      City,
      CityOpeningHour,
      MiscCharge,
      Surge,
      Booking,
      User,
      RateMonthlyV2,
      BookingMonthlyInstallment,
      DiscountRange
    ])
  ],
  controllers: [BrokerApiController],
  providers: [
    BrokerCredentialsGuard,
    LocationService,
    LocationOpeningHourService,
    LocationOpeningHourExceptionService,
    CityService,
    CityOpeningHourService,
    CarService,
    TimeValidationService,
    MiscChargeService,
    SurgeService,
    CarSearchService,
    BookingService,
    EditBookingService,
    CancelBookingService,
    BookingRepoService,
    CacheService,
    RateMonthlyV2Service,
    BookingMonthlyInstallmentService,
    DiscountRangeService
  ]
})
export class BrokerApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BrokerXmlBodyMiddleware).forRoutes({ path: 'broker/v1/*', method: RequestMethod.ALL });
  }
}
