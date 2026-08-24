import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Booking } from 'src/entities/booking.entity';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { BookingPaymentTransactionService } from '../booking.payment.transaction.service';
import { MailService } from 'src/mail/mail.service';
import { PAYMENT_ERROR_RECIPIENT } from 'src/config/contants';

/**
 * CMI (Centre Monétique Interbancaire) — Morocco.
 *
 * CMI runs on the Payten / Asseco NestPay platform, so this is the standard
 * `est3Dgate` hosted-page flow: we build a signed HTML form the customer's
 * browser POSTs to CMI, the customer pays on CMI's page, and CMI notifies us
 * server-to-server on `callbackUrl` (the source of truth) plus a browser
 * redirect to `okUrl` / `failUrl`.
 *
 * Modelled on the gateway integration this replaced, so the wiring,
 * transaction logging and booking-event emission all stay consistent.
 */
@Injectable()
export class CmiService {
    // Server-to-server + browser return endpoints (mounted under the global /api/v1 prefix)
    static CALLBACK_URL = '/api/v1/booking/cmi/callback';
    static OK_URL = '/api/v1/booking/cmi/ok';
    static FAIL_URL = '/api/v1/booking/cmi/fail';

    // Frontend result pages
    static PAYMENT_SUCCESS_URL = '/paymentsuccess';
    static PAYMENT_FAILURE_URL = '/paymentfailed';

    static CURRENCY_MAD = '504'; // ISO 4217 numeric for MAD
    static COUNTRY_MOROCCO = '504';
    static APPROVED_PROC_CODE = '00';
    static TEST_GATEWAY = 'https://testpayment.cmi.co.ma/fim/est3Dgate';
    static PROD_GATEWAY = 'https://payment.cmi.co.ma/fim/est3Dgate';

    constructor(
        @Inject(BookingPaymentTransactionService) private bp_transaction: BookingPaymentTransactionService,
        @Inject(MailService) private mailService: MailService,
    ) { }

    gatewayUrl(): string {
        return process.env.CMI_GATEWAY_URL || CmiService.TEST_GATEWAY;
    }

    /**
     * A unique order id per payment attempt. CMI forbids reusing an `oid`, so we
     * suffix the booking log number with a base-36 timestamp and persist it on the
     * booking (`cmi_oid`) so the callback can map back to the booking.
     */
    generateOid(booking: Booking): string {
        return `${booking.booking_log_number}-${Date.now().toString(36)}`.toUpperCase();
    }

    /**
     * Amount in major units with 2 decimals ("250.00"). For monthly bookings we
     * charge the first installment, matching PaymentService.getAmount().
     */
    getAmount(booking: Booking): string {
        let amount = booking.total_amount;
        if (booking.type == BookingTypes.MONTHLY && Array.isArray(booking.monthly_installments)) {
            const first = booking.monthly_installments.find((i) => i.installment_no == 1);
            if (first) amount = first.total_amount;
        }
        return Number(amount).toFixed(2);
    }

