import { Body, Controller, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { BookingMonthlyInstallmentService } from '../services/booking.monthly.installment.service';
import { MiscChargeService } from '../car.search/misc.charge.service';
import { TimeValidationService } from '../services/time.validation.service';
import { LocationService } from 'src/location/location.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { ConfirmBookingDto } from '../confirm.booking/confirm.booking.dto';
import { BookingService } from '../services/booking.service';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { MoreThan } from 'typeorm';
import { DiscountCouponService } from '../car.search/discount.coupon.service';

@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('booking/monthly/installment')
export class MonthlyInstallmentController {

    constructor(
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
        @Inject(BookingMonthlyInstallmentService) private bookingMonthlyInstallmentService: BookingMonthlyInstallmentService,
        @Inject(RateMonthlyV2Service) private rateMonthlyV2Service: RateMonthlyV2Service
    ) { }

    @Post()
    async installments(@Body() body: ConfirmBookingDto) {
        await this.timeValidationService.validatePickupTime(body);
        await this.timeValidationService.validateDropoffTime(body);
        await this.miscChargeService.clearGroupByQuery();

        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = await this.locationService.getOne({ id: body.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: body.dropoff_location_id });

        if (body.booking_type == BookingTypes.MONTHLY) {
            await this.timeValidationService.validateMonthlyDropoffTime(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
            const discount_coupon_where = {
                type: CouponTypes.MONTHLY,
                code: body.discount_coupon,
                end_date: MoreThan(body.pickup_date),
                status: DiscountCouponService.ACTIVE
            }

            const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
            const car_rate = await this.bookingService.getMonthlyCarRate(
                body,
                pickup_location,
                dropoff_location,
                misc_charges,
                discount_coupon
            );

            const car_extras = await this.bookingService.getMonthlyCarExtraRate(body, pickup_location) as any;
            let extra_kms_per_month_rate = 0;
            
            if (body.extra_kms) {
                const rate_monthly = await this.rateMonthlyV2Service.getOne({ id: car_rate.rate_id });
                 extra_kms_per_month_rate = rate_monthly[`extra_${body.extra_kms}_km_rate`];
            }
            
            
            return {
                booking_months: car_rate.booking_months,
                booking_days: car_rate.booking_days,
                flexi_days: car_rate.flexi_days,
                installments: await this.bookingMonthlyInstallmentService.prepareInstallments(body, car_rate, car_extras, extra_kms_per_month_rate, null)
            }
        }
    }
}
