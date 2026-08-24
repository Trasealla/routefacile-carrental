import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserBookingService extends BaseService<Booking> {
    constructor(
        @InjectRepository(Booking) repo: Repository<Booking>
    ) {
        super(repo)
    }

    static CURRENT = 'current';
    static COMING = 'coming';
    static PAST = 'past';
    static CANCELLED = 'cancelled';


    sortBookings(bookings: Booking[]) {
        // Step 1: Sort the array by created_at in descending order
        bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Step 2: Use a map to keep the latest record for each booking_number
        const latestBookings = new Map();

        for (const booking of bookings) {
            if (!latestBookings.has(booking.booking_number)) {
                latestBookings.set(booking.booking_number, booking);
            }
        }

        // Convert the map back to an array
        const result = Array.from(latestBookings.values());

        return result;
    }

    currentBookingsQuery(user_id: number, lang: string) {
        return `SELECT ${this.selects(lang)}
                    FROM bookings b1
                    ${this.joins()}
                    WHERE action != 'cancel'
                    AND pickup_date_time <= NOW()
                    AND dropoff_date_time >= NOW()
                    AND user_id = ${user_id}
                    AND b1.id = (
                        SELECT MAX(id)
                        FROM bookings b2
                        WHERE b1.booking_number = b2.booking_number
                        AND (b2.payment_type != 'now' OR b2.payment_status = 1)
                        AND user_id = ${user_id}
                    );`;
    }

    upcomingBookingsQuery(user_id: number, lang: string) {
        return `SELECT ${this.selects(lang)}
            FROM bookings b1
            ${this.joins()}
            WHERE action != 'cancel'
            AND pickup_date_time > NOW()
            AND user_id = ${user_id}
            AND b1.id = (
                SELECT MAX(id)
                FROM bookings b2
                WHERE b1.booking_number = b2.booking_number
                AND (b2.payment_type != 'now' OR b2.payment_status = 1)
                AND user_id = ${user_id}
            );`;
    }

    pastBookingsQuery(user_id: number, lang: string) {
        return `SELECT ${this.selects(lang)}
                FROM bookings b1
                ${this.joins()}
                WHERE action != 'cancel'
                AND dropoff_date_time < NOW()
                AND user_id = ${user_id}
                AND b1.id = (
                    SELECT MAX(id)
                    FROM bookings b2
                    WHERE b1.booking_number = b2.booking_number
                    AND (b2.payment_type != 'now' OR b2.payment_status = 1)
                    AND user_id = ${user_id}
                );`;
    }

    cancelledBookingsQuery(user_id: number, lang: string) {
        return `SELECT ${this.selects(lang)}
                FROM bookings b1
                ${this.joins()}
                WHERE action = 'cancel'
                AND user_id = ${user_id}
                AND b1.id = (
                    SELECT MAX(id)
                    FROM bookings b2
                    WHERE b1.booking_number = b2.booking_number
                    AND (b2.payment_type != 'now' OR b2.payment_status = 1)
                    AND user_id = ${user_id}
                );`;
    }

    joins() {
        return `JOIN cars AS c on c.id = b1.car_id
                JOIN car_groups AS cg on cg.id = b1.group_id
                LEFT JOIN locations AS pl on pl.id = b1.pickup_location_id
                LEFT JOIN locations AS dl on dl.id = b1.dropoff_location_id
                LEFT JOIN cities AS pe on pe.id = b1.pickup_city_id
                LEFT JOIN cities AS de on de.id = b1.dropoff_city_id
                `
    }

    selects(lang: string) {
        return `b1.*,
                c.name_${lang} car_name,
                c.image, 
                cg.name_${lang} AS group_name, 
                pl.name_${lang} pickup_location, 
                dl.name_${lang} AS dropoff_location,
                pe.name_${lang} pickup_city, 
                de.name_${lang} AS dropoff_city
                `
    }
}
