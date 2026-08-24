import { Controller, Get, Inject, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { BookingDto } from '../booking/booking.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'accounts')
@Controller('dashboard')
export class DashboardController {

    constructor(
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService
    ) { }

    private param_list = {
        booking_date: {
            column: `DATE_FORMAT(b.booking_date, '%Y-%m-%d')`,
            alias: `booking_date_group`,
            order_by: 'b.booking_date',
            where: `AND b.action != 'cancel'`
        },
        booking_month: {
            column: `DATE_FORMAT(b.booking_date, '%M-%Y')`,
            alias: `booking_month_group`,
            order_by: 'b.booking_date',
        },
        car: {
            column: `c.name_en`,
            alias: `car_name_group`,
            order_by: 'count',
            where: `AND b.action != 'cancel'`
        },
        city: {
            column: `pe.name_en`,
            alias: `city_name_group`,
            order_by: 'pe.id',
            where: `AND b.action != 'cancel'`
        },
        location: {
            column: `pl.name_en`,
            alias: `location_name_group`,
            order_by: 'count',
            where: `AND b.action != 'cancel'`
        },
        pickup_type: {
            column: `b.pickup_type`,
            alias: `pickup_type_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`
        },
        dropoff_type: {
            column: `b.dropoff_type`,
            alias: `dropoff_type_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`,
        },
        type: {
            column: `b.type`,
            alias: `type_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`
        },
        payment_type: {
            column: `b.payment_type`,
            alias: `payment_type_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`
        },
        action: {
            column: `b.action`,
            alias: `action_group`,
            order_by: 'b.id'
        },
        booking_source: {
            column: `b.booking_source`,
            alias: `booking_source_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`
        },
        group: {
            column: `cg.name_en`,
            alias: `group_name_group`,
            order_by: 'b.id',
            where: `AND b.action != 'cancel'`
        }
    }

    @Get('summary')
    async summary(@Query() params: BookingDto) {

        if (!params.from || !params.to) {
            throw new BadRequestException({
                success: false,
                error: {
                    code: 'MISSING_DATE_RANGE',
                    message: 'Both from and to dates are required. Format: YYYY-MM-DD'
                }
            });
        }

        const fromDate = new Date(params.from);
        const toDate = new Date(params.to);
        if (fromDate > toDate) {
            throw new BadRequestException({
                success: false,
                error: {
                    code: 'INVALID_DATE_RANGE',
                    message: 'From date cannot be after to date'
                }
            });
        }

        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const latestBookingSubquery = `(SELECT booking_number, MAX(id) AS latest_id
            FROM bookings
            WHERE (payment_type != 'now' OR payment_status = 1)
            GROUP BY booking_number)`;

        // Summary statistics
        const summaryQuery = `SELECT 
            COUNT(*) AS total_bookings,
            COALESCE(SUM(b.total_amount), 0) AS total_revenue,
            SUM(CASE WHEN b.payment_type = 'now' AND b.payment_status = 0 THEN 1 ELSE 0 END) AS incomplete_bookings,
            SUM(CASE WHEN b.action = 'cancel' THEN 1 ELSE 0 END) AS cancellations
        FROM bookings AS b
        INNER JOIN ${latestBookingSubquery} AS la ON b.id = la.latest_id
        WHERE DATE(b.booking_date) >= '${from}' AND DATE(b.booking_date) <= '${to}'`;

        // Full booking details
        const dataQuery = `SELECT 
            b.id AS id,
            b.booking_number AS booking_number,
            b.booking_log_number AS booking_log_number,
            b.booking_source AS source,
            DATE_FORMAT(b.booking_date, '%e/%c/%Y %l:%i:%s %p') AS booking_date,
            CASE b.action
                WHEN 'book' THEN 'Booked'
                WHEN 'edit' THEN 'Edited'
                WHEN 'extend' THEN 'Extended'
                ELSE 'Cancelled'
            END AS status,
            b.type AS type,
            CASE
                WHEN b.payment_type = 'now' THEN 'Pay Now'
                ELSE 'Pay Later'
            END AS payment_type,
            b.payment_status AS payment_status,
            b.booking_days AS booking_days,
            CASE WHEN b.booking_months IS NULL THEN 0 ELSE b.booking_months END AS booking_months,
            CASE WHEN b.flexi_days IS NULL THEN 0 ELSE b.flexi_days END AS flexi_days,
            CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_name,
            b.user_email AS user_email,
            CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
            c.name_en AS car_name,
            cg.name_en AS group_name,
            b.pickup_type AS pickup_type,
            COALESCE(pl.name_en, '') AS pickup_location,
            COALESCE(pe.name_en, '') AS pickup_city,
            COALESCE(b.pickup_address, '') AS pickup_address,
            DATE_FORMAT(b.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS pickup_date,
            b.dropoff_type AS dropoff_type,
            COALESCE(dl.name_en, '') AS dropoff_location,
            COALESCE(de.name_en, '') AS dropoff_city,
            COALESCE(b.dropoff_address, '') AS dropoff_address,
            DATE_FORMAT(b.dropoff_date_time, '%e/%c/%Y %l:%i:%s %p') AS dropoff_date,
            COALESCE(b.payfort_id, '') AS payfort_id,
            b.car_rate_total AS car_rate,
            b.inter_cities_charges AS inter_cities_charges,
            (b.pickup_parking_charges + b.dropoff_parking_charges) AS parking_charges,
            b.vmd_charges AS vmd_charges,
            b.delivery_charges AS delivery_charges,
            b.collection_charges AS collection_charges,
            COALESCE(b.coupon_code, '') AS coupon_code,
            DATEDIFF(b.pickup_date_time, b.booking_date) AS advance_booking_days,
            b.vat_amount AS vat_amount,
            b.total_amount AS total_amount
        FROM bookings AS b
        INNER JOIN ${latestBookingSubquery} AS la ON b.id = la.latest_id
        LEFT JOIN cars AS c ON c.id = b.car_id
        LEFT JOIN car_groups AS cg ON cg.id = b.group_id
        LEFT JOIN cities AS pe ON pe.id = b.pickup_city_id
        LEFT JOIN locations AS pl ON pl.id = b.pickup_location_id
        LEFT JOIN cities AS de ON de.id = b.dropoff_city_id
        LEFT JOIN locations AS dl ON dl.id = b.dropoff_location_id
        WHERE DATE(b.booking_date) >= '${from}' AND DATE(b.booking_date) <= '${to}'
        ORDER BY b.booking_date DESC`;

        const [summaryResult, data] = await Promise.all([
            this.bookingRepoService.executeRawQuery(summaryQuery),
            this.bookingRepoService.executeRawQuery(dataQuery)
        ]);

        const stats = summaryResult[0] || { total_bookings: 0, total_revenue: 0, incomplete_bookings: 0, cancellations: 0 };

        return {
            success: true,
            summary: {
                total_bookings: parseInt(stats.total_bookings) || 0,
                total_revenue: parseFloat(stats.total_revenue) || 0,
                incomplete_bookings: parseInt(stats.incomplete_bookings) || 0,
                cancellations: parseInt(stats.cancellations) || 0
            },
            date_range: { from, to },
            total_records: data.length,
            data
        };
    }

    @Get(':type')
    async index(@Param('type') type: string, @Query() params: BookingDto) {

        const to = params.to ? new Date(params.to).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const from = params.from ? new Date(params.from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const query = this.query(from, to, type, this.param_list)

        const response = await this.bookingRepoService.executeRawQuery(query)

        return this.makeDashboardResponse(response, this.param_list[type].alias);
    }

    query(from: string, to: string, type: string, param_list: object) {

        return `SELECT 
                ${param_list[type].column} AS ${param_list[type].alias},
                count(*) as count
            FROM
                bookings AS b
                    INNER JOIN
                (SELECT 
                    booking_number, MAX(id) AS latest_id
                FROM
                    bookings
                WHERE
                    (payment_type != 'now'
                        OR payment_status = 1)
                GROUP BY booking_number) AS la ON b.id = la.latest_id
                    LEFT JOIN
                cars AS c ON c.id = b.car_id
                    LEFT JOIN
                car_groups AS cg ON cg.id = b.group_id
                    LEFT JOIN
                cities AS pe ON pe.id = b.pickup_city_id
                    LEFT JOIN
                locations AS pl ON pl.id = b.pickup_location_id
                    LEFT JOIN
                cities AS de ON de.id = b.dropoff_city_id
                    LEFT JOIN
                locations AS dl ON dl.id = b.dropoff_location_id
            WHERE
                DATE(b.created_at) <= '${to}' AND
                DATE(b.created_at) >= '${from}'
                ${param_list[type].where || ''}
            GROUP BY ${param_list[type].alias}
            ORDER BY ${param_list[type].order_by} ASC`
    }

    makeDashboardResponse(response, alias) {
        const labels = response.map(a => a[alias]);
        const data = response.map(a => a.count);

        return {
            labels, data
        }
    }

    @Get('')
    async count() {
        const booking_count_query = `SELECT COUNT(*) AS count FROM bookings WHERE (payment_type != 'now' OR payment_status = 1)`;
        const booking_count_response = await this.bookingRepoService.executeRawQuery(booking_count_query)
        const user_count_query = `SELECT COUNT(*) AS count FROM users`;
        const user_count_response = await this.bookingRepoService.executeRawQuery(user_count_query)
        const location_count_query = `SELECT COUNT(*) AS count FROM locations WHERE status = 1`;
        const location_count_response = await this.bookingRepoService.executeRawQuery(location_count_query)
        const car_count_query = `SELECT COUNT(*) AS count FROM cars WHERE status = 1`;
        const car_count_response = await this.bookingRepoService.executeRawQuery(car_count_query)
        return {
            total_bookings: booking_count_response[0].count,
            total_users: user_count_response[0].count,
            total_locations: location_count_response[0].count,
            total_cars: car_count_response[0].count
        };
    }
}
