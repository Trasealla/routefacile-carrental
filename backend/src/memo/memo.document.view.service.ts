import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoDocumentView } from 'src/entities/memo.document.view.entity';
import { MemoDocument } from 'src/entities/memo.document.entity';
import { BaseService } from 'src/service/base.service';

const DEDUPE_WINDOW_MINUTES = 30;

@Injectable()
export class MemoDocumentViewService extends BaseService<MemoDocumentView> {
  constructor(
    @InjectRepository(MemoDocumentView) public readonly repo: Repository<MemoDocumentView>,
    @InjectRepository(MemoDocument) private readonly documentRepo: Repository<MemoDocument>,
  ) {
    super(repo);
  }

  /**
   * Record a view event for (document, user). Skips both the insert and the
   * counter bump if the same user already viewed this document within the
   * dedupe window (default 30 min) to keep counts honest on page refresh.
   *
   * Returns true if a new view was recorded (and counter incremented),
   * false if it was deduped.
   */
  async recordView(opts: {
    document_id: number;
    version_id?: number;
    user_id: number;
    ip_address?: string;
    user_agent?: string;
  }): Promise<boolean> {
    const since = new Date(Date.now() - DEDUPE_WINDOW_MINUTES * 60 * 1000);

    const recent = await this.repo
      .createQueryBuilder('v')
      .where('v.document_id = :d', { d: opts.document_id })
      .andWhere('v.user_id = :u', { u: opts.user_id })
      .andWhere('v.viewed_at >= :s', { s: since })
      .limit(1)
      .getCount();

    if (recent > 0) return false;

    await this.repo.insert({
      document_id: opts.document_id,
      version_id: opts.version_id ?? null,
      user_id: opts.user_id,
      ip_address: opts.ip_address ?? null,
      user_agent: opts.user_agent ?? null,
    } as any);

    await this.documentRepo.increment({ id: opts.document_id }, 'view_count', 1);
    return true;
  }
}
