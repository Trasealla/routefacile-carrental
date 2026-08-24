import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { UserService } from 'src/user/user.service';
import { UserBookingDto } from './user.booking.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user/booking')
export class UserBookingController {


    constructor(
        @Inject(UserService) private userService: UserService
    ) { }

    @Get()
    async index(@Query() params: UserBookingDto) {

        const page = params.page ?? 1;
        const page_size = params.page_size ?? 10;

        // Build the filter clause with bound parameters. Previously these values
        // were interpolated straight into the SQL string, which let a crafted
        // `user_email` inject arbitrary SQL (e.g. `x' OR 1=1 -- `) and dump every
        // user row. All user-supplied values now travel as `?` placeholders.
        const filters: string[] = ['1=1'];
        const filterParams: any[] = [];

        if (params.gender) {
            filters.push('u.gender = ?');
            filterParams.push(params.gender);
        }
        if (params.user_email) {
            // Escape LIKE wildcards so a literal % / _ in the input can't widen the match.
            const escaped = params.user_email.replace(/[\\%_]/g, '\\$&');
            filters.push("u.email LIKE ? ESCAPE '\\\\'");
            filterParams.push(`${escaped}%`);
        }
        if (params.booked_at_from) {
            filters.push('b.booking_date >= ?');
            filterParams.push(params.booked_at_from);
        }
        if (params.booked_at_to) {
            filters.push('b.booking_date <= ?');
            filterParams.push(params.booked_at_to);
        }
        // Registration-date filter. The admin UI labels these "Registration Date
        // From/To" and sends registered_from/registered_to; they filter on the
        // user's created_at. Previously the backend ignored them entirely.
        if (params.registered_from) {
            filters.push('u.created_at >= ?');
            filterParams.push(params.registered_from);
        }
        if (params.registered_to) {
            // Inclusive of the whole end day.
            filters.push('u.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
            filterParams.push(params.registered_to);
        }

        const where = `WHERE ${filters.join(' AND ')}`;

        // Subquery to count bookings per user
        const bookingCountSubquery = `(SELECT
            user_id,
            COUNT(*) AS booking_count
        FROM bookings
        WHERE (payment_type != 'now' OR payment_status = 1)
        GROUP BY user_id) AS bc`;

        const baseQuery = `SELECT
                            b.id,
                            CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                            u.email AS user_email,
                            CONCAT(u.phone_code, u.phone_number) AS user_phone,
                            u.gender,
                            u.dob,
                            c.name_en AS country,
                            b.booking_date,
                            u.created_at AS registered_at,
                            COALESCE(bc.booking_count, 0) AS total_bookings,
                            u.id AS user_id
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
                            RIGHT JOIN users AS u ON u.id = b.user_id
                            LEFT JOIN ${bookingCountSubquery} ON bc.user_id = u.id
                            LEFT JOIN countries AS c ON c.id = u.country_id
                                ${where}`;

        // Sort key comes from a fixed allow-list, never from the raw string — so
        // even though it can't be a bound parameter (it's an identifier, not a
        // value) it can only ever be one of these two safe expressions.
        let orderBy = 'user_id DESC';
        if (params.sort_by === 'total_bookings_asc') {
            orderBy = 'total_bookings ASC, user_id DESC';
        } else if (params.sort_by === 'total_bookings_desc') {
            orderBy = 'total_bookings DESC, user_id DESC';
        }

        // Booking-count filter. min_booking_count is validated as a number by the
        // DTO; bind it too rather than concatenating.
        let outerWhere = '';
        const outerParams: any[] = [];
        if (params.min_booking_count !== undefined && params.min_booking_count !== null) {
            outerWhere = ' WHERE total_bookings >= ?';
            outerParams.push(parseInt(params.min_booking_count.toString(), 10));
        }

        let query: string;

        if (params.user === true || params.user === 'true' as any) {
            // When user=true, return unique users only (grouped by user_id)
            query = `SELECT
                            MAX(id) AS id,
                            user_name,
                            user_email,
                            user_phone,
                            gender,
                            dob,
                            country,
                            MAX(booking_date) AS booking_date,
                            registered_at,
                            CAST(MAX(total_bookings) AS UNSIGNED) AS total_bookings,
                            user_id
                        FROM (${baseQuery}) AS subquery${outerWhere}
                        GROUP BY user_id, user_name, user_email, user_phone, gender, dob, country, registered_at`;
        } else {
            // Default: return all records (may have duplicate users)
            query = `SELECT
                            id,
                            user_name,
                            user_email,
                            user_phone,
                            gender,
                            dob,
                            country,
                            booking_date,
                            registered_at,
                            CAST(total_bookings AS UNSIGNED) AS total_bookings,
                            user_id
                        FROM (${baseQuery}) AS subquery${outerWhere}`;
        }

        // Parameter order must match the order the placeholders appear in the SQL:
        // inner filter params (inside baseQuery) first, then the outer WHERE param.
        const sharedParams = [...filterParams, ...outerParams];

        const record_query = `${query} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const record_params = [...sharedParams, page_size, page_size * (page - 1)];

        const result = await this.userService.executeRawQueryWithParams({
            query: record_query,
            params: record_params,
        });

        const count_result = await this.userService.executeRawQueryWithParams({
            query,
            params: sharedParams,
        });

        // Convert total_bookings to integer
        const formattedResult = result.map((item: any) => ({
            ...item,
            total_bookings: parseInt(item.total_bookings, 10) || 0
        }));

        return {
            data: formattedResult,
            total_records: count_result.length
        }
    }
}
