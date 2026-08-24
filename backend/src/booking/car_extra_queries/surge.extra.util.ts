import { Surge } from "src/entities/surge.entity";

export function surge(surge: Surge) {

    const surge_list = ['cdw', 'scdw', 'pai', 'gps', 'baby_seat', 'driver'];
    let return_value = '';
    if (!surge) {
        for (const surge_key of surge_list) {
            return_value += '0 as surge_' + surge_key + ','
        }
        return return_value.slice(0, -1);
    }

    for (const surge_key of surge_list) {
        return_value += `CASE WHEN date BETWEEN "${surge.start_date}" AND "${surge.end_date}"`;
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

        return_value += ` AND ${condition} THEN ROUND(rd.${surge_key} * (${surge[surge_key] / 100}), 2) ELSE 0 END AS surge_${surge_key},`;
    }

    return return_value.slice(0, -1);
}