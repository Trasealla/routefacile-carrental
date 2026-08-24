import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfirmBookingDto } from '../confirm.booking/confirm.booking.dto';
import { Surge } from 'src/entities/surge.entity';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { dailyRateQuery } from '../car_rate_queries/daily.rates.query';
import { Location } from 'src/entities/location.entity';
import { BaseService } from 'src/service/base.service';
import { Booking } from 'src/entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { dailyExtrasQuery } from '../car_extra_queries/daily.extras.query';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { BookingActions } from 'src/entities/enums/booking.action';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { User } from 'src/entities/user.entity';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { monthlyRateQueryV2 } from '../car_rate_queries/monthly.rates.query.v2';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { monthlyExtrasQueryV2 } from '../car_extra_queries/monthly.extras.query.v2';
import { BookingMonthlyInstallmentService } from './booking.monthly.installment.service';
import { DiscountRangeService } from '../car.search/discount.range.service';
import { BOOKING_NUMBER_PREFIX } from 'src/config/contants';

@Injectable()
export class BookingService extends BaseService<Booking> {

    static PAYMENT_STATUS_DONE = 1;

    constructor(
        @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
        @Inject(RateMonthlyV2Service) private rateMonthlyV2Service: RateMonthlyV2Service,
        @Inject(BookingMonthlyInstallmentService) private bookingMonthlyInstallmentService: BookingMonthlyInstallmentService,
        @Inject(DiscountRangeService) private discountRangeService: DiscountRangeService
    ) {
        super(bookingRepo);
    }

    async getDailyCarRate(
        body: ConfirmBookingDto,
        discount_coupon: DiscountCoupon,
        surge: Surge,
        pickup_location: Location,
        dropoff_location: Location,
        misc_charges: object,
        include_inactive: boolean = false,
    ) {
        const daily_rate_query = dailyRateQuery(
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
            discount_coupon,
            surge,
            body.car_id,
            0,
            undefined,
            undefined,
            undefined,
            undefined,
            include_inactive,
        );

        const car_rate = await this.executeRawQuery(daily_rate_query);

        if (car_rate.length == 0) {
            console.warn('[BookingService.getDailyCarRate] No rate available', {
                car_id: body.car_id,
                pickup_city_id: body.pickup_city_id || pickup_location?.city_id,
                pickup_date: body.pickup_date,
                dropoff_date: body.dropoff_date,
                booking_number: (body as any).booking_number,
            });
            throw new BadRequestException('No rates available for the selected car and dates. Please choose a different date range or car.');
        }
        const return_obj = car_rate[0];
        return_obj.rate_query = daily_rate_query;
        return return_obj
    }

    async getDailyCarExtraRate(
        body: ConfirmBookingDto,
        discount_coupon: DiscountCoupon,
        surge: Surge,
        pickup_location: Location
    ) {
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

        const extras = await this.executeRawQuery(query);
        const car_extras_list = [];
        let rate = 0;
        if (body.car_extras && body.car_extras.length > 0 && extras.length > 0) {
            const added_extras = [];
            for (const extra_obj of body.car_extras) {
                if (!added_extras.includes(extra_obj.type)) {
                    added_extras.push(extra_obj.type);
                    const extra_obj_quantity = extra_obj.quantity ? extra_obj.quantity : 1;
                    const store_extra_obj = {
                        type: extra_obj.type,
                        org_price: extras[0][`org_${extra_obj.type}`],
                        quantity: extra_obj_quantity,
                        discount: extras[0][`discount_${extra_obj.type}`],
                        surge: extras[0][`surge_${extra_obj.type}`],
                        rate: extras[0][extra_obj.type] * extra_obj_quantity
                    }
                    rate += extras[0][extra_obj.type] * extra_obj_quantity
                    car_extras_list.push(store_extra_obj)
                }

            }
        }

        return { car_extras_list, rate, extra_rate_query: query };
    }

