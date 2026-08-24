import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { InterCitiesChargesService } from './inter.cities.charges.service';
import { InterCitiesChargesDto } from './inter.cities.charges.dto';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { MiscChargeDto } from './misc.charge.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/charges')
export class MiscChargesController {

    constructor(
        @Inject(InterCitiesChargesService) private interCitiesChargesService: InterCitiesChargesService,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
    ) { }

    @Get('inter_cities')
    async listing() {
        return await this.interCitiesChargesService.getAll({}, [], {}, null, true, 1, 100);
    }

    @Put('inter_cities')
    async save(@Body() body: InterCitiesChargesDto, @Request() req) {

        if (body.id) {
            const inter_city_charges = await this.interCitiesChargesService.getOne({ id: body.id }, ['id']);

            if (!inter_city_charges) {
                return new NotFoundException();
            }
            body.updated_by = req.user.id;
            return await this.interCitiesChargesService.update({ id: body.id }, body)
        } else {
            body.created_by = req.user.id;
            return await this.interCitiesChargesService.insert(body)
        }
    }

    @Delete('inter_cities/:id')
    async delete(@Param('id') id: number) {
        const discount_range = await this.interCitiesChargesService.getOne({ id })

        if (!discount_range) {
            throw new NotFoundException();
        }

        return await this.interCitiesChargesService.hardDelete({ id });
    }

    @Get('other')
    async otherListing() {
        return await this.miscChargeService.getAll({}, [], {}, null, true, 1, 100);
    }

    @Put('other')
    async otherSave(@Body() body: MiscChargeDto, @Request() req) {

        const misc_charge = await this.miscChargeService.getOne({ id: body.id, key: body.key }, ['id']);

        if (!misc_charge) {
            return new NotFoundException();
        }

        body.updated_by = req.user.id;

        return await this.miscChargeService.update({ id: body.id, key: body.key }, body)
    }
}
