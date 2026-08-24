#!/usr/bin/env python3
"""
Rate rows for the Moroccan fleet, using LITERAL car ids.

Why this exists: the first run put the car ids in MySQL session variables
(@car_B ...) in part 1, then loaded the rates from a second mysql invocation.
Session variables do not survive across connections, so every car_id came
through as NULL and the load aborted. Car ids are hard-coded here instead.

Writes /tmp/rf_rates_fix.sql.gz only — executes nothing.
"""
import datetime, gzip

FILE_ID = 176

# group: (car_id, group_id)
IDS = {
    "B":  (75, 4),   "B1": (76, 19), "C":  (77, 3),  "D":  (78, 2),
    "D1": (79, 1),   "D2": (80, 20), "D3": (81, 21), "E":  (82, 5),
    "E1": (83, 18),  "E2": (84, 22),
}

# group: ([12 monthly weekday rates], cdw, scdw, pai, gps, baby_seat)
RATES = {
    "B":  ([300, 300, 300, 300, 350, 400, 400, 400, 400, 400, 350, 350],  50,  60, 30, 0, 40),
    "B1": ([350, 350, 350, 350, 400, 400, 450, 450, 450, 400, 400, 350],  50,  60, 30, 0, 40),
    "C":  ([400, 400, 450, 450, 450, 500, 550, 550, 550, 450, 400, 400],  60,  70, 35, 0, 40),
    "D":  ([500, 500, 500, 500, 500, 600, 600, 600, 600, 550, 500, 500],  70,  80, 40, 0, 40),
    "D1": ([500, 500, 500, 500, 550, 600, 600, 600, 600, 550, 500, 500],  70,  80, 50, 0, 40),
    "D2": ([550, 550, 550, 600, 700, 750, 800, 800, 750, 700, 550, 550],  80,  85, 50, 0, 40),
    "D3": ([550, 550, 550, 600, 700, 750, 800, 800, 750, 700, 550, 550],  80,  85, 50, 0, 35),
    "E":  ([800, 800, 800, 800, 800, 900, 900, 900, 900, 850, 800, 800],  85,  90, 60, 0, 35),
    "E1": ([850, 850, 850, 850, 850, 900, 1000, 1000, 950, 900, 850, 800], 90,  90, 60, 0, 35),
    "E2": ([1200, 1200, 1200, 1300, 1300, 1400, 1500, 1500, 1400, 1300, 1200, 1200], 120, 150, 90, 0, 30),
}

CITIES = [1, 2, 3, 4, 5, 6, 7, 8]
START = datetime.date(2025, 1, 1)
END = datetime.date(2027, 12, 31)
COLS = ("(year,month,date,day_type,rate,cdw,scdw,pai,gps,baby_seat,driver,"
        "car_id,city_id,group_id,file_id,created_by,created_at,updated_at)")


def main():
    rows = []
    d = START
    while d <= END:
        m = d.month
        for g, (car_id, group_id) in IDS.items():
            rate = RATES[g][0][m - 1]
            cdw, scdw, pai, gps, baby = RATES[g][1:]
            for city in CITIES:
                for dt in ("normal", "weekend"):
                    rows.append(
                        f"({d.year},{m},'{d}','{dt}',{rate},{cdw},{scdw},{pai},{gps},{baby},"
                        f"NULL,{car_id},{city},{group_id},{FILE_ID},1,NOW(),NOW())")
        d += datetime.timedelta(days=1)

    with gzip.open("/tmp/rf_rates_fix.sql.gz", "wt") as f:
        batch = 2000
        for i in range(0, len(rows), batch):
            f.write(f"INSERT INTO rates_daily {COLS} VALUES " + ",".join(rows[i:i + batch]) + ";\n")

    print(f"rate rows: {len(rows)}")
    print("wrote /tmp/rf_rates_fix.sql.gz")


if __name__ == "__main__":
    main()
