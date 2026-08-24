import { Inject, Injectable } from '@nestjs/common';
import { CarSearchDto } from './car.search.dto';
import { CarSearchQueryDto } from './car.search.query.dto';
import { dailyRateQuery } from '../car_rate_queries/daily.rates.query';
import { Location } from 'src/entities/location.entity';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { Surge } from 'src/entities/surge.entity';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { CarService } from 'src/car/car.service';
import { monthlyRateQueryV2 } from '../car_rate_queries/monthly.rates.query.v2';
import { getDaysBetweenDates } from 'src/admin/utils/date.util';
import { PickupTypes } from 'src/entities/enums/pickup.type';

@Injectable()
export class CarSearchService {

    constructor(
        @Inject(CarService) private carService: CarService
    ) { }

    async getPaginatedDailyRates(
        body: CarSearchDto,
        params: CarSearchQueryDto,
        pickup_location: Location,
        dropoff_location: Location,
        misc_charges,
        discount_coupon: DiscountCoupon,
        surge: Surge
    ) {
        const data_query = dailyRateQuery(
            body.pickup_type,
            body.dropoff_type,
            body.pickup_city_id || pickup_location.city_id,
            body.dropoff_city_id || dropoff_location.city_id,
            body.pickup_location_id,
            body.dropoff_location_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            misc_charges,
            discount_coupon,
            surge,
            params.car_id,
            params.category_id,
            params.sort || 'ASC',
            params.page || 1,
            params.page_size || 10,
            params.lang || LanguageTypes.ENGLISH
        );
        // Optimize: Get count without fetching all records
        const count_query = this.getDailyRatesCountQuery(
            body.pickup_type,
            body.dropoff_type,
            body.pickup_city_id || pickup_location.city_id,
            body.dropoff_city_id || dropoff_location.city_id,
            body.pickup_location_id,
            body.dropoff_location_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            misc_charges,
            discount_coupon,
            surge,
            params.car_id,
            params.category_id
        );
        const count_result = await this.carService.executeRawQuery(count_query);
        const total_records = count_result[0]?.total || 0;
        return {
           // data_query,
            data: await this.carService.executeRawQuery(data_query),
            total_records: total_records
        }
    }

    async getPaginatedMonthlyRates(
        body: CarSearchDto,
        params: CarSearchQueryDto,
        pickup_location: Location,
        dropoff_location: Location,
        misc_charges,
        discount_coupon: DiscountCoupon
    ) {
        const data_query = monthlyRateQueryV2(
            body.pickup_type,
            body.dropoff_type,
            body.pickup_city_id || pickup_location.city_id,
            body.dropoff_city_id || dropoff_location.city_id,
            body.pickup_location_id,
            body.dropoff_location_id,
            body.pickup_date,
            body.pickup_time,
            body.dropoff_date,
            body.dropoff_time,
            body.booking_months,
            misc_charges,
            discount_coupon,
            params.monthly_mileage,
            params.car_id,
            params.category_id,
            params.lang || LanguageTypes.ENGLISH,
            params.sort || 'ASC',
            params.page || 1,
            params.page_size || 10
        );

        // Optimize: Get count without fetching all records
        const count_query = this.getMonthlyRatesCountQuery(
            body.pickup_city_id || pickup_location.city_id,
            body.pickup_date,
            body.dropoff_date,
            params.car_id,
            params.category_id
        );

        const count_result = await this.carService.executeRawQuery(count_query);
        const total_records = count_result[0]?.total || 0;

        return {
        //    data_query,
            data: await this.carService.executeRawQuery(data_query),
            total_records: total_records
        }
    }

