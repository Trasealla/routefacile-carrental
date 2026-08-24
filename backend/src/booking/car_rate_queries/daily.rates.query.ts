import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { CARS_PATH } from "src/config/contants";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { CouponDiscountTypes } from "src/entities/enums/coupon.discount.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { LanguageTypes } from "src/entities/enums/language.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { SortTypes } from "src/entities/enums/sort.type";
import { Surge } from "src/entities/surge.entity";
import { vmd } from "./vmd.util";
import { surge } from "./surge.util";

export function dailyRateQuery(
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
    misc_charges,
    coupon_obj,
    surge_obj,
    car_id: number = 0,
    category_id: number = 0,
    sort_type: string = SortTypes.ASC,
    page: number = 1,
    page_size: number = 10,
    lang: string = LanguageTypes.ENGLISH,
    include_inactive: boolean = false,
) {
    const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
    const booking_days = booking_days_res.total_days;
    dropoff_date = booking_days_res.dropoff_date;
    const pay_now = 1 - (misc_charges.pay_now / 100); // pay now inverse i.e 0.95 in case of 5 percentage
    const image_path = process.env.FILE_SERVER + CARS_PATH;
    // A UAE-era clause used to sit in the WHERE below:
    //     (![2, 4, 5].includes(pickup_city_id)) ? 'AND c.featured = 0' : ''
    // It hid an Abu Dhabi showcase vehicle outside three city ids. Those ids now
    // belong to Moroccan cities, and every Moroccan car has featured = NULL — in
    // SQL, NULL = 0 is NULL rather than true, so the clause silently discarded the
    // entire fleet in every city except the three it skipped. That is why search
    // returned no cars for Marrakech, Casablanca and the rest.
    // featured is only a sort key here (see the ORDER BY), so nothing filters on it.
    // The identical clause in car.search.service.ts's count query was removed too;
    // the two must agree or total_records will not match the rows returned.
    return `
        SELECT 
        tbl1.id,
        tbl1.car_name,
        tbl1.doors,
        tbl1.featured,
        tbl1.passengers,
        tbl1.suit_cases,
        tbl1.image,
        tbl1.has_special_rate,
        group_id,
        city_id,
        ${pickup_city_id} AS pickup_city_id,
        ${dropoff_city_id} AS dropoff_city_id,
        tbl1.group_name,
        tbl1.transmission,
        fuel_type,
        category,
        brand,
        (SUM(tbl1.rate) + sum(surge) - ${(coupon_obj && coupon_obj.discount_type == CouponDiscountTypes.PERCENTAGE) ? 'sum(discount)' : 'discount'}) AS pay_later,
        ((SUM(tbl1.rate) + sum(surge) - ${(coupon_obj && coupon_obj.discount_type == CouponDiscountTypes.PERCENTAGE) ? 'sum(discount)' : 'discount'}) * ${pay_now}) AS pay_now,
        tbl1.rate_from_range,
        tbl1.rate_from_daily,
        SUM(tbl1.rate) AS car_rate_total,
        ${booking_days} AS booking_days,
        inter_cities_charges,
        pickup_parking_charges,
        dropoff_parking_charges,
        delivery_charges,
        collection_charges,
        ${(coupon_obj && coupon_obj.discount_type == CouponDiscountTypes.PERCENTAGE) ? 'sum(discount) AS discount' : 'discount'},
        sum(surge) AS surge,
        coupon_note,
        vmd_charges
        FROM
            (SELECT 
                c.id,
                c.name_${lang} AS car_name,
                c.doors_${lang} as doors,
                c.featured,
                c.passengers_${lang} as passengers,
                c.suit_cases_${lang} as suit_cases,
                CASE 
                    WHEN c.special_rates_image IS NOT NULL AND c.special_rates_cities IS NOT NULL AND (
                        JSON_EXTRACT(c.special_rates_cities, '$.all') = true 
                        OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(c.special_rates_cities, '$.ids'), '[]'), CAST(${pickup_city_id} AS JSON))
                    ) THEN CONCAT("${image_path}", c.special_rates_image)
                    ELSE CONCAT("${image_path}", c.image)
                END as image,
                CASE 
                    WHEN c.special_rates_image IS NOT NULL AND c.special_rates_cities IS NOT NULL AND (
                        JSON_EXTRACT(c.special_rates_cities, '$.all') = true 
                        OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(c.special_rates_cities, '$.ids'), '[]'), CAST(${pickup_city_id} AS JSON))
                    ) THEN 1
                    ELSE 0
                END as has_special_rate,
                c.group_id AS group_id,
                cg.name_${lang} AS group_name,
                ct.name_${lang} AS transmission,
                cft.name_${lang} AS fuel_type,
                cc.name_${lang} AS category,
                cb.name_${lang} AS brand,
                CASE
                    WHEN rr.rate > 0 THEN rr.rate
                    ELSE rd.rate
                END AS rate,
                rr.rate AS rate_from_range,
                rd.rate AS rate_from_daily,
                rd.city_id,
                CASE 
                    WHEN iec.charges IS Null THEN 0 
                    ELSE iec.charges
                END AS inter_cities_charges,
                ${(pickup_type == PickupTypes.SELF) ? 'pl.parking_charges AS pickup_parking_charges,' : '0 AS pickup_parking_charges,'}
                ${(dropoff_type == DropoffTypes.SELF && pickup_type == PickupTypes.SELF) ? 'CASE WHEN pl.parking_charges > 0 THEN 0 ELSE dl.parking_charges END AS dropoff_parking_charges,' : (dropoff_type == DropoffTypes.SELF ? 'dl.parking_charges AS dropoff_parking_charges,' : '0 AS dropoff_parking_charges,')}
                ${(pickup_type == PickupTypes.DELIVERY) ? misc_charges.delivery_charges + ' AS delivery_charges,' : '0 AS delivery_charges,'}
                ${(dropoff_type == DropoffTypes.COLLECTION) ? misc_charges.collection_charges + ' AS collection_charges,' : ' 0 AS collection_charges,'}
                ${surge(surge_obj, pickup_type)},
                ${coupon(coupon_obj, surge_obj, pickup_type)},
                ${vmd(pickup_city_id, booking_days)}
            FROM
                cars AS c
            LEFT JOIN car_groups AS cg on cg.id = c.group_id
            LEFT JOIN car_transmissions AS ct on ct.id = c.transmission_id
            LEFT JOIN car_fuel_types AS cft on cft.id = c.fuel_type_id
            LEFT JOIN car_categories AS cc on cc.id = c.category_id
            LEFT JOIN car_brands AS cb on cb.id = c.brand_id
            LEFT JOIN rates_daily AS rd ON (rd.car_id = c.id
                AND rd.group_id = c.group_id
                AND rd.city_id = ${pickup_city_id}
                AND rd.date >= '${pickup_date}'
                AND rd.date <= '${dropoff_date}')
            LEFT JOIN rates_range AS rr ON (c.group_id = rr.group_id
                AND rr.city_id = ${pickup_city_id}
                AND rr.end_date >= Now()
                AND rr.id = (SELECT MAX(rr_inner.id) from rates_range rr_inner 
                WHERE c.group_id = rr_inner.group_id
                AND rr_inner.city_id = ${pickup_city_id}
                AND ${(pickup_type == PickupTypes.DELIVERY) ? 'rr_inner.location_id IS NULL' : 'rr_inner.location_id =' + pickup_location_id}
                AND rr_inner.deleted_at IS NULL
                AND rr_inner.end_date >= Now()
                AND rd.date BETWEEN rr_inner.start_date AND rr_inner.end_date
                AND ${booking_days} BETWEEN rr_inner.from AND rr_inner.to))
            LEFT JOIN ineter_cities_charges AS iec ON (iec.pickup_city_id = ${pickup_city_id} AND iec.dropoff_city_id = ${dropoff_city_id})
            ${(pickup_type == PickupTypes.SELF) ?
            'LEFT JOIN locations AS pl ON pl.id = ' + pickup_location_id : ''}
            ${(dropoff_type == DropoffTypes.SELF) ?
            'LEFT JOIN locations AS dl ON dl.id = ' + dropoff_location_id : ''}
            WHERE
                ${include_inactive ? 'c.status IN (0, 1)' : 'c.status = 1'}
                ${(category_id) ? 'AND cc.id = ' + category_id : ''}
                AND c.deleted_at IS NULL
                ${(car_id) ? 'AND c.id =' + car_id : ''}
                ) AS tbl1
        WHERE tbl1.rate IS NOT NULL
        GROUP BY tbl1.id
        ORDER BY (tbl1.featured = 1) DESC, pay_later ${sort_type}
        LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;
}

function coupon(coupon: DiscountCoupon, surge: Surge, pickup_type: string) {
    if (!coupon) {
        return '0 AS discount, 0 as coupon_note';
    }

    let coupon_rate;

    let surge_condition = 'true';
    let surge_rate = 0;
    if (surge) {
        surge_rate = surge.rate;
        if (!surge.car_ids.all) {
            surge_condition += ` AND c.id IN (${surge.car_ids.ids.join(',')})`;
        }

        if (!surge.group_ids.all) {
            surge_condition += ` AND c.group_id IN (${surge.group_ids.ids.join(',')})`;
        }

        if (!surge.city_ids.all) {
            surge_condition += ` AND rd.city_id IN (${surge.city_ids.ids.join(',')})`;
        }

        if (!surge.location_ids.all && pickup_type == PickupTypes.SELF) {
            surge_condition += ` AND (CASE WHEN rr.rate > 0 THEN rr.location_id IN (${surge.location_ids.ids.join(',')}) ELSE TRUE END)`;
        }
    }

    if (coupon.discount_type === CouponDiscountTypes.PERCENTAGE) {
        coupon_rate = `
            CASE WHEN ${surge_condition} THEN (${coupon.rate} + (${coupon.rate} * ${surge_rate} / 100))
            ELSE ${coupon.rate} END`;
    } else {
        coupon_rate = coupon.rate; // For fixed value coupons
    }

    let condition = 'true';

    if (!coupon.car_ids.all) {
        condition += ` AND c.id IN (${coupon.car_ids.ids.join(',')})`;
    }

    if (!coupon.group_ids.all) {
        condition += ` AND c.group_id IN (${coupon.group_ids.ids.join(',')})`;
    }

    if (!coupon.city_ids.all) {
        condition += ` AND rd.city_id IN (${coupon.city_ids.ids.join(',')})`;
    }

    if (!coupon.location_ids.all && pickup_type == PickupTypes.SELF) {
        condition += ` AND (CASE WHEN rr.rate > 0 THEN rr.location_id IN (${coupon.location_ids.ids.join(',')}) ELSE TRUE END)`;
    }

    let case_discount_coupon;
    if (coupon.discount_type === CouponDiscountTypes.PERCENTAGE) {
        case_discount_coupon = `
            CASE WHEN date BETWEEN "${coupon.start_date}" AND "${coupon.end_date}" THEN (
                CASE WHEN ${condition} THEN ( 
                    ROUND((CASE WHEN rr.rate > 0 THEN rr.rate ELSE rd.rate END) * ${coupon_rate}/100, 2) 
                    ) ELSE 0 END
            ) ELSE 0 END AS discount`;
    } else {
        case_discount_coupon = `
            CASE WHEN date BETWEEN "${coupon.start_date}" AND "${coupon.end_date}" THEN (
                CASE WHEN ${condition} THEN "${coupon_rate}" ELSE 0 END
            ) ELSE 0 END AS discount`;
    }

    return `${case_discount_coupon}, "${coupon.note}" as coupon_note`;
}


