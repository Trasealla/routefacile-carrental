
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BookingRepoService } from './booking.repo.service';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { CancelBookingDto } from '../cancel.booking/cancel.booking.dto'; 
import { Booking } from 'src/entities/booking.entity';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { BookingActions } from 'src/entities/enums/booking.action';



@Injectable()
export class CancelBookingService {

    constructor(
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService) {
    }

    async validateBooking(body: CancelBookingDto, user_id: number) {

        const booking = await this.bookingRepoService.getOne(
            { id: body.booking_id, user_id: user_id },
        );

        if (!booking) {
            throw new BadRequestException('Booking not found.');
        }

        if (booking.cancellation_date_time) {
            throw new BadRequestException('Booking already cancelled.');
        }

        const current_date_time = new Date();
        current_date_time.setHours(current_date_time.getHours());

        if (current_date_time > booking.dropoff_date_time) {
            throw new BadRequestException(`Booking cannnot be canncelled after pickup time`);
        }

        return booking;
    }

    async cancelBooking(
        body: CancelBookingDto,
        booking: Booking
    ) {
        const car_rate_total = booking.car_rate_total;
        const total_amount = booking.total_amount;
        const booking_days = booking.booking_days;

        const cancellation_date_time = new Date();
        cancellation_date_time.setHours(cancellation_date_time.getHours());

        const update = {
            cancellation_reason: body.cancellation_reason,
            cancellation_date_time: cancellation_date_time,
            action: BookingActions.CANCEL
        }

        const current_date_time = new Date();
        current_date_time.setHours(current_date_time.getHours());

        const pickup_date_time = new Date(booking.pickup_date_time);
        const diffTime = Math.abs(current_date_time.getTime() - pickup_date_time.getTime());
        const day_difference = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (booking.payment_type == PaymentTypes.PAY_NOW && day_difference < 1 && booking.payment_status == 1) {
            const cancellation_charges = Math.floor(car_rate_total / booking_days);
            const refund_amount = total_amount - cancellation_charges;
            update['cancellation_charges'] = cancellation_charges;
            update['refund_amount'] = refund_amount;
            update['refund_status'] = RefundStatus.PENDING;
        }

        const response = await this.bookingRepoService.update({ id: booking.id }, update)
        
        if (response.status == BookingRepoService.SUCCESS) {
            return {
                booking_id: booking.id,
                message: 'Booking cancelled ' + `${(booking.payment_type == PaymentTypes.PAY_NOW) ? 'Refund amount :' + update['refund_amount'] : ''}`
            }
        } else {
            throw new BadRequestException('Something went wrong ' + JSON.stringify(response) + ' ' + JSON.stringify(booking))
        }
    }
}
