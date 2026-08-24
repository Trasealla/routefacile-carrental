import { Body, Controller, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CityDto } from './city.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { CityService } from 'src/city/city.service';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/city')
export class CityController {

    constructor(
        @Inject(CityService) private cityService: CityService,
        @Inject(CityOpeningHourService) private cityOpeningHourService: CityOpeningHourService,
    ) { }

    @Get()
    @Roles('admin', 'counter')
    async listing(@Query() params: PaginationDto) {
        const relations = {
            city_opening_hours: {
                columns: ['id', 'from_hours', 'to_hours']
            }
        };

        return await this.cityService.getAll({}, [], relations, null, true, params.page, params.page_size)
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const relations = {
            city_opening_hours: {
                columns: ['id', 'day', 'from_hours', 'to_hours', 'is_closed']
            }
        };
        const response = await this.cityService.getOne({ id }, [], relations);
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(
        @Body() body: CityDto,
        @Request() req
    ) {

        body.created_by = req.user.id;
        const location = await this.cityService.insert(body);
        const location_id = location.response.identifiers[0].id;
        for (const locatopn_opening_hour of body.city_opening_hours) {
            const insert = { ...locatopn_opening_hour, location_id, created_by: req.user.id }
            await this.cityOpeningHourService.insert(insert);
        }
        return location;
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() body: CityDto,
        @Request() req
    ) {

        const city = await this.cityService.getOne({ id });

        if (!city) {
            throw new NotFoundException()
        }
        const { city_opening_hours, ...update_obj } = body

        update_obj.updated_by = req.user.id;
        const city_update = await this.cityService.update({ id }, update_obj);

        for (const city_opening_hour of body.city_opening_hours) {
            const update = {
                updated_by: req.user.id,
                from_hours: city_opening_hour.from_hours,
                to_hours: city_opening_hour.to_hours,
                is_closed: city_opening_hour.is_closed
            }
            await this.cityOpeningHourService.update(
                {
                    day: city_opening_hour.day,
                    city_id: id,
                }, update
            );
        }

        return city_update;
    }
}
