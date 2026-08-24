import { PickupTypes } from "src/entities/enums/pickup.type";
import { Surge } from "src/entities/surge.entity";

export function surge(surge: Surge, pickup_type: string) {

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

    if (!surge.location_ids.all && pickup_type == PickupTypes.SELF) {
        condition += ` AND (CASE WHEN rr.rate > 0 THEN rr.location_id IN (${surge.location_ids.ids.join(',')}) ELSE TRUE END)`;
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