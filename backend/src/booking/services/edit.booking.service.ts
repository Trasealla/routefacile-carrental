
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BookingRepoService } from './booking.repo.service';
import { EditBookingDto } from '../edit.booking/edit.booking.dto'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/service/base.service';
import { BookingService } from './booking.service';
import { Surge } from 'src/entities/surge.entity';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { User } from 'src/entities/user.entity';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { BookingActions } from 'src/entities/enums/booking.action';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { MODIFY_BOOKING_BUFFER } from 'src/config/contants';
import { SortTypes } from 'src/entities/enums/sort.type';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { BookingMonthlyInstallmentService } from './booking.monthly.installment.service';

@Injectable()
export class EditBookingService extends BaseService<Booking> {

    constructor(
        @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(RateMonthlyV2Service) private rateMonthlyV2Service: RateMonthlyV2Service,
        @Inject(BookingMonthlyInstallmentService) private bookingMonthlyInstallmentService: BookingMonthlyInstallmentService) {
        super(bookingRepo);
    }

    async validateBooking(body: EditBookingDto, user_id: number) {
        const relations = {
            monthly_installments: {
                columns: ['id', 'installment_no', 'total_amount', 'previous_total_amount', 'booking_id', 'actual_amount']
            }
        }
        const parent_booking = await this.bookingRepoService.getOne(
            { booking_number: body.booking_number, user_id: user_id },
            [],
            relations,
            BookingService.LEFT_JOIN,
            { column: 'entity_id', order: SortTypes.DESC }
        );

        if (!parent_booking) {
            throw new BadRequestException('Booking not found.');
        }

        const edit_bookings_count = await this.bookingRepoService.getAll({ booking_number: parent_booking.booking_number, action: BookingActions.EDIT }, ['id']);
        if (edit_bookings_count.data.length > 0) {
            throw new BadRequestException('Booking cannnot be edited twice.');
        }

        const current_date_time = new Date();
        
        if (parent_booking.pickup_date_time < current_date_time) {
            throw new BadRequestException(`Booking cannnot be edited after pickup`);
        }
        current_date_time.setHours(current_date_time.getHours() + MODIFY_BOOKING_BUFFER);
        
        if (parent_booking.pickup_date_time < current_date_time) {
            throw new BadRequestException(`Booking cannnot be edited before ${MODIFY_BOOKING_BUFFER} hours`);
        }

        if (parent_booking.refund_status == RefundStatus.PENDING) {
            throw new BadRequestException('Booking cannnot be edited because refund is pending');
        }

        return parent_booking;
    }


