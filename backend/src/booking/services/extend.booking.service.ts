
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BookingRepoService } from './booking.repo.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/service/base.service';
import { BookingService } from './booking.service';
import { SortTypes } from 'src/entities/enums/sort.type';
import { ExtendBookingDto } from '../extend.booking/extend.booking.dto';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { Surge } from 'src/entities/surge.entity';
import { User } from 'src/entities/user.entity';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { BookingActions } from 'src/entities/enums/booking.action';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CarRateTypes } from 'src/entities/enums/car.rate.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { ExtendActionTypes } from 'src/entities/enums/extend.action.type';
import { Location } from 'src/entities/location.entity';
import { dailyRateExtendDetailQuery } from '../car_rate_queries/daily.rates.extend.detail.query';
import { dailyExtrasExtendDetailQuery } from '../car_extra_queries/daily.extras.extend.detail.query';

@Injectable()
export class ExtendBookingService extends BaseService<Booking> {

    constructor(
        @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService) {
        super(bookingRepo);
    }

    async validateBooking(body: ExtendBookingDto, user_id: number) {
        const parent_booking = await this.bookingRepoService.getOne(
            { booking_number: body.booking_number, user_id: user_id },
            [],
            {},
            '',
            { column: 'id', order: SortTypes.DESC }
        );

        if (!parent_booking) {
            throw new BadRequestException('Booking not found.');
        }

        if (parent_booking.payment_type == PaymentTypes.PAY_NOW && parent_booking.payment_status == 0) {
          //  throw new BadRequestException('Payment pending for previous booking');
        }

        const current_date_time = new Date();

        // if (current_date_time < parent_booking.pickup_date_time) {
        //     throw new BadRequestException(`Cannot extend the booking which is not started`);
        // }

        if (current_date_time > parent_booking.dropoff_date_time) {
            throw new BadRequestException(`Cannot extend if booking is ended` );
        }

        // Parse as Morocco time (UTC+1): the customer picks a local time
        const new_dropoff_datetime = new Date(`${body.dropoff_date}T${body.dropoff_time}:00+01:00`)
        if (new_dropoff_datetime <= parent_booking.dropoff_date_time) {
            throw new BadRequestException(`New dropoff time cannot be less than the existing one`);
        }

        if (parent_booking.refund_status == RefundStatus.PENDING) {
            throw new BadRequestException('Booking cannnot be edited because refund is pending');
        }

        return parent_booking;
    }

