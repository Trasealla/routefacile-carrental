import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { MemoDocument } from 'src/entities/memo.document.entity';
import { MemoDocumentAccess } from 'src/entities/memo.document.access.entity';
import { MemoDocumentVersion } from 'src/entities/memo.document.version.entity';
import { MemoDocumentStatus, MemoAccessTargetType } from 'src/entities/enums/memo.enums';

export interface MemoListQuery {
  page?: number;
  page_size?: number;
  q?: string;
  category_id?: number;
}

@Injectable()
export class MemoAccessResolverService {
  constructor(
    @InjectRepository(MemoDocument) private documentRepo: Repository<MemoDocument>,
    @InjectRepository(MemoDocumentAccess) private accessRepo: Repository<MemoDocumentAccess>,
    @InjectRepository(MemoDocumentVersion) private versionRepo: Repository<MemoDocumentVersion>,
  ) { }

  /**
   * Returns IDs of all documents the given user (admins.id, admins.type) can view.
   * Honors ALL | USER_TYPE | USER access entries.
   */
  async getAccessibleDocumentIds(user_id: number, user_type: string): Promise<number[] | null> {
    // Memo admins can see everything
    if (user_type === 'admin') {
      return null; // null = no restriction
    }

    const rows = await this.accessRepo
      .createQueryBuilder('a')
      .select('DISTINCT a.document_id', 'document_id')
      .where('(a.target_type = :all)', { all: MemoAccessTargetType.ALL })
      .orWhere('(a.target_type = :type AND a.target_value = :tval)', {
        type: MemoAccessTargetType.USER_TYPE,
        tval: user_type,
      })
      .orWhere('(a.target_type = :user AND a.target_value = :uid)', {
        user: MemoAccessTargetType.USER,
        uid: String(user_id),
      })
      .getRawMany<{ document_id: number }>();

    return rows.map(r => Number(r.document_id));
  }

  /**
   * List published, non-deleted memos visible to the user, with pagination + search.
   */
  async listVisibleDocuments(user_id: number, user_type: string, params: MemoListQuery) {
    const page = Math.max(1, Number(params.page) || 1);
    const page_size = Math.min(100, Math.max(1, Number(params.page_size) || 10));

    const accessible = await this.getAccessibleDocumentIds(user_id, user_type);
    if (accessible !== null && accessible.length === 0) {
      return { data: [], total_records: 0 };
    }

    const qb = this.documentRepo
      .createQueryBuilder('d')
      .leftJoin('d.category', 'c')
      .leftJoin(MemoDocumentVersion, 'v', 'v.id = d.current_version_id')
      .select([
        'd.id AS id',
        'd.title AS title',
        'd.description AS description',
        'd.tags AS tags',
        'd.status AS status',
        'd.published_at AS published_at',
        'd.view_count AS view_count',
        'd.category_id AS category_id',
        'c.name AS category_name',
        'v.id AS version_id',
        'v.version_no AS version_no',
        'v.uploaded_at AS version_uploaded_at',
      ])
      .where('d.deleted_at IS NULL')
      .andWhere('d.status = :status', { status: MemoDocumentStatus.PUBLISHED });

    if (accessible !== null) {
      qb.andWhere('d.id IN (:...ids)', { ids: accessible });
    }

    if (params.category_id) {
      qb.andWhere('d.category_id = :cid', { cid: params.category_id });
    }

    if (params.q && params.q.trim()) {
      qb.andWhere('(d.title LIKE :q OR d.description LIKE :q OR d.tags LIKE :q)', {
        q: `%${params.q.trim()}%`,
      });
    }

    const total_records = await qb.clone().select('COUNT(DISTINCT d.id)', 'count').getRawOne<{ count: string }>().then(r => Number(r?.count || 0));

    qb.orderBy('d.published_at', 'DESC').addOrderBy('d.id', 'DESC').offset((page - 1) * page_size).limit(page_size);

    const data = await qb.getRawMany();
    return { data, total_records };
  }

