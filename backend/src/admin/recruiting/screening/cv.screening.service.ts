import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { existsSync, promises as fs } from 'fs';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { RecruitingScreeningKeyword } from 'src/entities/recruiting.screening.keyword.entity';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';
import { ApplicationStatusTypes } from 'src/entities/enums/application.status.type';

// Import pdf-parse from its internal lib path to bypass the broken self-test
// that runs in index.js when loaded outside a test harness (tries to open
// ./test/data/05-versions-space.pdf which is not shipped with npm install).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages?: number }> = require('pdf-parse/lib/pdf-parse.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth: { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> } = require('mammoth');

export type ScreeningStatus = 'qualified' | 'not_qualified' | 'no_keywords' | 'no_cv';

export interface ScreeningResult {
    application_id: number;
    score: number;             // 0..100
    status: ScreeningStatus;
    matched_must_have: string[];
    missing_must_have: string[];
    matched_optional: string[];
    matched_exclude: string[];
    cv_text_length: number;
    screened_at: Date;
}

@Injectable()
export class CvScreeningService {
    private readonly logger = new Logger(CvScreeningService.name);

    constructor(
        @InjectRepository(CareerJobApplication) private readonly applicationRepo: Repository<CareerJobApplication>,
        @InjectRepository(RecruitingScreeningKeyword) private readonly keywordRepo: Repository<RecruitingScreeningKeyword>,
        @InjectRepository(CareerJobApplicationAttachment) private readonly attachmentRepo: Repository<CareerJobApplicationAttachment>,
    ) { }

    /**
     * Extract plain text from CV/attachments for an application.
     */
    async extractCvText(application: CareerJobApplication): Promise<string> {
        const buffers: { name: string; buf: Buffer; type: string }[] = [];

        const tryRead = async (filename: string, mimeType?: string) => {
            if (!filename) return;
            const filePath = join(process.cwd(), 'uploads', 'job-applications', String(application.career_job_id), filename);
            if (!existsSync(filePath)) {
                this.logger.warn(`CV file missing on disk: ${filePath}`);
                return;
            }
            try {
                const buf = await fs.readFile(filePath);
                buffers.push({ name: filename, buf, type: this.detectType(filename, mimeType) });
            } catch (err) {
                this.logger.warn(`Could not read ${filePath}: ${(err as any)?.message || err}`);
            }
        };

        await tryRead(application.cv);

        // Also include any extra attachments (covers cases where CV was uploaded as attachment)
        const attachments = await this.attachmentRepo.find({ where: { career_job_application_id: application.id } });
        for (const att of attachments) {
            if (att.file_name && att.file_name !== application.cv) {
                await tryRead(att.file_name, att.file_type);
            }
        }

        let combined = '';
        for (const file of buffers) {
            try {
                if (file.type === 'pdf') {
                    const parsed = await pdfParse(file.buf);
                    combined += '\n' + (parsed.text || '');
                } else if (file.type === 'docx') {
                    const parsed = await mammoth.extractRawText({ buffer: file.buf });
                    combined += '\n' + (parsed.value || '');
                } else if (file.type === 'txt') {
                    combined += '\n' + file.buf.toString('utf-8');
                } else {
                    // Unsupported type (.doc, images) — skip; user can rescreen after re-upload
                    this.logger.debug(`Skipping unsupported CV file type: ${file.name}`);
                }
            } catch (err) {
                this.logger.warn(`Failed to parse ${file.name}: ${(err as any)?.message || err}`);
            }
        }

        return combined.toLowerCase();
    }

