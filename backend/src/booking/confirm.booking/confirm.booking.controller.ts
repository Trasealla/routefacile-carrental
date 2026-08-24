import { Body, Controller, Inject, Ip, Post, Request, UseGuards } from '@nestjs/common';
import { ConfirmBookingDto } from './confirm.booking.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { ConfirmBookingService } from './confirm.booking.service';

@ApiTags('booking-form')
@UseGuards(JwtAuthGuard)
@Controller('confirm/booking')
export class ConfirmBookingController {
    constructor(
        @Inject(UserService) private userService: UserService,
        @Inject(ConfirmBookingService) private confirmBookingService: ConfirmBookingService,
    ) { }

    @Post()
    async confirm(@Body() body: ConfirmBookingDto, @Request() req, @Ip() ip) {
        const user = await this.userService.getOne({ id: req.user.id });
        return this.confirmBookingService.confirmForUser(body, user, ip);
    }
}