  /**
   * Verify that the given user can view the given document.
   * Returns the document + current version, or null if not accessible.
   */
  async resolveViewable(user_id: number, user_type: string, document_id: number) {
    const doc = await this.documentRepo.findOne({ where: { id: document_id, deleted_at: IsNull() as any } });
    if (!doc) return null;

    if (user_type !== 'admin') {
      if (doc.status !== MemoDocumentStatus.PUBLISHED) return null;
      const accessible = await this.getAccessibleDocumentIds(user_id, user_type);
      if (accessible !== null && !accessible.includes(document_id)) return null;
    }

    if (!doc.current_version_id) return null;
    const version = await this.versionRepo.findOne({ where: { id: doc.current_version_id } });
    if (!version) return null;

    return { document: doc, version };
  }

  // ---------------------------------------------------------------------------
  // Portal-user (email-based) access
  // ---------------------------------------------------------------------------

  /**
   * Returns IDs of all documents visible to a portal user identified by email.
   * Portal users only see entries with target_type=ALL or target_type=USER
   * where target_value matches their email (case-insensitive).
   */
  async getAccessibleDocumentIdsForPortal(email: string): Promise<number[]> {
    const lower = (email || '').toLowerCase();
    const rows = await this.accessRepo
      .createQueryBuilder('a')
      .select('DISTINCT a.document_id', 'document_id')
      .where('a.target_type = :all', { all: MemoAccessTargetType.ALL })
      .orWhere('(a.target_type = :user AND LOWER(a.target_value) = :email)', {
        user: MemoAccessTargetType.USER,
        email: lower,
      })
      .getRawMany<{ document_id: number }>();
    return rows.map((r) => Number(r.document_id));
  }

  async listVisibleDocumentsForPortal(email: string, params: MemoListQuery) {
    const page = Math.max(1, Number(params.page) || 1);
    const page_size = Math.min(100, Math.max(1, Number(params.page_size) || 10));

    // Portal access: any authenticated portal user (already domain-restricted
    // at login time) can see every published, non-deleted memo. Per-document
    // access entries are ignored for portal users by design.
    const qb = this.documentRepo
      .createQueryBuilder('d')
      .leftJoin('d.category', 'c')
      .leftJoin(MemoDocumentVersion, 'v', 'v.id = d.current_version_id')
      .select([
        'd.id AS id',
        'd.title AS title',
        'd.description AS description',
        'd.tags AS tags',
        'd.status AS status',
        'd.published_at AS published_at',
        'd.view_count AS view_count',
        'd.category_id AS category_id',
        'c.name AS category_name',
        'v.id AS version_id',
        'v.version_no AS version_no',
        'v.uploaded_at AS version_uploaded_at',
      ])
      .where('d.deleted_at IS NULL')
      .andWhere('d.status = :status', { status: MemoDocumentStatus.PUBLISHED });

    if (params.category_id) {
      qb.andWhere('d.category_id = :cid', { cid: params.category_id });
    }
    if (params.q && params.q.trim()) {
      qb.andWhere('(d.title LIKE :q OR d.description LIKE :q OR d.tags LIKE :q)', {
        q: `%${params.q.trim()}%`,
      });
    }

    const total_records = await qb
      .clone()
      .select('COUNT(DISTINCT d.id)', 'count')
      .getRawOne<{ count: string }>()
      .then((r) => Number(r?.count || 0));

    qb.orderBy('d.published_at', 'DESC')
      .addOrderBy('d.id', 'DESC')
      .offset((page - 1) * page_size)
      .limit(page_size);

    const data = await qb.getRawMany();
    return { data, total_records };
  }

  async resolveViewableForPortal(email: string, document_id: number) {
    // Portal access: any authenticated portal user can view any published,
    // non-deleted memo. Per-document access entries are ignored.
    const doc = await this.documentRepo.findOne({ where: { id: document_id, deleted_at: IsNull() as any } });
    if (!doc) return null;
    if (doc.status !== MemoDocumentStatus.PUBLISHED) return null;

    if (!doc.current_version_id) return null;
    const version = await this.versionRepo.findOne({ where: { id: doc.current_version_id } });
    if (!version) return null;

    return { document: doc, version };
  }

  /**
   * Fetch a fresh document row (used to return up-to-date view_count after
   * a recordView call without re-running access checks).
   */
  async getDocumentRaw(document_id: number) {
    return await this.documentRepo.findOne({ where: { id: document_id } });
  }
}
