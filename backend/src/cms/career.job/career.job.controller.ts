import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CareerJobService } from './career.job.service';
import { ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { CareerJobDto } from '../dtos/career.job.dto';
import { CareerJobApplicationDto } from '../dtos/career.job.application.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CareerJobApplicationService } from './career.job.application.service';
import { CareerJobApplicationAttachmentService } from './career.job.application.attachment.service';
import { LangDto } from 'src/dtos/lang.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CareerJobApplicationEvent } from 'src/event/events/career.job.application.event';
import { MoreThanOrEqual } from 'typeorm';
import { RecruitingQuestionnaireService } from 'src/recruiting/recruiting.questionnaire.service';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@UseGuards(ApiKeyAuthGuard)
@Controller('career/job')
export class CareerJobController {

    constructor(
        @Inject(CareerJobService) private careerJobService: CareerJobService,
        @Inject(CareerJobApplicationService) private careerJobApplicationService: CareerJobApplicationService,
        @Inject(CareerJobApplicationAttachmentService) private attachmentService: CareerJobApplicationAttachmentService,
        @Inject(RecruitingQuestionnaireService) private questionnaireService: RecruitingQuestionnaireService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @Get()
    async listing(@Param() params: PaginationDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `title_${lang}`, `description_${lang}`, `location_${lang}`,
            'experience_years', 'expiry_date'
        ];
        const where = { status: CareerJobService.ACTIVE, expiry_date: MoreThanOrEqual(new Date().toISOString().split('T')[0]) }
        const response = await this.careerJobService.getAll(where, select);
        return this.careerJobService.removePostfix(response)
    }

    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'career job id',
    })
    @Get('/:id')
    async details(@Param() params: CareerJobDto, @Query() query: LangDto) {
        const lang = query.lang || LanguageTypes.ENGLISH;
        const select = ['id', `title_${lang}`, `description_${lang}`, `location_${lang}`,
            'experience_years', 'expiry_date'
        ];
        const where = { status: CareerJobService.ACTIVE, id: params.id, expiry_date: MoreThanOrEqual(new Date().toISOString().split('T')[0]) }

        const response = await this.careerJobService.getOne(where, select);

        return this.careerJobService.removePostfix(response)
    }

    /**
     * Public mirror of the admin "by-job" endpoint. Returns the active
     * screening questions (with parsed `options`) for a given job, ordered
     * by display_order. Used by the public career site to render a
     * pre-apply questionnaire before the applicant form.
     */
    @ApiParam({ name: 'id', type: 'number', description: 'career job id' })
    @Get('/:id/questionnaire')
    async questionnaire(@Param() params: CareerJobDto) {
        const job = await this.careerJobService.getOne(
            { id: params.id, status: CareerJobService.ACTIVE },
            ['id'],
        );
        if (!job) {
            return { status: 'success', count: 0, data: [] };
        }
        const rows = await this.questionnaireService.listByJob(params.id);
        const data = rows
            .filter((r: any) => r.status === undefined || r.status === 1)
            .map((r: any) => {
                if (typeof r.options === 'string' && r.options.length) {
                    try { r.options = JSON.parse(r.options); } catch { r.options = null; }
                }
                return r;
            });
        return { status: 'success', count: data.length, data };
    }

    @Post('/application')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const job_id = req.body.career_job_id;
                    const upload_path = `./uploads/job-applications/${job_id}`;

                    // Create directory if it does not exist
                    fs.mkdir(upload_path, { recursive: true }, (err) => {
                        if (err) {
                            return cb(err, upload_path);
                        }
                        cb(null, upload_path);
                    });
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);

                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|jpeg|jpg|png)$/)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG'), false);
                }
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
        })
    )
    async apply(@Body() body: CareerJobApplicationDto, @UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one file (CV) is required');
        }

        // Find the CV file (required)
        const cvFile = files.find(f => f.fieldname === 'cv');
        if (!cvFile) {
            throw new BadRequestException('CV file is required (field name: cv)');
        }
        body.cv = cvFile.filename;
        body.source_channel = body.source_channel || 'routefacile';

        const response = await this.careerJobApplicationService.insert(body);

        if (response.status == 'success') {
            const applicationId = response.response.identifiers[0]?.id;

            // Save all uploaded files as attachments
            for (const file of files) {
                await this.attachmentService.insert({
                    career_job_application_id: applicationId,
                    file_name: file.filename,
                    original_name: file.originalname,
                    file_type: file.mimetype,
                    file_size: file.size,
                });
            }

            this.eventEmitter.emit('career.job.application', new CareerJobApplicationEvent(applicationId));
        }

        return response;
    }
}