    async saveBooking(
        body: ConfirmBookingDto,
        booking_data,
        surge: Surge,
        discount_coupon: DiscountCoupon,
        misc_charges,
        user: User,
        car_extras: { car_extras_list: [], rate: number, per_month_rate: number, flexi_days_rate: number, extra_rate_query: string },
        ip
    ) {
        const booking = new Booking();
        booking.user_request = body;
        // debug start - turn off in future
        booking.rate_query = booking_data.rate_query;
        booking.extra_rate_query = car_extras.extra_rate_query;
        // debug end
        booking.booking_number = `${BOOKING_NUMBER_PREFIX}${await this.getLastBookingId()}`;
        const booking_log_number = getCurrentDateFormatted() + Math.round(Math.random() * 1E9);
        booking.booking_log_number = booking_log_number;
        booking.booking_source = body.booking_source;
        booking.payment_type = body.payment_type;
        booking.action = BookingActions.BOOK;
        const booking_date = new Date();

        booking.booking_date = booking_date;
        booking.type = body.booking_type; // Daily or Monthly
        booking.booking_days = booking_data.booking_days;
        booking.booking_months = booking_data.booking_months;

        booking.pickup_type = body.pickup_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const pickup_date_time = new Date(`${body.pickup_date}T${body.pickup_time}:00+01:00`);
        booking.pickup_date_time = pickup_date_time;
        booking.pickup_location_id = body.pickup_location_id;
        booking.pickup_city_id = body.pickup_city_id || booking_data.pickup_city_id;
        booking.pickup_coordinates = body.pickup_coordinates;
        booking.pickup_address = body.pickup_address;

        booking.dropoff_type = body.dropoff_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const dropoff_date_time = new Date(`${body.dropoff_date}T${body.dropoff_time}:00+01:00`);
        booking.dropoff_date_time = dropoff_date_time;
        booking.dropoff_location_id = body.dropoff_location_id;
        booking.dropoff_city_id = body.dropoff_city_id || booking_data.dropoff_city_id;
        booking.dropoff_coordinates = body.dropoff_coordinates;
        booking.dropoff_address = body.dropoff_address;

        booking.comments = body.comments;

        booking.car_id = body.car_id;
        booking.group_id = booking_data.group_id;
        booking.car_extras = car_extras.car_extras_list;
        booking.car_extras_rate_total = car_extras.rate;
        booking.extra_kms_total_rate = 0;
        booking.pay_now_amount = booking_data.pay_now;
        booking.pay_later_amount = booking_data.pay_later;
        if (booking.type == BookingTypes.MONTHLY) {

            booking.per_month_rate = booking_data.org_per_month_rate;
            booking.flexi_days_rate = booking_data.org_flexi_days_rate;
            booking.monthly_mileage = body.monthly_mileage;
            booking.flexi_days = booking_data.flexi_days;
        }

        booking.car_rate_total = booking_data.car_rate_total;

        booking.surge_percentage = (surge) ? surge.rate : 0
        booking.surge_amount = booking_data.surge;
        booking.surge_details = surge;


        booking.inter_cities_charges = booking_data.inter_cities_charges
        booking.pickup_parking_charges = booking_data.pickup_parking_charges
        booking.dropoff_parking_charges = booking_data.dropoff_parking_charges
        booking.collection_charges = booking_data.collection_charges
        booking.delivery_charges = booking_data.delivery_charges
        booking.vmd_charges = booking_data.vmd_charges
        booking.sub_amount = this.calculateSubTotal(booking, booking_data, car_extras)

        if (booking.payment_type == PaymentTypes.PAY_NOW) {
            if(booking.type == BookingTypes.DAILY) {
                booking.pay_now_discount_percentage = misc_charges.pay_now
                booking.pay_now_discount_amount = booking_data.pay_later - booking_data.pay_now;
            } else {
                booking.pay_now_discount_amount = misc_charges.monthly_pay_now_discount
            }
        }

        booking.coupon_code = body.discount_coupon
        booking.coupon_details = discount_coupon;
        booking.coupon_discount_amount = booking_data.discount;

        booking.vat_percentage = misc_charges.vat;
        booking.vat_amount = (booking.sub_amount * misc_charges.vat / 100);

        booking.total_amount = booking.sub_amount + booking.vat_amount;
        booking.user_id = user.id
        booking.user_first_name = user.first_name
        booking.user_last_name = user.last_name
        booking.user_email = user.email
        booking.user_phone_code = user.phone_code
        booking.user_phone_number = user.phone_number
        booking.user_country_id = user.country_id
        booking.user_ip = ip.split(":").pop()
        
        // Store Adjust device ID for S2S attribution tracking
        if (body.adjust_device_id) {
            booking.adjust_device_id = body.adjust_device_id;
        }

        const db_booking = await this.bookingRepo.insert(booking);
        if (db_booking.identifiers[0].id != undefined && db_booking.identifiers[0].id > 0) {
            if (booking.type == BookingTypes.MONTHLY) {
                const installments = await this.bookingMonthlyInstallmentService.prepareInstallments(body, booking_data, car_extras, booking.extra_kms_per_month_rate, null)
                await this.bookingMonthlyInstallmentService.saveInstallments(installments, db_booking.identifiers[0].id, booking_date)
            }
            return {
                id: db_booking.identifiers[0].id,
                booking_number: booking.booking_number
            }
        }
        throw new BadRequestException('Something went wrong' + JSON.stringify(body));
    }

