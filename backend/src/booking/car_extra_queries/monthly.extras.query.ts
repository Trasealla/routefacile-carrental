export function monthlyExtrasQuery(
    city_id: number,
    months: number,
    car_id: number
) {
    const year = new Date().getFullYear();
    const query = `
        SELECT 
            c.id AS car_id,
            (rm.cdw * ?) AS cdw,
            (rm.scdw * ?) AS scdw,
            (rm.pai * ?) AS pai,
            (rm.gps * ?) AS gps,
            (rm.baby_seat * ?) AS baby_seat,
            (rm.driver * ?) AS driver
            FROM 
                cars AS c
            LEFT JOIN rates_monthly rm ON (rm.car_id = c.id AND rm.deleted_at IS NULL)
        WHERE
            rm.city_id = ? 
            AND rm.year = ?
            AND rm.car_id = ?`;
    const params = [months, months, months, months, months, months, city_id, year, car_id];
    
    return {query, params}
}
