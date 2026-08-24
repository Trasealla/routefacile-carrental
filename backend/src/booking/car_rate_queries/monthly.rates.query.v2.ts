import { calculateReservation, getDaysBetweenDates } from "src/admin/utils/date.util";
import { CARS_PATH } from "src/config/contants";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { LanguageTypes } from "src/entities/enums/language.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { SortTypes } from "src/entities/enums/sort.type";

export function monthlyRateQueryV2(
    pickup_type: string,
    dropoff_type: string,
    pickup_city_id: number,
    dropoff_city_id: number,
    pickup_location_id: number,
    dropoff_location_id: number,
    pickup_date: string,
    pickup_time: string,
    dropoff_date: string,
    dropoff_time: string,
    months: number,
    misc_charges,
    discount_coupon,
    mileage: number = 3000,
    car_id: number = 0,
    category_id: number = 0,
    lang: string = LanguageTypes.ENGLISH,
    sort_type: string = SortTypes.ASC,
    page: number = 1,
    page_size: number = 10
) {
    const year = new Date().getFullYear();
    const image_path = process.env.FILE_SERVER + CARS_PATH;
    /*
        Ramzan offer till 31 Aug
    */
    const monthly_pay_now_discount = (pickup_date <= '2026-12-31') ? misc_charges.monthly_pay_now_discount : 0;
    //const monthly_pay_now_discount = misc_charges.monthly_pay_now_discount;
    const booking_days_res = calculateReservation(pickup_date, pickup_time, dropoff_date, dropoff_time);
    const booking_days = booking_days_res.booking_days;
    const cal_months = booking_days_res.booking_months;
    const flexi_days = booking_days_res.flexi_days;
    return `
        SELECT 
            c.id,
            rm.id AS rate_id,
            ${pickup_city_id} AS city_id,
            ${pickup_city_id} AS pickup_city_id,
            ${dropoff_city_id} AS dropoff_city_id,
            c.name_${lang} AS car_name,
            c.doors_${lang} AS doors,
            c.passengers_${lang} AS passengers,
            c.suit_cases_${lang} AS suit_cases,
            CASE 
                WHEN c.special_rates_image IS NOT NULL AND c.special_rates_cities IS NOT NULL AND (
                    JSON_EXTRACT(c.special_rates_cities, '$.all') = true 
                    OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(c.special_rates_cities, '$.ids'), '[]'), CAST(${pickup_city_id} AS JSON))
                ) THEN CONCAT("${image_path}", c.special_rates_image)
                ELSE CONCAT("${image_path}", c.image)
            END AS image,
            CASE 
                WHEN c.special_rates_image IS NOT NULL AND c.special_rates_cities IS NOT NULL AND (
                    JSON_EXTRACT(c.special_rates_cities, '$.all') = true 
                    OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(c.special_rates_cities, '$.ids'), '[]'), CAST(${pickup_city_id} AS JSON))
                ) THEN 1
                ELSE 0
            END AS has_special_rate,
            c.group_id AS group_id,
            cg.name_${lang} AS group_name,
            ct.name_${lang} AS transmission,
            cft.name_${lang} AS fuel_type,
            cc.name_${lang} AS category,
            cb.name_${lang} AS brand,
            ROUND(((rm.rate * ${cal_months}) + ((rm.rate/30) * ${flexi_days})), 2) AS car_rate_total,
            (${rm_rate()} - ${monthly_pay_now_discount}) AS pay_now,
            ${rm_rate()} AS pay_later,
            ${rm_rate()} AS per_month_rate,
            (${rm_rate()} * ${cal_months}) AS monthly_rate,
            round(((${rm_rate()}/30) * ${flexi_days}), 2) AS flexi_days_rate,
            rm.rate AS org_per_month_rate,
            round(((rm.rate/30) * ${flexi_days}), 2) AS org_flexi_days_rate,
            ${cal_months} AS booking_months,
            ${booking_days} AS booking_days,
            ${flexi_days} AS flexi_days,
            CASE 
                WHEN iec.charges IS NULL THEN 0 
                ELSE iec.charges
            END AS inter_cities_charges,
            ${(pickup_type == PickupTypes.SELF) ? 'pl.parking_charges AS pickup_parking_charges,' : '0 AS pickup_parking_charges,'}
            ${(dropoff_type == DropoffTypes.SELF && pickup_type == PickupTypes.SELF) ? 'CASE WHEN pl.parking_charges > 0 THEN 0 ELSE dl.parking_charges END AS dropoff_parking_charges,' : (dropoff_type == DropoffTypes.SELF ? 'dl.parking_charges AS dropoff_parking_charges,' : '0 AS dropoff_parking_charges,')}
            0 AS delivery_charges,
            0 AS collection_charges,
            ${vmd(pickup_city_id, months, flexi_days)},
            ${monthly_discount_value()} as discount,
            dc.discount_type,
            dc.note as coupon_note,
            ${monthly_discount_value()} AS monthly_discount_value,
            
            ROUND(${flexi_days_discount_value(flexi_days)}, 2) AS flexi_days_discount_value
        FROM
            cars AS c
        LEFT JOIN car_groups AS cg ON cg.id = c.group_id
        LEFT JOIN car_transmissions AS ct ON ct.id = c.transmission_id
        LEFT JOIN car_fuel_types AS cft ON cft.id = c.fuel_type_id
        LEFT JOIN car_categories AS cc ON cc.id = c.category_id
        LEFT JOIN car_brands AS cb on cb.id = c.brand_id
        LEFT JOIN rates_monthly_v2 rm ON rm.car_id = c.id
            AND rm.deleted_at IS NULL
            AND rm.city_id = ${pickup_city_id}
            AND rm.year = ${year}
            AND rm.months = (SELECT 
                                MAX(rm_inner.months)
                            FROM
                                rates_monthly_v2 rm_inner
                            WHERE
                                rm_inner.car_id = c.id
                                AND rm_inner.year = ${year}
                                AND rm_inner.city_id = ${pickup_city_id}
                                AND rm_inner.months <= ${cal_months}
                                AND rm_inner.mileage = ${mileage}
                                AND (rm_inner.model_year IS NULL OR rm_inner.model_year = c.year)
                                AND rm_inner.deleted_at IS NULL)
            AND rm.mileage = ${mileage}
            AND (rm.model_year IS NULL OR rm.model_year = c.year)
        LEFT JOIN ineter_cities_charges AS iec ON (iec.pickup_city_id = ${pickup_city_id} AND iec.dropoff_city_id = ${dropoff_city_id})
        ${(pickup_type == PickupTypes.SELF) ?
            'LEFT JOIN locations AS pl ON pl.id = ' + pickup_location_id : ''}
        ${(dropoff_type == DropoffTypes.SELF) ?
            'LEFT JOIN locations AS dl ON dl.id = ' + dropoff_location_id : ''}
        ${coupon(discount_coupon, pickup_location_id, pickup_city_id, pickup_date, dropoff_date)}
        WHERE
            c.status = 1
            ${(category_id) ? 'AND cc.id = ' + category_id : ''}
            AND c.deleted_at IS NULL
            ${(car_id) ? 'AND c.id =' + car_id : ''}
            AND rm.id is not null
        GROUP BY c.id
        ORDER BY car_rate_total ${sort_type}
        LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;
}

function vmd(city_id: number, months: number, flexi_days: number) {
    if (city_id !== 1) { // Dubai
        return `0 AS vmd_charges, 0 AS per_month_vmd_charges, 0 AS flexi_days_vmd_charges`;
    }
    return `${(months * 50) + (flexi_days * (50 / 30))} AS vmd_charges, 50 AS per_month_vmd_charges, ${(flexi_days * (50 / 30))} AS flexi_days_vmd_charges`;
}

function coupon(discount_coupon: DiscountCoupon, pickup_location_id, pickup_city_id, pickup_date, dropoff_date) {
    return `LEFT JOIN discount_coupons dc ON (dc.type = 'monthly'
                        AND dc.code = '${discount_coupon?.code}'
                        AND (JSON_EXTRACT(dc.location_ids, '$.all') = TRUE
                        OR JSON_CONTAINS(JSON_EXTRACT(dc.location_ids, '$.ids'),
                            '${pickup_location_id}',
                            '$'))
                        AND (JSON_EXTRACT(dc.city_ids, '$.all') = TRUE
                        OR JSON_CONTAINS(JSON_EXTRACT(dc.city_ids, '$.ids'),
                            '${pickup_city_id}',
                            '$'))
                        AND (JSON_EXTRACT(dc.group_ids, '$.all') = TRUE
                        OR JSON_CONTAINS(JSON_EXTRACT(dc.group_ids, '$.ids'),
                            c.group_id,
                            '$'))
                        AND (JSON_EXTRACT(dc.car_ids, '$.all') = TRUE
                        OR JSON_CONTAINS(JSON_EXTRACT(dc.car_ids, '$.ids'),
                            CONCAT('', c.id),
                            '$'))
                        AND dc.start_date <= '${pickup_date}'
                        AND dc.status = 1
                        AND dc.deleted_at IS NULL)`;


}

function rm_rate() {
    return `(CASE
                WHEN dc.discount_type = 'value' THEN (rm.rate - dc.rate)
                WHEN dc.discount_type = 'percentage' THEN (rm.rate - (rm.rate * (dc.rate / 100)))
                ELSE rm.rate
            END)`;
}

function monthly_discount_value() {
    return `CASE
                WHEN dc.discount_type = 'value' THEN dc.rate
                WHEN dc.discount_type = 'percentage' THEN rm.rate * (dc.rate / 100)
                ELSE 0
            END`;
}


function flexi_days_discount_value(flexi_days) {
    return 0;
    // return `CASE
    //             WHEN dc.discount_type = 'value' THEN (dc.rate/30) * ${flexi_days}
    //             WHEN dc.discount_type = 'percentage' THEN ((rm.rate * (dc.rate / 100))/30) * ${flexi_days}
    //             ELSE 0
    //         END`;
}
