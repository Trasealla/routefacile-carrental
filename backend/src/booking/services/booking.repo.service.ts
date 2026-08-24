import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { DropoffTypes } from 'src/entities/enums/dropoff.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { PickupTypes } from 'src/entities/enums/pickup.type';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BookingRepoService extends BaseService<Booking> {
    constructor(
        @InjectRepository(Booking) bookingRepo: Repository<Booking>
    ) {
        super(bookingRepo)
    }

    extractRecipients(booking: Booking) {
        let recipients = [];
        if (booking.pickup_location) {
            recipients = [...recipients, ...booking.pickup_location.recipients]
        }
        if (booking.dropoff_location) {
            recipients = [...recipients, ...booking.dropoff_location.recipients]
        }
        if (booking.pickup_city && booking.pickup_type == PickupTypes.DELIVERY) {
            recipients = [...recipients, ...booking.pickup_city.recipients]
        }
        if (booking.dropoff_city && booking.dropoff_type == DropoffTypes.COLLECTION) {
            recipients = [...recipients, ...booking.dropoff_city.recipients]
        }

        return [...new Set(recipients)];
    }

    emailLinks() {
        return {
            contact_us: process.env.CONTACT_US,
            find_a_branch: process.env.FIND_A_BRANCH,
            terms_and_conditions: process.env.TERMS_AND_CONDITIONS,
            user_bookings:process.env.USER_BOOKINGS,
            file_server: process.env.FILE_SERVER,
            faq: process.env.FAQ
        }
    }

    conditionsObject(booking) {
        return {
            pay_now: (booking.payment_type == PaymentTypes.PAY_NOW),
            self_pickup: (booking.pickup_type == PickupTypes.SELF),
            self_dropoff: (booking.dropoff_type == DropoffTypes.SELF),
            daily_booking: (booking.type == BookingTypes.DAILY),
            monthly_booking: (booking.type == BookingTypes.MONTHLY),
            staging: (process.env.NODE_ENV == "staging" || process.env.NODE_ENV == "local"),
            same_amount_check: (booking.amount_message == 'Same amount already paid'),
            vmd: (booking.pickup_city_id == 1), // dubai
            daily_or_weekly: (booking.booking_days < 7) ? 'Daily' : 'Weekly',
            coupon_check: booking.coupon_code ? true : false,
            coupon_note_check: booking.coupon_details?.note ? true : false,
            coupon_note: booking.coupon_details?.note ? booking.coupon_details.note : '',
        }
    }
}
