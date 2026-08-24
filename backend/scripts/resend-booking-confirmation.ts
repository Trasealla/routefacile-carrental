/**
 * Resend a booking confirmation email.
 *
 * Use case: the original send failed (e.g. SES "GenericFailure" because the
 * customer's email is on the SES suppression list). This script re-runs the
 * exact same confirmation template, but lets you override the "to" address so
 * the branch still gets the booking details.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/resend-booking-confirmation.ts <booking_id> [override_to_email]
 *
 * Examples:
 *   # Resend using the booking's original customer email
 *   npx ts-node -r tsconfig-paths/register scripts/resend-booking-confirmation.ts 20408
 *
 *   # Resend but route the "to" to the Sharjah branch (customer email is bouncing)
 *   npx ts-node -r tsconfig-paths/register scripts/resend-booking-confirmation.ts 20408 sharjah@autostrad.com
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { BookingRepoService } from '../src/booking/services/booking.repo.service';
import {
  BOOKING_RESERVATION_RECEPIENT,
  BOOKING_RESERVATION_RECEPIENT_CC,
  BOOKING_RESERVATION_RECEPIENT_TESTING,
} from '../src/config/contants';

async function main() {
  const [, , bookingIdArg, overrideTo] = process.argv;
  const bookingId = Number(bookingIdArg);

  if (!bookingId) {
    console.error('Usage: resend-booking-confirmation.ts <booking_id> [override_to_email]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  try {
    const mailService = app.get(MailService);
    const bookingRepoService = app.get(BookingRepoService);

    const relations = {
      pickup_location: { columns: ['id', 'recipients', 'name_en', 'contact_number'] },
      dropoff_location: { columns: ['id', 'recipients', 'name_en', 'contact_number'] },
      pickup_emirate: { columns: ['id', 'recipients', 'name_en', 'contact_number'] },
      dropoff_emirate: { columns: ['id', 'recipients', 'name_en', 'contact_number'] },
      car: { columns: ['id', 'name_en'] },
      monthly_installments: {
        columns: ['id', 'installment_no', 'due_date', 'sub_amount', 'vat_amount', 'total_amount'],
      },
    };

    const booking: any = await bookingRepoService.getOne(
      { id: bookingId },
      [],
      relations,
      BookingRepoService.LEFT_JOIN,
    );

    if (!booking) {
      console.error(`Booking ${bookingId} not found.`);
      process.exit(2);
    }

    booking.car_rate_total = Number(booking.car_rate_total) + Number(booking.surge_amount);
    const recipients = bookingRepoService.extractRecipients(booking);

    const context = {
      booking,
      conditions: bookingRepoService.conditionsObject(booking),
      recipients,
      links: bookingRepoService.emailLinks(),
    };

    // Original "to" was the customer's email. Allow override.
    const to = overrideTo || booking.user_email;

    // Build the CC list the same way the listener does.
    let cc: string[] = context.conditions.staging
      ? [BOOKING_RESERVATION_RECEPIENT_TESTING]
      : [BOOKING_RESERVATION_RECEPIENT, ...BOOKING_RESERVATION_RECEPIENT_CC, ...recipients];

    // If we are overriding the "to" (because the customer mailbox is bouncing),
    // don't put the bouncing address back into CC — SES would still reject the
    // whole message. Drop the original customer email from CC.
    if (overrideTo && booking.user_email) {
      cc = cc.filter(
        (addr) => (addr || '').trim().toLowerCase() !== booking.user_email.trim().toLowerCase(),
      );
    }
    // Also avoid putting the "to" in CC.
    cc = cc.filter((addr) => (addr || '').trim().toLowerCase() !== to.trim().toLowerCase());

    console.log(`Resending booking ${booking.booking_number} confirmation`);
    console.log(`  Template: booking_confirm_${booking.type}`);
    console.log(`  To:       ${to}`);
    console.log(`  CC:       ${cc.join(', ')}`);

    await mailService.send(
      to,
      'Your Booking with Autostrad Rent a Car',
      `booking_confirm_${booking.type}`,
      context,
      cc,
      booking.id,
      [],
    );

    console.log('✅ Email accepted by SMTP. Check mail_responses for the new row.');
  } catch (err) {
    console.error('❌ Resend failed:', err);
    process.exitCode = 3;
  } finally {
    await app.close();
  }
}

main();
