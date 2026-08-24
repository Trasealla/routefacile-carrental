import { Body, Controller, Get, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CancelBookingService } from '../services/cancel.booking.service'; 
import { CancellationPolicyService } from '../services/cancellation.policy.service';
import { CancelBookingDto } from './cancel.booking.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CancelBookingEvent } from 'src/event/events/cacnel.booking.event';

@ApiTags('booking-form')
@UseGuards(JwtAuthGuard)
@Controller('cancel/booking')
export class CancelBookingController {
    constructor(
        @Inject(CancelBookingService) private cancelBookingService: CancelBookingService,
        @Inject(CancellationPolicyService) private cancellationPolicyService: CancellationPolicyService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /**
     * Check whether the authenticated user is eligible to cancel a booking today (UAE time).
     * Returns eligibility status, count, limit, and allowed alternative actions.
     */
    @Get('eligibility')
    async checkEligibility(@Request() req) {
        const user_id = req.user.id;
        return this.cancellationPolicyService.checkEligibility(user_id);
    }

    @Post()
    async cancel(@Body() body: CancelBookingDto, @Request() req) {
        const user_id = req.user.id;

        // Enforce daily cancellation limit (1 per UAE calendar day)
        await this.cancellationPolicyService.enforceLimit(user_id);

        const booking = await this.cancelBookingService.validateBooking(body, user_id)
        const response = await this.cancelBookingService.cancelBooking(body, booking)

        // Record successful cancellation in audit table
        await this.cancellationPolicyService.recordCancellation(
            user_id,
            booking.id,
            body.cancellation_reason,
        );

        this.eventEmitter.emit('cancel.booking', new CancelBookingEvent(booking.id));
        return response
    }
}
