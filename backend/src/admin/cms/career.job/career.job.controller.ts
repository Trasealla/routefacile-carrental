import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CareerJobDto } from './career.job.dto';
import { CareerJobStatusDto } from './career.job.status.dto';
import { CareerJobService } from 'src/cms/career.job/career.job.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { buildJobSlug } from 'src/cms/career.job/slug.util';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/career/job')
export class CareerJobController {
    constructor(
        @Inject(CareerJobService) private careerJobService: CareerJobService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.careerJobService.getAll({}, [], {}, null, true, params.page, params.page_size);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.careerJobService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    async store(
        @Body() body: CareerJobDto,
        @Request() req
    ) {
        body.created_by = req.user.id
        const result = await this.careerJobService.insert(body);

        // Auto-generate slug for the newly inserted row (stable, never changes).
        if (result?.status === 'success') {
            const newId = result.response?.identifiers?.[0]?.id;
            if (newId) {
                const slug = buildJobSlug(body.title_en, newId);
                await this.careerJobService.update({ id: newId }, { slug } as any);
            }
        }
        return result;
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: CareerJobDto, @Request() req) {

        const respone = await this.careerJobService.getOne({ id });

        if (respone) {
            body.updated_by = req.user.id;
            return await this.careerJobService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    /**
     * Status-only update (used by the listing toggle). Accepts just
     * `{ "status": 0 | 1 }` so the FE doesn't have to resend the whole job.
     */
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CareerJobStatusDto,
        @Request() req,
    ) {
        const existing = await this.careerJobService.getOne({ id });
        if (!existing) {
            throw new NotFoundException();
        }
        body.updated_by = req.user.id;
        return await this.careerJobService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.careerJobService.getOne({ id });

        if (respone) {
            await this.careerJobService.update({ id }, { deleted_by: req.user.id })
            return await this.careerJobService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