    async editBooking(
        body: EditBookingDto,
        parent_booking: Booking,
        query_booking_data,
        surge: Surge,
        discount_coupon: DiscountCoupon,
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
        booking.booking_source = body.booking_source;
        booking.parent_id = parent_booking.id;
        booking.payment_type = parent_booking.payment_type;
        booking.action = BookingActions.EDIT;
        const booking_date = new Date();
      //  booking_date.setHours(booking_date.getHours() + UTC_DIFF_HOURS)
        booking.booking_date = booking_date;
        booking.type = body.booking_type; // Daily or Monthly
        booking.booking_days = query_booking_data.booking_days;
        booking.booking_months = query_booking_data.booking_months;

        booking.pickup_type = body.pickup_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const pickup_date_time = new Date(`${body.pickup_date}T${body.pickup_time}:00+01:00`);
        booking.pickup_date_time = pickup_date_time;
        booking.pickup_location_id = body.pickup_location_id;
        booking.pickup_city_id = body.pickup_city_id || query_booking_data.pickup_city_id;
        booking.pickup_coordinates = body.pickup_coordinates;
        booking.pickup_address = body.pickup_address;

        booking.dropoff_type = body.dropoff_type;
        // Parse as Morocco time (UTC+1): the customer picks a local time
        const dropoff_date_time = new Date(`${body.dropoff_date}T${body.dropoff_time}:00+01:00`);
        booking.dropoff_date_time = dropoff_date_time;
        booking.dropoff_location_id = body.dropoff_location_id;
        booking.dropoff_city_id = body.dropoff_city_id || query_booking_data.dropoff_city_id;
        booking.dropoff_coordinates = body.dropoff_coordinates;
        booking.dropoff_address = body.dropoff_address;

        booking.car_id = body.car_id;
        booking.group_id = query_booking_data.group_id;
        booking.car_extras = car_extras.car_extras_list;
        booking.car_extras_rate_total = car_extras.rate;
        booking.extra_kms_total_rate = 0;
        if (booking.type == BookingTypes.DAILY) {
            booking.pay_now_amount = query_booking_data.pay_now;
            booking.pay_later_amount = query_booking_data.pay_later;
        } else {
            booking.per_month_rate = query_booking_data.per_month_rate;
            booking.flexi_days_rate = query_booking_data.flexi_days_rate;
            booking.monthly_mileage = body.monthly_mileage;
            booking.flexi_days = query_booking_data.flexi_days;
            if (body.extra_kms) {
                booking.extra_kms_per_month = body.extra_kms;
                const rate_monthly = await this.rateMonthlyV2Service.getOne({ id: query_booking_data.rate_id }); 
                booking.extra_kms_per_month_rate = rate_monthly[`extra_${body.extra_kms}_km_rate`];
                booking.extra_kms_total_rate = booking.extra_kms_per_month_rate * booking.booking_months; // can incorporate flexi days
            }
        }

        booking.car_rate_total = query_booking_data.car_rate_total;

        booking.surge_percentage = (surge) ? surge.rate : 0
        booking.surge_amount = query_booking_data.surge;
        booking.surge_details = surge;


        booking.inter_cities_charges = query_booking_data.inter_cities_charges
        booking.pickup_parking_charges = query_booking_data.pickup_parking_charges
        booking.dropoff_parking_charges = query_booking_data.dropoff_parking_charges
        booking.collection_charges = query_booking_data.collection_charges
        booking.delivery_charges = query_booking_data.delivery_charges
        booking.vmd_charges = query_booking_data.vmd_charges
        booking.sub_amount = this.bookingService.calculateSubTotal(booking, query_booking_data, car_extras)

        if (booking.payment_type == PaymentTypes.PAY_NOW && booking.type == BookingTypes.DAILY) {
            booking.pay_now_discount_percentage = misc_charges.pay_now
            booking.pay_now_discount_amount = query_booking_data.pay_later - query_booking_data.pay_now;
        }

        booking.coupon_code = body.discount_coupon
        booking.coupon_details = discount_coupon;
        booking.coupon_discount_amount = query_booking_data.discount;

        booking.vat_percentage = misc_charges.vat;
        booking.vat_amount = (booking.sub_amount * misc_charges.vat / 100);

        booking.total_amount = booking.sub_amount + booking.vat_amount;
        booking.previous_total_amount = parent_booking.total_amount;
        booking.actual_total_amount = booking.total_amount;
        var same_amount_check = false;
        if (booking.payment_type == PaymentTypes.PAY_NOW) {
            if (Number(booking.previous_total_amount).toFixed(2) == booking.total_amount.toFixed(2)) {
                same_amount_check = true;
                booking.amount_message = `Same amount already paid`;
            } else if (booking.previous_total_amount > booking.total_amount) {
                booking.refund_amount = booking.previous_total_amount - booking.total_amount;
                booking.amount_message = `Refund amount ${booking.refund_amount}`;
            } else {
                booking.amount_message = `You need to pay ${(booking.total_amount - booking.previous_total_amount)}`;
                booking.total_amount = booking.total_amount - booking.previous_total_amount;
            }
        } else {
            booking.amount_message = `You need to pay ${booking.total_amount}`;
        }


        booking.user_id = user.id
        booking.user_first_name = user.first_name
        booking.user_last_name = user.last_name
        booking.user_email = user.email
        booking.user_phone_code = user.phone_code
        booking.user_phone_number = user.phone_number
        booking.user_country_id = user.country_id
        booking.user_ip = ip.split(":").pop()

        const db_booking = await this.bookingRepo.insert(booking);
        if (db_booking.identifiers[0].id != undefined && db_booking.identifiers[0].id > 0) {
            let refund_check = booking.refund_amount;
            if (parent_booking.type == BookingTypes.MONTHLY) {
                const installments = await this.bookingMonthlyInstallmentService.prepareInstallments(body, query_booking_data, car_extras, booking.extra_kms_per_month_rate, parent_booking)
                await this.bookingMonthlyInstallmentService.saveInstallments(installments, db_booking.identifiers[0].id, booking_date);
                const first_installment = installments.find(installment => installment.installment_no == 1);
                refund_check = first_installment.refund_amount;
                same_amount_check = (first_installment.amount_message == 'Same amount already paid')
            }
            return {
                id: db_booking.identifiers[0].id,
                booking_number: booking.booking_number,
                message: booking.amount_message,
                refund_email: refund_check ? true : false,
                same_amount_check
            }
        }
        throw new BadRequestException('Something went wrong' + JSON.stringify(body));
    }

}
