export function vmd(city_id: number, total_days: number) {

    if (city_id !== 1) { // not dubai
        return '0 AS vmd_charges';
    }

    if (total_days < 30) {
        return `${(total_days * 4)} AS vmd_charges`;
    } else {
        return `${Math.round(((total_days / 30) * 50) + ((50 / 30) * (total_days % 30)))} AS vmd_charges`
    }
}