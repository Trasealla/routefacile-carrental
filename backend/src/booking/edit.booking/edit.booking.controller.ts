import { Body, Controller, Inject, Ip, Post, Request, UseGuards } from '@nestjs/common';
import { CarService } from 'src/car/car.service';
import { DiscountCouponService } from '../car.search/discount.coupon.service';
import { SurgeService } from '../car.search/surge.service';
import { MiscChargeService } from '../car.search/misc.charge.service';
import { TimeValidationService } from '../services/time.validation.service'; 
import { LocationService } from 'src/location/location.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { MoreThan } from 'typeorm';
import { BookingService } from '../services/booking.service'; 
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditBookingDto } from './edit.booking.dto';
import { EditBookingService } from '../services/edit.booking.service'; 
import { EditBookingEvent } from 'src/event/events/edit.booking.event';


@ApiTags('booking-form')
@UseGuards(JwtAuthGuard)
@Controller('edit/booking')
export class EditBookingController {
    constructor(
        @Inject(CarService) private carService: CarService,
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(UserService) private userService: UserService,
        @Inject(EditBookingService) private editBookingService: EditBookingService,
        private readonly eventEmitter: EventEmitter2

    ) { }

    @Post()
    async edit(@Body() body: EditBookingDto, @Request() req, @Ip() ip) {
        const parent_booking = await this.editBookingService.validateBooking(body, req.user.id);
        
        await this.timeValidationService.validatePickupTime(body);
        await this.timeValidationService.validateDropoffTime(body);
        
        await this.carService.clearGroupByQuery();
        const user = await this.userService.getOne({ id: req.user.id });
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = await this.locationService.getOne({ id: body.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: body.dropoff_location_id });
        await this.locationService.validateLocation(pickup_location, dropoff_location, body.dropoff_type, body.pickup_type, body.dropoff_city_id);

        let booking;
        if (body.booking_type == BookingTypes.DAILY) {
            const discount_coupon_where = {
                type: CouponTypes.DAILY,
                code: body.discount_coupon,
                end_date: MoreThan(body.pickup_date),
                status: DiscountCouponService.ACTIVE
            }
            const surge_where = {
                end_date: MoreThan(body.pickup_date),
                status: SurgeService.ACTIVE
            }

            const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
            const surge = await this.surgeService.getOne(surge_where);

            const car_rate = await this.bookingService.getDailyCarRate(body, discount_coupon, surge, pickup_location, dropoff_location, misc_charges);

            const car_extras = await this.bookingService.getDailyCarExtraRate(body, discount_coupon, surge, pickup_location) as any;

            booking = await this.editBookingService.editBooking(body, parent_booking, car_rate, surge, discount_coupon, misc_charges, user, car_extras, ip);
            
        } else {
            await this.timeValidationService.validateMonthlyDropoffTime(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
            const car_rate = await this.bookingService.getMonthlyCarRate(
                body,
                pickup_location,
                dropoff_location,
                misc_charges,
                null
            );

            const car_extras = await this.bookingService.getMonthlyCarExtraRate(body, pickup_location) as any;

            booking = await this.editBookingService.editBooking(body, parent_booking, car_rate, null, null, misc_charges, user, car_extras, ip);
        }
        if (parent_booking.payment_type == PaymentTypes.PAY_LATER || booking.refund_email || booking.same_amount_check) {
            this.eventEmitter.emit('edit.booking', new EditBookingEvent(booking.id));
        }

        return { 
            status: 'success',
            booking, 
            payment_type: body.payment_type
        }
    }
}