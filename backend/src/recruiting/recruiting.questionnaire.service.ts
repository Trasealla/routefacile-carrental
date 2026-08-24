import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { RecruitingQuestionnaire } from 'src/entities/recruiting.questionnaire.entity';
import { BaseService } from 'src/service/base.service';

export interface BulkQuestionInput {
    question_en: string;
    question_ar?: string;
    question_type?: string;
    options?: { value: string; label_en: string; label_ar?: string }[];
    help_text_en?: string;
    help_text_ar?: string;
    placeholder_en?: string;
    placeholder_ar?: string;
    min_value?: number;
    max_value?: number;
    category?: string;
    is_required?: number;
    display_order?: number;
    status?: number;
}

@Injectable()
export class RecruitingQuestionnaireService extends BaseService<RecruitingQuestionnaire> {
    constructor(
        @InjectRepository(RecruitingQuestionnaire) private questionnaireRepository: Repository<RecruitingQuestionnaire>,
    ) {
        super(questionnaireRepository);
    }

    /** All active questions for a job, ordered by display_order. */
    async listByJob(career_job_id: number) {
        return this.questionnaireRepository.find({
            where: { career_job_id, deleted_at: IsNull() } as any,
            order: { display_order: 'ASC', id: 'ASC' },
        });
    }

    /**
     * Bulk insert. Optionally soft-delete existing rows for the same job first
     * (replace_existing). Auto-assigns display_order when not supplied.
     */
    async bulkCreate(
        career_job_id: number,
        questions: BulkQuestionInput[],
        admin_id: number,
        replace_existing = false,
    ) {
        if (!questions || questions.length === 0) {
            throw new BadRequestException('At least one question is required.');
        }

        return this.questionnaireRepository.manager.transaction(async (trx) => {
            const repo = trx.getRepository(RecruitingQuestionnaire);

            if (replace_existing) {
                await repo.update(
                    { career_job_id } as any,
                    { deleted_by: admin_id } as any,
                );
                await repo
                    .createQueryBuilder()
                    .softDelete()
                    .where('career_job_id = :career_job_id AND deleted_at IS NULL', { career_job_id })
                    .execute();
            }

            // Determine starting display_order if any question omits it.
            let nextOrder = 1;
            const last = await repo
                .createQueryBuilder('q')
                .where('q.career_job_id = :career_job_id AND q.deleted_at IS NULL', { career_job_id })
                .orderBy('q.display_order', 'DESC')
                .getOne();
            if (last) {
                nextOrder = (last.display_order || 0) + 1;
            }

            const rows: RecruitingQuestionnaire[] = questions.map((q, idx) => {
                const serialised_options = q.options ? JSON.stringify(q.options) : null;
                return repo.create({
                    career_job_id,
                    question_en: q.question_en,
                    question_ar: q.question_ar ?? null,
                    question_type: q.question_type || 'text',
                    options: serialised_options,
                    help_text_en: q.help_text_en ?? null,
                    help_text_ar: q.help_text_ar ?? null,
                    placeholder_en: q.placeholder_en ?? null,
                    placeholder_ar: q.placeholder_ar ?? null,
                    min_value: q.min_value ?? null,
                    max_value: q.max_value ?? null,
                    category: q.category ?? null,
                    is_required: q.is_required ?? 1,
                    display_order: q.display_order ?? nextOrder + idx,
                    status: q.status ?? 1,
                    created_by: admin_id,
                } as any) as unknown as RecruitingQuestionnaire;
            });

            const saved = await repo.save(rows);
            return { status: 'success', count: saved.length, questions: saved };
        });
    }

    /** Update display_order for a list of questions (transactional). */
    async reorder(items: { id: number; display_order: number }[], admin_id: number) {
        if (!items || items.length === 0) {
            throw new BadRequestException('No items to reorder.');
        }
        return this.questionnaireRepository.manager.transaction(async (trx) => {
            const repo = trx.getRepository(RecruitingQuestionnaire);
            const ids = items.map((i) => i.id);
            const existing = await repo.find({ where: { id: In(ids) } as any });
            const found = new Set(existing.map((e) => e.id));
            for (const i of items) {
                if (!found.has(i.id)) {
                    throw new BadRequestException(`Question ${i.id} not found.`);
                }
            }
            for (const i of items) {
                await repo.update({ id: i.id } as any, {
                    display_order: i.display_order,
                    updated_by: admin_id,
                } as any);
            }
            return { status: 'success', updated: items.length };
        });
    }

    /**
     * Copy all active questions from one job to another. Re-numbers display_order
     * to start after the highest existing order on the target (unless replace_existing).
     */
    async duplicate(
        source_career_job_id: number,
        target_career_job_id: number,
        admin_id: number,
        replace_existing = false,
    ) {
        if (source_career_job_id === target_career_job_id) {
            throw new BadRequestException('Source and target jobs must be different.');
        }

        const source = await this.questionnaireRepository.find({
            where: { career_job_id: source_career_job_id, deleted_at: IsNull() } as any,
            order: { display_order: 'ASC', id: 'ASC' },
        });

        if (source.length === 0) {
            throw new BadRequestException('Source job has no questions to duplicate.');
        }

        const payload: BulkQuestionInput[] = source.map((q) => ({
            question_en: q.question_en,
            question_ar: q.question_ar ?? undefined,
            question_type: q.question_type,
            options: q.options ? safeParseOptions(q.options) : undefined,
            help_text_en: q.help_text_en ?? undefined,
            help_text_ar: q.help_text_ar ?? undefined,
            placeholder_en: q.placeholder_en ?? undefined,
            placeholder_ar: q.placeholder_ar ?? undefined,
            min_value: q.min_value ?? undefined,
            max_value: q.max_value ?? undefined,
            category: q.category ?? undefined,
            is_required: q.is_required,
            status: q.status,
        }));

        return this.bulkCreate(target_career_job_id, payload, admin_id, replace_existing);
    }
}

function safeParseOptions(raw: string): { value: string; label_en: string; label_ar?: string }[] | undefined {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}