    private getDailyRatesCountQuery(
        pickup_type: string,
        dropoff_type: string,
        pickup_city_id: number,
        dropoff_city_id: number,
        pickup_location_id: number,
        dropoff_location_id: number,
        pickup_date: string,
        pickup_time: string,
        dropoff_date: string,
        dropoff_time: string,
        misc_charges,
        discount_coupon,
        surge,
        car_id: number = 0,
        category_id: number = 0
    ) {
        // Calculate booking days and adjusted dropoff date using the same logic as dailyRateQuery
        const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
        const booking_days = booking_days_res.total_days;
        const adjusted_dropoff_date = booking_days_res.dropoff_date;
        
        // Use the same subquery structure as the data query to ensure consistent filtering
        return `
            SELECT COUNT(*) as total
            FROM (
                SELECT 
                    tbl1.id
                FROM (
                    SELECT 
                        c.id,
                        CASE
                            WHEN rr.rate > 0 THEN rr.rate
                            ELSE rd.rate
                        END AS rate
                    FROM cars AS c
                    LEFT JOIN car_groups AS cg on cg.id = c.group_id
                    LEFT JOIN car_transmissions AS ct on ct.id = c.transmission_id
                    LEFT JOIN car_fuel_types AS cft on cft.id = c.fuel_type_id
                    LEFT JOIN car_categories AS cc on cc.id = c.category_id
                    LEFT JOIN car_brands AS cb on cb.id = c.brand_id
                    LEFT JOIN rates_daily AS rd ON (rd.car_id = c.id
                        AND rd.group_id = c.group_id
                        AND rd.city_id = ${pickup_city_id}
                        AND rd.date >= '${pickup_date}'
                        AND rd.date <= '${adjusted_dropoff_date}')
                    LEFT JOIN rates_range AS rr ON (c.group_id = rr.group_id
                        AND rr.city_id = ${pickup_city_id}
                        AND rr.end_date >= Now()
                        AND rr.id = (SELECT MAX(rr_inner.id) from rates_range rr_inner 
                        WHERE c.group_id = rr_inner.group_id
                        AND rr_inner.city_id = ${pickup_city_id}
                        AND ${(pickup_type == PickupTypes.SELF) ? 'rr_inner.location_id =' + pickup_location_id : 'rr_inner.location_id IS NULL'}
                        AND rr_inner.deleted_at IS NULL
                        AND rr_inner.end_date >= Now()
                        AND rd.date BETWEEN rr_inner.start_date AND rr_inner.end_date
                        AND ${booking_days} BETWEEN rr_inner.from AND rr_inner.to))
                    WHERE
                        c.status = 1
                        ${(category_id) ? 'AND cc.id = ' + category_id : ''}
                        AND c.deleted_at IS NULL
                        /* Removed alongside the same clause in daily.rates.query.ts —
                         * it dropped the whole Moroccan fleet outside city ids 2/4/5.
                         * This count must stay in step with the data query or the
                         * result total will not match the rows returned. */
                        ${(car_id) ? 'AND c.id =' + car_id : ''}
                ) AS tbl1
                WHERE tbl1.rate IS NOT NULL
                GROUP BY tbl1.id
            ) AS grouped_cars
        `;
    }

    private getMonthlyRatesCountQuery(
        pickup_city_id: number,
        pickup_date: string,
        dropoff_date: string,
        car_id: number = 0,
        category_id: number = 0
    ) {
        // Build WHERE conditions
        let where_conditions = [];
        
        if (car_id > 0) {
            where_conditions.push(`c.id = ${car_id}`);
        }
        
        if (category_id > 0) {
            where_conditions.push(`c.category_id = ${category_id}`);
        }
        
        const where_clause = where_conditions.length > 0 
            ? `AND ${where_conditions.join(' AND ')}` 
            : '';
        
        // Simplified count query for monthly rates
        const year = new Date(pickup_date).getFullYear();
        return `
            SELECT COUNT(DISTINCT c.id) as total
            FROM cars c
            LEFT JOIN rates_monthly_v2 rm ON c.id = rm.car_id 
                AND rm.city_id = ${pickup_city_id}
                AND rm.year = ${year}
                AND rm.deleted_at IS NULL
            WHERE c.status = 1
            AND c.deleted_at IS NULL
            AND rm.id IS NOT NULL
            ${where_clause}
        `;
    }
}
