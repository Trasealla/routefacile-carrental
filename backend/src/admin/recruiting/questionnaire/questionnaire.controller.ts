import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Like } from 'typeorm';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RecruitingQuestionnaireService } from 'src/recruiting/recruiting.questionnaire.service';
import {
    QUESTION_TYPES,
    RecruitingQuestionnaireBulkDto,
    RecruitingQuestionnaireDto,
    RecruitingQuestionnaireDuplicateDto,
    RecruitingQuestionnaireFilterDto,
    RecruitingQuestionnaireReorderDto,
    RecruitingQuestionnaireUpdateDto,
} from './questionnaire.dto';

const HR_ROLES = ['admin', 'hr_manager', 'hr_recruitment'] as const;

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(...HR_ROLES)
@Controller('admin/recruiting/questionnaire')
export class RecruitingQuestionnaireController {
    constructor(
        @Inject(RecruitingQuestionnaireService) private questionnaireService: RecruitingQuestionnaireService,
    ) { }

    /** Static metadata for the form builder. */
    @Get('meta/types')
    meta() {
        return {
            status: 'success',
            data: {
                question_types: QUESTION_TYPES,
                supports_options: ['single_choice', 'multiple_choice'],
                supports_min_max: ['number', 'rating'],
            },
        };
    }

    @Get()
    async listing(
        @Query() params: PaginationDto,
        @Query() filter: RecruitingQuestionnaireFilterDto,
    ) {
        const where: any = {};
        if (filter.career_job_id) where.career_job_id = filter.career_job_id;
        if (filter.category) where.category = filter.category;
        if (filter.question_type) where.question_type = filter.question_type;
        if (filter.search) where.question_en = Like(`%${filter.search}%`);

        const result = await this.questionnaireService.getAll(
            where,
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
            true,
            params.page,
            params.page_size,
            { column: 'entity.display_order', order: 'ASC' },
        );

        // Parse options JSON for each row.
        if (result?.data?.length) {
            result.data = result.data.map(parseRowOptions);
        }
        return result;
    }

    /** All active questions for a given job, no pagination, ordered by display_order. */
    @Get('by-job/:career_job_id')
    async byJob(@Param('career_job_id', ParseIntPipe) career_job_id: number) {
        const rows = await this.questionnaireService.listByJob(career_job_id);
        return {
            status: 'success',
            count: rows.length,
            data: rows.map(parseRowOptions),
        };
    }

    @Get(':id')
    async detail(@Param('id', ParseIntPipe) id: number) {
        const response = await this.questionnaireService.getOne(
            { id },
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
        );
        if (!response) throw new NotFoundException();
        return parseRowOptions(response);
    }

    @Post()
    async store(@Body() body: RecruitingQuestionnaireDto, @Request() req: any) {
        validateOptionsForType(body.question_type, body.options);
        validateMinMax(body.min_value, body.max_value);
        const row: any = {
            ...body,
            options: body.options ? JSON.stringify(body.options) : null,
            created_by: req.user.id,
        };
        return this.questionnaireService.insert(row);
    }

    /** Bulk-create questions for a job. */
    @Post('bulk')
    async bulk(@Body() body: RecruitingQuestionnaireBulkDto, @Request() req: any) {
        for (const q of body.questions) {
            validateOptionsForType(q.question_type, q.options);
            validateMinMax(q.min_value, q.max_value);
        }
        return this.questionnaireService.bulkCreate(
            body.career_job_id,
            body.questions as any,
            req.user.id,
            !!body.replace_existing,
        );
    }

    /** Reorder a list of questions in one shot. */
    @Put('reorder')
    async reorder(@Body() body: RecruitingQuestionnaireReorderDto, @Request() req: any) {
        return this.questionnaireService.reorder(body.items, req.user.id);
    }

    /** Copy questions from one job to another. */
    @Post('duplicate')
    async duplicate(
        @Body() body: RecruitingQuestionnaireDuplicateDto,
        @Request() req: any,
    ) {
        return this.questionnaireService.duplicate(
            body.source_career_job_id,
            body.target_career_job_id,
            req.user.id,
            !!body.replace_existing,
        );
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: RecruitingQuestionnaireUpdateDto,
        @Request() req: any,
    ) {
        const existing = await this.questionnaireService.getOne({ id });
        if (!existing) throw new NotFoundException();
        validateOptionsForType(body.question_type ?? existing.question_type, body.options);
        validateMinMax(body.min_value, body.max_value);
        const patch: any = { ...body, updated_by: req.user.id };
        if (body.options !== undefined) {
            patch.options = body.options ? JSON.stringify(body.options) : null;
        }
        return this.questionnaireService.update({ id }, patch);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        const response = await this.questionnaireService.getOne({ id });
        if (!response) throw new NotFoundException();
        await this.questionnaireService.update({ id }, { deleted_by: req.user.id });
        return this.questionnaireService.softDelete({ id });
    }
}

/* ----------------------------- helpers ----------------------------- */

function parseRowOptions<T extends { options?: string | null }>(row: T): T {
    if (row && typeof row.options === 'string' && row.options.length) {
        try {
            (row as any).options = JSON.parse(row.options);
        } catch {
            (row as any).options = null;
        }
    }
    return row;
}

function validateOptionsForType(type: string | undefined, options: any[] | undefined) {
    const choiceTypes = new Set(['single_choice', 'multiple_choice']);
    if (type && choiceTypes.has(type)) {
        if (!options || options.length < 2) {
            throw new BadRequestException(
                `${type} questions require at least 2 options.`,
            );
        }
        const values = options.map((o) => o?.value);
        if (new Set(values).size !== values.length) {
            throw new BadRequestException('Option values must be unique within a question.');
        }
    }
}

function validateMinMax(min?: number, max?: number) {
    if (min !== undefined && max !== undefined && min > max) {
        throw new BadRequestException('min_value cannot be greater than max_value.');
    }
}