    calculateSubTotal(booking, booking_data, car_extras) {
        let rate;
        if (booking.type == BookingTypes.DAILY) {
            rate = (booking.payment_type == PaymentTypes.PAY_LATER) ? booking_data.pay_later : booking_data.pay_now;
        } else {
            rate = booking_data.car_rate_total;
        }
        console.log(
            'car rate: ' + parseInt(rate) + ' - ' +
            'pickup parking: ' + parseInt(booking.pickup_parking_charges) + ' ' +
            'dropoff parking:' + parseInt(booking.dropoff_parking_charges) + ' ' +
            'collection: ' + parseInt(booking.collection_charges) + ' ' +
            'delivery: ' + parseInt(booking.delivery_charges) + ' ' +
            'inter cities: ' + parseInt(booking.inter_cities_charges) + ' ' +
            'VMD: ' + parseInt(booking.vmd_charges) + ' ' +
            'extra kms: ' + parseFloat(booking.extra_kms_total_rate) + ' ' +
            'car extras: ' + parseInt(car_extras.rate)
        )

        const sub_total = (
            parseFloat(rate) +
            parseFloat(booking.pickup_parking_charges) +
            parseFloat(booking.dropoff_parking_charges) +
            parseFloat(booking.collection_charges) +
            parseFloat(booking.delivery_charges) +
            parseFloat(booking.inter_cities_charges) +
            parseFloat(booking.vmd_charges) +
            parseFloat(booking.extra_kms_total_rate) +
            parseFloat(car_extras.rate)
        );

        return sub_total;
    }

    async getMonthlyCarRate(
        body: ConfirmBookingDto,
        pickup_location: Location,
        dropoff_location: Location,
        misc_charges: object,
        discount_coupon: DiscountCoupon
    ) {
        const monthly_rate_query = monthlyRateQueryV2(
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
            body.booking_months,
            misc_charges,
            discount_coupon,
            body.monthly_mileage,
            body.car_id
        );
        
        const car_rate = await this.executeRawQuery(monthly_rate_query);

        if (car_rate.length == 0) {
            console.warn('[BookingService.getMonthlyCarRate] No rate available', {
                car_id: body.car_id,
                pickup_city_id: body.pickup_city_id || pickup_location?.city_id,
                pickup_date: body.pickup_date,
                dropoff_date: body.dropoff_date,
                booking_months: body.booking_months,
            });
            throw new BadRequestException('No monthly rates available for the selected car and dates.');
        }

        return car_rate[0];
    }

    async getMonthlyCarExtraRate(body: ConfirmBookingDto, pickup_location: Location) {

        const query = monthlyExtrasQueryV2(
            body.pickup_city_id || pickup_location.city_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            body.car_id,
            body.monthly_mileage
        );

        const extras = await this.executeRawQuery(query);

        const car_extras_list = [];
        let rate = 0;
        let per_month_rate = 0;
        let flexi_days_rate = 0;
        if (body.car_extras && body.car_extras.length > 0 && extras.length > 0) {
            for (const extra_obj of body.car_extras) {
                const extra_obj_quantity = extra_obj.quantity ? extra_obj.quantity : 1;
                const store_extra_obj = {
                    type: extra_obj.type,
                    quantity: extra_obj_quantity,
                    rate: extras[0][extra_obj.type] * extra_obj_quantity,
                    per_month_rate: extras[0][`${extra_obj.type}_per_month_rate`]
                }
                per_month_rate += extras[0][`${extra_obj.type}_per_month_rate`] * extra_obj_quantity
                flexi_days_rate += extras[0][`${extra_obj.type}_flexi_days_rate`] * extra_obj_quantity
                rate += extras[0][extra_obj.type] * extra_obj_quantity
                car_extras_list.push(store_extra_obj)
            }
        }

        return { car_extras_list, rate, per_month_rate, flexi_days_rate };
    }
    async getLastBookingId() {
        const last_booking_query = 'SELECT MAX(id) AS max_id FROM bookings';

        const result = await this.executeRawQuery(last_booking_query);
        
        return JSON.parse(JSON.stringify(result))[0].max_id + 1;
    }
}