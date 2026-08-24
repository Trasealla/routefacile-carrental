import { calculateReservation, monthlyBrackets } from "src/admin/utils/date.util";

export function monthlyExtrasQueryV2(
    city_id: number,
    pickup_date: string,
    pickup_time: string,
    dropoff_date: string,
    dropoff_time: string,
    car_id: number,
    monthly_mileage: number = 3000
) {
    const year = new Date().getFullYear();
    const booking_days_res = calculateReservation(pickup_date, pickup_time, dropoff_date, dropoff_time);
    const booking_days = booking_days_res.booking_days;
    const months = booking_days_res.booking_months;
    const flexi_days = booking_days_res.flexi_days;
    const q_month = monthlyBrackets(months)
    const query = `
        SELECT 
            c.id AS car_id,
            0 AS cdw,
            Round(((rm.scdw * ${months}) + ((rm.scdw / 30) * ${flexi_days})), 2) AS scdw,
            Round(((rm.pai * ${months}) + ((rm.scdw / 30) * ${flexi_days})), 2) AS pai,
            Round(((rm.gps * ${months}) + ((rm.scdw / 30) * ${flexi_days})), 2) AS gps,
            Round(((rm.baby_seat * ${months}) + ((rm.scdw / 30) * ${flexi_days})), 2) AS baby_seat,
            Round(((rm.driver * ${months}) + ((rm.scdw / 30) * ${flexi_days})), 2) AS driver,

            (rm.scdw) AS scdw_per_month_rate,
            (rm.pai) AS pai_per_month_rate,
            (rm.gps) AS gps_per_month_rate,
            (rm.baby_seat) AS baby_seat_per_month_rate,
            (rm.driver) AS driver_per_month_rate,

            ((rm.scdw / 30) * ${flexi_days}) AS scdw_flexi_days_rate,
            ((rm.pai / 30) * ${flexi_days}) AS pai_flexi_days_rate,
            ((rm.gps / 30) * ${flexi_days}) AS gps_flexi_days_rate,
            ((rm.baby_seat / 30) * ${flexi_days}) AS baby_seat_flexi_days_rate,
            ((rm.driver / 30) * ${flexi_days}) AS driver_flexi_days_rate,

            ${flexi_days} AS flexi_days
            FROM 
                cars AS c
            LEFT JOIN rates_monthly_v2 rm ON (rm.car_id = c.id AND rm.deleted_at IS NULL)
        WHERE
            rm.city_id = ${city_id} 
            AND rm.year = ${year}
            AND months = (SELECT 
                                MAX(rm_inner.months)
                            FROM
                                rates_monthly_v2 rm_inner
                            WHERE
                                rm_inner.car_id = c.id
                                AND rm_inner.year = ${year}
                                AND rm_inner.city_id = ${city_id}
                                AND rm_inner.months <= ${q_month}
                                AND rm_inner.mileage = ${monthly_mileage}
                                AND (rm_inner.model_year IS NULL OR rm_inner.model_year = c.year)
                                AND rm_inner.deleted_at IS NULL)
            AND mileage = ${monthly_mileage}
            AND (rm.model_year IS NULL OR rm.model_year = c.year)
            AND rm.car_id = ${car_id}`;

    return query
}
