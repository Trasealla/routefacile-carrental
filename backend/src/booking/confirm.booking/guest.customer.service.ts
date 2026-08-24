import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { GUEST_EMAIL_DOMAIN, isPlaceholderGuestEmail } from 'src/config/contants';

/**
 * Turns the single "email or mobile number" a guest types at checkout into a
 * customer record.
 *
 * Bookings are rows that point at a user, so a booking without a user is not
 * something this schema can express. Rather than change that, a guest gets a
 * customer record created for them silently — no form to fill in, no password to
 * choose, no OTP. From their side it is not an account; from the admin's side it
 * is a normal customer whose bookings group together the next time they book
 * with the same number.
 *
 * Deliberately returns no token and issues no session. An unauthenticated caller
 * can therefore attach a booking to an existing customer, which is what we want
 * for a returning guest, but cannot use a known email address to get into that
 * customer's account.
 */
@Injectable()
export class GuestCustomerService {
  /** Moroccan default; a guest who types +33… keeps their own code. */
  private static readonly DEFAULT_PHONE_CODE = '212';

  constructor(@Inject(UserService) private userService: UserService) {}

  private static isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  /**
   * Split "+212 655 585 859" into a dialling code and a subscriber number.
   * Without a leading "+" we cannot tell where the code ends, so the number is
   * treated as local and gets the Moroccan default.
   */
  private static parsePhone(raw: string): { phone_code: string; phone_number: string } | null {
    const trimmed = raw.replace(/[\s\-().]/g, '');
    if (/^0\d{8,14}$/.test(trimmed)) {
      // Local form: 0655585859 -> 212 / 655585859
      return { phone_code: GuestCustomerService.DEFAULT_PHONE_CODE, phone_number: trimmed.slice(1) };
    }
    if (/^\+\d{8,17}$/.test(trimmed)) {
      const digits = trimmed.slice(1);
      // Country codes are 1-3 digits; 212 (Morocco) is the common case here, so
      // try the longest match first and fall back to a 2- then 1-digit code.
      for (const len of [3, 2, 1]) {
        const code = digits.slice(0, len);
        const rest = digits.slice(len);
        if (code === GuestCustomerService.DEFAULT_PHONE_CODE && rest.length >= 6) {
          return { phone_code: code, phone_number: rest };
        }
      }
      return { phone_code: digits.slice(0, 2), phone_number: digits.slice(2) };
    }
    if (/^\d{8,15}$/.test(trimmed)) {
      return { phone_code: GuestCustomerService.DEFAULT_PHONE_CODE, phone_number: trimmed };
    }
    return null;
  }

  /**
   * Find the customer this identifier belongs to, creating one if it is new.
   * `identifier` is whatever the guest typed: an email address or a phone number.
   */
  async resolve(identifier: string): Promise<User> {
    const value = (identifier || '').trim();
    if (!value) {
      throw new BadRequestException('Please enter your email address or mobile number.');
    }

    if (GuestCustomerService.isEmail(value)) {
      const email = value.toLowerCase();
      const existing = await this.userService.getOne({ email });
      if (existing) return existing;
      return this.create({ email });
    }

    const phone = GuestCustomerService.parsePhone(value);
    if (!phone) {
      throw new BadRequestException('Please enter a valid email address or mobile number.');
    }

    const existing = await this.userService.getOne({ phone_number: phone.phone_number });
    if (existing) return existing;
    return this.create({ phone });
  }