    /**
     * Score an application's CV against the keyword set defined for its job.
     */
    async screen(applicationId: number): Promise<ScreeningResult> {
        const application = await this.applicationRepo.findOne({ where: { id: applicationId } });
        if (!application) {
            throw new NotFoundException(`Application ${applicationId} not found`);
        }

        const keywords = await this.keywordRepo.find({
            where: { career_job_id: application.career_job_id, status: 1 },
        });

        const now = new Date();

        if (!keywords.length) {
            const result: ScreeningResult = {
                application_id: application.id,
                score: 0,
                status: 'no_keywords',
                matched_must_have: [],
                missing_must_have: [],
                matched_optional: [],
                matched_exclude: [],
                cv_text_length: 0,
                screened_at: now,
            };
            await this.persist(application.id, result);
            return result;
        }

        const cvText = await this.extractCvText(application);
        if (!cvText || cvText.trim().length < 30) {
            const result: ScreeningResult = {
                application_id: application.id,
                score: 0,
                status: 'no_cv',
                matched_must_have: [],
                missing_must_have: keywords.filter(k => k.keyword_type === 'must_have').map(k => k.keyword),
                matched_optional: [],
                matched_exclude: [],
                cv_text_length: cvText?.length || 0,
                screened_at: now,
            };
            await this.persist(application.id, result);
            return result;
        }

        const matchedMustHave: string[] = [];
        const missingMustHave: string[] = [];
        const matchedOptional: string[] = [];
        const matchedExclude: string[] = [];

        let positiveScore = 0;
        let positiveMax = 0;
        let excludePenalty = 0;

        for (const k of keywords) {
            const found = this.containsKeyword(cvText, k.keyword);
            const weight = Number(k.weight) || 1;

            if (k.keyword_type === 'must_have') {
                positiveMax += weight * 2; // must-haves count double in the denominator
                if (found) {
                    positiveScore += weight * 2;
                    matchedMustHave.push(k.keyword);
                } else {
                    missingMustHave.push(k.keyword);
                }
            } else if (k.keyword_type === 'optional') {
                positiveMax += weight;
                if (found) {
                    positiveScore += weight;
                    matchedOptional.push(k.keyword);
                }
            } else if (k.keyword_type === 'exclude') {
                if (found) {
                    excludePenalty += weight * 5;
                    matchedExclude.push(k.keyword);
                }
            }
        }

        const denominator = positiveMax || 1;
        let raw = ((positiveScore - excludePenalty) / denominator) * 100;
        if (raw < 0) raw = 0;
        if (raw > 100) raw = 100;
        const score = Math.round(raw * 100) / 100;

        // Classification rules:
        //  - Any exclude keyword found -> not_qualified
        //  - All must-haves matched AND score >= 60 -> qualified
        //  - Otherwise -> not_qualified
        let status: ScreeningResult['status'] = 'not_qualified';
        if (matchedExclude.length === 0 && missingMustHave.length === 0 && score >= 60) {
            status = 'qualified';
        }

        const result: ScreeningResult = {
            application_id: application.id,
            score,
            status,
            matched_must_have: matchedMustHave,
            missing_must_have: missingMustHave,
            matched_optional: matchedOptional,
            matched_exclude: matchedExclude,
            cv_text_length: cvText.length,
            screened_at: now,
        };

        await this.persist(application.id, result);

        // Auto-bucket: if AI says qualified and the application is still in the
        // initial PENDING state (i.e. recruiter hasn't touched it yet), advance
        // it to REVIEWING so it shows up in the active pipeline. We deliberately
        // do NOT change anything if the recruiter has already moved it.
        if (status === 'qualified' && Number(application.status) === ApplicationStatusTypes.PENDING) {
            try {
                await this.applicationRepo.update(
                    { id: application.id },
                    { status: ApplicationStatusTypes.REVIEWING },
                );
            } catch (err) {
                this.logger.warn(`Auto-bucket failed for application ${application.id}: ${(err as any)?.message || err}`);
            }
        }

        return result;
    }

    /**
     * Return the persisted screening result for an application, parsed back
     * into a structured object. Useful for the admin UI details panel.
     */
    async getDetails(applicationId: number): Promise<ScreeningResult | null> {
        const application = await this.applicationRepo.findOne({ where: { id: applicationId } });
        if (!application) {
            throw new NotFoundException(`Application ${applicationId} not found`);
        }
        if (!application.ai_screened_at) return null;

        let summary: any = {};
        try {
            summary = application.ai_match_summary ? JSON.parse(application.ai_match_summary) : {};
        } catch {
            summary = {};
        }

        return {
            application_id: application.id,
            score: Number(application.ai_score) || 0,
            status: (application.ai_status as ScreeningStatus) || 'no_cv',
            matched_must_have: summary.matched_must_have || [],
            missing_must_have: summary.missing_must_have || [],
            matched_optional: summary.matched_optional || [],
            matched_exclude: summary.matched_exclude || [],
            cv_text_length: summary.cv_text_length || 0,
            screened_at: application.ai_screened_at,
        };
    }

    /**
     * Re-screen every application for a given job. Runs sequentially to keep
     * memory bounded when CVs are large PDFs.
     */
    async screenJob(jobId: number): Promise<{ job_id: number; total: number; processed: number; failed: number; results: ScreeningResult[] }> {
        const applications = await this.applicationRepo.find({ where: { career_job_id: jobId } });
        const results: ScreeningResult[] = [];
        let failed = 0;
        for (const app of applications) {
            try {
                const r = await this.screen(app.id);
                results.push(r);
            } catch (err) {
                failed++;
                this.logger.warn(`screenJob failed for application ${app.id}: ${(err as any)?.message || err}`);
            }
        }
        return {
            job_id: jobId,
            total: applications.length,
            processed: results.length,
            failed,
            results,
        };
    }

    private async persist(applicationId: number, result: ScreeningResult) {
        try {
            await this.applicationRepo.update(
                { id: applicationId },
                {
                    ai_score: result.score,
                    ai_status: result.status,
                    ai_match_summary: JSON.stringify({
                        matched_must_have: result.matched_must_have,
                        missing_must_have: result.missing_must_have,
                        matched_optional: result.matched_optional,
                        matched_exclude: result.matched_exclude,
                        cv_text_length: result.cv_text_length,
                    }),
                    ai_screened_at: new Date(),
                },
            );
        } catch (err) {
            this.logger.error(`Failed to persist screening result for application ${applicationId}: ${(err as any)?.message || err}`);
        }
    }

    private containsKeyword(haystack: string, keyword: string): boolean {
        if (!keyword) return false;
        const needle = keyword.trim().toLowerCase();
        if (!needle) return false;
        // Word-boundary match for single words; substring for multi-word phrases
        if (/^[a-z0-9+#.\-]+$/i.test(needle)) {
            const re = new RegExp(`(^|[^a-z0-9])${this.escapeRegex(needle)}([^a-z0-9]|$)`, 'i');
            return re.test(haystack);
        }
        return haystack.includes(needle);
    }

    private escapeRegex(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private detectType(filename: string, mimeType?: string): string {
        const lower = (filename || '').toLowerCase();
        if (lower.endsWith('.pdf') || mimeType === 'application/pdf') return 'pdf';
        if (lower.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
        if (lower.endsWith('.txt') || mimeType === 'text/plain') return 'txt';
        return 'unknown';
    }
}
