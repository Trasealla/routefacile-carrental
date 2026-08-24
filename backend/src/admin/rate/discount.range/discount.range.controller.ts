import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { DiscountRangeService } from 'src/booking/car.search/discount.range.service';
import { DiscountRangeDto } from './discount.range.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discount/range')
export class DiscountRangeController {

    constructor(
        @Inject(DiscountRangeService) private discountRangeService: DiscountRangeService
    ) { }

    @Get()
    async listing() {
        // There are only ever a handful of rules per extra (six extras), so a single
        // generous page keeps the admin screen showing every rule rather than
        // silently truncating at 100 and hiding rules that still affect pricing.
        return await this.discountRangeService.getAll({}, [], {}, null, true, 1, 1000);
    }

    @Put()
    async save(@Body() body: DiscountRangeDto, @Request() req) {

        // Cross-field check the DTO can't express: a backwards range matches nothing,
        // so the rule would sit in the list looking active while never applying.
        if (Number(body.from) > Number(body.to)) {
            throw new BadRequestException('"From days" cannot be greater than "To days"');
        }

        if (body.id) {
            const discount_range = await this.discountRangeService.getOne({ id: body.id, type: body.type }, ['id']);

            if (!discount_range) {
                return new NotFoundException();
            }
            body.updated_by = req.user.id;
            return await this.discountRangeService.update({ id: body.id }, body)
        } else {
            body.created_by = req.user.id;
            return await this.discountRangeService.insert(body)
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const discount_range = await this.discountRangeService.getOne({ id })

        if (!discount_range) {
            throw new NotFoundException();
        }

        return await this.discountRangeService.softDelete({ id });
    }
}
