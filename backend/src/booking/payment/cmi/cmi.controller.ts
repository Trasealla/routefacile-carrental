import { Body, Controller, HttpStatus, Inject, Post, Redirect, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BookingRepoService } from '../../services/booking.repo.service';
import { BookingService } from '../../services/booking.service';
import { BookingPaymentTransactionService } from '../booking.payment.transaction.service';
import { CmiService } from './cmi.service';
import { CmiInitiateDto } from './cmi.initiate.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { Booking } from 'src/entities/booking.entity';
import { BookingActions } from 'src/entities/enums/booking.action';
import { ConfirmBookingEvent } from 'src/event/events/confirm.booking.event';
import { EditBookingEvent } from 'src/event/events/edit.booking.event';
import { ExtendBookingEvent } from 'src/event/events/extend.booking.event';

/**
 * CMI (Morocco / NestPay) hosted-page payment controller.
 *
 *  POST /booking/cmi/initiate  (JWT)   -> returns { gateway_url, request_data } to auto-submit
 *  POST /booking/cmi/callback  (public)-> server-to-server, source of truth, plain-text reply
 *  POST /booking/cmi/ok|fail   (public)-> where the customer's browser lands, redirect to FE
 */
@ApiTags('booking-form')
@Controller('booking/cmi')
export class CmiController {
    constructor(
        @Inject(BookingRepoService) private bookingRepo: BookingRepoService,
        @Inject(CmiService) private cmi: CmiService,
        @Inject(BookingPaymentTransactionService) private bp_transaction: BookingPaymentTransactionService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Build the signed est3Dgate form for an unpaid PAY_NOW booking. The frontend
     * takes `request_data`, drops it into a hidden auto-submitting <form> and posts
     * it to `gateway_url` so the customer lands on CMI's hosted page.
     */
    @UseGuards(JwtAuthGuard)
    @Post('initiate')
    async initiate(@Body() body: CmiInitiateDto) {
        const where = {
            id: body.booking_id,
            payment_status: BookingRepoService.INACTIVE,
            payment_type: PaymentTypes.PAY_NOW,
        };
        const relations = {
            monthly_installments: { columns: ['id', 'installment_no', 'total_amount'] },
        };
        const booking = await this.bookingRepo.getOne(where, [], relations, BookingService.LEFT_JOIN);

        if (!booking) {
            return { status: 'error', message: 'Booking not found or already paid' };
        }

        const oid = this.cmi.generateOid(booking);
        await this.bookingRepo.update({ id: booking.id }, { payment_triggered: 1, cmi_oid: oid });

        const params = this.cmi.buildParams(booking, oid, body.lang || 'fr');

        // Log without secrets
        await this.bp_transaction.insert({
            type: 'CMI_INITIATE',
            booking_id: booking.id,
            payload: { ...params, hash: '***', clientid: '***' },
            merchant_reference: oid,
        });

        return {
            status: 'success',
            gateway_url: this.cmi.gatewayUrl(),
            request_data: params,
        };
    }

    /**
     * Server-to-server result. THIS marks the booking paid — verify the hash,
     * match the order and amount, act only on ProcReturnCode "00", and stay
     * idempotent (CMI can retry). Reply in plain text, HTTP 200, no HTML.
     */
    @ApiExcludeEndpoint()
    @Post('callback')
    async callback(@Body() body: any, @Res() res) {
        const oid = body?.oid;
        const booking = await this.bookingRepo.getOne({ cmi_oid: oid });

        if (booking) {
            await this.bp_transaction.insert({
                type: 'CMI_CALLBACK',
                booking_id: booking.id,
                payload: body,
                merchant_reference: oid,
            });
        }

        // 1) Verify signature first — an unverified callback is a forged payment.
        if (!this.cmi.verifyCallback(body)) {
            await this.cmi.sendErrorNotification(booking, body, 'CMI_CALLBACK_HASH_MISMATCH');
            return res.status(HttpStatus.OK).type('text/plain').send('FAILURE');
        }

        if (!booking) {
            await this.cmi.sendErrorNotification(null, body, 'CMI_CALLBACK_ORDER_NOT_FOUND');
            return res.status(HttpStatus.OK).type('text/plain').send('FAILURE');
        }

        // 2) Amount tampering check.
        if (!this.cmi.amountMatches(booking, body)) {
            await this.cmi.sendErrorNotification(booking, body, 'CMI_CALLBACK_AMOUNT_MISMATCH');
            return res.status(HttpStatus.OK).type('text/plain').send('FAILURE');
        }

        // 3) Idempotency — a second callback must not double-fulfil.
        if (booking.payment_status === BookingService.PAYMENT_STATUS_DONE) {
            return res.status(HttpStatus.OK).type('text/plain').send('APPROVED');
        }

        // 4) Act on the outcome.
        if (this.cmi.isApproved(body)) {
            await this.bookingRepo.update(
                { id: booking.id },
                { payment_status: BookingService.PAYMENT_STATUS_DONE, cmi_response: body },
            );
            this.sendNotification(booking);
            // trantype=Auth captures immediately -> just acknowledge.
            // trantype=PreAuth -> reply ACTION=POSTAUTH to capture.
            const reply = (process.env.CMI_TRAN_TYPE || 'Auth') === 'PreAuth' ? 'ACTION=POSTAUTH' : 'APPROVED';
            return res.status(HttpStatus.OK).type('text/plain').send(reply);
        }

        await this.cmi.sendErrorNotification(booking, body, 'CMI_CALLBACK_REFUSED');
        return res.status(HttpStatus.OK).type('text/plain').send('FAILURE');
    }

    /** Browser lands here on success — display only, never mark paid from here. */
    @ApiExcludeEndpoint()
    @Post('ok')
    @Redirect()
    async ok(@Body() body: any) {
        const booking = body?.oid ? await this.bookingRepo.getOne({ cmi_oid: body.oid }) : null;
        return { url: `${process.env.FRONTEND_HOST}${CmiService.PAYMENT_SUCCESS_URL}?id=${booking?.id ?? ''}` };
    }

    /** Browser lands here on failure/abandon. */
    @ApiExcludeEndpoint()
    @Post('fail')
    @Redirect()
    async fail(@Body() body: any) {
        const failMsg = encodeURIComponent(String(body?.ErrMsg || body?.mdErrorMsg || 'payment_failed')).substring(0, 120);
        return { url: `${process.env.FRONTEND_HOST}${CmiService.PAYMENT_FAILURE_URL}?reason=${failMsg}` };
    }

    private sendNotification(booking: Booking) {
        switch (booking.action) {
            case BookingActions.BOOK:
                this.eventEmitter.emit('confirm.booking', new ConfirmBookingEvent(booking.id));
                break;
            case BookingActions.EDIT:
                this.eventEmitter.emit('edit.booking', new EditBookingEvent(booking.id));
                break;
            case BookingActions.EXTEND:
                this.eventEmitter.emit('extend.booking', new ExtendBookingEvent(booking.id));
                break;
        }
    }
}