    async extendBooking(
        body: ExtendBookingDto,
        parent_booking: Booking,
        query_booking_data,
        surge: Surge,
        misc_charges,
        user: User,
        car_extras: { car_extras_list: [], rate: number, extra_rate_query: string },
        ip
    ) {
        const booking = new Booking();
        booking.user_request = body;
        // debug start - turn off in future
        booking.rate_query = query_booking_data.rate_query;
        booking.extra_rate_query = car_extras.extra_rate_query;
        // debug end
        const booking_log_number = getCurrentDateFormatted() + Math.round(Math.random() * 1E9);
        booking.booking_number = parent_booking.booking_number;
        booking.booking_log_number = booking_log_number;
        booking.parent_id = parent_booking.id;
        booking.booking_source = body.booking_source;
        booking.payment_type = parent_booking.payment_type;
        booking.action = BookingActions.EXTEND;
        const booking_date = new Date();
        booking.booking_date = booking_date;
        booking.type = BookingTypes.DAILY; // Extension will be converted to daily
        booking.booking_days = query_booking_data.booking_days;

        booking.pickup_type = parent_booking.pickup_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const pickup_date_time = new Date(`${this.getDropoffDate(parent_booking)}T${this.getDropoffTime(parent_booking)}:00+01:00`);
        booking.pickup_date_time = pickup_date_time;
        booking.pickup_location_id = parent_booking.pickup_location_id;
        booking.pickup_city_id = parent_booking.pickup_city_id || query_booking_data.pickup_city_id;
        booking.pickup_coordinates = parent_booking.pickup_coordinates;
        booking.pickup_address = parent_booking.pickup_address;

        booking.dropoff_type = parent_booking.dropoff_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const dropoff_date_time = new Date(`${body.dropoff_date}T${body.dropoff_time}:00+01:00`);
        booking.dropoff_date_time = dropoff_date_time;
        booking.dropoff_location_id = parent_booking.dropoff_location_id;
        booking.dropoff_city_id = parent_booking.dropoff_city_id || query_booking_data.dropoff_city_id;
        booking.dropoff_coordinates = parent_booking.dropoff_coordinates;
        booking.dropoff_address = parent_booking.dropoff_address;

        booking.car_id = parent_booking.car_id;
        booking.group_id = query_booking_data.group_id;
        booking.car_extras = car_extras.car_extras_list;
        booking.car_extras_rate_total = car_extras.rate;

        booking.extra_kms_total_rate = 0;

        booking.pay_now_amount = query_booking_data.pay_now;
        booking.pay_later_amount = query_booking_data.pay_later;


        booking.car_rate_total = query_booking_data.car_rate_total;

        booking.surge_percentage = (surge) ? surge.rate : 0
        booking.surge_amount = query_booking_data.surge;
        booking.surge_details = surge;

        booking.inter_cities_charges = 0
        booking.pickup_parking_charges = 0
        booking.dropoff_parking_charges = 0
        booking.collection_charges = 0
        booking.delivery_charges = 0
        booking.vmd_charges = query_booking_data.vmd_charges
        booking.sub_amount = this.bookingService.calculateSubTotal(booking, query_booking_data, car_extras)

        if (booking.payment_type == PaymentTypes.PAY_NOW && booking.type == BookingTypes.DAILY) {
            booking.pay_now_discount_percentage = misc_charges.pay_now
            booking.pay_now_discount_amount = query_booking_data.pay_later - query_booking_data.pay_now;
        }

        booking.coupon_code = ''
        booking.coupon_details = null;
        booking.coupon_discount_amount = 0;

        booking.vat_percentage = misc_charges.vat;
        booking.vat_amount = (booking.sub_amount * misc_charges.vat / 100);

        booking.total_amount = booking.sub_amount + booking.vat_amount;
        booking.previous_total_amount = parent_booking.total_amount;

        booking.amount_message = `You need to pay ${booking.total_amount}`;

        booking.user_id = user.id
        booking.user_first_name = user.first_name
        booking.user_last_name = user.last_name
        booking.user_email = user.email
        booking.user_phone_code = user.phone_code
        booking.user_phone_number = user.phone_number
        booking.user_country_id = user.country_id
        booking.user_ip = ip.split(":").pop()

        if (body.action_type == ExtendActionTypes.EXTEND) {
            const db_booking = await this.bookingRepo.insert(booking);
            if (db_booking.identifiers[0].id != undefined && db_booking.identifiers[0].id > 0) {
                return {
                    id: db_booking.identifiers[0].id,
                    booking_number: booking.booking_number,
                    message: booking.amount_message
                }
            }
        } else {
            return {
                booking_number: booking.booking_number,
                details: {
                    extended_days: booking.booking_days,
                    car_rate: booking.car_rate_total,
                    pay_now_discount_amount: booking.pay_now_discount_amount,
                    car_extra_rate: booking.car_extras_rate_total,
                    vmd: booking.vmd_charges,
                    sub_amount: booking.sub_amount,
                    vat: booking.vat_amount,
                    total: booking.total_amount
                },
                message: booking.amount_message
            }
        }

        throw new BadRequestException('Something went wrong' + JSON.stringify(body));
    }

    getDropoffLocationTimeDto(booking: Booking, body) {
        return {
            pickup_time: this.getPickupTime(booking),
            pickup_date: this.getPickupDate(booking),
            dropoff_time: body.dropoff_time,
            dropoff_date: body.dropoff_date,
            dropoff_address: booking.dropoff_address,
            dropoff_coordinates: booking.dropoff_coordinates,
            dropoff_city_id: booking.dropoff_city_id,
            dropoff_location_id: booking.dropoff_location_id,
            dropoff_type: booking.dropoff_type,
            booking_type: booking.type
        }
    }

    getPickupTime(booking: Booking) {
        const pickup_date_time = new Date(booking.pickup_date_time);
        const pickup_hours = pickup_date_time.getHours().toString().padStart(2, '0');
        const pickup_minutes = pickup_date_time.getMinutes().toString().padStart(2, '0');

        return `${pickup_hours}:${pickup_minutes}`;
    }

