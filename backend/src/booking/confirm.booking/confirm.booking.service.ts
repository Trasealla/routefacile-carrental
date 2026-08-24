import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MoreThan, MoreThanOrEqual } from 'typeorm';
import { CarService } from 'src/car/car.service';
import { LocationService } from 'src/location/location.service';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { User } from 'src/entities/user.entity';
import { ConfirmBookingEvent } from 'src/event/events/confirm.booking.event';
import { DiscountCouponService } from '../car.search/discount.coupon.service';
import { SurgeService } from '../car.search/surge.service';
import { MiscChargeService } from '../car.search/misc.charge.service';
import { TimeValidationService } from '../services/time.validation.service';
import { BookingService } from '../services/booking.service';
import { ConfirmBookingDto } from './confirm.booking.dto';

/**
 * The booking-confirmation pipeline, independent of how the customer was
 * identified.
 *
 * This used to live in the body of ConfirmBookingController.confirm(), which is
 * behind JwtAuthGuard and reads req.user. Guest checkout needs the identical
 * pipeline for a customer resolved from an email or phone number instead of a
 * JWT, so the logic moved here and both controllers hand it a User.
 */
@Injectable()
export class ConfirmBookingService {
  constructor(
    @Inject(CarService) private carService: CarService,
    @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
    @Inject(SurgeService) private surgeService: SurgeService,
    @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
    @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
    @Inject(LocationService) private locationService: LocationService,
    @Inject(BookingService) private bookingService: BookingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async confirmForUser(body: ConfirmBookingDto, user: User, ip: string) {
    await this.timeValidationService.validatePickupTime(body);
    await this.timeValidationService.validateDropoffTime(body);
    await this.timeValidationService.validateOneBooking(body.pickup_date, user.id);
    await this.discountCouponService.validateDiscountCoupon(body);
    await this.discountCouponService.assertSingleUsePerUser(body.discount_coupon, user.id);
    await this.carService.clearGroupByQuery();

    const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

    const pickup_location = await this.locationService.getOne(
      { id: body.pickup_location_id },
      ['id', 'city_id', 'is_virtual'],
    );
    const dropoff_location = await this.locationService.getOne(
      { id: body.dropoff_location_id },
      ['id', 'city_id', 'is_virtual'],
    );
    await this.locationService.validateLocation(
      pickup_location,
      dropoff_location,
      body.dropoff_type,
      body.pickup_type,
      body.dropoff_city_id,
    );

    let booking;
    if (body.booking_type == BookingTypes.DAILY) {
      const discount_coupon_where = {
        type: CouponTypes.DAILY,
        code: body.discount_coupon,
        end_date: MoreThan(body.pickup_date),
        status: DiscountCouponService.ACTIVE,
      };
      const surge_where = {
        end_date: MoreThanOrEqual(body.pickup_date),
        status: SurgeService.ACTIVE,
      };

      const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
      const surge = await this.surgeService.getOne(surge_where);

      const car_rate = await this.bookingService.getDailyCarRate(
        body, discount_coupon, surge, pickup_location, dropoff_location, misc_charges,
      );
      const car_extras = (await this.bookingService.getDailyCarExtraRate(
        body, discount_coupon, surge, pickup_location,
      )) as any;

      booking = await this.bookingService.saveBooking(
        body, car_rate, surge, discount_coupon, misc_charges, user, car_extras, ip,
      );
      await this.discountCouponService.consumeCoupon(discount_coupon);
    } else {
      await this.timeValidationService.validateMonthlyDropoffTime(
        body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time,
      );
      const discount_coupon_where = {
        type: CouponTypes.MONTHLY,
        code: body.discount_coupon,
        end_date: MoreThan(body.pickup_date),
        status: DiscountCouponService.ACTIVE,
      };

      const discount_coupon = await this.discountCouponService.getOne(discount_coupon_where);
      const car_rate = await this.bookingService.getMonthlyCarRate(
        body, pickup_location, dropoff_location, misc_charges, discount_coupon,
      );
      const car_extras = (await this.bookingService.getMonthlyCarExtraRate(
        body, pickup_location,
      )) as any;

      booking = await this.bookingService.saveBooking(
        body, car_rate, null, discount_coupon, misc_charges, user, car_extras, ip,
      );
      await this.discountCouponService.consumeCoupon(discount_coupon);
    }

    if (body.payment_type == PaymentTypes.PAY_LATER) {
      this.eventEmitter.emit('confirm.booking', new ConfirmBookingEvent(booking.id));
    }

    return { status: 'success', booking, payment_type: body.payment_type };
  }
}
