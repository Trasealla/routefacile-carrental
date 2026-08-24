import { Body, Controller, Get, Inject, Ip, Param, Post, Request, UseGuards, BadRequestException } from '@nestjs/common';
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
import { ExtendBookingService } from '../services/extend.booking.service';
import { BookingRepoService } from '../services/booking.repo.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { MoreThan } from 'typeorm';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { ExtendBookingEvent } from 'src/event/events/extend.booking.event';
import { ExtendActionTypes } from 'src/entities/enums/extend.action.type';
import { SortTypes } from 'src/entities/enums/sort.type';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { BookingPaymentTransactionService } from '../payment/booking.payment.transaction.service';
import {
    PublicExtendLookupDto,
    PublicExtendCheckDto,
    PublicExtendConfirmDto
} from './public.extend.booking.dto';

@ApiTags('public-extend-booking')
@Controller('public/extend/booking')
export class PublicExtendBookingController {

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
     * Step 1: Lookup booking by booking number + email for verification
     * Returns booking details if found and eligible for extension
     */
    @Post('lookup')
    async lookup(@Body() body: PublicExtendLookupDto) {
        const booking = await this.findAndVerifyBooking(body.booking_number, body.email);

        return {
            status: 'success',
            booking: {
                booking_number: booking.booking_number,
                type: booking.type,
                payment_type: booking.payment_type,
                pickup_date_time: booking.pickup_date_time,
                dropoff_date_time: booking.dropoff_date_time,
                car_id: booking.car_id,
                group_id: booking.group_id,
                pickup_location_id: booking.pickup_location_id,
                dropoff_location_id: booking.dropoff_location_id,
                total_amount: booking.total_amount,
                user_first_name: booking.user_first_name,
                user_last_name: booking.user_last_name,
                car_extras: booking.car_extras,
                booking_days: booking.booking_days,
            }
        };
    }

    /**
     * Step 2: Check extension cost without committing
     * Returns the price breakdown for extending to the new dropoff date
     */
    @Post('check')
    async check(@Body() body: PublicExtendCheckDto) {
        const booking = await this.findAndVerifyBooking(body.booking_number, body.email);
        this.validateExtension(booking, body.dropoff_date, body.dropoff_time);

        const extendDto = {
            booking_number: booking.booking_number,
            dropoff_date: body.dropoff_date,
            dropoff_time: body.dropoff_time,
            action_type: ExtendActionTypes.CHECK,
            booking_source: 'web'
        } as any;

        const dropoff_date_time_dto = this.extendBookingService.getDropoffLocationTimeDto(booking, extendDto);
        await this.timeValidationService.validateDropoffTime(dropoff_date_time_dto);

        await this.carService.clearGroupByQuery();
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
        const pickup_location = await this.locationService.getOne({ id: booking.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: booking.dropoff_location_id });

        const car_rate_dto = this.extendBookingService.getDtoForRateCalculation(booking, extendDto) as any;
        const surge_where = {
            end_date: MoreThan(this.extendBookingService.getDropoffDate(booking)),
            status: SurgeService.ACTIVE
        };
        const surge = await this.surgeService.getOne(surge_where);
        const discount_coupon = null;

        const car_rate = await this.bookingService.getDailyCarRate(car_rate_dto, discount_coupon, surge, pickup_location, dropoff_location, misc_charges);
        const car_extras = await this.bookingService.getDailyCarExtraRate(car_rate_dto, discount_coupon, surge, pickup_location) as any;

        const vat_percentage = misc_charges.vat;
        const sub_amount = car_rate.car_rate_total + car_extras.rate + car_rate.vmd_charges;
        const vat_amount = sub_amount * vat_percentage / 100;
        const total_amount = sub_amount + vat_amount;

        const details = await this.extendBookingService.getExtensionDetails(booking, car_rate_dto, surge, pickup_location, dropoff_location, misc_charges);

        return {
            status: 'success',
            extension: {
                extended_days: car_rate.booking_days,
                car_rate: car_rate.car_rate_total,
                car_extras_rate: car_extras.rate,
                vmd_charges: car_rate.vmd_charges,
                pay_now_discount_amount: (booking.payment_type == PaymentTypes.PAY_NOW) ? (car_rate.pay_later - car_rate.pay_now) : 0,
                sub_amount: sub_amount,
                vat_percentage: vat_percentage,
                vat_amount: vat_amount,
                total_amount: total_amount,
            },
            details
        };
    }

