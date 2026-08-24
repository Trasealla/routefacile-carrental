import { Controller, Get, Inject, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { BookingService } from './booking.service';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { BookingDto } from './booking.dto';
import { BookingLogDto } from './booking.log.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'counter', 'accounts')
@Controller('admin/booking')
export class BookingController {
    constructor(
        @Inject(BookingService) private bookingService: BookingService
    ) { }

    @Get()
    async index(@Query() params: BookingDto) {

        // Validate date range
        if (params.from && params.to) {
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
        }

        // Validate pickup date range
        if (params.pickup_from && params.pickup_to) {
            const pickupFromDate = new Date(params.pickup_from);
            const pickupToDate = new Date(params.pickup_to);
            if (pickupFromDate > pickupToDate) {
                throw new BadRequestException({
                    success: false,
                    error: {
                        code: 'INVALID_PICKUP_DATE_RANGE',
                        message: 'Pickup from date cannot be after pickup to date'
                    }
                });
            }
        }

        const page = params.page ?? 1;
        const page_size = Math.min(params.page_size ?? 100, 1000); // Default 100, Max 1000

        let where = 'WHERE ';

        // Date filtering using booking_date (not created_at)
        // Only apply date filters if provided
        if (params.from || params.to) {
            if (params.from && params.to) {
                const fromDate = new Date(params.from).toISOString().split('T')[0];
                const toDate = new Date(params.to).toISOString().split('T')[0];
                where += ` DATE(b.booking_date) >= '${fromDate}' AND DATE(b.booking_date) <= '${toDate}'`;
            } else if (params.from) {
                const fromDate = new Date(params.from).toISOString().split('T')[0];
                where += ` DATE(b.booking_date) >= '${fromDate}'`;
            } else if (params.to) {
                const toDate = new Date(params.to).toISOString().split('T')[0];
                where += ` DATE(b.booking_date) <= '${toDate}'`;
            }
        } else {
            // If no date filters, return all bookings
            where += ' 1=1';
        }

        if (params.booking_number) {
            where += ` AND b.booking_number = '${params.booking_number}'`;
        }

        if (params.user_email) {
            where += ` AND b.user_email = '${params.user_email}'`;
        }

        if (params.payment_type) {
            where += ` AND b.payment_type = '${params.payment_type}'`;
        }

        if (params.type) {
            where += ` AND b.type = '${params.type}'`;
        }

        if (params.status) {
            where += ` AND b.action = '${params.status}'`;
        }

        if (params.location_id) {
            where += ` AND b.pickup_location_id = '${params.location_id}'`;
        }

        if (params.city_id) {
            where += ` AND b.pickup_city_id = '${params.city_id}'`;
        }

        if (params.pickup_type) {
            where += ` AND b.pickup_type = '${params.pickup_type}'`;
        }

        if (params.dropoff_type) {
            where += ` AND b.dropoff_type = '${params.dropoff_type}'`;
        }
        if (params.booking_source) {
            where += ` AND b.booking_source = '${params.booking_source}'`;
        }

        if (params.coupon_code) {
            where += ` AND b.coupon_code = '${params.coupon_code}'`;
        }

        if (params.broker_id) {
            where += ` AND b.broker_id = '${params.broker_id}'`;
        }

        // Pickup date filtering
        if (params.pickup_from) {
            const pickupFromDate = new Date(params.pickup_from).toISOString().split('T')[0];
            where += ` AND DATE(b.pickup_date_time) >= '${pickupFromDate}'`;
        }

        if (params.pickup_to) {
            const pickupToDate = new Date(params.pickup_to).toISOString().split('T')[0];
            where += ` AND DATE(b.pickup_date_time) <= '${pickupToDate}'`;
        }


        const query = `SELECT 
                        b.id AS id,
                        b.booking_number AS booking_number,
                        b.booking_log_number AS booking_log_number,
                        b.booking_source AS source,
                        b.broker_id AS broker_id,
                        COALESCE(br.name, '') AS broker_name,
                        COALESCE(b.broker_reference, '') AS broker_reference,
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
                        b.booking_days AS booking_days,
                        CASE
                            WHEN b.booking_months IS NULL THEN 0
                            ELSE b.booking_months
                        END AS booking_months,
                        CASE
                            WHEN b.flexi_days IS NULL THEN 0
                            ELSE b.flexi_days
                        END AS flexi_days,
                        CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_name,
                        b.user_email AS user_email,
                        CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
                        c.name_en AS car_name,
                        b.pickup_type AS pickup_type,
                        COALESCE(pl.name_en, '') AS pickup_location,
                        COALESCE(pe.name_en, '') AS pickup_city,
                        COALESCE(b.pickup_address, '') AS pickup_address,
                        DATE_FORMAT(b.pickup_date_time,
                                '%e/%c/%Y %l:%i:%s %p') AS pickup_date,
                        b.dropoff_type AS dropoff_type,
                        COALESCE(dl.name_en, '') AS dropoff_location,
                        COALESCE(de.name_en, '') AS dropoff_city,
                        COALESCE(b.dropoff_address, '') AS dropoff_address,
                        DATE_FORMAT(b.dropoff_date_time,
                                '%e/%c/%Y %l:%i:%s %p') AS dropoff_date,
                        COALESCE(b.payfort_id, '') AS payfort_id,
                        b.car_rate_total AS car_rate,
                        b.inter_cities_charges AS inter_cities_charges,
                        (b.pickup_parking_charges + b.dropoff_parking_charges) AS parking_charges,
                        b.vmd_charges AS vmd_charges,
                        b.delivery_charges AS delivery_charges,
                        b.collection_charges AS collection_charges,
                        COALESCE(b.coupon_code, '') AS coupon_code,
                        b.vat_amount AS vat_amount,
                        b.total_amount AS total_amount
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
                        cities AS pe ON pe.id = b.pickup_city_id
                            LEFT JOIN
                        locations AS pl ON pl.id = b.pickup_location_id
                            LEFT JOIN
                        cities AS de ON de.id = b.dropoff_city_id
                            LEFT JOIN
                        locations AS dl ON dl.id = b.dropoff_location_id
                            LEFT JOIN
                        brokers AS br ON br.id = b.broker_id ${where}`;

        const record_query = `${query} ORDER BY b.booking_date DESC LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`

        const result = await this.bookingService.executeRawQuery(record_query);

        // Get total count
        const count_query = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
        const count_result = await this.bookingService.executeRawQuery(count_query);
        const total_records = count_result[0]?.total || 0;

        // Calculate total pages
        const total_pages = Math.ceil(total_records / page_size);

        // Calculate summary statistics
        const summary_query = `SELECT 
            COUNT(*) as total_bookings,
            COALESCE(SUM(b.total_amount), 0) as total_revenue
        FROM bookings AS b
        INNER JOIN (SELECT booking_number, MAX(id) AS latest_id
            FROM bookings
            WHERE (payment_type != 'now' OR payment_status = 1)
            GROUP BY booking_number) AS la ON b.id = la.latest_id
        ${where}`;
        
        const summary_result = await this.bookingService.executeRawQuery(summary_query);
        const summary = summary_result[0] || { total_bookings: 0, total_revenue: 0 };

        return {
            success: true,
            data: result,
            pagination: {
                current_page: page,
                total_pages: total_pages,
                total_records: total_records,
                page_size: page_size
            },
            summary: {
                total_bookings: parseInt(summary.total_bookings) || 0,
                total_revenue: parseFloat(summary.total_revenue) || 0,
                date_range: params.from || params.to ? {
                    from: params.from || null,
                    to: params.to || null
                } : null
            }
        }
    }

    @Get('log')
    async log(@Query() params: BookingLogDto) {
        const page = params.page ?? 1;
        const page_size = params.page_size ?? 10;

        let where = 'WHERE 1=1';


        if (params.booking_number) {
            where += ` AND booking_number = '${params.booking_number}'`;
        }

        if (params.booking_log_number) {
            where += ` AND booking_log_number = '${params.booking_log_number}'`;
        }

        if (params.user_email) {
            where += ` AND b.user_email = '${params.user_email}'`;
        }

        const query = `SELECT 
                            b.*,
                            c.name_en AS car_name,
                            cg.name_en AS group_name,
                            pe.name_en AS pickup_city_name,
                            de.name_en AS dropoff_city_name,
                            pl.name_en AS pickup_location_name,
                            dl.name_en AS dropoff_location_name
                        FROM
                            bookings b
                            left join cars c on c.id = b.car_id
                            left join car_groups cg on cg.id = b.group_id
                            left join cities pe on pe.id = b.pickup_city_id
                            left join cities de on de.id = b.dropoff_city_id
                            left join locations pl on pl.id = b.pickup_location_id
                            left join locations dl on dl.id = b.dropoff_location_id
        
                        ${where} ORDER BY id DESC LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;

        const count_query = `SELECT count(*) as total_bookings FROM bookings b ${where}`;
        const result = await this.bookingService.executeRawQuery(query);

        const count_result = await this.bookingService.executeRawQuery(count_query);
        return {
            data: result,
            total_records: count_result[0].total_bookings
        }
    }

    @Get('detail/:booking_number')
    async detail(@Param('booking_number') booking_number: string) {
        const lang = LanguageTypes.ENGLISH;
        const relations = {
            car: { columns: ['id', `name_${lang}`, 'image'] },
            group: { columns: ['id', `name_${lang}`] },
            pickup_location: { columns: ['id', `name_${lang}`] },
            dropoff_location: { columns: ['id', `name_${lang}`] },
            pickup_city: { columns: ['id', `name_${lang}`] },
            dropoff_city: { columns: ['id', `name_${lang}`] },
            monthly_installments: { columns: [`due_date`, `total_amount`] },
            broker: { columns: ['id', 'name'] }
        }

        return await this.bookingService.getAll({ booking_number }, [], relations, BookingService.LEFT_JOIN, false, 0, 0, { column: 'entity_id', order: 'DESC' });
    }

    @Get('incomplete')
    async incomplete(@Query() params: BookingDto) {
        const page = params.page ?? 1;
        const page_size = params.page_size ?? 10;

        // Build date filter conditions - use range comparison instead of DATE() for index usage
        let dateConditions = '';
        if (params.to) {
            const toDate = new Date(params.to).toISOString().split('T')[0];
            dateConditions += ` AND b.created_at <= '${toDate} 23:59:59'`;
        } else {
            const toDate = new Date().toISOString().split('T')[0];
            dateConditions += ` AND b.created_at <= '${toDate} 23:59:59'`;
        }

        if (params.from) {
            const fromDate = new Date(params.from).toISOString().split('T')[0];
            dateConditions += ` AND b.created_at >= '${fromDate} 00:00:00'`;
        }

        let userEmailCondition = '';
        if (params.user_email) {
            userEmailCondition = ` AND b.user_email = '${params.user_email}'`;
        }

        // Optimized subquery: Use LEFT JOIN instead of NOT EXISTS for better performance
        // First get max successful booking id per user, then filter incomplete bookings
        // that have no successful booking after them (i.e., their id > max_success_id or user has no successful bookings)
        const latestIncompleteSubquery = `
            SELECT b.user_email, MAX(b.id) as latest_id
            FROM bookings b
            LEFT JOIN (
                SELECT user_email, MAX(id) as max_success_id
                FROM bookings
                WHERE (payment_type = 'now' AND payment_status = 1) OR payment_type = 'later'
                GROUP BY user_email
            ) ls ON b.user_email = ls.user_email
            WHERE 
                b.payment_type = 'now' 
                AND b.payment_status = 0
                AND (ls.max_success_id IS NULL OR b.id > ls.max_success_id)
                ${dateConditions}
                ${userEmailCondition}
            GROUP BY b.user_email
        `;

        const query = `SELECT 
                            b.*,
                            c.name_en AS car_name,
                            cg.name_en AS group_name,
                            pe.name_en AS pickup_city_name,
                            de.name_en AS dropoff_city_name,
                            pl.name_en AS pickup_location_name,
                            dl.name_en AS dropoff_location_name
                        FROM
                            bookings b
                        INNER JOIN (${latestIncompleteSubquery}) AS latest 
                            ON b.id = latest.latest_id
                        LEFT JOIN cars c ON c.id = b.car_id
                        LEFT JOIN car_groups cg ON cg.id = b.group_id
                        LEFT JOIN cities pe ON pe.id = b.pickup_city_id
                        LEFT JOIN cities de ON de.id = b.dropoff_city_id
                        LEFT JOIN locations pl ON pl.id = b.pickup_location_id
                        LEFT JOIN locations dl ON dl.id = b.dropoff_location_id`;

        const record_query = `${query} ORDER BY b.id DESC LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`;

        const count_query = `SELECT COUNT(*) as total FROM (${latestIncompleteSubquery}) as count_query`;
        const result = await this.bookingService.executeRawQuery(record_query);

        const count_result = await this.bookingService.executeRawQuery(count_query);
        return {
            data: result,
            total_records: count_result[0]?.total || 0
        }
    }
}
