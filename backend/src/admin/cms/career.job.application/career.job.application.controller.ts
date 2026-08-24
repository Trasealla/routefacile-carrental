import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobApplicationAttachmentService } from 'src/cms/career.job/career.job.application.attachment.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { CareerJobApplicationFilterDto, CareerJobApplicationUpdateDto } from './career.job.application.dto';
import { CareerJobApplicationStatusChangedEvent } from 'src/event/events/career.job.application.status.changed.event';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/career/application')
export class CareerJobApplicationController {
    constructor(
        @Inject(CareerJobApplicationService) private careerJobApplicationService: CareerJobApplicationService,
        @Inject(CareerJobApplicationAttachmentService) private attachmentService: CareerJobApplicationAttachmentService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto, @Query() filter: CareerJobApplicationFilterDto) {
        const where: any = {};

        if (filter.career_job_id) {
            where.career_job_id = filter.career_job_id;
        }

        if (filter.status !== undefined && filter.status !== null) {
            where.status = filter.status;
        }

        if (filter.source_channel) {
            where.source_channel = filter.source_channel;
        }

        if (filter.ai_status) {
            where.ai_status = filter.ai_status;
        }

        const relations = {
            career_job: {
                columns: ['id', 'title_en', 'title_ar'],
            }
        };

        const sortColumn = filter.sort_by ? `entity.${filter.sort_by}` : 'entity.created_at';
        const sortOrder = (filter.sort_order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        return await this.careerJobApplicationService.getAll(
            where,
            [],
            relations,
            'left',
            true,
            params.page,
            params.page_size,
            { column: sortColumn, order: sortOrder }
        );
    }

    @Get('pending-count')
    async pendingCount() {
        const result = await this.careerJobApplicationService.getAll({ status: 0 });
        return { pending_count: result.total_records };
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const relations = {
            career_job: {
                columns: ['id', 'title_en', 'title_ar', 'location_en', 'location_ar', 'experience_years', 'expiry_date', 'status'],
            },
            reviewed_by_admin: {
                columns: ['id', 'first_name', 'last_name'],
            },
            attachments: {
                columns: ['id', 'file_name', 'original_name', 'file_type', 'file_size', 'created_at'],
            }
        };

        const response = await this.careerJobApplicationService.getOne({ id }, [], relations, 'left');

        if (response) {
            return response;
        }

        throw new NotFoundException();
    }

    @Put(':id')
    async updateStatus(@Param('id') id: number, @Body() body: CareerJobApplicationUpdateDto, @Request() req) {
        const application = await this.careerJobApplicationService.getOne({ id });

        if (!application) {
            throw new NotFoundException();
        }

        const previousStatus = application.status;
        body.reviewed_by = req.user.id;
        const result = await this.careerJobApplicationService.update({ id }, body);

        if (body.status !== undefined && body.status !== null && Number(body.status) !== Number(previousStatus)) {
            this.eventEmitter.emit(
                'career.job.application.status.changed',
                new CareerJobApplicationStatusChangedEvent(Number(id), Number(previousStatus), Number(body.status)),
            );
        }

        return result;
    }

    @Get(':id/cv')
    async downloadCv(@Param('id') id: number, @Res() res: Response) {
        const application = await this.careerJobApplicationService.getOne({ id });

        if (!application) {
            throw new NotFoundException();
        }

        const filePath = join(process.cwd(), 'uploads', 'job-applications', String(application.career_job_id), application.cv);

        if (!existsSync(filePath)) {
            throw new NotFoundException('CV file not found');
        }

        return res.download(filePath);
    }

    @Get(':id/attachment/:attachmentId')
    async downloadAttachment(@Param('id') id: number, @Param('attachmentId') attachmentId: number, @Res() res: Response) {
        const application = await this.careerJobApplicationService.getOne({ id });

        if (!application) {
            throw new NotFoundException();
        }

        const attachment = await this.attachmentService.getOne({ id: attachmentId, career_job_application_id: id });

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        const filePath = join(process.cwd(), 'uploads', 'job-applications', String(application.career_job_id), attachment.file_name);

        if (!existsSync(filePath)) {
            throw new NotFoundException('Attachment file not found');
        }

        return res.download(filePath, attachment.original_name);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const response = await this.careerJobApplicationService.getOne({ id });

        if (response) {
            return await this.careerJobApplicationService.hardDelete({ id });
        }

        throw new NotFoundException();
    }

    /**
     * Re-emit the career.job.application event for an existing application.
     * Use this to backfill the HR notification + applicant confirmation email
     * when the original send failed (e.g. SMTP outage at the time of apply).
     */
    @Post(':id/resend-confirmation')
    async resendConfirmation(@Param('id') id: number) {
        const application = await this.careerJobApplicationService.getOne({ id });
        if (!application) {
            throw new NotFoundException();
        }
        this.eventEmitter.emit(
            'career.job.application',
            new (require('src/event/events/career.job.application.event').CareerJobApplicationEvent)(Number(id)),
        );
        return { message: 'Re-queued', application_id: Number(id), email: application.email };
    }
}
