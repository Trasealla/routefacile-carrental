import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LocationService } from '../location/location.service';
import { LocationOpeningHourService } from '../location/location.opening.hour.service';
import { LocationOpeningHourExceptionService } from 'src/location/location.opening.hour.exception.service';
import { CityService } from 'src/city/city.service';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { DropoffLocationTimeDto } from './dtos/dropoff.location.time.dto';
import { DropoffTypes } from 'src/entities/enums/dropoff.type';
import { PickupLocationTimeDto } from './dtos/pickup.location.time.dto';
import { OpeningHourDto } from './dtos/opening.hour.dto';
import { BaseLocationTypes } from 'src/entities/enums/base.location.type';
import { CacheService } from 'src/cache/cache.service';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { DiscountCouponDto } from './dtos/discount.coupon.dto';
import { DiscountCouponService } from './car.search/discount.coupon.service';
import { TimeValidationService } from './services/time.validation.service';
import { CalculateDropoffDateDto } from './dtos/calculate.dropoff.date.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('booking/form')
export class BookingFormController {
    private CACHE_KEY_OPENING_HOUR = 'opening_hours';

    constructor(
        @Inject(LocationService) private locationService: LocationService,
        @Inject(LocationOpeningHourService) private locationOpeningHourService: LocationOpeningHourService,
        @Inject(LocationOpeningHourExceptionService) private locationOpeningHourExceptionService: LocationOpeningHourExceptionService,
        @Inject(CityService) private cityService: CityService,
        @Inject(CityOpeningHourService) private cityOpeningHourService: CityOpeningHourService,
        @Inject(CacheService) private cacheService: CacheService,
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
        @Inject(TimeValidationService) private timeValidationService: TimeValidationService
    ) { }

    @Post('validate_pickup')
    async validatePickup(@Body() body: PickupLocationTimeDto) {

        await this.timeValidationService.validatePickupTime(body);
        return { status: 'success', message: 'Valid time' };
    }

    @Post('validate_dropoff')
    async validateDropoff(@Body() body: DropoffLocationTimeDto) {

        await this.timeValidationService.validateDropoffTime(body);
        return { status: 'success', message: 'Valid time' };
    }

    @Get('get_opening_hours/:type/:entity_id/:day/:shift')
    async getOpeningHours(@Param() params: OpeningHourDto, @Query('date') date?: string) {

        const cache_key = date
            ? `${this.CACHE_KEY_OPENING_HOUR}_${params.type}_${params.entity_id}_${params.day}_${params.shift}_${date}`
            : `${this.CACHE_KEY_OPENING_HOUR}_${params.type}_${params.entity_id}_${params.day}_${params.shift}`;
        const cacheResponse = await this.cacheService.get(cache_key);
        if (cacheResponse) {
            return { range: cacheResponse };
        }

        if (params.type === BaseLocationTypes.LOCATION) {
            const location = await this.locationService.getOne({ id: params.entity_id });
            if (!location) {
                throw new NotFoundException('Location Not Found');
            }

            // Check exception hours when a specific date is provided
            if (date) {
                const exceptionWhere = {
                    location_id: params.entity_id,
                    start_date: LessThanOrEqual(date),
                    end_date: MoreThanOrEqual(date),
                };
                const allExceptions = await this.locationOpeningHourExceptionService.getAll(exceptionWhere);

                if (allExceptions.data.length > 0) {
                    // day-specific exceptions take priority over general (day=NULL) ones
                    const daySpecific = allExceptions.data.filter(e => e.day === params.day && e.shift === params.shift);
                    const dayGeneral = allExceptions.data.filter(e => e.day === null && e.shift === params.shift);
                    const match = daySpecific.length > 0 ? daySpecific[0] : (dayGeneral.length > 0 ? dayGeneral[0] : null);

                    if (match) {
                        if (match.is_closed) {
                            return { range: [], is_closed: true };
                        }

                        const response = this.locationOpeningHourService.generateTimeRange(match.from_hours, match.to_hours);
                        this.cacheService.set(cache_key, response);
                        return { range: response };
                    }
                }
            }

            // Fall back to regular opening hours
            const where = { shift: params.shift, day: params.day, location_id: params.entity_id };
            const select = ['id', 'from_hours', 'to_hours', 'location_id', 'day'];
            const result = await this.locationOpeningHourService.getAll(where, select);

            if (result.data.length < 1) {
                throw new BadRequestException('No timings available');
            }

            const time_range = result.data[0];
            const response = this.locationOpeningHourService.generateTimeRange(time_range.from_hours, time_range.to_hours);
            this.cacheService.set(cache_key, response);
            return { range: response };

        } else {
            const city = await this.cityService.getOne({ id: params.entity_id });
            if (!city) {
                throw new NotFoundException('City Not Found');
            }

            const where = { shift: 1, day: params.day, city_id: params.entity_id };
            const select = ['id', 'from_hours', 'to_hours', 'city_id', 'day'];
            const result = await this.cityOpeningHourService.getAll(where, select);

            if (result.data.length < 1) {
                throw new BadRequestException('No timings available');
            }

            const time_range = result.data[0];
            const response = this.locationOpeningHourService.generateTimeRange(time_range.from_hours, time_range.to_hours);
            this.cacheService.set(cache_key, response);
            return { range: response };
        }
    }

    @Post('validate_coupon')
    async validateDiscountCoupon(@Body() body: DiscountCouponDto) {

        await this.discountCouponService.validateDiscountCoupon(body)
        return { status: 'success', message: 'Valid coupon' };
    }

    @Post('calculate_dropoff_date')
    async calculateDropoffDate(@Body() body: CalculateDropoffDateDto) {
        if (body.dropoff_type == DropoffTypes.SELF) {
            const whereLocation = {
                id: body.dropoff_location_id
            };
            const location = await this.locationService.getOne(whereLocation);
            if (!location) {
                throw new BadRequestException('Location not found');
            }
            const dropoff_date = new Date(body.pickup_date)
            dropoff_date.setMonth(dropoff_date.getMonth() + body.booking_months);
            const dropoff_day = new Date(dropoff_date).getDay() + 1;

            const opening_hours = await this.locationOpeningHourService.getAll({ day: dropoff_day, 'location_id': location.id });
            if (opening_hours.data.length < 1) {
                throw new BadRequestException('Opening hours not found for today for this location');
            }

            

        } else {

        }
    }
}
