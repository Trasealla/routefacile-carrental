import { Controller, Get, Inject, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateMonthlyV2Service } from 'src/admin/rate/rate.monthly/rate.monthly.v2.service';
import { monthlyBrackets } from 'src/admin/utils/date.util';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { In, IsNull, MoreThan } from 'typeorm';

@ApiTags('booking-form')
@UseGuards(ApiKeyAuthGuard)
@Controller('booking/monthly/upgrade')
export class MonthlyUpgradeController {

    constructor(@Inject(RateMonthlyV2Service) private rateMonthlyV2Service: RateMonthlyV2Service
    ) { }

    @Get('extra/km/:rate_id')
    async getExtraKmsPlans(@Param('rate_id') rate_id: number) {
        const response_km = await this.rateMonthlyV2Service.getOne({ id: rate_id }, ['id', 'extra_1000_km_rate', 'extra_2000_km_rate', 'extra_3000_km_rate']);

        if (!response_km) {
            throw new NotFoundException();
        }
        return response_km;
    }

    @Get('mileage/plans/:car_id/:city_id/:months')
    async mileagePlans(@Param('car_id') car_id: number, @Param('city_id') city_id: number, @Param('months') months: number) {
        const q_month = monthlyBrackets(months);
        const date = new Date();
        const year = date.getFullYear();
        const response = await this.rateMonthlyV2Service.getAll({ car_id, city_id, months: q_month, year, deleted_at: IsNull() }, ['id', 'rate', 'mileage']);

        if (!response) {
            throw new NotFoundException();
        }
        return response;
    }

    @Get('monthly/plans/:car_id/:city_id/:mileage')
    async monthlyPlans(@Param('car_id') car_id: number, @Param('city_id') city_id: number, @Param('mileage') mileage: number) {

        const date = new Date();
        const year = date.getFullYear();
        const response = await this.rateMonthlyV2Service.getAll({ car_id, city_id, mileage: mileage, year, deleted_at: IsNull() }, ['id', 'rate', 'months']);

        if (!response) {
            throw new NotFoundException();
        }
        return response;
    }
}
