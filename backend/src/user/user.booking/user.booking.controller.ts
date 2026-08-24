import { Controller, Get, Inject, NotFoundException, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserBookingService } from './user.booking.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { BookingActions } from 'src/entities/enums/booking.action';
import { CARS_PATH } from 'src/config/contants';
import { SortTypes } from 'src/entities/enums/sort.type';


@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user/booking')
export class UserBookingController {

    constructor(
        @Inject(UserBookingService) private userBookingService: UserBookingService
    ) { }

    @ApiParam({
        name: 'type',
        type: 'string',
        description: 'current, coming, past, cancelled'
    })
    @Get('listing/:type')
    async index(@Param('type') type: string, @Query() query: PaginationDto, @Request() req) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const user_id = req.user.id;

        let bQuery;
        switch (type) {
            case UserBookingService.CURRENT:
                bQuery = this.userBookingService.currentBookingsQuery(user_id, lang)
                break;
            case UserBookingService.COMING:
                bQuery = this.userBookingService.upcomingBookingsQuery(user_id, lang)
                break;
            case UserBookingService.PAST:
                bQuery = this.userBookingService.pastBookingsQuery(user_id, lang)
                break;
            case UserBookingService.CANCELLED:
                bQuery = this.userBookingService.cancelledBookingsQuery(user_id, lang)
                break;
            default:
                bQuery = ''
        }

        const response = await this.userBookingService.executeRawQuery(bQuery);

        const path = process.env.FILE_SERVER + CARS_PATH;
        const data = this.userBookingService.removePostfix(response, { image: path })

        return {
            total_records: response.length,
            data: data
        };
    }

    @Get('detail/:id')
    async detail(@Param('id') id: number, @Query() query: PaginationDto, @Request() req) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const user_id = req.user.id;
        const relations = {
            car: { columns: ['id', `name_${lang}`, 'image'] },
            group: { columns: ['id', `name_${lang}`] },
            pickup_location: { columns: ['id', `name_${lang}`] },
            dropoff_location: { columns: ['id', `name_${lang}`] },
            pickup_city: { columns: ['id', `name_${lang}`] },
            dropoff_city: { columns: ['id', `name_${lang}`] }
        }
        const where = { user_id, id };

        const booking = await this.userBookingService.getOne(where, [], relations, UserBookingService.LEFT_JOIN)
        if (booking) {
            const path = process.env.FILE_SERVER + CARS_PATH;
            const data = this.userBookingService.removePostfix(booking, { image: path })
            const history_where = { id: Not(booking.id), booking_number: booking.booking_number }
            const history = await this.userBookingService.getAll(history_where, [], relations, UserBookingService.LEFT_JOIN, true, query.page, query.page_size)
            return {
                data,
                history: this.userBookingService.removePostfix(history.data, { image: path })
            };
        }

        throw new NotFoundException();
    }

    @Get('latest/:booking_number')
    async latest(@Param('booking_number') booking_number: string, @Query() query: PaginationDto, @Request() req) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const user_id = req.user.id;
        const relations = {
            car: { columns: ['id', `name_${lang}`, 'image'] },
            group: { columns: ['id', `name_${lang}`] },
            pickup_location: { columns: ['id', `name_${lang}`] },
            dropoff_location: { columns: ['id', `name_${lang}`] },
            pickup_city: { columns: ['id', `name_${lang}`] },
            dropoff_city: { columns: ['id', `name_${lang}`] },
            monthly_installments: { columns: ['id', 'total_amount', 'installment_no', 'actual_amount', 'previous_total_amount'] }
        }
        // @todo: get confirm booking based on booking_number (pay_later or (pay_now AND payment_status=1))
        const where = { user_id, booking_number };

        const booking = await this.userBookingService.getOne(where, [], relations, UserBookingService.LEFT_JOIN, { column: 'entity.id', order: SortTypes.DESC })
        if (booking) {
            const path = process.env.FILE_SERVER + CARS_PATH;
            const data = this.userBookingService.removePostfix(booking, { image: path })
            return {
                data,
            };
        }

        throw new NotFoundException();
    }
}
