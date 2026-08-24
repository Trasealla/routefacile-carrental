import { Controller, Get, Inject, Param, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingRepoService } from './services/booking.repo.service';

@ApiTags('booking')
@Controller('booking')
export class PublicBookingController {
    constructor(
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService
    ) { }

    @Get('by-number/:booking_number')
    async getByBookingNumber(@Param('booking_number') booking_number: string) {
        const query = `SELECT
            b.*,
            c.name_en            AS car_name_en,
            c.name_ar            AS car_name_ar,
            cg.name_en           AS car_group_name_en,
            cg.name_ar           AS car_group_name_ar,
            pl.name_en           AS pickup_location_name_en,
            dl.name_en           AS dropoff_location_name_en,
            pe.name_en           AS pickup_city_name_en,
            de.name_en           AS dropoff_city_name_en
        FROM bookings b
        LEFT JOIN cars        c  ON c.id  = b.car_id
        LEFT JOIN car_groups  cg ON cg.id = b.group_id
        LEFT JOIN locations   pl ON pl.id = b.pickup_location_id
        LEFT JOIN locations   dl ON dl.id = b.dropoff_location_id
        LEFT JOIN cities    pe ON pe.id = b.pickup_city_id
        LEFT JOIN cities    de ON de.id = b.dropoff_city_id
        WHERE b.booking_number = ?
        ORDER BY b.id DESC
        LIMIT 1`;

        const result = await this.bookingRepoService.executeRawQueryWithParams({
            query,
            params: [booking_number]
        });
        
        if (result.length === 0) {
            throw new BadRequestException({
                success: false,
                error: {
                    code: 'BOOKING_NOT_FOUND',
                    message: `Booking with number ${booking_number} not found`
                }
            });
        }

        const booking = result[0];
        const user_id = booking.user_id;

        // Get user documents for this booking's user (TypeORM soft delete = NULL deleted_at)
        const documentsQuery = `SELECT
            ud.id,
            ud.doc_type,
            ud.front_image,
            ud.back_image,
            ud.created_at,
            ud.updated_at
        FROM user_documents ud
        WHERE ud.user_id = ?
        AND ud.deleted_at IS NULL
        ORDER BY ud.id ASC`;

        const documents = await this.bookingRepoService.executeRawQueryWithParams({
            query: documentsQuery,
            params: [user_id]
        });

        // Format document paths
        const fileServer = process.env.FILE_SERVER || '';
        const documentPath = `${fileServer}/user/${user_id}/`;
        
        const formattedDocuments = documents.map((doc: any) => ({
            id: doc.id,
            doc_type: doc.doc_type,
            front_image: doc.front_image ? `${documentPath}${doc.front_image}` : null,
            back_image: doc.back_image ? `${documentPath}${doc.back_image}` : null,
            created_at: doc.created_at,
            updated_at: doc.updated_at
        }));

        return {
            success: true,
            data: {
                ...booking,
                user_documents: formattedDocuments
            }
        };
    }
}

