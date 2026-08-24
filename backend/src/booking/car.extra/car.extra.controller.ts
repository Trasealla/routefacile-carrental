import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { CarService } from 'src/car/car.service';
import { SurgeService } from '../car.search/surge.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CarExtraDto } from './car.extra.dto';
import { MoreThan } from 'typeorm';
import { dailyExtrasQuery } from '../car_extra_queries/daily.extras.query';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { TimeValidationService } from '../services/time.validation.service';
import { LocationService } from 'src/location/location.service';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { DiscountCouponService } from '../car.search/discount.coupon.service';
import { monthlyExtrasQueryV2 } from '../car_extra_queries/monthly.extras.query.v2';
import { DiscountRangeService } from '../car.search/discount.range.service';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('booking/form/car/extra')
export class CarExtraController {

    constructor(
        @Inject(CarService) private carService: CarService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
        @Inject(DiscountRangeService) private discountRangeService: DiscountRangeService
    ) { }

    @Post()
    async carSearch(@Body() body: CarExtraDto) {
        await this.timeValidationService.validatePickupTime(body);
        await this.timeValidationService.validateDropoffTime(body);
        await this.carService.clearGroupByQuery();

        const pickup_location = await this.locationService.getOne({ id: body.pickup_location_id });

        if (body.booking_type == BookingTypes.DAILY) {

            const discount_coupon_where = {
                type: CouponTypes.DAILY,
                code: body.discount_coupon,
                end_date: MoreThan(body.pickup_date),
                status: DiscountCouponService.ACTIVE
            }
            const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
            
            const surge = await this.surgeService.getOne({ end_date: MoreThan(body.pickup_date), status: SurgeService.ACTIVE });
            const discount_range = await this.discountRangeService.getDiscountRange(body)
            const query = dailyExtrasQuery(
                body.pickup_city_id || pickup_location.city_id,
                body.pickup_date,
                body.pickup_time,
                body.dropoff_date,
                body.dropoff_time,
                body.car_id,
                discount_range.data,
                surge,
                discount_coupon
            );
            return await this.carService.executeRawQuery(query);

        } else {
            await this.timeValidationService.validateMonthlyDropoffTime(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
            const query = monthlyExtrasQueryV2(
                body.pickup_city_id || pickup_location.city_id,
                body.pickup_date,
                body.pickup_time,
                body.dropoff_date,
                body.dropoff_time,
                body.car_id,
                body.monthly_mileage
            );
            return await this.carService.executeRawQuery(query);
        }
    }
}
