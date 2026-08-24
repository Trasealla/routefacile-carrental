import {
    BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException,
    Param, Post, Query, Req, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CareerJob } from 'src/entities/career.job.entity';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';
import { CareerJobApplicationAnswer } from 'src/entities/career.job.application.answer.entity';
import { CareerJobView } from 'src/entities/career.job.view.entity';
import { RecruitingQuestionnaire } from 'src/entities/recruiting.questionnaire.entity';

import { CareerJobService } from './career.job.service';
import { PublicCareerApplicationDto } from './public.career.application.dto';
import { CareerJobApplicationEvent } from 'src/event/events/career.job.application.event';

const ACTIVE = 1;
const DEFAULT_OG_IMAGE = process.env.CAREER_DEFAULT_OG_IMAGE
    || 'https://routefacilecarrental.com/media/static/careers/recruiting-banner.jpg';
const PUBLIC_BASE_URL = process.env.PUBLIC_SITE_URL || 'https://routefacilecarrental.com';

/** Strip HTML tags + collapse whitespace. */
function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function excerpt(html: string, max = 200): string {
    const txt = stripHtml(html);
    if (txt.length <= max) return txt;
    return txt.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function isNumericId(value: string): boolean {
    return /^\d+$/.test(value);
}

function todayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Public, NO-AUTH career site endpoints.
 *
 * Mounted at  /api/v1/public/career/*
 *
 * Throttling:  POST /application is rate-limited to 5/min per IP.
 *              GET endpoints inherit the global throttler.
 */
@ApiExcludeController()
@Controller('public/career')
export class PublicCareerController {
    constructor(
        @Inject(CareerJobService) private careerJobService: CareerJobService,
        @InjectRepository(CareerJob) private careerJobRepo: Repository<CareerJob>,
        @InjectRepository(CareerJobApplication) private applicationRepo: Repository<CareerJobApplication>,
        @InjectRepository(CareerJobApplicationAttachment) private attachmentRepo: Repository<CareerJobApplicationAttachment>,
        @InjectRepository(CareerJobApplicationAnswer) private answerRepo: Repository<CareerJobApplicationAnswer>,
        @InjectRepository(CareerJobView) private viewRepo: Repository<CareerJobView>,
        @InjectRepository(RecruitingQuestionnaire) private questionRepo: Repository<RecruitingQuestionnaire>,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    // -----------------------------------------------------------------------
    // §1.1 List active jobs
    // -----------------------------------------------------------------------
    @Get('job')
    async list(
        @Query('page') pageRaw?: string,
        @Query('page_size') pageSizeRaw?: string,
        @Query('search') search?: string,
        @Query('location') location?: string,
        @Query('experience') experienceRaw?: string,
    ) {
        const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
        const page_size = Math.min(50, Math.max(1, parseInt(pageSizeRaw || '12', 10) || 12));

        const qb = this.careerJobRepo.createQueryBuilder('j')
            .select([
                'j.id', 'j.slug', 'j.title_en', 'j.title_ar',
                'j.description_en', 'j.description_ar',
                'j.location_en', 'j.location_ar',
                'j.experience_years', 'j.expiry_date',
                'j.image_url', 'j.created_at',
            ])
            .where('j.status = :status AND j.deleted_at IS NULL AND j.expiry_date >= :today',
                { status: ACTIVE, today: todayDate() });

        if (search) {
            qb.andWhere('(j.title_en LIKE :s OR j.title_ar LIKE :s)', { s: `%${search}%` });
        }
        if (location) {
            qb.andWhere('(j.location_en LIKE :loc OR j.location_ar LIKE :loc)', { loc: `%${location}%` });
        }
        const exp = experienceRaw !== undefined ? parseInt(experienceRaw, 10) : NaN;
        if (!Number.isNaN(exp)) {
            qb.andWhere('j.experience_years <= :exp', { exp });
        }

        const total = await qb.clone().getCount();
        const rows = await qb
            .orderBy('j.created_at', 'DESC')
            .skip((page - 1) * page_size)
            .take(page_size)
            .getMany();

        const data = await Promise.all(rows.map(r => this.serializeJob(r)));
        return { data, total, page, page_size };
    }

    // -----------------------------------------------------------------------
    // §1.2 Job detail (id OR slug)
    // -----------------------------------------------------------------------
    @Get('job/:idOrSlug')
    async detail(
        @Param('idOrSlug') idOrSlug: string,
        @Req() req: any,
        @Query('utm_source') utm_source?: string,
        @Query('utm_medium') utm_medium?: string,
        @Query('utm_campaign') utm_campaign?: string,
    ) {
        const job = await this.findActiveJob(idOrSlug);
        if (!job) throw new NotFoundException('Job not found or no longer active.');

        // Fire-and-forget analytics log (any UTM => log it).
        if (utm_source || utm_medium || utm_campaign) {
            this.logView(job.id, req, { utm_source, utm_medium, utm_campaign }).catch(() => undefined);
        }
        return this.serializeJob(job);
    }

    // -----------------------------------------------------------------------
    // §1.3 Public questionnaire
    // -----------------------------------------------------------------------
    @Get('job/:idOrSlug/questionnaire')
    async questionnaire(@Param('idOrSlug') idOrSlug: string) {
        const job = await this.findActiveJob(idOrSlug);
        if (!job) throw new NotFoundException('Job not found or no longer active.');

        const rows = await this.questionRepo.find({
            where: { career_job_id: job.id, status: ACTIVE, deleted_at: IsNull() } as any,
            order: { display_order: 'ASC', id: 'ASC' },
        });

        const questions = rows.map(r => {
            let opts: any = null;
            if (typeof r.options === 'string' && r.options.length) {
                try { opts = JSON.parse(r.options); } catch { opts = null; }
            }
            return {
                id: r.id,
                type: r.question_type,
                label_en: r.question_en,
                label_ar: r.question_ar,
                placeholder_en: r.placeholder_en,
                placeholder_ar: r.placeholder_ar,
                help_text_en: r.help_text_en,
                help_text_ar: r.help_text_ar,
                options: opts,
                min: r.min_value,
                max: r.max_value,
                required: r.is_required === 1,
                order: r.display_order,
                category: r.category,
            };
        });

        return {
            id: job.id,
            slug: job.slug,
            title_en: job.title_en,
            title_ar: job.title_ar,
            questions,
        };
    }

    // -----------------------------------------------------------------------
    // §1.4 Submit application (multipart)
    // -----------------------------------------------------------------------
    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('application')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, _file, cb) => {
                    const job_id = (req.body as any)?.career_job_id || 'unknown';
                    const dir = `./uploads/job-applications/${job_id}`;
                    fs.mkdir(dir, { recursive: true }, err => cb(err, dir));
                },
                filename: (_req, file, cb) => {
                    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${suffix}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (/\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|jpeg|jpg|png)$/.test(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG'), false);
                }
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB / file
        }),
    )
    async apply(
        @Body() body: PublicCareerApplicationDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        // 1. Job must be active and not expired
        const job = await this.careerJobRepo.findOne({
            where: { id: body.career_job_id } as any,
            select: ['id', 'status', 'expiry_date'] as any,
        });
        if (!job || job.status !== ACTIVE) {
            throw new BadRequestException('Job is not accepting applications.');
        }
        if (job.expiry_date && new Date(job.expiry_date as any) < new Date(todayDate())) {
            throw new BadRequestException('Job posting has expired.');
        }

        // 2. CV is mandatory
        const cvFile = (files || []).find(f => f.fieldname === 'cv');
        if (!cvFile) throw new BadRequestException('CV file is required (field name: cv).');

        // 3. Optional: extra attachments (max 3)
        const extras = (files || []).filter(f => f.fieldname === 'attachments');
        if (extras.length > 3) throw new BadRequestException('Maximum 3 additional attachments allowed.');

        // 4. Parse + validate answers JSON against the questionnaire
        const parsedAnswers = this.parseAnswers(body.answers);
        const questions = await this.questionRepo.find({
            where: { career_job_id: job.id, status: ACTIVE, deleted_at: IsNull() } as any,
        });
        this.validateAnswers(questions, parsedAnswers);

        // 5. Persist application
        const insertResult = await this.applicationRepo.insert({
            career_job_id: job.id,
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_code: body.country_code || body.phone_code || '',
            phone_number: body.phone_number,
            current_location: body.current_location ?? null,
            expected_salary: body.expected_salary ?? null,
            notice_period_days: body.notice_period_days ?? null,
            cv: cvFile.filename,
            source_channel: body.source_channel || 'routefacile',
            status: 0,
        } as any);

        const applicationId: number = (insertResult.identifiers?.[0] as any)?.id;
        if (!applicationId) throw new BadRequestException('Failed to save application.');

        // 6. Persist attachments (CV + extras)
        for (const f of [cvFile, ...extras]) {
            await this.attachmentRepo.insert({
                career_job_application_id: applicationId,
                file_name: f.filename,
                original_name: f.originalname,
                file_type: f.mimetype,
                file_size: f.size,
            } as any);
        }

        // 7. Persist answers
        if (parsedAnswers.length) {
            await this.answerRepo.insert(parsedAnswers.map(a => ({
                career_job_application_id: applicationId,
                questionnaire_id: a.question_id,
                answer: typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer),
            })) as any);
        }

        // 8. Trigger notification flow (email recruiters / AI screening)
        this.eventEmitter.emit('career.job.application', new CareerJobApplicationEvent(applicationId));

        return { id: applicationId, status: 'received' };
    }

    // -----------------------------------------------------------------------
    // §5.1 Indeed XML feed
    // -----------------------------------------------------------------------
    @SkipThrottle()
    @Get('feed/indeed.xml')
    @Header('Content-Type', 'application/xml; charset=utf-8')
    async indeedFeed() {
        const jobs = await this.careerJobRepo.find({
            where: {
                status: ACTIVE,
                expiry_date: MoreThanOrEqual(todayDate()) as any,
                deleted_at: IsNull(),
            } as any,
            order: { created_at: 'DESC' },
            take: 500,
        });

        const xmlEscape = (s: string) => (s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        const items = jobs.map(j => {
            const slug = j.slug || `${j.id}`;
            const url = `${PUBLIC_BASE_URL.replace(/\/$/, '')}/careers/${slug}`;
            const date = (j.created_at instanceof Date ? j.created_at : new Date(j.created_at as any)).toUTCString();
            return `
  <job>
    <title><![CDATA[${j.title_en || ''}]]></title>
    <date><![CDATA[${date}]]></date>
    <referencenumber><![CDATA[${j.id}]]></referencenumber>
    <url><![CDATA[${url}]]></url>
    <company><![CDATA[Route Facile Car Rental]]></company>
    <city><![CDATA[${j.location_en || ''}]]></city>
    <state><![CDATA[]]></state>
    <country><![CDATA[AE]]></country>
    <description><![CDATA[${j.description_en || ''}]]></description>
    <category><![CDATA[Automotive]]></category>
    <experience><![CDATA[${j.experience_years ?? 0} years]]></experience>
  </job>`;
        }).join('');

        return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>Route Facile Car Rental</publisher>
  <publisherurl>${xmlEscape(PUBLIC_BASE_URL)}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
</source>`;
    }

    // =======================================================================
    // helpers
    // =======================================================================

    private async findActiveJob(idOrSlug: string): Promise<CareerJob | null> {
        const today = todayDate();
        if (isNumericId(idOrSlug)) {
            return this.careerJobRepo.findOne({
                where: {
                    id: parseInt(idOrSlug, 10),
                    status: ACTIVE,
                    expiry_date: MoreThanOrEqual(today) as any,
                    deleted_at: IsNull(),
                } as any,
            });
        }
        return this.careerJobRepo.findOne({
            where: {
                slug: idOrSlug,
                status: ACTIVE,
                expiry_date: MoreThanOrEqual(today) as any,
                deleted_at: IsNull(),
            } as any,
        });
    }

    /** Public-safe job DTO with description_excerpt + image_url fallback. */
    private async serializeJob(j: CareerJob) {
        const slug = j.slug || `${j.id}`;
        const image_url = j.image_url || DEFAULT_OG_IMAGE;
        const desc_en = j.description_en || '';

        // Look up the questionnaire id (if any) so the FE can decide whether
        // to render the pre-apply form.
        let questionnaire_id: number | null = null;
        const firstQ = await this.questionRepo.findOne({
            where: { career_job_id: j.id, status: ACTIVE, deleted_at: IsNull() } as any,
            select: ['id'],
        });
        if (firstQ) questionnaire_id = firstQ.id;

        return {
            id: j.id,
            slug,
            title_en: j.title_en,
            title_ar: j.title_ar,
            description_en: desc_en,
            description_ar: j.description_ar || '',
            description_excerpt: excerpt(desc_en, 200),
            location_en: j.location_en,
            location_ar: j.location_ar,
            experience_years: j.experience_years,
            expiry_date: j.expiry_date,
            image_url,
            canonical_url: `${PUBLIC_BASE_URL.replace(/\/$/, '')}/careers/${slug}`,
            created_at: j.created_at,
            questionnaire_id,
        };
    }

    private parseAnswers(raw?: string): Array<{ question_id: number; answer: any }> {
        if (!raw) return [];
        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new BadRequestException('answers must be a valid JSON array.');
        }
        if (!Array.isArray(parsed)) {
            throw new BadRequestException('answers must be a JSON array.');
        }
        return parsed.map((a: any) => {
            const qid = parseInt(a.question_id ?? a.questionnaire_id, 10);
            if (Number.isNaN(qid)) throw new BadRequestException('Each answer needs a numeric question_id.');
            return { question_id: qid, answer: a.answer };
        });
    }

    private validateAnswers(questions: RecruitingQuestionnaire[], answers: Array<{ question_id: number; answer: any }>) {
        const byId = new Map(questions.map(q => [q.id, q]));
        const provided = new Map(answers.map(a => [a.question_id, a]));

        // Required-field check
        for (const q of questions) {
            if (q.is_required === 1) {
                const a = provided.get(q.id);
                if (!a || a.answer === null || a.answer === undefined
                    || (typeof a.answer === 'string' && a.answer.trim() === '')
                    || (Array.isArray(a.answer) && a.answer.length === 0)) {
                    throw new BadRequestException(`Question "${q.question_en}" is required.`);
                }
            }
        }

        // Range check for number/rating
        for (const a of answers) {
            const q = byId.get(a.question_id);
            if (!q) continue; // ignore stray answers
            if (q.question_type === 'number' || q.question_type === 'rating') {
                const n = Number(a.answer);
                if (Number.isNaN(n)) {
                    throw new BadRequestException(`Question "${q.question_en}" expects a number.`);
                }
                if (q.min_value !== null && q.min_value !== undefined && n < q.min_value) {
                    throw new BadRequestException(`"${q.question_en}" must be >= ${q.min_value}.`);
                }
                if (q.max_value !== null && q.max_value !== undefined && n > q.max_value) {
                    throw new BadRequestException(`"${q.question_en}" must be <= ${q.max_value}.`);
                }
            }
        }
    }

    private async logView(
        career_job_id: number,
        req: any,
        utm: { utm_source?: string; utm_medium?: string; utm_campaign?: string },
    ) {
        const ip = (req?.headers?.['x-forwarded-for']?.split(',')[0] || req?.ip || '').toString();
        const ip_hash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32) : null;
        await this.viewRepo.insert({
            career_job_id,
            utm_source: utm.utm_source || null,
            utm_medium: utm.utm_medium || null,
            utm_campaign: utm.utm_campaign || null,
            referrer: req?.headers?.['referer'] || null,
            ip_hash,
            user_agent: (req?.headers?.['user-agent'] || '').toString().slice(0, 500),
        } as any);
    }
}
