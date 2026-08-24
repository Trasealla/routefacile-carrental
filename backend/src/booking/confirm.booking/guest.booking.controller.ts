import { BadRequestException, Body, Controller, Inject, Ip, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { CARS_PATH } from 'src/config/contants';
import { UserBookingService } from 'src/user/user.booking/user.booking.service';
import { ConfirmBookingService } from './confirm.booking.service';
import { GuestCustomerService } from './guest.customer.service';
import { GuestBookingDto } from './guest.booking.dto';

/**
 * Pay-later booking without an account.
 *
 * Requiring a login before a customer can reserve a car they are paying for at
 * the counter loses bookings for no benefit — there is no payment to protect and
 * nothing about the reservation the customer does not already know. A guest
 * gives an email address or a mobile number and that is the whole checkout.
 *
 * Pay-now deliberately still requires a session: that flow hands the customer to
 * a payment gateway and has to be able to tie the transaction back to a known
 * account.
 */
@ApiTags('booking-form')
@Controller('guest/booking')
export class GuestBookingController {
  constructor(
    @Inject(GuestCustomerService) private guestCustomerService: GuestCustomerService,
    @Inject(ConfirmBookingService) private confirmBookingService: ConfirmBookingService,
    @Inject(UserBookingService) private userBookingService: UserBookingService,
  ) {}

  @Post()
  async confirm(@Body() body: GuestBookingDto, @Query('lang') lang: string, @Ip() ip) {
    if (body.payment_type !== PaymentTypes.PAY_LATER) {
      throw new BadRequestException('Guest checkout is available for pay-later bookings only.');
    }

    // The web form posts name / mobile / email as separate fields. The older
    // single-box `identifier` is still honoured so anything already integrated
    // against this endpoint keeps working.
    const hasNamedFields = !!(body.full_name || body.email || body.phone_number);
    const user = hasNamedFields
      ? await this.guestCustomerService.resolveDetails({
          full_name: body.full_name,
          email: body.email,
          phone_code: body.phone_code,
          phone_number: body.phone_number,
        })
      : await this.guestCustomerService.resolve(body.identifier);

    // No token in the response, by design: attaching a booking to a returning
    // customer must not double as a way of signing in as them.
    const result = await this.confirmBookingService.confirmForUser(body, user, ip);

    // The confirmation screen normally fetches the booking through an
    // authenticated endpoint, which a guest has no way to call. Rather than
    // expose a public lookup — an id plus somebody's email would be enough to
    // read their booking — the detail travels back in this response, once, to
    // the browser that just made the reservation.
    const detail = await this.detailFor(result.booking.id, user.id, lang);

    return { ...result, detail };
  }

  private async detailFor(booking_id: number, user_id: number, lang?: string) {
    const language = lang || LanguageTypes.ENGLISH;
    const relations = {
      car: { columns: ['id', `name_${language}`, 'image'] },
      group: { columns: ['id', `name_${language}`] },
      pickup_location: { columns: ['id', `name_${language}`] },
      dropoff_location: { columns: ['id', `name_${language}`] },
      pickup_city: { columns: ['id', `name_${language}`] },
      dropoff_city: { columns: ['id', `name_${language}`] },
    };

    const booking = await this.userBookingService.getOne(
      { user_id, id: booking_id },
      [],
      relations,
      UserBookingService.LEFT_JOIN,
    );
    if (!booking) return null;

    return this.userBookingService.removePostfix(booking, {
      image: process.env.FILE_SERVER + CARS_PATH,
    });
  }
}
