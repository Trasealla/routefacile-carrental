import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { LocationService } from 'src/location/location.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { LocationOpeningHourExceptionService } from 'src/location/location.opening.hour.exception.service';
import { LocationOpeningHourExceptionDto } from './location.opening.hour.exception.dto';
import { CacheService } from 'src/cache/cache.service';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/location/opening/hour/exception')
export class LocationOpeningHourExceptionController {

    private CACHE_KEY_OPENING_HOUR = 'opening_hours';

    constructor(
        @Inject(LocationService) private locationService: LocationService,
        @Inject(LocationOpeningHourExceptionService) private locationOpeningHourExceptionService: LocationOpeningHourExceptionService,
        @Inject(CacheService) private cacheService: CacheService,
    ) {
    }

    @Get(':location_id')
    async listing(@Param('location_id') location_id: number, @Param() params: PaginationDto) {
        return await this.locationOpeningHourExceptionService.getAll({ location_id }, [], {}, null, true, params.page, 100)
    }

    @Post(':location_id')
    async store(
        @Param('location_id') location_id: number,
        @Body() body: LocationOpeningHourExceptionDto,
        @Request() req
    ) {

        const location = await this.locationService.getOne({ id: location_id });

        if (!location) {
            throw new NotFoundException()
        }

        const response = await this.locationOpeningHourExceptionService.insert({
            location_id: location_id,
            start_date: body.start_date,
            end_date: body.end_date,
            day: body.day || null,
            shift: body.shift,
            from_hours: body.from_hours,
            to_hours: body.to_hours,
            is_closed: body.is_closed,
            created_by: req.user.id
        })

        await this.cacheService.deleteByPrefix(`${this.CACHE_KEY_OPENING_HOUR}_location_${location_id}`);

        return response;
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() body: LocationOpeningHourExceptionDto,
        @Request() req
    ) {

        const locationOpeningHourException = await this.locationOpeningHourExceptionService.getOne({ id });

        if (!locationOpeningHourException) {
            throw new NotFoundException()
        }

        const update = {
            start_date: body.start_date,
            end_date: body.end_date,
            day: body.day || null,
            shift: body.shift,
            from_hours: body.from_hours,
            to_hours: body.to_hours,
            is_closed: body.is_closed,
            updated_by: req.user.id
        }

        const response = await this.locationOpeningHourExceptionService.update({
            id
        }, update)

        await this.cacheService.deleteByPrefix(`${this.CACHE_KEY_OPENING_HOUR}_location_${locationOpeningHourException.location_id}`);

        return response;
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number,
    ) {

        const obj = await this.locationOpeningHourExceptionService.getOne({ id });

        if (!obj) {
            throw new NotFoundException()
        }

        await this.cacheService.deleteByPrefix(`${this.CACHE_KEY_OPENING_HOUR}_location_${obj.location_id}`);

        return await this.locationOpeningHourExceptionService.hardDelete({ id });
    }
}