  /**
   * Resolve a guest from the named checkout fields.
   *
   * Checkout now asks for name, mobile and email separately, which means we get
   * a real name to put on the booking and both contact routes instead of one.
   * An existing customer is matched on email first and mobile second, so a
   * returning guest keeps their history either way — and if they gave a name
   * this time but the record was created earlier without one, it is filled in.
   */
  async resolveDetails(input: {
    full_name?: string;
    email?: string;
    phone_code?: string;
    phone_number?: string;
  }): Promise<User> {
    const email = (input.email || '').trim().toLowerCase();
    const phone_number = (input.phone_number || '').replace(/[^\d]/g, '');
    const phone_code = (input.phone_code || '').replace(/[^\d]/g, '')
      || GuestCustomerService.DEFAULT_PHONE_CODE;

    if (!email && !phone_number) {
      throw new BadRequestException('Please enter your mobile number or email address.');
    }
    if (email && !GuestCustomerService.isEmail(email)) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    const { first_name, last_name } = GuestCustomerService.splitName(input.full_name);

    // Identity matching, in order of how much it proves.
    //
    // Email is the strong signal: an address identifies one customer. A mobile
    // number is weaker — numbers get reused, mistyped, and shared between a
    // family or a company's staff. Matching on phone alone once attached a
    // booking to an unrelated existing customer and sent that customer's
    // confirmation to *their* address instead of the person who just booked.
    //
    // So: match on email when one is given. Fall back to phone only when the
    // record it finds has no real email of its own — meaning there is no other
    // identity to collide with.
    let existing: User | null = null;

    if (email) {
      existing = await this.userService.getOne({ email });
    } else if (phone_number) {
      const byPhone = await this.userService.getOne({ phone_number });
      if (byPhone && isPlaceholderGuestEmail(byPhone.email)) existing = byPhone;
    }

    if (existing) {
      // Whatever the customer typed this time is their current information, so
      // it replaces what is on file rather than only filling blanks. Someone
      // correcting a misspelled name should see the correction on the booking
      // and in the confirmation email.
      const patch: Record<string, string> = {};
      if (first_name && first_name !== existing.first_name) {
        patch.first_name = first_name;
        patch.last_name = last_name;
      }
      if (phone_number && phone_number !== existing.phone_number) {
        patch.phone_number = phone_number;
        patch.phone_code = phone_code;
      }
      if (Object.keys(patch).length) {
        await this.userService.update({ id: existing.id }, patch);
        return this.userService.getOne({ id: existing.id });
      }
      return existing;
    }

    return this.create({
      email: email || undefined,
      phone: phone_number ? { phone_code, phone_number } : undefined,
      first_name,
      last_name,
    });
  }

  /** "Youssef El Amrani" -> first "Youssef", last "El Amrani". */
  private static splitName(full_name?: string): { first_name: string; last_name: string } {
    const parts = (full_name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { first_name: '', last_name: '' };
    return {
      first_name: parts[0].slice(0, 40),
      last_name: parts.slice(1).join(' ').slice(0, 40),
    };
  }

  private async create(input: {
    email?: string;
    phone?: { phone_code: string; phone_number: string };
    first_name?: string;
    last_name?: string;
  }) {
    // The users table requires an email and a phone number and treats email as
    // unique, so whichever half the guest did not give is filled with a
    // placeholder. The placeholders are recognisable on sight in the admin so
    // nobody mistakes one for a real address, and the counter staff know to ask.
    const stamp = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
    const email = input.email ?? `guest.${stamp}${GUEST_EMAIL_DOMAIN}`;
    const phone_code = input.phone?.phone_code ?? GuestCustomerService.DEFAULT_PHONE_CODE;
    const phone_number = input.phone?.phone_number ?? '';

    // A random password nobody holds: the record is reachable only by booking
    // again with the same identifier, or by the customer using "forgot password"
    // if they later decide they want an account.
    const password_org = randomBytes(12).toString('hex');

    const response = await this.userService.insert({
      first_name: input.first_name || 'Guest',
      last_name: input.last_name || (input.first_name ? '' : 'Customer'),
      email,
      phone_code,
      phone_number,
      password: await bcrypt.hash(password_org, 10),
      password_org,
      status: UserService.ACTIVE,
    });

    if (response.status !== 'success') {
      throw new BadRequestException(
        response?.error?.message || 'Could not start your booking, please try again.',
      );
    }

    const id = response.response.identifiers[0]?.id;
    return this.userService.getOne({ id });
  }
}
