import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { StopSaleService } from './stop.sale.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { StopSaleDto } from './stop.sale.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/stop/sale')
export class StopSaleController {

    constructor(
        @Inject(StopSaleService) private stopSaleService: StopSaleService
    ) {

    }

    @Get()
    async listing(@Query() params: PaginationDto) {
        const relations = {
            city: { columns: ['id', `name_en`] },
            location: { columns: ['id', `name_en`] }
        };

        return await this.stopSaleService.getAll({}, [], relations, StopSaleService.LEFT_JOIN)
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.stopSaleService.getOne({ id });
        if (!response) {
            throw new NotFoundException();
        }

        return response;
    }

    @Post()
    async store(@Body() body: StopSaleDto, @Request() req) {

        body.created_by = req.user.id;

        return await this.stopSaleService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: StopSaleDto, @Request() req) {

        const coupon = await this.stopSaleService.getOne({ id });

        if (!coupon) {
            throw new NotFoundException();
        }
        body.updated_by = req.user.id;

        return await this.stopSaleService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const response = await this.stopSaleService.getOne({ id });
        if (!response) {
            throw new NotFoundException();
        }

        return await this.stopSaleService.softDelete({ id });
    }
}
