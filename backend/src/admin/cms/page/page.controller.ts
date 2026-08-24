import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PageService } from 'src/cms/page/page.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { PageDto } from './page.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/page')
export class PageController {
    constructor(
        @Inject(PageService) private pageService: PageService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.pageService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.pageService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: PageDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        return await this.pageService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: PageDto, @Request() req) {

        const respone = await this.pageService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.pageService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.pageService.getOne({ id });

        if (respone) {
            await this.pageService.update({ id }, { deleted_by: req.user.id })
            return await this.pageService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