    /**
     * Step 3: Confirm extension - creates the extension booking record
     * For PAY_NOW: returns booking_id for payment step
     * For PAY_LATER: confirms immediately and sends notification
     */
    @Post('confirm')
    async confirm(@Body() body: PublicExtendConfirmDto, @Ip() ip: string) {
        const parent_booking = await this.findAndVerifyBooking(body.booking_number, body.email);
        this.validateExtension(parent_booking, body.dropoff_date, body.dropoff_time);

        const extendDto = {
            booking_number: parent_booking.booking_number,
            dropoff_date: body.dropoff_date,
            dropoff_time: body.dropoff_time,
            action_type: ExtendActionTypes.EXTEND,
            booking_source: body.booking_source
        } as any;

        const dropoff_date_time_dto = this.extendBookingService.getDropoffLocationTimeDto(parent_booking, extendDto);
        await this.timeValidationService.validateDropoffTime(dropoff_date_time_dto);

        await this.carService.clearGroupByQuery();
        const user = await this.userService.getOne({ id: parent_booking.user_id });
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
        const pickup_location = await this.locationService.getOne({ id: parent_booking.pickup_location_id });
        const dropoff_location = await this.locationService.getOne({ id: parent_booking.dropoff_location_id });

        const car_rate_dto = this.extendBookingService.getDtoForRateCalculation(parent_booking, extendDto) as any;
        const surge_where = {
            end_date: MoreThan(this.extendBookingService.getDropoffDate(parent_booking)),
            status: SurgeService.ACTIVE
        };
        const surge = await this.surgeService.getOne(surge_where);
        const discount_coupon = null;

        let booking;
        if (parent_booking.type == BookingTypes.DAILY) {
            const car_rate = await this.bookingService.getDailyCarRate(car_rate_dto, discount_coupon, surge, pickup_location, dropoff_location, misc_charges);
            const car_extras = await this.bookingService.getDailyCarExtraRate(car_rate_dto, discount_coupon, surge, pickup_location) as any;
            booking = await this.extendBookingService.extendBooking(car_rate_dto, parent_booking, car_rate, surge, misc_charges, user, car_extras, ip);
        } else {
            const car_rate = await this.bookingService.getDailyCarRate(car_rate_dto, discount_coupon, surge, pickup_location, dropoff_location, misc_charges);
            const car_extras = await this.bookingService.getDailyCarExtraRate(car_rate_dto, discount_coupon, surge, pickup_location) as any;
            booking = await this.extendBookingService.extendBooking(car_rate_dto, parent_booking, car_rate, surge as any, misc_charges, user, car_extras, ip);
        }

        if (parent_booking.payment_type == PaymentTypes.PAY_LATER) {
            this.eventEmitter.emit('extend.booking', new ExtendBookingEvent(booking.id));
            return {
                status: 'success',
                message: 'Booking extended successfully',
                booking,
                payment_required: false
            };
        }

        return {
            status: 'success',
            message: 'Extension created. Please proceed to payment.',
            booking,
            payment_required: true,
            payment_type: parent_booking.payment_type
        };
    }

    /**
     * Find booking by number and verify email ownership
     */
    private async findAndVerifyBooking(booking_number: string, email: string) {
        const booking = await this.bookingRepoService.getOne(
            { booking_number },
            [],
            {},
            '',
            { column: 'id', order: SortTypes.DESC }
        );

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        if (booking.user_email.toLowerCase() !== email.toLowerCase()) {
            throw new BadRequestException('Email does not match booking');
        }

        return booking;
    }

    /**
     * Validate that the booking is eligible for extension
     */
    private validateExtension(booking: any, dropoff_date: string, dropoff_time: string) {
        const current_date_time = new Date();

        if (current_date_time > booking.dropoff_date_time) {
            throw new BadRequestException('Cannot extend if booking has ended');
        }

        // Parse as Morocco time (UTC+1)
        const new_dropoff_datetime = new Date(`${dropoff_date}T${dropoff_time}:00+01:00`);
        if (new_dropoff_datetime <= booking.dropoff_date_time) {
            throw new BadRequestException('New dropoff time must be after the existing dropoff time');
        }

        if (booking.refund_status == RefundStatus.PENDING) {
            throw new BadRequestException('Booking cannot be extended because refund is pending');
        }
    }
}
