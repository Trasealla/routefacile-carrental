import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { BOOKING_RESERVATION_RECEPIENT, BOOKING_RESERVATION_RECEPIENT_CC, BOOKING_RESERVATION_RECEPIENT_TESTING, isPlaceholderGuestEmail } from 'src/config/contants';
import { ConfirmBookingEvent } from '../events/confirm.booking.event';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { SmsService } from 'src/mail/sms.service';
import { CONFIRM_BOOKING } from 'src/mail/sms/sms_texts';
import { AdjustService } from 'src/adjust/adjust.service';
import { BookingTypes } from 'src/entities/enums/booking.type';

@Injectable()
export class ConfirmBookingListener {
    private readonly logger = new Logger(ConfirmBookingListener.name);

    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        private readonly smsService: SmsService,
        private readonly adjustService: AdjustService,
    ) { }

    @OnEvent('confirm.booking')
    async handleConfirmBookingEvent(event: ConfirmBookingEvent) {
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
                },
                monthly_installments: {
                    columns: ['id', 'installment_no', 'due_date', 'sub_amount', 'vat_amount', 'total_amount']
                }
            }
            const booking = await this.bookingRepoService.getOne(where, [], relations, BookingRepoService.LEFT_JOIN);
            
            if (!booking) {
                console.error(`[ConfirmBookingListener] Booking not found for id: ${event.booking_id}`);
                return;
            }
            
            booking.car_rate_total = Number(booking.car_rate_total) + Number(booking.surge_amount);
            const recipients = this.bookingRepoService.extractRecipients(booking);
            // What the customer actually typed at checkout. Phone-only guests are
            // given a synthetic @guest.route-facile.local address so the rest of
            // the system has an email column to work with — that placeholder must
            // never be shown to anyone, so it is filtered out here rather than in
            // the template, where Handlebars cannot test for it.
            const hasRealEmail = !!booking.user_email && !isPlaceholderGuestEmail(booking.user_email);
            const customer_contact = hasRealEmail
                ? booking.user_email
                : (booking.user_phone_number
                    ? `+${booking.user_phone_code} ${booking.user_phone_number}`
                    : '');

            const context = {
                booking,
                customer_contact,
                conditions: this.bookingRepoService.conditionsObject(booking),
                recipients,
                links: this.bookingRepoService.emailLinks()
            };
            const sms_text = CONFIRM_BOOKING.replace('[user]', booking.user_first_name).replace('[booking_number]', booking.booking_number);
            
            // Send SMS - don't let SMS failure block email sending
            try {
                await this.smsService.send(booking.user_phone_code, booking.user_phone_number, sms_text, `confirm_booking`, booking.id);
            } catch (smsError) {
                console.error(`[ConfirmBookingListener] SMS failed for booking ${booking.id}:`, smsError);
            }
            
            // Send Email - separate try-catch to ensure it runs even if SMS fails
            //
            // A guest who checked out with only a phone number has no real email
            // address, just the stand-in the users table required. Mailing that
            // would bounce every time and cost us sender reputation, so the
            // customer copy is skipped and the booking still reaches the team.
            const customerHasEmail = !isPlaceholderGuestEmail(booking.user_email);
            const internal = context.conditions.staging
                ? [BOOKING_RESERVATION_RECEPIENT_TESTING]
                : [BOOKING_RESERVATION_RECEPIENT, ...BOOKING_RESERVATION_RECEPIENT_CC, ...recipients];

            try {
                await this.mailService.send(
                    customerHasEmail ? booking.user_email : internal[0],
                    'Your Booking with Route Facile',
                    `booking_confirm_${booking.type}`,
                    context,
                    customerHasEmail ? internal : internal.slice(1),
                    booking.id,
                    []
                );
                this.logger.log(
                    customerHasEmail
                        ? `Email sent successfully for booking ${booking.id} to ${booking.user_email}`
                        : `Booking ${booking.id} has no customer email (phone-only guest); notified the team only`
                );
            } catch (emailError) {
                this.logger.error(`Email failed for booking ${booking.id}:`, emailError);
            }

            // Track Monthly Booking event in Adjust for AdVolve campaign attribution
            if (booking.type === BookingTypes.MONTHLY && booking.adjust_device_id) {
                try {
                    const revenue = Number(booking.total_amount) || 0;
                    await this.adjustService.trackMonthlyBooking(
                        booking.adjust_device_id,
                        booking.id,
                        revenue,
                        'MAD'
                    );
                    this.logger.log(`Adjust Monthly Booking event tracked for booking ${booking.id}`);
                } catch (adjustError) {
                    this.logger.error(`Adjust tracking failed for booking ${booking.id}:`, adjustError);
                }
            }
        } catch (error) {
            this.logger.error(`Error processing booking confirmation for id ${event.booking_id}:`, error);
        }
    }
}