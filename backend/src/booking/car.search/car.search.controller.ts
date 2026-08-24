import { Body, Controller, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CarSearchDto } from './car.search.dto';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CarSearchQueryDto } from './car.search.query.dto';
import { DiscountCouponService } from './discount.coupon.service';
import { MoreThan, MoreThanOrEqual } from 'typeorm';
import { SurgeService } from './surge.service';
import { MiscChargeService } from './misc.charge.service';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { TimeValidationService } from '../services/time.validation.service'; 
import { LocationService } from 'src/location/location.service';
import { CarSearchService } from './car.search.service';
import { BookingFormSubmissionService } from '../services/booking.form.submission.service';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('booking/form/car/search')
export class CarSearchController {
    constructor(
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(CarSearchService) private carSearchService: CarSearchService,
        @Inject(BookingFormSubmissionService) private bookingFormSubmissionService: BookingFormSubmissionService
    ) { }

    @Post()
    async carSearch(@Body() body: CarSearchDto, @Query() params: CarSearchQueryDto) {
        // Use unique timer label per request to avoid conflicts
        const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const carSearchLabel = `carSearch-${requestId}`;
        const getPaginatedRatesLabel = body.booking_type == BookingTypes.DAILY 
            ? `getPaginatedDailyRates-${requestId}` 
            : `getPaginatedMonthlyRates-${requestId}`;
        
        console.time(carSearchLabel);
        
        console.time('validatePickupTime');
        await this.timeValidationService.validatePickupTime(body);
        console.timeEnd('validatePickupTime');
        
        console.time('validateDropoffTime');
        await this.timeValidationService.validateDropoffTime(body);
        console.timeEnd('validateDropoffTime');
        
        console.time('validateDiscountCoupon');
        await this.discountCouponService.validateDiscountCoupon(body);
        console.timeEnd('validateDiscountCoupon');
        
        console.time('clearGroupByQuery');
        await this.miscChargeService.clearGroupByQuery();
        console.timeEnd('clearGroupByQuery');

        console.time('getMiscCharges');
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
        console.timeEnd('getMiscCharges');

        console.time('getLocations');
        const pickup_location = await this.locationService.getOne({ id: body.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: body.dropoff_location_id });
        console.timeEnd('getLocations');
        
        console.time('storeFormSubmission');
        this.bookingFormSubmissionService.store(body);
        console.timeEnd('storeFormSubmission');
        
        console.time('validateLocation');
        await this.locationService.validateLocation(pickup_location, dropoff_location, body.dropoff_type, body.pickup_type, body.dropoff_city_id);
        console.timeEnd('validateLocation');
        
        try {
            if (body.booking_type == BookingTypes.DAILY) {
                const discount_coupon_where = {
                    type: CouponTypes.DAILY,
                    code: body.discount_coupon,
                    end_date: MoreThan(body.pickup_date),
                    status: DiscountCouponService.ACTIVE
                }
                const surge_where = {
                    end_date: MoreThanOrEqual(body.pickup_date),
                    status: SurgeService.ACTIVE
                }

                const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
                const surge = await this.surgeService.getOne(surge_where, [], {}, null, { column: 'created_at', order: 'DESC' });

                console.time(getPaginatedRatesLabel);
                const result = await this.carSearchService.getPaginatedDailyRates(
                    body,
                    params,
                    pickup_location,
                    dropoff_location,
                    misc_charges,
                    discount_coupon,
                    surge
                );
                console.timeEnd(getPaginatedRatesLabel);
                return result;
            } else { // Monthly
                await this.timeValidationService.validateMonthlyDropoffTime(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
                const discount_coupon_where = {
                    type: CouponTypes.MONTHLY,
                    code: body.discount_coupon,
                    end_date: MoreThan(body.pickup_date),
                    status: DiscountCouponService.ACTIVE
                }

                const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);

                console.time(getPaginatedRatesLabel);
                const result = await this.carSearchService.getPaginatedMonthlyRates(
                    body,
                    params,
                    pickup_location,
                    dropoff_location,
                    misc_charges,
                    discount_coupon
                );
                console.timeEnd(getPaginatedRatesLabel);
                return result;
            }
        } finally {
            // Ensure timer is always ended, even if there's an error
            console.timeEnd(carSearchLabel);
        }
    }
}
