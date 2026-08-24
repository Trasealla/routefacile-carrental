import { CARS_PATH } from "src/config/contants";
import { LanguageTypes } from "src/entities/enums/language.type";
import { Surge } from "src/entities/surge.entity";

export function homeRateQuery(
    city_id: number,
    from_date: string,
    to_date_for_daily: string,
    to_date_for_weekly: string,
    year: number,
    surge_obj: Surge,
    category_id: number = 0,
    page: number = 1,
    page_size: number = 10,
    lang: string = LanguageTypes.ENGLISH
) {
    
    
    
    const image_path = process.env.FILE_SERVER + CARS_PATH;

    return `
    SELECT 
        daily.car_id as id,
        daily.image,
        daily.name,
        daily.passengers,
        daily.doors,
        daily.transmission,
        daily.brand,
        daily.fuel_type,
        daily.category,
       -- daily_rr,
       -- daily_rd,
        CASE
            WHEN daily_rr IS NOT NULL THEN (daily_rr + daily.surge)
            ELSE (daily_rd + daily.surge)
        END AS daily_rate,
        weekly_rate,
        monthly_rate
    FROM
        (SELECT 
            c.id AS car_id,
            c.name_${lang} AS name,
            CONCAT("${image_path}" , c.image) as image,
            c.passengers_${lang} as passengers,
            c.doors_${lang} as doors,
            ct.name_${lang} AS transmission,
            cb.name_${lang} AS brand,
            cft.name_${lang} AS fuel_type,
            cc.name_${lang} AS category,
            SUM(rr.rate) AS daily_rr,
            SUM(rd.rate) AS daily_rd,
            ${surge(surge_obj)}
        FROM
            cars AS c
        LEFT JOIN car_transmissions AS ct on ct.id = c.transmission_id
        LEFT JOIN car_brands AS cb on cb.id = c.brand_id
        LEFT JOIN car_fuel_types AS cft on cft.id = c.fuel_type_id
        LEFT JOIN car_categories AS cc on cc.id = c.category_id
        LEFT JOIN rates_daily AS rd ON (rd.car_id = c.id
            AND rd.group_id = c.group_id
            AND rd.city_id = ${city_id}
            AND rd.date >= '${from_date}'
            AND rd.date <= '${to_date_for_daily}')
        LEFT JOIN rates_range AS rr ON (c.group_id = rr.group_id
            AND rr.city_id = ${city_id}
            AND rr.location_id IS NULL
            AND rr.deleted_at IS NULL
            AND rd.date BETWEEN rr.start_date AND rr.end_date
            AND 1 BETWEEN rr.from AND rr.to)
        WHERE
            c.status = 1 AND c.deleted_at IS NULL
            ${(category_id) ? 'AND cc.id = ' + category_id : ''}
        GROUP BY c.id) AS daily

        JOIN

        (SELECT
            car_id, (SUM(rate) + SUM(surge)) AS weekly_rate
        FROM
            (SELECT
            c.id AS car_id,
            CASE
                WHEN rr.rate IS NOT NULL THEN rr.rate
                ELSE rd.rate
            END AS rate,
            ${surge(surge_obj)}
        FROM
            cars AS c
        LEFT JOIN car_categories AS cc on cc.id = c.category_id    
        LEFT JOIN rates_daily AS rd ON (rd.car_id = c.id
            AND rd.group_id = c.group_id
            AND rd.city_id = ${city_id}
            AND rd.date >= '${from_date}'
            AND rd.date <= '${to_date_for_weekly}')
        LEFT JOIN rates_range AS rr ON (c.group_id = rr.group_id
            AND rr.city_id = ${city_id}
            AND rr.location_id IS NULL
            AND rr.deleted_at IS NULL
            AND rd.date BETWEEN rr.start_date AND rr.end_date
            AND 7 BETWEEN rr.from AND rr.to)
        WHERE
            c.status = 1 AND c.deleted_at IS NULL ${(category_id) ? 'AND cc.id = ' + category_id : ''}) AS daily_query
        GROUP BY daily_query.car_id) AS weekly

        JOIN

        (SELECT
            c.id AS car_id,
            rate AS monthly_rate
        FROM
            cars AS c
        LEFT JOIN car_categories AS cc on cc.id = c.category_id 
        LEFT JOIN rates_monthly AS rm ON (rm.car_id = c.id)    
        WHERE
            city_id = ${city_id} AND rm.year = ${year} AND rm.deleted_at IS NULL ${(category_id) ? 'AND cc.id = ' + category_id : ''}
        GROUP BY car_id) AS monthly
        
        ON monthly.car_id = daily.car_id AND daily.car_id = weekly.car_id
        ORDER BY monthly.monthly_rate ASC
        LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;
}

function surge(surge: Surge) {

    if (!surge) {
        return '0 AS surge';
    }

    let condition = 'true';

    if (!surge.car_ids.all) {
        condition += ` AND c.id IN (${surge.car_ids.ids.join(',')})`;
    }

    if (!surge.group_ids.all) {
        condition += ` AND c.group_id IN (${surge.group_ids.ids.join(',')})`;
    }

    if (!surge.city_ids.all) {
        condition += ` AND rd.city_id IN (${surge.city_ids.ids.join(',')})`;
    }
    // city/delivery rates
    if (!surge.location_ids.all) {
        condition += ` AND rr.location_id IN (${surge.location_ids.ids.join(',')})`;
    }

    const case_surge = `
            CASE WHEN date BETWEEN "${surge.start_date}" AND "${surge.end_date}" THEN (
                CASE WHEN ${condition} THEN (
                    ROUND(
                        (CASE WHEN rr.rate > 0 THEN rr.rate ELSE rd.rate END) * "${surge.rate / 100}", 2) 
                    ) ELSE 0 END
            ) ELSE 0 END AS surge`;


    return case_surge;
}
