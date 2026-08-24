import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { SurgeDto } from './surge.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/surge')
export class SurgeController {

    constructor(
        @Inject(SurgeService) private surgeService: SurgeService
    ) {

    }

    @Get()
    async listing() {
        return await this.surgeService.getAll()
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.surgeService.getOne({ id });
        if (!response) {
            throw new NotFoundException();
        }

        return response;
    }

    @Post()
    async store(@Body() body: SurgeDto, @Request() req) {

        body.created_by = req.user.id;

        return await this.surgeService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: SurgeDto, @Request() req) {

        const surge = await this.surgeService.getOne({ id });

        if (!surge) {
            throw new NotFoundException();
        }
        body.updated_by = req.user.id;

        return await this.surgeService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const response = await this.surgeService.getOne({ id });
        if (!response) {
            throw new NotFoundException();
        }

        return await this.surgeService.softDelete({ id });
    }
}
