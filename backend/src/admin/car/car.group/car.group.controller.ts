import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { CarGroupService } from './car.group.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CarGroupDto } from './car.group.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car-group')
export class CarGroupController {
    constructor(
        @Inject(CarGroupService) private carGroupService: CarGroupService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.carGroupService.getAll({}, [], {}, null, true, params.page, params.page_size, {column: 'name_en', order: 'ASC'});
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.carGroupService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: CarGroupDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.carGroupService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: CarGroupDto, @Request() req) {

        const respone = await this.carGroupService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.carGroupService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.carGroupService.getOne({ id });

        if (respone) {
            await this.carGroupService.update({ id }, { deleted_by: req.user.id })
            return await this.carGroupService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
