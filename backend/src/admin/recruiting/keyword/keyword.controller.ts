import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RecruitingScreeningKeywordService } from 'src/recruiting/recruiting.screening.keyword.service';
import { RecruitingKeywordDto, RecruitingKeywordFilterDto, RecruitingKeywordUpdateDto } from './keyword.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/keyword')
export class RecruitingKeywordController {
    constructor(
        @Inject(RecruitingScreeningKeywordService) private keywordService: RecruitingScreeningKeywordService,
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto, @Query() filter: RecruitingKeywordFilterDto) {
        const where: any = {};
        if (filter.career_job_id) {
            where.career_job_id = filter.career_job_id;
        }

        return await this.keywordService.getAll(
            where,
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
            true,
            params.page,
            params.page_size,
            { column: 'entity.created_at', order: 'DESC' },
        );
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.keywordService.getOne(
            { id },
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
        );

        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingKeywordDto, @Request() req: any) {
        body.created_by = req.user.id;
        return await this.keywordService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: RecruitingKeywordUpdateDto, @Request() req: any) {
        const response = await this.keywordService.getOne({ id });
        if (response) {
            body.updated_by = req.user.id;
            return await this.keywordService.update({ id }, body);
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req: any) {
        const response = await this.keywordService.getOne({ id });
        if (response) {
            await this.keywordService.update({ id }, { deleted_by: req.user.id });
            return await this.keywordService.softDelete({ id });
        }
        throw new NotFoundException();
    }
}
