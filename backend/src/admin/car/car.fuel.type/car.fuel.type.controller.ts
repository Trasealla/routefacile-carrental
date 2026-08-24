import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { CarFuelTypeService } from './car.fuel.type.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CarFuelTypeDto } from './car.fuel.type.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car-fuel_type')
export class CarFuelTypeController {
    constructor(
        @Inject(CarFuelTypeService) private carFuelTypeService: CarFuelTypeService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.carFuelTypeService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.carFuelTypeService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: CarFuelTypeDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.carFuelTypeService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: CarFuelTypeDto, @Request() req) {

        const respone = await this.carFuelTypeService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.carFuelTypeService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.carFuelTypeService.getOne({ id });

        if (respone) {
            await this.carFuelTypeService.update({ id }, { deleted_by: req.user.id })
            return await this.carFuelTypeService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
