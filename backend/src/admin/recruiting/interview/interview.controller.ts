import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RecruitingInterviewService } from 'src/recruiting/recruiting.interview.service';
import { RecruitingStatusHistoryService } from 'src/recruiting/recruiting.status.history.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { RecruitingInterviewDto, RecruitingInterviewUpdateDto, RecruitingInterviewFilterDto } from './interview.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/interview')
export class RecruitingInterviewController {
    constructor(
        @Inject(RecruitingInterviewService) private interviewService: RecruitingInterviewService,
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto, @Query() filters: RecruitingInterviewFilterDto) {
        const where: any = {};
        if (filters.application_id) where.application_id = filters.application_id;
        if (filters.interviewer_id) where.interviewer_id = filters.interviewer_id;
        if (filters.status !== undefined && filters.status !== null) where.status = filters.status;

        return await this.interviewService.getAll(
            where,
            [],
            {
                application: { columns: ['id', 'first_name', 'last_name', 'email'] },
                interviewer: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left',
            true,
            params.page,
            params.page_size,
            { column: 'entity.interview_date', order: 'DESC' }
        );
    }

    @Get('upcoming')
    async upcoming() {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const repo = this.interviewService['repository'];
        const interviews = await repo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .addSelect(['application_alias.id', 'application_alias.first_name', 'application_alias.last_name', 'application_alias.email'])
            .leftJoin('entity.interviewer', 'interviewer_alias')
            .addSelect(['interviewer_alias.id', 'interviewer_alias.first_name', 'interviewer_alias.last_name'])
            .where('entity.status = :status', { status: 0 })
            .andWhere('entity.interview_date >= :now', { now })
            .orderBy('entity.interview_date', 'ASC')
            .take(20)
            .getMany();

        return { data: interviews };
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.interviewService.getOne(
            { id },
            [],
            {
                application: { columns: ['id', 'first_name', 'last_name', 'email', 'phone_number'] },
                interviewer: { columns: ['id', 'first_name', 'last_name'] },
                created_by_admin: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left'
        );
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingInterviewDto, @Request() req) {
        body.created_by = req.user.id;
        // Interviewer can be assigned later from the interview detail screen.
        // If the client doesn't supply one, default to the acting admin so the
        // record is never orphaned.
        if (!body.interviewer_id) {
            body.interviewer_id = req.user.id;
        }
        return await this.interviewService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: RecruitingInterviewUpdateDto, @Request() req) {
        const response = await this.interviewService.getOne({ id });
        if (response) {
            return await this.interviewService.update({ id }, body);
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const response = await this.interviewService.getOne({ id });
        if (response) {
            return await this.interviewService.update({ id }, { status: 2 }); // CANCELLED
        }
        throw new NotFoundException();
    }
}
