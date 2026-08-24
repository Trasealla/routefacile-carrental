import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { CarTagDto } from './car.tag.dto';
import { CarTagService } from './car.tag.service';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car-tag')
export class CarTagController {
    constructor(
        @Inject(CarTagService) private carTagService: CarTagService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.carTagService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.carTagService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: CarTagDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.carTagService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: CarTagDto, @Request() req) {

        const respone = await this.carTagService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.carTagService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.carTagService.getOne({ id });

        if (respone) {
            await this.carTagService.update({ id }, { deleted_by: req.user.id })
            return await this.carTagService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
