import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { FaqService } from 'src/cms/faq/faq.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { FaqDto } from './faq.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/faq')
export class FaqController {
    constructor(
        @Inject(FaqService) private faqService: FaqService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.faqService.getAll({}, [], { category: { columns: ['id', 'name_en'] } }, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.faqService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }

    @Post()
    async store(
        @Body() body: FaqDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.faqService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: FaqDto, @Request() req) {

        const respone = await this.faqService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.faqService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.faqService.getOne({ id });

        if (respone) {
            await this.faqService.update({ id }, { deleted_by: req.user.id })
            return await this.faqService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}