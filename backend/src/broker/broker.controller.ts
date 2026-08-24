import { Body, ConflictException, Controller, Get, Inject, Ip, NotFoundException, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { BrokerCredentialsGuard } from './guards/broker-credentials.guard';
import { BrokerXmlResponseInterceptor } from './interceptors/broker-xml-response.interceptor';
import { BrokerAvailabilityDto } from './dtos/broker.availability.dto';
import { BrokerCreateBookingDto } from './dtos/broker.create.booking.dto';
import { BrokerEditBookingDto } from './dtos/broker.edit.booking.dto';
import { BrokerCancelBookingDto } from './dtos/broker.cancel.booking.dto';

import { CarService } from 'src/car/car.service';
import { LocationService } from 'src/location/location.service';
import { TimeValidationService } from 'src/booking/services/time.validation.service';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { CarSearchService } from 'src/booking/car.search/car.search.service';
import { BookingService } from 'src/booking/services/booking.service';
import { EditBookingService } from 'src/booking/services/edit.booking.service';
import { CancelBookingService } from 'src/booking/services/cancel.booking.service';

import { User } from 'src/entities/user.entity';
import { Booking } from 'src/entities/booking.entity';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { BookingSources } from 'src/entities/enums/booking.source';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { MonthlyMileage } from 'src/entities/enums/monthly.mileage';

@Controller('broker/v1')
@UseGuards(BrokerCredentialsGuard)
export class BrokerApiController {
    constructor(
        @Inject(CarService) private carService: CarService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(CarSearchService) private carSearchService: CarSearchService,
        @Inject(BookingService) private bookingService: BookingService,
        @Inject(EditBookingService) private editBookingService: EditBookingService,
        @Inject(CancelBookingService) private cancelBookingService: CancelBookingService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    ) { }

    private splitDateTime(iso: string): { date: string, time: string } {
        const [date, timePart] = iso.split('T');
        return { date, time: (timePart || '00:00').slice(0, 5) };
    }

    private toPricingBody(input: {
        booking_type: string,
        pickup: { type: string, location_id?: number, city_id?: number, address?: string },
        dropoff: { type: string, location_id?: number, city_id?: number, address?: string },
        pickup_date_time: string,
        dropoff_date_time: string,
        booking_months?: number,
        car_id?: number,
        payment_type?: string,
        monthly_mileage?: number,
    }): any {
        const pickup = this.splitDateTime(input.pickup_date_time);
        const dropoff = this.splitDateTime(input.dropoff_date_time);

        return {
            booking_type: input.booking_type,
            booking_source: BookingSources.BROKER,
            car_id: input.car_id,
            pickup_type: input.pickup.type,
            pickup_date: pickup.date,
            pickup_time: pickup.time,
            pickup_location_id: input.pickup.location_id,
            pickup_city_id: input.pickup.city_id,
            pickup_address: input.pickup.address,
            dropoff_type: input.dropoff.type,
            dropoff_date: dropoff.date,
            dropoff_time: dropoff.time,
            dropoff_location_id: input.dropoff.location_id,
            dropoff_city_id: input.dropoff.city_id,
            dropoff_address: input.dropoff.address,
            booking_months: input.booking_months,
            monthly_mileage: input.monthly_mileage || MonthlyMileage.MILEAGE_3000,
            payment_type: input.payment_type || PaymentTypes.PAY_LATER,
            discount_coupon: undefined,
            car_extras: [],
            comments: undefined,
        };
    }

    private async findOrCreateCustomer(customer: { first_name: string, last_name: string, email: string, phone_code: string, phone_number: string, country_id?: number }): Promise<User> {
        let user = await this.userRepository.findOne({ where: { email: customer.email } });

        if (!user) {
            const temp_password = await bcrypt.hash(`broker_${Date.now()}_${Math.random()}`, 10);
            user = this.userRepository.create({
                first_name: customer.first_name,
                last_name: customer.last_name,
                email: customer.email,
                phone_code: customer.phone_code,
                phone_number: customer.phone_number,
                country_id: customer.country_id,
                password: temp_password,
                password_org: temp_password,
                status: 1
            });
            user = await this.userRepository.save(user);
        }

        return user;
    }

    @Post('availability')
    @UseInterceptors(new BrokerXmlResponseInterceptor('AvailabilityResponse'))
    async availability(@Body() body: BrokerAvailabilityDto) {
        const pricing_body = this.toPricingBody(body);

        await this.timeValidationService.validatePickupTime(pricing_body);
        await this.timeValidationService.validateDropoffTime(pricing_body);
        await this.carService.clearGroupByQuery();

        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
        const pickup_location = pricing_body.pickup_location_id ? await this.locationService.getOne({ id: pricing_body.pickup_location_id }) : null;
        const dropoff_location = pricing_body.dropoff_location_id ? await this.locationService.getOne({ id: pricing_body.dropoff_location_id }) : null;
        await this.locationService.validateLocation(pickup_location, dropoff_location, pricing_body.dropoff_type, pricing_body.pickup_type, pricing_body.dropoff_city_id);

        const params = { page: 1, page_size: 50 } as any;

        let result;
        if (body.booking_type == BookingTypes.DAILY) {
            const surge = await this.surgeService.getOne({ end_date: MoreThanOrEqual(pricing_body.pickup_date), status: SurgeService.ACTIVE }, [], {}, null, { column: 'created_at', order: 'DESC' });
            result = await this.carSearchService.getPaginatedDailyRates(pricing_body, params, pickup_location, dropoff_location, misc_charges, null, surge);
        } else {
            result = await this.carSearchService.getPaginatedMonthlyRates(pricing_body, params, pickup_location, dropoff_location, misc_charges, null);
        }

        const cars = (result.data || []).map((row: any) => {
            const total_car_rate = Number(row.car_rate_total || 0);
            const estimated_total = Number(row.pay_later ?? row.car_rate_total ?? 0);
            const vat_amount = Number((estimated_total * (misc_charges.vat || 0) / 100).toFixed(2));

            return {
                car_id: row.id,
                name: row.car_name,
                category: row.category,
                daily_rate: body.booking_type == BookingTypes.DAILY ? Number((total_car_rate / (row.booking_days || 1)).toFixed(2)) : undefined,
                total_car_rate,
                vat_amount,
                estimated_total: Number((estimated_total + vat_amount).toFixed(2))
            };
        });

        return { cars, total_records: result.total_records };
    }

    @Post('bookings')
    @UseInterceptors(new BrokerXmlResponseInterceptor('CreateBookingResponse'))
    async createBooking(@Body() body: BrokerCreateBookingDto, @Request() req, @Ip() ip) {
        const pricing_body = this.toPricingBody(body);

        await this.timeValidationService.validatePickupTime(pricing_body);
        await this.timeValidationService.validateDropoffTime(pricing_body);
        await this.carService.clearGroupByQuery();

        const user = await this.findOrCreateCustomer(body.customer);
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = pricing_body.pickup_location_id ? await this.locationService.getOne({ id: pricing_body.pickup_location_id }) : null;
        const dropoff_location = pricing_body.dropoff_location_id ? await this.locationService.getOne({ id: pricing_body.dropoff_location_id }) : null;
        await this.locationService.validateLocation(pickup_location, dropoff_location, pricing_body.dropoff_type, pricing_body.pickup_type, pricing_body.dropoff_city_id);

        let saved: { id: number, booking_number: string };

        try {
            if (body.booking_type == BookingTypes.DAILY) {
                const surge = await this.surgeService.getOne({ end_date: MoreThanOrEqual(pricing_body.pickup_date), status: SurgeService.ACTIVE });
                const car_rate = await this.bookingService.getDailyCarRate(pricing_body, null, surge, pickup_location, dropoff_location, misc_charges);
                const car_extras = await this.bookingService.getDailyCarExtraRate(pricing_body, null, surge, pickup_location) as any;
                saved = await this.bookingService.saveBooking(pricing_body, car_rate, surge, null, misc_charges, user, car_extras, ip);
            } else {
                await this.timeValidationService.validateMonthlyDropoffTime(pricing_body.pickup_date, pricing_body.pickup_time, pricing_body.dropoff_date, pricing_body.dropoff_time);
                const car_rate = await this.bookingService.getMonthlyCarRate(pricing_body, pickup_location, dropoff_location, misc_charges, null);
                const car_extras = await this.bookingService.getMonthlyCarExtraRate(pricing_body, pickup_location) as any;
                saved = await this.bookingService.saveBooking(pricing_body, car_rate, null, null, misc_charges, user, car_extras, ip);
            }
        } catch (error) {
            if (error?.status == 400) {
                throw new ConflictException('Car is no longer available for the selected dates. Please re-check availability.');
            }
            throw error;
        }

        await this.bookingService.update({ id: saved.id }, { broker_id: req.broker.id, broker_reference: body.broker_reference || null });
        const booking = await this.bookingService.getOne({ id: saved.id });

        return {
            booking_id: booking.id,
            booking_number: booking.booking_number,
            status: booking.action,
            total_amount: booking.total_amount,
            broker_reference: booking.broker_reference
        };
    }

    @Get('bookings/:reservation_id')
    @UseInterceptors(new BrokerXmlResponseInterceptor('BookingDetailsResponse'))
    async getBooking(@Param('reservation_id') reservation_id: string, @Request() req) {
        const booking = await this.findCurrentBookingForBroker(reservation_id, req.broker.id);

        if (!booking) {
            throw new NotFoundException('Booking not found.');
        }

        const cancelled = !!booking.cancellation_date_time;

        return {
            booking_id: booking.id,
            booking_number: booking.booking_number,
            broker_reference: booking.broker_reference,
            status: cancelled ? 'cancelled' : 'confirmed',
            last_action: booking.action,
            booking_type: booking.type,
            booking_date: booking.booking_date,
            booking_days: booking.booking_days,
            booking_months: booking.booking_months,
            vehicle: {
                car_id: booking.car_id,
                name: booking.car?.name_en,
                category: booking.car?.category?.name_en,
            },
            pickup: {
                type: booking.pickup_type,
                date_time: booking.pickup_date_time,
                location_id: booking.pickup_location_id,
                location: booking.pickup_location?.name_en,
                city_id: booking.pickup_city_id,
                city: booking.pickup_city?.name_en,
                address: booking.pickup_address,
            },
            dropoff: {
                type: booking.dropoff_type,
                date_time: booking.dropoff_date_time,
                location_id: booking.dropoff_location_id,
                location: booking.dropoff_location?.name_en,
                city_id: booking.dropoff_city_id,
                city: booking.dropoff_city?.name_en,
                address: booking.dropoff_address,
            },
            customer: {
                first_name: booking.user_first_name,
                last_name: booking.user_last_name,
                email: booking.user_email,
                phone_code: booking.user_phone_code,
                phone_number: booking.user_phone_number,
            },
            payment: {
                currency: 'MAD',
                payment_type: booking.payment_type,
                payment_status: booking.payment_status ? 'paid' : 'unpaid',
                car_rate_total: Number(booking.car_rate_total || 0),
                discount_total: Number(booking.discount_total || 0),
                vat_amount: Number(booking.vat_amount || 0),
                total_amount: Number(booking.total_amount || 0),
            },
            cancellation: {
                cancelled,
                cancelled_at: booking.cancellation_date_time || null,
                cancellation_charge: Number(booking.cancellation_charges || 0),
                refund_amount: Number(booking.refund_amount || 0),
            },
        };
    }

    /**
     * Resolve whatever reference the broker held on to into the booking row that
     * represents the reservation *right now*.
     *
     * An amendment does not update the existing row — it writes a new one that
     * keeps the same `booking_number` and points `parent_id` at the row it
     * supersedes. So a broker that stored the `booking_id` from the original
     * create call is holding a stale row, and reading it back would report the
     * pre-amendment dates and price. Resolving to the highest id for the
     * booking number always lands on the current state.
     */
    private async findCurrentBookingForBroker(reservation_id: string, broker_id: number): Promise<Booking> {
        const reference = (reservation_id || '').trim();

        if (!reference) {
            return null;
        }

        let booking_number = reference;

        // A numeric reference is a booking id; look up its booking number first.
        if (/^\d+$/.test(reference)) {
            const by_id = await this.bookingRepository.findOne({
                where: { id: Number(reference), broker_id },
                select: ['booking_number'],
            });

            if (!by_id) {
                return null;
            }

            booking_number = by_id.booking_number;
        }

        return this.bookingRepository.findOne({
            where: { booking_number, broker_id },
            order: { id: 'DESC' },
            relations: ['car', 'car.category', 'pickup_location', 'pickup_city', 'dropoff_location', 'dropoff_city'],
        });
    }

    @Post('bookings/edit')
    @UseInterceptors(new BrokerXmlResponseInterceptor('EditBookingResponse'))
    async editBooking(@Body() body: BrokerEditBookingDto, @Request() req, @Ip() ip) {
        const parent_booking = await this.bookingService.getOne({ id: body.booking_id, broker_id: req.broker.id });

        if (!parent_booking) {
            throw new NotFoundException('Booking not found.');
        }

        const pricing_body = this.toPricingBody(body);
        const edit_body = { ...pricing_body, booking_number: parent_booking.booking_number };

        await this.editBookingService.validateBooking(edit_body as any, parent_booking.user_id);
        await this.timeValidationService.validatePickupTime(pricing_body);
        await this.timeValidationService.validateDropoffTime(pricing_body);
        await this.carService.clearGroupByQuery();

        const user = await this.userRepository.findOne({ where: { id: parent_booking.user_id } });
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = pricing_body.pickup_location_id ? await this.locationService.getOne({ id: pricing_body.pickup_location_id }) : null;
        const dropoff_location = pricing_body.dropoff_location_id ? await this.locationService.getOne({ id: pricing_body.dropoff_location_id }) : null;
        await this.locationService.validateLocation(pickup_location, dropoff_location, pricing_body.dropoff_type, pricing_body.pickup_type, pricing_body.dropoff_city_id);

        let edited: { id: number, booking_number: string };

        try {
            if (body.booking_type == BookingTypes.DAILY) {
                const surge = await this.surgeService.getOne({ end_date: MoreThan(pricing_body.pickup_date), status: SurgeService.ACTIVE });
                const car_rate = await this.bookingService.getDailyCarRate(pricing_body, null, surge, pickup_location, dropoff_location, misc_charges);
                const car_extras = await this.bookingService.getDailyCarExtraRate(pricing_body, null, surge, pickup_location) as any;
                edited = await this.editBookingService.editBooking(edit_body as any, parent_booking, car_rate, surge, null, misc_charges, user, car_extras, ip);
            } else {
                await this.timeValidationService.validateMonthlyDropoffTime(pricing_body.pickup_date, pricing_body.pickup_time, pricing_body.dropoff_date, pricing_body.dropoff_time);
                const car_rate = await this.bookingService.getMonthlyCarRate(pricing_body, pickup_location, dropoff_location, misc_charges, null);
                const car_extras = await this.bookingService.getMonthlyCarExtraRate(pricing_body, pickup_location) as any;
                edited = await this.editBookingService.editBooking(edit_body as any, parent_booking, car_rate, null, null, misc_charges, user, car_extras, ip);
            }
        } catch (error) {
            if (error?.status == 400) {
                throw new ConflictException('Car is no longer available for the selected dates. Please re-check availability.');
            }
            throw error;
        }

        await this.bookingService.update({ id: edited.id }, { broker_id: req.broker.id, broker_reference: parent_booking.broker_reference });
        const booking = await this.bookingService.getOne({ id: edited.id });

        return {
            booking_id: booking.id,
            booking_number: booking.booking_number,
            total_amount: booking.total_amount
        };
    }

    @Post('bookings/cancel')
    @UseInterceptors(new BrokerXmlResponseInterceptor('CancelBookingResponse'))
    async cancelBooking(@Body() body: BrokerCancelBookingDto, @Request() req) {
        const booking = await this.bookingService.getOne({ id: body.booking_id, broker_id: req.broker.id });

        if (!booking) {
            throw new NotFoundException('Booking not found.');
        }

        if (booking.cancellation_date_time) {
            throw new ConflictException('Booking already cancelled.');
        }

        const result = await this.cancelBookingService.cancelBooking({ booking_id: booking.id, cancellation_reason: body.reason || 'Cancelled via broker API' }, booking);
        const updated_booking = await this.bookingService.getOne({ id: booking.id });

        return {
            booking_id: updated_booking.id,
            cancellation_charge: updated_booking.cancellation_charges || 0,
            refund_amount: updated_booking.refund_amount || 0,
            message: (result as any).message
        };
    }
}
