import { BadRequestException, Body, Controller, Get, Inject, Ip, Post, Query, Request, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiExcludeController } from '@nestjs/swagger';

import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

import { AdminCreateBookingDto, AdminAvailabilityDto, AdminCustomerSearchDto } from './admin.booking.create.dto';

import { CarService } from 'src/car/car.service';
import { LocationService } from 'src/location/location.service';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { CarSearchService } from 'src/booking/car.search/car.search.service';
import { BookingService } from 'src/booking/services/booking.service';

import { User } from 'src/entities/user.entity';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { BookingSources } from 'src/entities/enums/booking.source';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { MonthlyMileage } from 'src/entities/enums/monthly.mileage';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'counter')
@Controller('admin/booking-create')
export class AdminBookingCreateController {
    constructor(
        @Inject(CarService) private carService: CarService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
        @Inject(SurgeService) private surgeService: SurgeService,
        @Inject(CarSearchService) private carSearchService: CarSearchService,
        @Inject(BookingService) private bookingService: BookingService,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    // Customer picker for the admin booking form. Parameterized via query builder —
    // never string-interpolated into SQL.
    @Get('customers')
    async searchCustomers(@Query() params: AdminCustomerSearchDto) {
        const page = params.page || 1;
        const page_size = Math.min(params.page_size || 10, 50);

        const query = this.userRepository.createQueryBuilder('user')
            .select(['user.id', 'user.first_name', 'user.last_name', 'user.email', 'user.phone_code', 'user.phone_number', 'user.country_id'])
            .where('user.deleted_at IS NULL');

        if (params.search) {
            const term = `%${params.search}%`;
            query.andWhere(new Brackets(qb => {
                qb.where('user.email LIKE :term', { term })
                    .orWhere('user.first_name LIKE :term', { term })
                    .orWhere('user.last_name LIKE :term', { term })
                    .orWhere('user.phone_number LIKE :term', { term })
                    .orWhere("CONCAT(user.first_name, ' ', user.last_name) LIKE :term", { term });
            }));
        }

        const total_records = await query.getCount();
        const data = await query.orderBy('user.id', 'DESC')
            .skip((page - 1) * page_size)
            .take(page_size)
            .getMany();

        return { data, total_records };
    }

    private async resolveCustomer(customer: AdminCreateBookingDto['customer']): Promise<User> {
        if (customer.user_id) {
            const existing = await this.userRepository.findOne({ where: { id: customer.user_id } });
            if (!existing) {
                throw new BadRequestException('Selected customer no longer exists.');
            }
            return existing;
        }

        const byEmail = await this.userRepository.findOne({ where: { email: customer.email } });
        if (byEmail) {
            return byEmail;
        }

        const temp_password = await bcrypt.hash(`admin_${Date.now()}_${Math.random()}`, 10);
        const created = this.userRepository.create({
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            phone_code: customer.phone_code,
            phone_number: customer.phone_number,
            country_id: customer.country_id,
            password: temp_password,
            password_org: temp_password,
            status: 1,
        });

        return await this.userRepository.save(created);
    }

    // Availability for the admin booking form. Deliberately does NOT run
    // TimeValidationService: the retail buffer-hours / opening-hours rules exist to
    // stop online customers booking a car nobody can hand over, but counter staff are
    // standing at the desk with the customer and routinely serve immediate pickups.
    // Keeping this in step with the create endpoint below — if search enforced the
    // buffer but create didn't, walk-ins would never see a car to book.
    @Post('availability')
    async availability(@Body() body: AdminAvailabilityDto) {
        const pricing_body: any = {
            booking_type: body.booking_type,
            booking_source: BookingSources.ADMIN,
            pickup_type: body.pickup_type,
            pickup_date: body.pickup_date,
            pickup_time: body.pickup_time,
            pickup_location_id: body.pickup_location_id,
            pickup_city_id: body.pickup_city_id,
            dropoff_type: body.dropoff_type,
            dropoff_date: body.dropoff_date,
            dropoff_time: body.dropoff_time,
            dropoff_location_id: body.dropoff_location_id,
            dropoff_city_id: body.dropoff_city_id,
            booking_months: body.booking_months,
        };

        const pickup_at = new Date(`${body.pickup_date}T${body.pickup_time}:00`);
        const dropoff_at = new Date(`${body.dropoff_date}T${body.dropoff_time}:00`);
        if (dropoff_at <= pickup_at) {
            throw new BadRequestException('Dropoff date and time must be after the pickup date and time.');
        }

        await this.carService.clearGroupByQuery();

        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
        const pickup_location = pricing_body.pickup_location_id
            ? await this.locationService.getOne({ id: pricing_body.pickup_location_id })
            : null;
        const dropoff_location = pricing_body.dropoff_location_id
            ? await this.locationService.getOne({ id: pricing_body.dropoff_location_id })
            : null;

        await this.locationService.validateLocation(
            pickup_location, dropoff_location, pricing_body.dropoff_type, pricing_body.pickup_type, pricing_body.dropoff_city_id
        );

        const params: any = {
            page: 1,
            page_size: 50,
            monthly_mileage: body.monthly_mileage || MonthlyMileage.MILEAGE_3000,
        };

        if (body.booking_type == BookingTypes.DAILY) {
            const surge = await this.surgeService.getOne({
                end_date: MoreThanOrEqual(pricing_body.pickup_date),
                status: SurgeService.ACTIVE
            });
            return await this.carSearchService.getPaginatedDailyRates(
                pricing_body, params, pickup_location, dropoff_location, misc_charges, null, surge
            );
        }

        return await this.carSearchService.getPaginatedMonthlyRates(
            pricing_body, params, pickup_location, dropoff_location, misc_charges, null
        );
    }

    @Post()
    async create(@Body() body: AdminCreateBookingDto, @Request() req, @Ip() ip) {
        // Counter staff are deliberately exempt from the retail opening-hours/buffer
        // checks (they book in person, sometimes out of hours), but a dropoff that
        // precedes pickup is never valid — it yields nonsense booking_days and pricing.
        const pickup_at = new Date(`${body.pickup_date}T${body.pickup_time}:00`);
        const dropoff_at = new Date(`${body.dropoff_date}T${body.dropoff_time}:00`);

        if (dropoff_at <= pickup_at) {
            throw new BadRequestException('Dropoff date and time must be after the pickup date and time.');
        }

        const pricing_body: any = {
            booking_type: body.booking_type,
            booking_source: BookingSources.ADMIN,
            car_id: body.car_id,
            pickup_type: body.pickup_type,
            pickup_date: body.pickup_date,
            pickup_time: body.pickup_time,
            pickup_location_id: body.pickup_location_id,
            pickup_city_id: body.pickup_city_id,
            pickup_address: body.pickup_address,
            dropoff_type: body.dropoff_type,
            dropoff_date: body.dropoff_date,
            dropoff_time: body.dropoff_time,
            dropoff_location_id: body.dropoff_location_id,
            dropoff_city_id: body.dropoff_city_id,
            dropoff_address: body.dropoff_address,
            booking_months: body.booking_months,
            monthly_mileage: body.monthly_mileage || MonthlyMileage.MILEAGE_3000,
            payment_type: PaymentTypes.PAY_LATER,
            discount_coupon: undefined,
            car_extras: [],
            comments: body.comments,
        };

        await this.carService.clearGroupByQuery();

        const user = await this.resolveCustomer(body.customer);
        const misc_charges = await this.miscChargeService.getMiscChargesAsObject();

        const pickup_location = pricing_body.pickup_location_id
            ? await this.locationService.getOne({ id: pricing_body.pickup_location_id })
            : null;
        const dropoff_location = pricing_body.dropoff_location_id
            ? await this.locationService.getOne({ id: pricing_body.dropoff_location_id })
            : null;

        await this.locationService.validateLocation(
            pickup_location, dropoff_location, pricing_body.dropoff_type, pricing_body.pickup_type, pricing_body.dropoff_city_id
        );

        let saved: { id: number, booking_number: string };

        if (body.booking_type == BookingTypes.DAILY) {
            const surge = await this.surgeService.getOne({
                end_date: MoreThanOrEqual(pricing_body.pickup_date),
                status: SurgeService.ACTIVE
            });
            const car_rate = await this.bookingService.getDailyCarRate(pricing_body, null, surge, pickup_location, dropoff_location, misc_charges);
            const car_extras = await this.bookingService.getDailyCarExtraRate(pricing_body, null, surge, pickup_location) as any;
            saved = await this.bookingService.saveBooking(pricing_body, car_rate, surge, null, misc_charges, user, car_extras, ip || '0.0.0.0');
        } else {
            const car_rate = await this.bookingService.getMonthlyCarRate(pricing_body, pickup_location, dropoff_location, misc_charges, null);
            const car_extras = await this.bookingService.getMonthlyCarExtraRate(pricing_body, pickup_location) as any;
            saved = await this.bookingService.saveBooking(pricing_body, car_rate, null, null, misc_charges, user, car_extras, ip || '0.0.0.0');
        }

        if (body.mark_as_paid) {
            await this.bookingService.update({ id: saved.id }, { payment_status: BookingService.PAYMENT_STATUS_DONE });
        }

        const booking = await this.bookingService.getOne({ id: saved.id });

        return {
            success: true,
            data: {
                booking_id: booking.id,
                booking_number: booking.booking_number,
                total_amount: booking.total_amount,
                payment_status: booking.payment_status,
                customer: {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                },
            },
        };
    }
}
