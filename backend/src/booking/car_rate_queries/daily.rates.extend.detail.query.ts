import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { LanguageTypes } from "src/entities/enums/language.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { Surge } from "src/entities/surge.entity";
import { vmd } from "./vmd.util";
import { surge } from "./surge.util";

export function dailyRateExtendDetailQuery(
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
    surge_obj,
    car_id: number = 0,
    category_id: number = 0,
    lang: string = LanguageTypes.ENGLISH
) {
    const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
    const booking_days = booking_days_res.total_days;
    dropoff_date = booking_days_res.dropoff_date;
    return `
            Select id, car_name, date, (rate + surge) as rate from (
                SELECT 
                    c.id,
                    c.name_${lang} AS car_name,
                    rd.date,
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
                    c.status IN (0, 1)
                    ${(category_id) ? 'AND cc.id = ' + category_id : ''}
                    AND c.deleted_at IS NULL
                    ${(car_id) ? 'AND c.id =' + car_id : ''}
                ) AS tbl`;
}