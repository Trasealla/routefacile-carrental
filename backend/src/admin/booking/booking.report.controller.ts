import { Body, Controller, Inject, Post, UseGuards, StreamableFile } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { BookingService } from './booking.service';
import { BookingReportDto } from './booking.report.dto';
import * as XLSX from 'xlsx';


@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/booking/report')
export class BookingReportController {
    constructor(
        @Inject(BookingService) private bookingService: BookingService
    ) { }

    @Post()
    async index(@Body() body: BookingReportDto) {

        const result = await this.bookingService.executeRawQuery(this.reportQuery(body));
        const data = result.map(obj => Object.values(obj));


        const fileName = `bookings_${Date.now()}.xlsx`;

        var workbook = XLSX.utils.book_new();
        var worksheet = XLSX.utils.json_to_sheet(
            data
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.utils.sheet_add_aoa(worksheet, [this.worksheetColumns()], { origin: "A1" });

        const upload_path = `./uploads/admin/booking/reports/${fileName}`;

        XLSX.writeFileXLSX(workbook, upload_path);

        return {path: `${process.env.FILE_SERVER}/admin/booking/reports/${fileName}`};
    }

    reportQuery(body: BookingReportDto) {
        return `SELECT 
                b.id AS 'Sr. No',
                b.booking_number AS 'Booking number',
                b.booking_log_number AS 'Booking ID',
                DATE_FORMAT(b.booking_date, '%d-%b-%Y') AS 'Booking Date',
                b.type AS 'Booking Type',
                CASE WHEN b.booking_months IS NULL THEN 0 ELSE b.booking_months END AS 'Month Time',
                b.total_amount AS 'Booking Amount',
                CASE WHEN b.payment_type = 'now' THEN 'Pay Now' ELSE 'Pay Later' END AS 'Pay Type',
                CONCAT(b.user_first_name, ' ', b.user_last_name) AS 'User Name',
                b.user_email AS 'User Email',
                CONCAT(b.user_phone_code, b.user_phone_number) AS 'User Phone',
                c.name_en AS 'Car Name',
                b.pickup_type AS 'Pickup Type',
                COALESCE(pe.name_en, '') AS 'Pickup City',
                COALESCE(pl.name_en, '') AS 'Pickup Location',
                COALESCE(b.pickup_address, '') AS 'Pickup Address',
                DATE_FORMAT(b.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS 'Pickup Date & Time',
                b.dropoff_type AS 'Dropoff Type',
                COALESCE(de.name_en, '') AS 'Dropoff City',
                COALESCE(dl.name_en, '') AS 'Dropoff Location',
                COALESCE(b.dropoff_address, '') AS 'Dropoff Address',
                DATE_FORMAT(b.dropoff_date_time, '%e/%c/%Y %l:%i:%s %p') AS 'Dropoff Date & Time',
                CASE b.action WHEN 'book' THEN 'Booked' WHEN 'edit' THEN 'Edited' WHEN 'extend' THEN 'Extend' ELSE 'Cancelled' END AS Status,
                COALESCE(b.payfort_id, '') AS 'Payment Reference',
                b.booking_days AS 'No Of Days',
                DATEDIFF(b.pickup_date_time, b.booking_date) AS 'No Of Advance Days',
                b.car_rate_total AS 'Car Rate',
                b.inter_cities_charges AS 'Inter City Charges',
                (b.pickup_parking_charges + b.dropoff_parking_charges) AS 'Parking Charges',
                b.vmd_charges AS 'VMD Charges',
                b.delivery_charges AS 'Delivery Charges',
                b.collection_charges AS 'Collect Charges',
                COALESCE(b.coupon_code, '') AS 'Coupon Code',
                b.vat_amount AS 'Tax Amount',
                CASE b.booking_source WHEN 'web' THEN 'Website' WHEN 'broker' THEN 'Broker' WHEN 'api' THEN 'API' ELSE 'Mobile' END AS 'Source',
                COALESCE(br.name, '') AS 'Broker',
                COALESCE(b.broker_reference, '') AS 'Broker Reference'
            FROM
                bookings AS b
                    INNER JOIN
                (SELECT
                    booking_number, MAX(id) AS latest_id
                FROM
                    bookings
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
                brokers AS br ON br.id = b.broker_id
            WHERE
                b.id > ${body.from} 
                    AND (CASE
                    WHEN b.payment_type = 'now' THEN b.payment_status = 1
                    ELSE 1 = 1
                END)
            ORDER BY b.id ASC;`;
    }

    worksheetColumns() {
        return [
            'Sr. No',
            'Booking number',
            'Booking ID',
            'Booking Date',
            'Booking Type',
            'Month Time',
            'Booking Amount',
            'Pay Type',
            'User Name',
            'User Email',
            'User Phone',
            'Car Name',
            'Pickup Type',
            'Pickup City',
            'Pickup Location',
            'Pickup Address',
            'Pickup Date & Time',
            'Dropoff Type',
            'Dropoff City',
            'Dropoff Location',
            'Dropoff Address',
            'Dropoff Date & Time',
            'Status',
            'Payment Reference',
            'No Of Days',
            'No Of Advance Days',
            'Car Rate',
            'Inter City Charges',
            'Parking Charges',
            'VMD Charges',
            'Delivery Charges',
            'Collect Charges',
            'Coupon Code',
            'Tax Amount',
            'Source',
            'Broker',
            'Broker Reference'
        ];
    }
}
