import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { CarTransmissionService } from './car.transmission.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CarTransmissionDto } from './car.transmission.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car-transmission')
export class CarTransmissionController {

    constructor(
        @Inject(CarTransmissionService) private carTransmissionService: CarTransmissionService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.carTransmissionService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.carTransmissionService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: CarTransmissionDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.carTransmissionService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: CarTransmissionDto, @Request() req) {

        const respone = await this.carTransmissionService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.carTransmissionService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.carTransmissionService.getOne({ id });

        if (respone) {
            await this.carTransmissionService.update({ id }, { deleted_by: req.user.id })
            return await this.carTransmissionService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
