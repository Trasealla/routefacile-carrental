import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { FaqCategoryService } from 'src/cms/faq/faq.category.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { FaqCategoryDto } from './faq.category.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/faq/category')
export class FaqCategoryController {
    constructor(
        @Inject(FaqCategoryService) private faqCategoryService: FaqCategoryService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.faqCategoryService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.faqCategoryService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: FaqCategoryDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.faqCategoryService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: FaqCategoryDto, @Request() req) {

        const respone = await this.faqCategoryService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.faqCategoryService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.faqCategoryService.getOne({ id });

        if (respone) {
            await this.faqCategoryService.update({ id }, { deleted_by: req.user.id })
            return await this.faqCategoryService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}