    /**
     * Build the full set of form fields (including `hash`) to POST to est3Dgate.
     * `storekey` is NEVER included in the posted form — it only feeds the hash.
     */
    buildParams(booking: Booking, oid: string, lang = 'fr'): Record<string, string> {
        const base = process.env.NODE_HOST;

        const params: Record<string, string> = {
            clientid: process.env.CMI_CLIENT_ID || '',
            storetype: process.env.CMI_STORE_TYPE || '3D_PAY_HOSTING',
            trantype: process.env.CMI_TRAN_TYPE || 'Auth',
            amount: this.getAmount(booking),
            currency: CmiService.CURRENCY_MAD,
            oid,
            okUrl: `${base}${CmiService.OK_URL}`,
            failUrl: `${base}${CmiService.FAIL_URL}`,
            callbackUrl: `${base}${CmiService.CALLBACK_URL}`,
            shopurl: process.env.CMI_SHOP_URL || process.env.FRONTEND_HOST || '',
            lang: ['fr', 'ar', 'en'].includes(lang) ? lang : 'fr',
            email: booking.user_email || '',
            tel: `${booking.user_phone_code || ''}${booking.user_phone_number || ''}`,
            BillToName: `${booking.user_first_name || ''} ${booking.user_last_name || ''}`.trim().substring(0, 60),
            BillToCompany: '',
            BillToStreet1: (booking.pickup_address || 'N/A').toString().substring(0, 60),
            BillToCity: '',
            BillToStateProv: '',
            BillToPostalCode: '',
            BillToCountry: CmiService.COUNTRY_MOROCCO,
            rnd: crypto.randomBytes(16).toString('hex'),
            hashAlgorithm: 'ver3',
            encoding: 'UTF-8',
            refreshtime: process.env.CMI_REFRESH_TIME || '5',
            AutoRedirect: 'true',
            CallbackResponse: 'true',
        };

        // Trim every posted value so what we hash === what we post (a trailing
        // space or \r\n silently breaks the ver3 hash).
        for (const k of Object.keys(params)) {
            params[k] = String(params[k]).trim();
        }

        params.hash = this.computeHash(params, process.env.CMI_STORE_KEY || '');
        return params;
    }

    /**
     * NestPay ver3 hash.
     *   1. all params except `hash` and `encoding`
     *   2. sort names case-insensitively (ASCII)
     *   3. join escaped values with "|"   (escape backslash FIRST, then pipe)
     *   4. append "|" + escaped(storekey)
     *   5. hash = base64( raw sha512( plaintext ) )   — base64 of the BINARY digest
     */
    computeHash(params: Record<string, any>, storeKey: string): string {
        const escape = (v: any) =>
            String(v ?? '')
                .replace(/\\/g, '\\\\')
                .replace(/\|/g, '\\|');

        const names = Object.keys(params)
            .filter((k) => {
                const lk = k.toLowerCase();
                return lk !== 'hash' && lk !== 'encoding';
            })
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'en'));

        const plaintext =
            names.map((k) => escape(String(params[k]).trim())).join('|') + '|' + escape(storeKey);

        return crypto.createHash('sha512').update(plaintext, 'utf8').digest('base64');
    }

    /**
     * Recompute the hash over every POSTed field except `hash`/`HASH` and
     * `encoding` and compare (constant-time) with the received `HASH`. An
     * unverified callback is a forged payment — reject it.
     */
    verifyCallback(body: Record<string, any>): boolean {
        const received = body.HASH || body.hash;
        if (!received) return false;
        const computed = this.computeHash(body, process.env.CMI_STORE_KEY || '');
        const a = Buffer.from(String(received));
        const b = Buffer.from(String(computed));
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    /** Approved only on ProcReturnCode "00" with an authenticated 3DS outcome. */
    isApproved(body: Record<string, any>): boolean {
        const proc = String(body.ProcReturnCode || '');
        const responseOk = String(body.Response || '').toLowerCase() === 'approved';
        const md = String(body.mdStatus || '');
        const authenticated = ['1', '2', '3', '4'].includes(md);
        return proc === CmiService.APPROVED_PROC_CODE && (responseOk || authenticated);
    }

    amountMatches(booking: Booking, body: Record<string, any>): boolean {
        if (body.amount == null) return true; // some contracts omit it in the callback
        return Number(body.amount).toFixed(2) === this.getAmount(booking);
    }

    async sendErrorNotification(booking, body, stage) {
        try {
            const context = {
                name: 'RouteFacile',
                stage,
                booking: JSON.stringify(booking),
                body: JSON.stringify(body),
            };
            await this.mailService.send(
                PAYMENT_ERROR_RECIPIENT,
                'CMI Payment Error',
                'error_payment',
                context,
                [],
                booking?.id,
            );
        } catch (e) {
            console.error('CMI sendErrorNotification failed', e?.message);
        }
    }
}
