#!/usr/bin/env python3
"""
Generates the Morocco fleet + pricing migration SQL from the client's sheet.
Writes two local files only; executes nothing.
  /tmp/rf_migrate_part1.sql   brands, retire old fleet, 10 cars, rate-batch record
  /tmp/rf_rates.sql.gz        the daily rate rows
"""
import datetime, gzip

# group, group_id, name_en, name_ae, category_id, seats, doors, bags, image
CARS = [
    ("B",   4, "Hyundai i20",            "هيونداي i20",             2, 5, 5, 2, "rf-hyundai-i20.png"),
    ("B1", 19, "Renault Clio 5",         "رينو كليو 5",             2, 5, 5, 2, "rf-renault-clio5.png"),
    ("C",   3, "Peugeot 208",            "بيجو 208",                1, 5, 5, 2, "rf-peugeot-208.png"),
    ("D",   2, "Peugeot 2008",           "بيجو 2008",              15, 5, 5, 3, "rf-peugeot-2008.png"),
    ("D1",  1, "Dacia Duster",           "داسيا داستر",            15, 5, 5, 3, "rf-dacia-duster.png"),
    ("D2", 20, "Hyundai Tucson",         "هيونداي توسان",          15, 5, 5, 3, "rf-hyundai-tucson.png"),
    ("D3", 21, "Volkswagen T-Roc",       "فولكسفاجن تي-روك",       15, 5, 5, 3, "rf-vw-troc.png"),
    ("E",   5, "Hyundai Tucson Premium", "هيونداي توسان بريميوم",  15, 5, 5, 3, "rf-hyundai-tucson.png"),
    ("E1", 18, "Volkswagen Tiguan",      "فولكسفاجن تيغوان",       15, 5, 5, 4, "rf-vw-troc.png"),
    ("E2", 22, "Range Rover Evoque",     "رنج روفر إيفوك",          7, 5, 5, 3, "rf-range-rover-evoque.png"),
]

BRAND_OF = {
    "Hyundai i20": 4, "Hyundai Tucson": 4, "Hyundai Tucson Premium": 4,
    "Renault Clio 5": "Renault", "Peugeot 208": "Peugeot", "Peugeot 2008": "Peugeot",
    "Dacia Duster": "Dacia", "Volkswagen T-Roc": "Volkswagen",
    "Volkswagen Tiguan": "Volkswagen", "Range Rover Evoque": "Land Rover",
}
NEW_BRANDS = ["Renault", "Peugeot", "Dacia", "Volkswagen", "Land Rover"]

# group -> ([12 monthly weekday rates], cdw, scdw, pai, gps, baby_seat)
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


def var(group):
    return "@car_" + group.replace("1", "_1").replace("2", "_2").replace("3", "_3")


def main():
    out = []
    w = out.append
    w("-- Morocco fleet + pricing migration (generated)")
    w("START TRANSACTION;")

    w("-- 1) brands that do not exist yet")
    for b in NEW_BRANDS:
        w("INSERT INTO car_brands (name_en,name_ae,status,created_by,created_at,updated_at) "
          f"SELECT '{b}','{b}',1,1,NOW(),NOW() FROM DUAL "
          f"WHERE NOT EXISTS (SELECT 1 FROM car_brands WHERE name_en='{b}' AND deleted_at IS NULL);")

    w("-- 2) retire the previous fleet (rows kept so existing bookings still resolve)")
    w("UPDATE cars SET status=0, updated_at=NOW() WHERE deleted_at IS NULL;")

    w("-- 3) rate batch record")
    w("INSERT INTO rates_daily_files (file,created_by,created_at,updated_at) "
      "VALUES ('morocco-pricing-2026-08.xlsx',1,NOW(),NOW());")
    w("SET @fid = LAST_INSERT_ID();")

    w("-- 4) the 10 cars from the sheet")
    for g, gid, en, ae, cat, seats, doors, bags, img in CARS:
        b = BRAND_OF[en]
        bid = b if isinstance(b, int) else (
            f"(SELECT id FROM car_brands WHERE name_en='{b}' AND deleted_at IS NULL LIMIT 1)")
        w("INSERT INTO cars (name_en,name_ae,description_en,description_ae,image,banner_image,images,status,"
          "doors_en,doors_ae,passengers_en,passengers_ae,suit_cases_en,suit_cases_ae,"
          "air_bags,rear_camera,infotainment_system,bluetooth,sunroof,cruise_control,electric,"
          "group_id,fuel_type_id,category_id,brand_id,transmission_id,created_by,created_at,updated_at) VALUES ("
          f"'{en}','{ae}','{en}','{ae}','{img}','{img}','[\"{img}\"]',1,"
          f"'{doors}','{doors}','{seats}','{seats}','{bags}','{bags}',"
          f"4,1,1,1,0,1,0,{gid},1,{cat},{bid},1,1,NOW(),NOW());")
        w(f"SET {var(g)} = LAST_INSERT_ID();")

    w("-- 5) clear the previous rate table (backed up beforehand)")
    w("DELETE FROM rates_daily;")
    w("COMMIT;")

    with open("/tmp/rf_migrate_part1.sql", "w") as f:
        f.write("\n".join(out))
    print("part1 statements:", len(out))

    # ---- rate rows ----
    rows = []
    d = START
    while d <= END:
        m = d.month
        for g, gid, *_ in CARS:
            rate = RATES[g][0][m - 1]
            cdw, scdw, pai, gps, baby = RATES[g][1:]
            for city in CITIES:
                for dt in ("normal", "weekend"):
                    rows.append(
                        f"({d.year},{m},'{d}','{dt}',{rate},{cdw},{scdw},{pai},{gps},{baby},"
                        f"NULL,{var(g)},{city},{gid},@fid,1,NOW(),NOW())")
        d += datetime.timedelta(days=1)
    print("rate rows:", len(rows))

    cols = ("(year,month,date,day_type,rate,cdw,scdw,pai,gps,baby_seat,driver,"
            "car_id,city_id,group_id,file_id,created_by,created_at,updated_at)")
    with gzip.open("/tmp/rf_rates.sql.gz", "wt") as f:
        batch = 2000
        for i in range(0, len(rows), batch):
            f.write(f"INSERT INTO rates_daily {cols} VALUES " + ",".join(rows[i:i + batch]) + ";\n")
    print("wrote /tmp/rf_rates.sql.gz")


if __name__ == "__main__":
    main()
