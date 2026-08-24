import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RecruitingDepartmentService } from 'src/recruiting/recruiting.department.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { RecruitingDepartmentDto } from './department.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/department')
export class RecruitingDepartmentController {
    constructor(
        @Inject(RecruitingDepartmentService) private departmentService: RecruitingDepartmentService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.departmentService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get('active')
    async activeList() {
        return await this.departmentService.getAll({ status: 1 }, ['id', 'name_en', 'name_ar']);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.departmentService.getOne({ id });
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingDepartmentDto, @Request() req) {
        body.created_by = req.user.id;
        return await this.departmentService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: RecruitingDepartmentDto, @Request() req) {
        const response = await this.departmentService.getOne({ id });
        if (response) {
            body.updated_by = req.user.id;
            return await this.departmentService.update({ id }, body);
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {
        const response = await this.departmentService.getOne({ id });
        if (response) {
            await this.departmentService.update({ id }, { deleted_by: req.user.id });
            return await this.departmentService.softDelete({ id });
        }
        throw new NotFoundException();
    }
}
