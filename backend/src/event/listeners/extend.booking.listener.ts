import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { BOOKING_RESERVATION_RECEPIENT, BOOKING_RESERVATION_RECEPIENT_CC, BOOKING_RESERVATION_RECEPIENT_TESTING } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { SmsService } from 'src/mail/sms.service';
import { ExtendBookingEvent } from '../events/extend.booking.event';
import { EXTEND_BOOKING } from 'src/mail/sms/sms_texts';

@Injectable()
export class ExtendBookingListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        private readonly smsService: SmsService,
    ) { }

    @OnEvent('extend.booking')
    async handleExtendBookingEvent(event: ExtendBookingEvent) {
        try {
            const where = { id: event.booking_id };
            const relations = {
                pickup_location: {
                    columns: ['id', 'recipients', 'name_en', 'contact_number']
                },
                dropoff_location: {
                    columns: ['id', 'recipients', 'name_en', 'contact_number']
                },
                pickup_city: {
                    columns: ['id', 'recipients', 'name_en', 'contact_number']
                },
                dropoff_city: {
                    columns: ['id', 'recipients', 'name_en', 'contact_number']
                },
                car: {
                    columns: ['id', 'name_en', 'name_en']
                }
            }
            const booking = await this.bookingRepoService.getOne(where, [], relations, BookingRepoService.LEFT_JOIN);
            
            if (!booking) {
                console.error(`[ExtendBookingListener] Booking not found for id: ${event.booking_id}`);
                return;
            }
            
            booking.car_rate_total = Number(booking.car_rate_total) + Number(booking.surge_amount);
            const recipients = this.bookingRepoService.extractRecipients(booking);
            const context = {
                booking,
                conditions: this.bookingRepoService.conditionsObject(booking),
                recipients,
                links: this.bookingRepoService.emailLinks()
            };
            const sms_text = EXTEND_BOOKING.replace('[user]', booking.user_first_name).replace('[booking_number]', booking.booking_number);
            
            // Send SMS - don't let SMS failure block email sending
            try {
                await this.smsService.send(booking.user_phone_code, booking.user_phone_number, sms_text, 'confirm_booking', booking.id);
            } catch (smsError) {
                console.error(`[ExtendBookingListener] SMS failed for booking ${booking.id}:`, smsError);
            }
            
            // Send Email - separate try-catch to ensure it runs even if SMS fails
            try {
                await this.mailService.send(
                    booking.user_email,
                    'Your booking has been successfully extended',
                    'booking_extend',
                    context,
                    context.conditions.staging ? [BOOKING_RESERVATION_RECEPIENT_TESTING] : [BOOKING_RESERVATION_RECEPIENT, ...BOOKING_RESERVATION_RECEPIENT_CC, ...recipients],
                    booking.id,
                    []
                );
                console.log(`[ExtendBookingListener] Email sent successfully for booking ${booking.id} to ${booking.user_email}`);
            } catch (emailError) {
                console.error(`[ExtendBookingListener] Email failed for booking ${booking.id}:`, emailError);
            }
        } catch (error) {
            console.error(`[ExtendBookingListener] Error processing extend booking for id ${event.booking_id}:`, error);
        }
    }
}
