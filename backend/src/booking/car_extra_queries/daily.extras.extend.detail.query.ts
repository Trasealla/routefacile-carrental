import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { Booking } from "src/entities/booking.entity";
import { Surge } from "src/entities/surge.entity";
import { surge } from "./surge.extra.util";

export function dailyExtrasExtendDetailQuery(
    booking: Booking,
    city_id: number,
    pickup_date: string,
    pickup_time: string,
    dropoff_date: string,
    dropoff_time: string,
    car_id: number,
    surge_obj: Surge

) {
    const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
    dropoff_date = booking_days_res.dropoff_date;
    const query = `
                    SELECT id, name_en, 
                        ${booking.car_extras.map(extra => {
                            return `(${extra.type} + surge_${extra.type}) AS ${extra.type}`
                        })},
                        date
                        FROM
                        (SELECT 
                            c.id,
                            c.name_en,
                            ${booking.car_extras.map(extra => {
                                return `(rd.${extra.type} * ${extra.quantity}) AS ${extra.type}`
                            })},
                            rd.date,
                            ${surge(surge_obj)}
                        FROM
                            cars AS c
                                JOIN
                            rates_daily AS rd ON rd.car_id = c.id
                        WHERE
                            rd.car_id = ? AND rd.city_id = ?
                                AND rd.date >= ?
                                AND rd.date <= ?) as tbl`;

    const params = [car_id, city_id, pickup_date, dropoff_date];

    return { query, params }
}