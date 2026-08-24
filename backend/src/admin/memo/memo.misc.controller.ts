import { Controller, Get, Inject, Query, Request, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin as AdminEntity } from 'src/entities/admin.entity';
import { MemoPortalUser } from 'src/entities/memo.portal.user.entity';
import { MemoDocumentService } from 'src/memo/memo.document.service';
import { MemoDocumentViewService } from 'src/memo/memo.document.view.service';
import { MemoAuditLogService } from 'src/memo/memo.audit.log.service';
import { MemoDocumentStatus } from 'src/entities/enums/memo.enums';

// =====================================================
// USER LOOKUP - admin only - used by access-assign UI
// =====================================================
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/memo/users')
export class AdminMemoUserLookupController {
  constructor(
    @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
  ) { }

  @Get('lookup')
  async lookup(@Query() params: { q?: string; type?: string; page?: number; page_size?: number }) {
    const page = Number(params.page) || 1;
    const page_size = Math.min(50, Number(params.page_size) || 20);

    const qb = this.adminRepo.createQueryBuilder('a')
      .select(['a.id AS id', 'a.first_name AS first_name', 'a.last_name AS last_name', 'a.email AS email', 'a.type AS type', 'a.status AS status'])
      .where('a.deleted_at IS NULL');

    if (params.type) qb.andWhere('a.type = :t', { t: params.type });
    if (params.q && params.q.trim()) {
      qb.andWhere('(a.email LIKE :q OR a.first_name LIKE :q OR a.last_name LIKE :q)', { q: `%${params.q.trim()}%` });
    }

    const total_records = await qb.clone().getCount();
    qb.orderBy('a.first_name', 'ASC').offset((page - 1) * page_size).limit(page_size);
    const data = await qb.getRawMany();
    return { data, total_records };
  }
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/memo/dashboard')
export class AdminMemoDashboardController {
  constructor(
    @Inject(MemoDocumentService) private docService: MemoDocumentService,
    @Inject(MemoDocumentViewService) private viewService: MemoDocumentViewService,
    @Inject(MemoAuditLogService) private auditService: MemoAuditLogService,
    @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
  ) { }

  @Get('stats')
  async stats() {
    const total_documents = await this.docService.repo.count({ where: { deleted_at: null as any } });
    const published_documents = await this.docService.repo.count({ where: { status: MemoDocumentStatus.PUBLISHED, deleted_at: null as any } });
    const draft_documents = await this.docService.repo.count({ where: { status: MemoDocumentStatus.DRAFT, deleted_at: null as any } });
    const archived_documents = await this.docService.repo.count({ where: { status: MemoDocumentStatus.ARCHIVED, deleted_at: null as any } });
    const total_users = await this.adminRepo.count({ where: { deleted_at: null as any } });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);

    const views_today = await this.viewService.repo.createQueryBuilder('v')
      .where('v.viewed_at >= :t', { t: today })
      .getCount();

    const views_yesterday = await this.viewService.repo.createQueryBuilder('v')
      .where('v.viewed_at >= :y AND v.viewed_at < :t', { y: yesterday, t: today })
      .getCount();

    let views_trend_pct: number | null;
    if (views_yesterday === 0) {
      views_trend_pct = views_today > 0 ? 100 : 0;
    } else {
      views_trend_pct = Math.round(((views_today - views_yesterday) / views_yesterday) * 100);
    }
    const sign = views_trend_pct > 0 ? '+' : '';
    const views_trend = `${sign}${views_trend_pct}% vs yesterday`;

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const active_users = await this.viewService.repo.createQueryBuilder('v')
      .select('COUNT(DISTINCT v.user_id)', 'c')
      .where('v.viewed_at >= :s', { s: since })
      .getRawOne<{ c: string }>().then(r => Number(r?.c || 0));

    const recently_published = await this.docService.repo.find({
      where: { status: MemoDocumentStatus.PUBLISHED, deleted_at: null as any },
      order: { published_at: 'DESC' },
      take: 5,
    });

    return {
      total_documents,
      published_documents,
      draft_documents,
      archived_documents,
      total_users,
      views_today,
      views_yesterday,
      views_trend,
      views_trend_pct,
      active_users_30d: active_users,
      recently_published,
    };
  }

  @Get('top-documents')
  async topDocuments(@Query() params: { limit?: number }) {
    const limit = Math.min(50, Number(params.limit) || 10);
    const data = await this.viewService.repo.createQueryBuilder('v')
      .leftJoin('v.document', 'd')
      .select('v.document_id', 'document_id')
      .addSelect('d.title', 'title')
      .addSelect('COUNT(v.id)', 'view_count')
      .where('d.deleted_at IS NULL')
      .groupBy('v.document_id')
      .addGroupBy('d.title')
      .orderBy('view_count', 'DESC')
      .limit(limit)
      .getRawMany();
    return { data };
  }

  @Get('recent-activity')
  async recentActivity(@Query() params: { limit?: number }) {
    const limit = Math.min(100, Number(params.limit) || 20);
    const data = await this.auditService.repo.createQueryBuilder('al')
      .leftJoin('al.actor', 'a')
      .select([
        'al.id AS id',
        'al.action AS action',
        'al.entity_type AS entity_type',
        'al.entity_id AS entity_id',
        'al.metadata_json AS metadata_json',
        'al.created_at AS created_at',
        'al.actor_id AS actor_id',
        'a.email AS actor_email',
        'a.first_name AS actor_first_name',
        'a.last_name AS actor_last_name',
      ])
      .orderBy('al.created_at', 'DESC')
      .limit(limit)
      .getRawMany();
    return { data };
  }
}
