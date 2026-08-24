import { Module } from '@nestjs/common';
import { RateDailyController } from './rate.daily/rate.daily.controller';
import { RateDailyService } from './rate.daily/rate.daily.service';
import { RateDailyFileService } from './rate.daily/rate.daily.file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateDaily } from 'src/entities/rate.daily.entity';
import { RateDailyFile } from 'src/entities/rate.daily.file.entity';
import { AdminService } from '../admin.service';
import { Admin } from 'src/entities/admin.entity';
import { CarGroupService } from '../car/car.group/car.group.service';
import { CarGroup } from 'src/entities/car.group.entity';
import { Car } from 'src/entities/car.entity';
import { CarService } from 'src/car/car.service';
import { RateRangeController } from './rate.range/rate.range.controller';
import { RateRangeService } from './rate.range/rate.range.service';
import { RateRangeFileService } from './rate.range/rate.range.file.service';
import { RateRange } from 'src/entities/rate.range.entity';
import { RateRangeFile } from 'src/entities/rate.range.file.entity';
import { RateMonthlyService } from './rate.monthly/rate.monthly.service';
import { RateMonthlyFileService } from './rate.monthly/rate.monthly.file.service';
import { RateMonthly } from 'src/entities/rate.monthly.entity';
import { RateMonthlyFile } from 'src/entities/rate.monthly.file.entity';
import { RateMonthlyController } from './rate.monthly/rate.monthly.controller';
import { LocationService } from 'src/location/location.service';
import { Location } from 'src/entities/location.entity';
import { CacheBustingService } from '../cache.busting.service';
import { CityService } from 'src/city/city.service';
import { City } from 'src/entities/city.entity';
import { CacheService } from 'src/cache/cache.service';
import { SurgeController } from './surge/surge.controller';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { Surge } from 'src/entities/surge.entity';
import { DiscountCouponController } from './discount.coupon/discount.coupon.controller';
import { DiscountCouponSingleUseController } from './discount.coupon/discount.coupon.single.use.controller';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { RateMonthlyV2Controller } from './rate.monthly/rate.monthly.v2.controller';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { RateMonthlyV2Service } from './rate.monthly/rate.monthly.v2.service';
import { DiscountRange } from 'src/entities/discount.range.entity';
import { DiscountRangeService } from 'src/booking/car.search/discount.range.service';
import { DiscountRangeController } from './discount.range/discount.range.controller';
import { StopSaleController } from './stop.sale/stop.sale.controller';
import { StopSale } from 'src/entities/stop.sale.entity';
import { StopSaleService } from './stop.sale/stop.sale.service';
import { MiscChargesController } from './misc.charges/misc.charges.controller';
import { InterCitiesChargesService } from './misc.charges/inter.cities.charges.service';
import { InterCityCharge } from 'src/entities/ineter.cities.charge.entity';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { MiscCharge } from 'src/entities/misc.charge.entity';
import { RateTeacherController } from './rate.teacher/rate.teacher.controller';
import { RateTeacherService } from './rate.teacher/rate.teacher.service';
import { RateTeacher } from 'src/entities/rate.teacher.entity';

@Module({
  controllers: [RateDailyController, RateRangeController, RateMonthlyController, SurgeController, DiscountCouponSingleUseController, DiscountCouponController, RateMonthlyV2Controller, DiscountRangeController, StopSaleController, MiscChargesController, RateTeacherController],
  providers: [
    RateDailyService,
    RateDailyFileService,
    AdminService,
    CarGroupService,
    CarService,
    RateRangeService,
    RateRangeFileService,
    RateRangeService,
    RateRangeFileService,
    RateMonthlyService,
    RateMonthlyFileService,
    LocationService,
    CacheBustingService,
    CityService,
    CacheService,
    SurgeService,
    DiscountCouponService,
    RateMonthlyV2Service,
    DiscountRangeService,
    StopSaleService,
    InterCitiesChargesService,
    MiscChargeService,
    RateTeacherService
  ],
  imports: [TypeOrmModule.forFeature([
    RateDailyFile,
    RateDaily,
    Admin,
    CarGroup,
    Car,
    RateRange,
    RateRangeFile,
    RateMonthly,
    RateMonthlyFile,
    Location,
    City,
    Surge,
    DiscountCoupon,
    RateMonthlyV2,
    DiscountRange,
    StopSale,
    InterCityCharge,
    MiscCharge,
    RateTeacher
  ])]
})
export class RateModule { }