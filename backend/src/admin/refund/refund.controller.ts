import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { BookingService } from '../booking/booking.service';
import { RefundDto } from './refund.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'accounts')
@Controller('admin/refund')
export class RefundController {

    constructor(
        @Inject(BookingService) private bookingService: BookingService
    ) { }

    @Get()
    async index(@Query() params: RefundDto) {

        const page = params.page ?? 1;
        const page_size = params.page_size ?? 10;

        let where = `b.payment_type = 'now'
                    AND b.payment_status = 1
                    AND b.total_amount > 0
                    AND (b.action = 'cancel'
                        OR (b.action = 'edit'
                            AND CASE
                                WHEN b.type = 'daily' THEN b.previous_total_amount > b.actual_total_amount
                                ELSE bmi.previous_total_amount > bmi.actual_amount
                                END
                            )
                        )`;

        if (params.booking_number) {
            where += ` AND b.booking_number = '${params.booking_number}'`;
        }

        if (params.user_email) {
            where += ` AND b.user_email = '${params.user_email}'`;
        }

        const query = `SELECT 
                        b.id,
                        b.booking_number,
                        b.booking_log_number,
                        CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_name,
                        b.user_email AS user_email,
                        CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
                        CASE b.action
                            WHEN 'edit' THEN 'Edited'
                            ELSE 'Cancelled'
                        END AS action,
                        b.type,
                        CASE
                            WHEN b.type = 'daily' THEN b.total_amount
                            ELSE bmi.actual_amount
                        END AS total_amount,
                        CASE
                            WHEN b.type = 'daily' THEN b.previous_total_amount
                            ELSE bmi.previous_total_amount
                        END AS previous_total_amount,
                        CASE
                            WHEN b.action = 'cancel' THEN b.cancellation_date_time
                            ELSE b.booking_date
                        END AS time,
                        b.cancellation_reason
                    FROM
                        bookings AS b
                            LEFT JOIN
                        booking_monthly_installments AS bmi ON b.id = bmi.booking_id
                            AND bmi.installment_no = 1
                        WHERE ${where}
                        `;

        const record_query = `${query}  ORDER BY b.id DESC LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`

        const result = await this.bookingService.executeRawQuery(record_query);

        const count_result = await this.bookingService.executeRawQuery(query);

        return {
            data: result,
            total_records: count_result.length
        }
    }

}
