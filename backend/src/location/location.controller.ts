import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards, } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationTypeDto } from './dtos/location.type.dto';
import { LocationTypes } from 'src/entities/enums/location.type';
import { CacheService } from 'src/cache/cache.service';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { LangDto } from 'src/dtos/lang.dto';
import { LocationDetailDto } from './dtos/location.detail.dto';
import { DayTypes } from 'src/entities/enums/day.type';
import { LocationHourDetailDto } from './dtos/location.hours.detail.dto';
import { LocationOpeningHourService } from './location.opening.hour.service';
import { LocationOpeningHourExceptionService } from './location.opening.hour.exception.service';
import { LocationListDto } from './dtos/location.list.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('location')
export class LocationController {
    private CACHE_KEY_PREFIX = 'locations';
    constructor(
        @Inject(LocationService) private locationService: LocationService,
        @Inject(LocationOpeningHourService) private locationOpeningHourService: LocationOpeningHourService,
        @Inject(LocationOpeningHourExceptionService) private locationOpeningHourExceptionService: LocationOpeningHourExceptionService,
        @Inject(CacheService) private cacheService: CacheService
    ) { }

    @ApiParam({
        name: 'type',
        type: 'string',
        description: 'pickup or dropoff',
    })
    @Get(':type')
    async getLocations(@Param() params: LocationTypeDto, @Query() query: LocationListDto) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const city_id = query.city_id;
        const pickup_location_id = query.pickup_location_id;
        const api_key = `${this.CACHE_KEY_PREFIX}_${params.type}_${lang}_${city_id}_${pickup_location_id || 'all'}`;
        const cacheResponse = await this.cacheService.get(api_key);
        if (cacheResponse) {
            return cacheResponse;
        }
        const where = { status: LocationService.ACTIVE };
        if (params.type == LocationTypes.PICKUP) {
            where['pickup'] = 1
        } else {
            where['dropoff'] = 1
        };

        if (city_id) {
            where['city_id'] = city_id
        }

        const select = ['id', `name_${lang}`, `address_${lang}`, `is_virtual`, `timing_detail_${lang}`, `city_id`, 'lat', 'long', 'contact_number', 'recipients', 'buffer_hours', 'order'];

        const relations = {
            city: {
                columns: ['id', `name_${lang}`]
            }
        }

        const response = await this.locationService.getAll(where, select, relations, null, true, 1, 100, { column: 'entity_order', order: 'ASC' });
        let response_data = response.data;

        // Filter dropoff locations based on pickup location type
        if (params.type == LocationTypes.DROPOFF && pickup_location_id) {
            const pickup_location = await this.locationService.getOne({ id: pickup_location_id }, ['id', 'is_virtual', 'city_id']);
            if (pickup_location) {
                if (!pickup_location.is_virtual) {
                    // Pickup is PHYSICAL → show only physical locations as dropoff
                    response_data = response_data.filter(loc => !loc.is_virtual);
                } else {
                    // Pickup is VIRTUAL → show same virtual location + all physical locations
                    response_data = response_data.filter(
                        loc => !loc.is_virtual || loc.id === pickup_location_id
                    );
                }
            }
        }

        const response_update = this.locationService.removePostfix(response_data);
        this.cacheService.set(api_key, response_update);

        return response_update;
    }
    @ApiParam({
        name: 'type',
        type: 'string',
        description: 'pickup or dropoff'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'location id'
    })
    @Get(':type/:id')
    async details(@Param() params: LocationDetailDto, @Query() query: LangDto) {
        const lang = query.lang || LanguageTypes.ENGLISH;

        const where = (params.type == LocationTypes.PICKUP) ? { pickup: 1 } : { dropoff: 1 };
        where['id'] = params.id;
        const select = ['id', `name_${lang}`, `address_${lang}`, `timing_detail_${lang}`, 'recipients', 'contact_number', 'lat', 'long', 'buffer_hours'];
        const relations = { location_opening_hours: { columns: ['day', 'from_hours', 'to_hours', 'shift'] } }
        const response = await this.locationService.getOne(where, select, relations);
        if (!response) {
            throw new NotFoundException()
        }
        const response_update = this.locationService.removePostfix(response);

        return response_update;
    }

    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'location id',
    })
    @ApiParam({
        name: 'day',
        type: 'number',
        description: 'Day from 1 to 7',
    })
    @Get('hours/:id/:day')
    async hoursDetails(@Param() params: LocationHourDetailDto, @Query() query: LangDto, @Query('date') date?: string) {
        const lang = query.lang || LanguageTypes.ENGLISH;

        if (date) {
            const exceptionWhere = {
                location_id: params.id,
                start_date: LessThanOrEqual(date),
                end_date: MoreThanOrEqual(date),
            };
            const allExceptions = await this.locationOpeningHourExceptionService.getAll(exceptionWhere);

            if (allExceptions.data.length > 0) {
                const dayNum = Number(params.day);
                const daySpecific = allExceptions.data.filter(e => e.day === dayNum);
                const dayGeneral = allExceptions.data.filter(e => e.day === null);
                const daySpecificShifts = new Set(daySpecific.map(e => e.shift));
                const applicable = [...daySpecific, ...dayGeneral.filter(e => !daySpecificShifts.has(e.shift))];

                return applicable.map(e => ({
                    day: e.day ?? dayNum,
                    from_hours: e.is_closed ? 0 : e.from_hours,
                    to_hours: e.is_closed ? 0 : e.to_hours,
                    shift: e.shift,
                }));
            }
        }

        const where = { location_id: params.id, day: params.day };
        const select = ['day', 'from_hours', 'to_hours', 'shift'];
        const response = await this.locationOpeningHourService.getAll(where, select);
        if (!response) {
            throw new NotFoundException()
        }

        return response.data;
    }
}
