import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';
import { BookingFormSubmission } from 'src/entities/booking.form.submission.entity';
import { CarSearchDto } from '../car.search/car.search.dto';

@Injectable()
export class BookingFormSubmissionService extends BaseService<BookingFormSubmission> {
    constructor(
        @InjectRepository(BookingFormSubmission) bookingFormSubmission: Repository<BookingFormSubmission>,

    ) {
        super(bookingFormSubmission)
    }

    async store(body: CarSearchDto) {
        await this.insert({
            booking_source: body.booking_source,
            type: body.booking_type,
            booking_months: body.booking_months,
            pickup_type: body.pickup_type,
            // Parse as Morocco time (UTC+1): the customer picks a local time
            pickup_date_time: new Date(`${body.pickup_date}T${body.pickup_time}:00+01:00`),
            pickup_location_id: body.pickup_location_id,
            pickup_city_id: body.pickup_city_id,
            dropoff_type: body.dropoff_type,
            // Parse as Morocco time (UTC+1): the customer picks a local time
            dropoff_date_time: new Date(`${body.dropoff_date}T${body.dropoff_time}:00+01:00`),
            dropoff_location_id: body.dropoff_location_id,
            dropoff_city_id: body.dropoff_city_id,
            coupon_code: body.discount_coupon,
            form_submit: body.form_submit ?? 0 
        });
    }
}
