import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { CARS_PATH } from "src/config/contants";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { LanguageTypes } from "src/entities/enums/language.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { SortTypes } from "src/entities/enums/sort.type";

export function monthlyRateQuery(
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
    car_id: number = 0,
    category_id: number = 0,
    lang: string = LanguageTypes.ENGLISH,
    sort_type: string = SortTypes.ASC,
    page: number = 1,
    page_size: number = 10
) {
    const year = new Date().getFullYear();
    const image_path = process.env.FILE_SERVER + CARS_PATH;
    const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
    const booking_days = booking_days_res.total_days;
    const cal_months = Math.floor(booking_days / 30);
    const flexi_days = booking_days % 30;
    return `
        SELECT 
            c.id,
            c.name_${lang} AS car_name,
            c.doors_${lang} AS doors,
            c.passengers_${lang} AS passengers,
            c.suit_cases_${lang} AS suit_cases,
            CONCAT("${image_path}" , c.image) AS image,
            c.group_id AS group_id,
            cg.name_${lang} AS group_name,
            ct.name_${lang} AS transmission,
            cft.name_${lang} AS fuel_type,
            cc.name_${lang} AS category,
            round(((rm.rate * ${cal_months}) + ((rm.rate/30) * ${flexi_days})), 2) AS car_rate_total,
            rm.rate AS per_month_rate,
            (rm.rate * ${cal_months}) AS monthly_rate,
            round(((rm.rate/30) * ${flexi_days}), 2) AS flexi_days_rate,
            ${cal_months} AS booking_months,
            ${booking_days} AS booking_days,
            ${flexi_days} AS extra_days,
            CASE 
                WHEN iec.charges IS NULL THEN 0 
                ELSE iec.charges
            END AS inter_cities_charges,
            ${(pickup_type == PickupTypes.SELF) ? 'pl.parking_charges AS pickup_parking_charges,' : '0 AS pickup_parking_charges,'}
            ${(dropoff_type == DropoffTypes.SELF && pickup_type == PickupTypes.SELF) ? 'CASE WHEN pl.parking_charges > 0 THEN 0 ELSE dl.parking_charges END AS dropoff_parking_charges,' : (dropoff_type == DropoffTypes.SELF ? 'dl.parking_charges AS dropoff_parking_charges,' : '0 AS dropoff_parking_charges,')}
            ${(pickup_type == PickupTypes.DELIVERY) ? misc_charges.delivery_charges + ' AS delivery_charges,' : '0 AS delivery_charges,'}
            ${(dropoff_type == DropoffTypes.COLLECTION) ? misc_charges.collection_charges + ' AS collection_charges,' : ' 0 AS collection_charges,'}
            ${vmd(pickup_city_id, months)},
            0 as discount
            
            FROM 
                cars AS c
            LEFT JOIN car_groups AS cg ON cg.id = c.group_id
            LEFT JOIN car_transmissions AS ct ON ct.id = c.transmission_id
            LEFT JOIN car_fuel_types AS cft ON cft.id = c.fuel_type_id
            LEFT JOIN car_categories AS cc ON cc.id = c.category_id
            LEFT JOIN rates_monthly rm ON (rm.car_id = c.id AND rm.deleted_at IS NULL)
            LEFT JOIN ineter_cities_charges AS iec ON (iec.pickup_city_id = ${pickup_city_id} AND iec.dropoff_city_id = ${dropoff_city_id})
            ${(pickup_type == PickupTypes.SELF) ?
            'LEFT JOIN locations AS pl ON pl.id = ' + pickup_location_id : ''}
                ${(dropoff_type == DropoffTypes.SELF) ?
            'LEFT JOIN locations AS dl ON dl.id = ' + dropoff_location_id : ''}
            
        WHERE
            rm.city_id = ${pickup_city_id} AND rm.year = ${year}
            ${(category_id) ? 'AND cc.id = ' + category_id : ''}
            ${(car_id) ? 'AND c.id =' + car_id : ''}
            GROUP BY c.id
            ORDER BY rate ${sort_type}
            LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;
}

function vmd(city_id: number, months: number) {
    if (city_id !== 1) { // Dubai
        return `0 AS vmd_charges`;
    }
    return `${months * 50} AS vmd_charges`;
}

