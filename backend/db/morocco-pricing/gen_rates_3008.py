#!/usr/bin/env python3
"""
Daily rates for the Peugeot 3008 (car 85, group D4 = 25).

The client gave a RANGE only: 700–900 MAD (70–90 EUR). The month-by-month
spread below follows the same seasonal shape as every other group in their
sheet — cheapest Jan–Mar and Nov–Dec, peak Jul–Aug — scaled to that range.
Extras are copied from group E, the nearest price tier.

Writes /tmp/rf_rates_3008.sql.gz only.
"""
import datetime, gzip

CAR_ID, GROUP_ID, FILE_ID = 85, 25, 176

#        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
RATES = [700, 700, 700, 750, 800, 850, 900, 900, 850, 800, 700, 700]
CDW, SCDW, PAI, GPS, BABY = 85, 90, 60, 0, 35

CITIES = [1, 2, 3, 4, 5, 6, 7, 8]
START, END = datetime.date(2025, 1, 1), datetime.date(2027, 12, 31)
COLS = ("(year,month,date,day_type,rate,cdw,scdw,pai,gps,baby_seat,driver,"
        "car_id,city_id,group_id,file_id,created_by,created_at,updated_at)")


def main():
    rows, d = [], START
    while d <= END:
        rate = RATES[d.month - 1]
        for city in CITIES:
            for dt in ("normal", "weekend"):
                rows.append(
                    f"({d.year},{d.month},'{d}','{dt}',{rate},{CDW},{SCDW},{PAI},{GPS},{BABY},"
                    f"NULL,{CAR_ID},{city},{GROUP_ID},{FILE_ID},1,NOW(),NOW())")
        d += datetime.timedelta(days=1)

    with gzip.open("/tmp/rf_rates_3008.sql.gz", "wt") as f:
        for i in range(0, len(rows), 2000):
            f.write(f"INSERT INTO rates_daily {COLS} VALUES " + ",".join(rows[i:i + 2000]) + ";\n")
    print(f"rows: {len(rows)}  -> /tmp/rf_rates_3008.sql.gz")


if __name__ == "__main__":
    main()