    getPickupDate(booking: Booking) {
        const pickup_date_time = new Date(booking.pickup_date_time);
        const pickup_year = pickup_date_time.getFullYear().toString();
        const pickup_month = (pickup_date_time.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-based month
        const pickup_day = pickup_date_time.getDate().toString().padStart(2, '0');

        return `${pickup_year}-${pickup_month}-${pickup_day}`;
    }

    getDropoffTime(booking: Booking) {
        const dropoff_date_time = new Date(booking.dropoff_date_time);
        const dropoff_hours = dropoff_date_time.getHours().toString().padStart(2, '0');
        const dropoff_minutes = dropoff_date_time.getMinutes().toString().padStart(2, '0');

        return `${dropoff_hours}:${dropoff_minutes}`;
    }

    getDropoffDate(booking: Booking) {
        const dropoff_date_time = new Date(booking.dropoff_date_time);
        const dropoff_year = dropoff_date_time.getFullYear().toString();
        const dropoff_month = (dropoff_date_time.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-based month
        const dropoff_day = dropoff_date_time.getDate().toString().padStart(2, '0');

        return `${dropoff_year}-${dropoff_month}-${dropoff_day}`;
    }

    getDtoForRateCalculation(booking: Booking, body: ExtendBookingDto) {
        return {
            action_type: body.action_type,
            booking_source: body.booking_source,
            booking_number: body.booking_number,
            booking_type: booking.type,
            car_id: booking.car_id,
            pickup_type: booking.pickup_type,
            pickup_date: this.getDropoffDate(booking),
            pickup_time: this.getDropoffTime(booking),
            pickup_location_id: booking.pickup_location_id,
            pickup_coordinates: booking.pickup_coordinates,
            pickup_address: booking.pickup_address,
            pickup_city_id: booking.pickup_city_id,
            dropoff_type: booking.dropoff_type,
            dropoff_date: body.dropoff_date,
            dropoff_time: body.dropoff_time,
            dropoff_location_id: booking.dropoff_location_id,
            dropoff_city_id: booking.dropoff_city_id,
            dropoff_coordinates: booking.dropoff_coordinates,
            dropoff_address: booking.dropoff_address,
            booking_months: booking.booking_months,
            comments: '',
            km_plan: booking.extra_kms_per_month,
            payment_type: booking.payment_type,
            discount_coupon: '',
            car_extras: booking.car_extras,
            booking_days: booking.booking_days,
            one_day_rate: 0,
            rate_from_range: 0,
            rate_from_daily: 0,
            inter_cities_charges: booking.inter_cities_charges,
            pickup_parking_charges: booking.pickup_parking_charges,
            dropoff_parking_charges: booking.dropoff_parking_charges,
            delivery_charges: booking.delivery_charges,
            collection_charges: booking.collection_charges,
            discount: 0,
            surge: 0,
            vmd_charges: booking.vmd_charges,
            extra_kms: null,
            monthly_mileage: 0
        }
    }

    async getExtensionDetails(booking: Booking, car_rate_dto: any, surge: Surge, pickup_location: Location, dropoff_location: Location, misc_charges: any) {
        return {
            car_rate: await this.getDailyCarRateDetails(car_rate_dto, surge, pickup_location, dropoff_location, misc_charges),
            car_extras: (booking.car_extras.length > 0) ? await this.getDailyCarExtraRateDetails(booking, car_rate_dto, surge, pickup_location) as any : {}
        }
    }
    async getDailyCarRateDetails(body: any, surge: Surge, pickup_location: Location, dropoff_location: Location, misc_charges: any) {
        const daily_rate_extend_detail_query = dailyRateExtendDetailQuery(
            body.pickup_type,
            body.dropoff_type,
            body.pickup_city_id || pickup_location.city_id,
            body.dropoff_city_id || dropoff_location.city_id,
            body.pickup_location_id,
            body.dropoff_location_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            misc_charges,
            surge,
            body.car_id
        );
        
        return await this.executeRawQuery(daily_rate_extend_detail_query);
    }
    async getDailyCarExtraRateDetails(booking: Booking, body: any, surge: Surge, pickup_location: Location) {
        const query = dailyExtrasExtendDetailQuery(
            booking,
            body.pickup_city_id || pickup_location.city_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            body.car_id,
            surge
        );
        
        return await this.executeRawQueryWithParams(query)
    }
}
