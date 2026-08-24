import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { BOOKING_RESERVATION_RECEPIENT, BOOKING_RESERVATION_RECEPIENT_CC } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service'; 
import { SmsService } from 'src/mail/sms.service';
import { CANCEL_BOOKING, EXTEND_BOOKING } from 'src/mail/sms/sms_texts';
import { CancelBookingEvent } from '../events/cacnel.booking.event';

@Injectable()
export class CancelBookingListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        private readonly smsService: SmsService,
    ) { }

    @OnEvent('cancel.booking')
    async handleCancelBookingEvent(event: CancelBookingEvent) {

        const where = { id: event.booking_id };
        const relations = {
            pickup_location: {
                columns: ['id', 'recipients', 'name_en']
            },
            dropoff_location: {
                columns: ['id', 'recipients', 'name_en']
            },
            pickup_city: {
                columns: ['id', 'recipients', 'name_en']
            },
            dropoff_city: {
                columns: ['id', 'recipients', 'name_en']
            }
        }
        const booking = await this.bookingRepoService.getOne(where, [], relations, BookingRepoService.LEFT_JOIN);
        booking.car_rate_total = booking.car_rate_total + booking.surge_amount;
        const recipients = this.bookingRepoService.extractRecipients(booking);
        const context = {
            booking,
            recipients,
            conditions: this.bookingRepoService.conditionsObject(booking),
            links: this.bookingRepoService.emailLinks()
        };

        await this.smsService.send(booking.user_phone_code, booking.user_phone_number, CANCEL_BOOKING, 'cancel_booking', booking.id)
        await this.mailService.send(
            booking.user_email,
            'Your booking has been successfully cancelled',
            'booking_cancel',
            context,
            [BOOKING_RESERVATION_RECEPIENT, ...BOOKING_RESERVATION_RECEPIENT_CC, ...recipients],
            booking.id,
            []
        )
    }
}
