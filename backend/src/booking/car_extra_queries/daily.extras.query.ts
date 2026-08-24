import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { Surge } from "src/entities/surge.entity";
import { surge } from "./surge.extra.util";

export function dailyExtrasQuery(
    city_id: number,
    pickup_date: string,
    pickup_time: string,
    dropoff_date: string,
    dropoff_time: string,
    car_id: number,
    discount_range,
    surge_obj: Surge,
    coupon_obj: DiscountCoupon

) {
    const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
    dropoff_date = booking_days_res.dropoff_date;
    const discount_range_extras = getDiscountRangeOfExtras(discount_range);
    const query = `
            SELECT 
                tbl.id AS car_id,
                sum(tbl.cdw) as org_cdw,
                sum(tbl.scdw) as org_scdw,
                sum(tbl.pai) as org_pai,
                sum(tbl.gps) as org_gps,
                sum(tbl.baby_seat) as org_baby_seat,
                sum(tbl.driver) as org_driver,
                Round(sum(tbl.cdw + tbl.surge_cdw - tbl.discount_cdw) * ${discount_range_extras['cdw']}, 2) AS backup_cdw,
                0 AS cdw,
                Round(sum(tbl.scdw + tbl.surge_scdw - tbl.discount_scdw) * ${discount_range_extras['scdw']}, 2)  AS scdw,
                Round(sum(tbl.pai + tbl.surge_pai - tbl.discount_pai) * ${discount_range_extras['pai']}, 2)  AS pai,
                Round(sum(tbl.gps + tbl.surge_gps - tbl.discount_gps) * ${discount_range_extras['gps']}, 2)  AS gps,
                Round(sum(tbl.baby_seat + tbl.surge_baby_seat - tbl.discount_baby_seat) * ${discount_range_extras['baby_seat']}, 2)  AS baby_seat,
                Round(sum(tbl.driver + tbl.surge_driver - tbl.discount_driver) * ${discount_range_extras['driver']}, 2)  AS driver,
                sum(tbl.discount_cdw) as discount_cdw,
                sum(tbl.discount_scdw) as discount_scdw,
                sum(tbl.discount_pai) as discount_pai,
                sum(tbl.discount_gps) as discount_gps,
                sum(tbl.discount_baby_seat) as discount_baby_seat,
                sum(tbl.discount_driver) as discount_driver,
                sum(tbl.surge_cdw) as surge_cdw,
                sum(tbl.surge_scdw) as surge_scdw,
                sum(tbl.surge_pai) as surge_pai,
                sum(tbl.surge_gps) as surge_gps,
                sum(tbl.surge_baby_seat) as surge_baby_seat,
                sum(tbl.surge_driver) as surge_driver,
                (tbl.cdw + tbl.surge_cdw - tbl.discount_cdw) AS per_day_cdw,
                (tbl.scdw + tbl.surge_scdw - tbl.discount_scdw) AS per_day_scdw,
                (tbl.pai + tbl.surge_pai - tbl.discount_pai) AS per_day_pai,
                (tbl.gps + tbl.surge_gps - tbl.discount_gps) AS per_day_gps,
                (tbl.baby_seat + tbl.surge_baby_seat - tbl.discount_baby_seat) AS per_day_baby_seat,
                (tbl.driver + tbl.surge_driver - tbl.discount_driver) AS per_day_driver
            FROM
                (SELECT 
                    c.id,
                    c.name_en,
                    rd.date,
                    rd.rate,
                    rd.pai,
                    rd.gps,
                    rd.cdw,
                    rd.scdw,
                    rd.baby_seat,
                    rd.driver,
                    ${surge(surge_obj)},
                    ${coupon(coupon_obj)}
                FROM
                    cars AS c
                        JOIN
                    rates_daily AS rd ON rd.car_id = c.id
                WHERE
                    rd.car_id = ${car_id} AND rd.city_id = ${city_id}
                        AND rd.date >= '${pickup_date}'
                        AND rd.date <= '${dropoff_date}') as tbl`;

    return query
}

function coupon(coupon: DiscountCoupon) {
    const coupon_list = ['cdw', 'scdw', 'pai', 'gps', 'baby_seat', 'driver'];
    let return_value = '';
    if (!coupon) {
        for (const coupon_key of coupon_list) {
            return_value += '0 as discount_' + coupon_key + ','
        }
        return return_value.slice(0, -1);
    }

    for (const coupon_key of coupon_list) {
        return_value += `CASE WHEN date BETWEEN "${coupon.start_date}" AND "${coupon.end_date}"`;
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

        return_value += ` AND ${condition} THEN ROUND(rd.${coupon_key} * (${coupon[coupon_key] / 100}), 2) ELSE 0 END AS discount_${coupon_key},`;
    }

    return return_value.slice(0, -1);
}

function getDiscountRangeOfExtras(discount_range) {
    const res = { cdw: 1, scdw: 1, pai: 1, gps: 1, baby_seat: 1, driver: 1 };
    if (!Array.isArray(discount_range)) return res;
    discount_range.map((obj) => {
        if (obj && obj.type) {
            res[obj.type] = 1 - (Number(obj['discount'] || 0) / 100);
        }
    })

    return res;
}
