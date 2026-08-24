import { Controller, Get, Inject, NotFoundException, Param, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RecruitingStatusHistoryService } from 'src/recruiting/recruiting.status.history.service';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { RecruitingStatusHistoryDto } from './status-history.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

class StatusHistoryFilterDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    application_id: number;
}

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/status-history')
export class RecruitingStatusHistoryController {
    constructor(
        @Inject(RecruitingStatusHistoryService) private statusHistoryService: RecruitingStatusHistoryService,
        @Inject(CareerJobApplicationService) private applicationService: CareerJobApplicationService,
    ) { }

    @Get()
    async listing(@Query() filters: StatusHistoryFilterDto) {
        const where: any = {};
        if (filters.application_id) where.application_id = filters.application_id;

        return await this.statusHistoryService.getAll(
            where,
            [],
            {
                changed_by_admin: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left',
            false,
            1,
            100,
            { column: 'entity.created_at', order: 'DESC' }
        );
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.statusHistoryService.getOne(
            { id },
            [],
            {
                application: { columns: ['id', 'first_name', 'last_name', 'email'] },
                changed_by_admin: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left'
        );
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingStatusHistoryDto, @Request() req) {
        body.changed_by = req.user.id;

        // Also update the application's status. The CareerJobApplication entity
        // tracks the reviewer via `reviewed_by` (not `updated_by`), so we set
        // that to the acting admin so the timeline & details panel reflect it.
        await this.applicationService.update(
            { id: body.application_id },
            { status: body.to_status, reviewed_by: req.user.id }
        );

        return await this.statusHistoryService.insert(body);
    }
}
