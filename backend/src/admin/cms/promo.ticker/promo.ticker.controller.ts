import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { PromoTickerService } from 'src/cms/promo.ticker/promo.ticker.service';
import { PromoTickerDto } from './promo.ticker.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/promo-ticker')
export class PromoTickerController {
    constructor(
        @Inject(PromoTickerService) private promoTickerService: PromoTickerService
    ) { }

    @Get()
    async listing() {
        const promoTickers = await this.promoTickerService.getAll(
            {},
            ['id', 'text_en', 'text_ar', 'status', 'start_date', 'end_date', 'sort_order', 'scroll_speed', 'created_at'],
            {},
            null,
            true,
            1,
            100,
            { column: 'entity.sort_order', order: 'ASC' }
        );

        if (!promoTickers) {
            throw new NotFoundException();
        }

        return promoTickers;
    }

    @Get(':id')
    async details(@Param('id') id: number) {
        const promoTicker = await this.promoTickerService.getOne({ id });

        if (!promoTicker) {
            throw new NotFoundException();
        }

        return promoTicker;
    }

    @Post()
    async store(
        @Body() body: PromoTickerDto,
        @Request() req
    ) {
        body.created_by = req.user.id;

        if (!body.sort_order) {
            body.sort_order = 0;
        }

        return await this.promoTickerService.insert(body);
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() body: PromoTickerDto,
        @Request() req
    ) {
        const promoTicker = await this.promoTickerService.getOne({ id });

        if (!promoTicker) {
            throw new NotFoundException();
        }

        body.updated_by = req.user.id;

        return await this.promoTickerService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {
        const promoTicker = await this.promoTickerService.getOne({ id });

        if (!promoTicker) {
            throw new NotFoundException();
        }

        return await this.promoTickerService.softDelete({ id }, req.user.id);
    }
}







