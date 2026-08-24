import { Body, Controller, Get, Inject, Ip, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CarService } from 'src/car/car.service';
import { SurgeService } from '../car.search/surge.service';
import { MiscChargeService } from '../car.search/misc.charge.service';
import { TimeValidationService } from '../services/time.validation.service'; 
import { LocationService } from 'src/location/location.service';
import { BookingService } from '../services/booking.service'; 
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExtendBookingDto } from './extend.booking.dto';
import { ExtendBookingService } from '../services/extend.booking.service'; 
import { BookingRepoService } from '../services/booking.repo.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { MoreThan } from 'typeorm';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { ExtendBookingEvent } from 'src/event/events/extend.booking.event';
import { ExtendActionTypes } from 'src/entities/enums/extend.action.type';
import { SortTypes } from 'src/entities/enums/sort.type';
import { RefundStatus } from 'src/entities/enums/refund.status';

@ApiTags('booking-form')
@UseGuards(JwtAuthGuard)
@Controller('extend/booking')
export class ExtendBookingController {

    constructor(
        @Inject(CarService) private carService: CarService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(UserService) private userService: UserService,
        @Inject(ExtendBookingService) private extendBookingService: ExtendBookingService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        private readonly eventEmitter: EventEmitter2

    ) { }

    /**
     * Check if a booking is eligible for extension.
     * Used by the frontend to show/hide the "Extend Booking" option in My Account.
     */
    @Get('eligibility/:booking_number')
    async checkEligibility(@Param('booking_number') booking_number: string, @Request() req) {
        const booking = await this.bookingRepoService.getOne(
            { booking_number, user_id: req.user.id },
            [],
            {},
            '',
            { column: 'id', order: SortTypes.DESC }
        );

        if (!booking) {
            return { eligible: false, reason: 'Booking not found' };
        }

        const current_date_time = new Date();

        if (current_date_time > booking.dropoff_date_time) {
            return { eligible: false, reason: 'Booking has ended' };
        }

        if (booking.refund_status == RefundStatus.PENDING) {
            return { eligible: false, reason: 'Refund is pending' };
        }

        if (booking.payment_type == PaymentTypes.PAY_NOW && booking.payment_status == 0) {
            return { eligible: false, reason: 'Payment pending for this booking' };
        }

        return {
            eligible: true,
            booking: {
                booking_number: booking.booking_number,
                type: booking.type,
                payment_type: booking.payment_type,
                pickup_date_time: booking.pickup_date_time,
                dropoff_date_time: booking.dropoff_date_time,
                car_id: booking.car_id,
                total_amount: booking.total_amount
            }
        };
    }

    @Post()
    async extend(@Body() body: ExtendBookingDto, @Request() req, @Ip() ip) {

        const parent_booking = await this.extendBookingService.validateBooking(body, req.user.id);
        const dropoff_date_time_dto = this.extendBookingService.getDropoffLocationTimeDto(parent_booking, body);
        await this.timeValidationService.validateDropoffTime(dropoff_date_time_dto);

        await this.carService.clearGroupByQuery();
        const user = await this.userService.getOne({ id: req.user.id });
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = await this.locationService.getOne({ id: parent_booking.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: parent_booking.dropoff_location_id });

        let booking;
        const car_rate_dto = this.extendBookingService.getDtoForRateCalculation(parent_booking, body)
        
        const discount_coupon = null;

        
        const surge_where = {
            end_date: MoreThan(this.extendBookingService.getDropoffDate(parent_booking)),
            status: SurgeService.ACTIVE
        }

        const surge = await this.surgeService.getOne(surge_where);

        if (parent_booking.type == BookingTypes.DAILY) {
            const car_rate = await this.bookingService.getDailyCarRate(car_rate_dto, discount_coupon, surge, pickup_location, dropoff_location, misc_charges, true);
            const car_extras = await this.bookingService.getDailyCarExtraRate(car_rate_dto, discount_coupon, surge, pickup_location) as any;
            booking = await this.extendBookingService.extendBooking(car_rate_dto, parent_booking, car_rate, surge, misc_charges, user, car_extras, ip);

        } else {

            const car_rate = await this.bookingService.getDailyCarRate(car_rate_dto, discount_coupon, surge, pickup_location, dropoff_location, misc_charges, true);

            const car_extras = await this.bookingService.getDailyCarExtraRate(car_rate_dto, discount_coupon, surge, pickup_location) as any;

            booking = await this.extendBookingService.extendBooking(car_rate_dto, parent_booking, car_rate, null, misc_charges, user, car_extras, ip);

        }
        const details =await this.extendBookingService.getExtensionDetails(parent_booking, car_rate_dto, surge, pickup_location, dropoff_location, misc_charges);
        if (parent_booking.payment_type == PaymentTypes.PAY_LATER && body.action_type == ExtendActionTypes.EXTEND) {
            this.eventEmitter.emit('extend.booking', new ExtendBookingEvent(booking.id));
        }

        return {
            status: 'success',
            booking,
            payment_type: parent_booking.payment_type,
            details
        }
    }
}
