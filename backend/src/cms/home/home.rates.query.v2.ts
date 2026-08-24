import { CARS_PATH } from "src/config/contants";
import { LanguageTypes } from "src/entities/enums/language.type";
import { Surge } from "src/entities/surge.entity";

export function homeRateQueryV2(
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
        c.id,
        c.name_${lang} AS name,
        CONCAT("${image_path}" , c.image) as image,
        c.passengers_${lang} as passengers,
        c.doors_${lang} as doors,
        ct.name_${lang} AS transmission,
        cb.name_${lang} AS brand,
        cft.name_${lang} AS fuel_type,
        cc.name_${lang} AS category,
        /* "From" price: the cheapest published day rate for this car in this city
         * over the next 30 days. These three columns used to be hard-coded to 0,
         * which is why the fleet page showed no pricing at all and the markup that
         * rendered it had been commented out.
         *
         * weekly_rate / monthly_rate stay NULL rather than 0 — long-stay pricing
         * comes from rates_range and rates_monthly, and a wrong weekly figure is
         * worse than none. NULL lets the UI hide them; 0 rendered as "MAD 0".
         */
        (SELECT MIN(rd.rate)
           FROM rates_daily rd
          WHERE rd.car_id = c.id
            AND rd.group_id = c.group_id
            AND rd.city_id = ${city_id}
            AND rd.date BETWEEN '${from_date}' AND DATE_ADD('${from_date}', INTERVAL 30 DAY)) AS daily_rate,
        NULL as weekly_rate,
        NULL as monthly_rate
        FROM
            cars AS c
        LEFT JOIN car_transmissions AS ct on ct.id = c.transmission_id
        LEFT JOIN car_brands AS cb on cb.id = c.brand_id
        LEFT JOIN car_fuel_types AS cft on cft.id = c.fuel_type_id
        LEFT JOIN car_categories AS cc on cc.id = c.category_id
        WHERE
            c.status = 1
            AND c.deleted_at IS NULL
            ${(category_id) ? 'AND cc.id = ' + category_id : ''}
        ORDER BY 
            CASE cc.name_en
                WHEN 'Economy Cars' THEN 1
                WHEN 'Compact Cars' THEN 2
                WHEN 'Mid-Size Cars' THEN 3
                WHEN 'Family Cars' THEN 4
                WHEN 'Premium Cars' THEN 5
                WHEN 'Electric Vehicle' THEN 6
                WHEN 'SUV' THEN 7
                ELSE 8
            END ASC,
            c.id ASC
        LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;
}
