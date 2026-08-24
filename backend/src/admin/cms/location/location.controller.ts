import { Body, Controller, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { LocationService } from 'src/location/location.service';
import { LocationDto } from './location.dto';
import { LocationListingDto } from './location.listing.dto';
import { LocationOpeningHourService } from 'src/location/location.opening.hour.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { CacheService } from 'src/cache/cache.service';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/location')
export class LocationController {

    // Must match LocationController.CACHE_KEY_PREFIX in src/location/location.controller.ts
    private static readonly PUBLIC_LOCATIONS_CACHE_PREFIX = 'locations';

    constructor(
        @Inject(LocationService) private locationService: LocationService,
        @Inject(LocationOpeningHourService) private locationOpeningHourService: LocationOpeningHourService,
        @Inject(CacheService) private cacheService: CacheService,
    ) {

    }

    private async invalidatePublicLocationsCache() {
        await this.cacheService.deleteByPrefix(LocationController.PUBLIC_LOCATIONS_CACHE_PREFIX);
    }

    @Get()
    @Roles('admin', 'counter')
    async listing(@Query() params: LocationListingDto) {
        const relations = {
            location_opening_hours: {
                columns: ['id', 'shift', 'from_hours', 'to_hours']
            }
        };

        const where: any = {};
        
        if (params.is_virtual !== undefined) {
            where.is_virtual = params.is_virtual;
        }

        const page = params.page || 1;
        // Default to a large page_size (1000) to return all locations by default
        // The DTO defaults page_size to 10, so we override it to 1000 to return all records
        // Users can still explicitly set a smaller page_size for pagination if needed
        const page_size = params.page_size === 10 ? 1000 : (params.page_size || 1000);

        return await this.locationService.getAll(where, [], relations, null, true, page, page_size)
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const relations = {
            location_opening_hours: {
                columns: ['id', 'day', 'shift', 'from_hours', 'to_hours', 'is_closed']
            }
        };
        const response = await this.locationService.getOne({ id }, [], relations);
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(
        @Body() body: LocationDto,
        @Request() req
    ) {

        body.created_by = req.user.id;
        const location = await this.locationService.insert(body);
        const location_id = location.response.identifiers[0].id;
        for (const locatopn_opening_hour of body.location_opening_hours) {
            const insert = { ...locatopn_opening_hour, location_id, created_by: req.user.id }
            await this.locationOpeningHourService.insert(insert);
        }
        await this.invalidatePublicLocationsCache();
        return location;
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() body: LocationDto,
        @Request() req
    ) {

        const location = await this.locationService.getOne({ id });

        if (!location) {
            throw new NotFoundException()
        }
        const { location_opening_hours, ...update_obj } = body

        update_obj.updated_by = req.user.id;

        const location_update = await this.locationService.update({ id }, update_obj);

        for (const location_opening_hour of body.location_opening_hours) {
            const update = {
                updated_by: req.user.id,
                from_hours: location_opening_hour.from_hours,
                to_hours: location_opening_hour.to_hours,
                is_closed: location_opening_hour.is_closed
            }
            await this.locationOpeningHourService.update(
                {
                    day: location_opening_hour.day,
                    shift: location_opening_hour.shift,
                    location_id: id
                }, update
            );
        }

        await this.invalidatePublicLocationsCache();
        return location_update;
    }
}
