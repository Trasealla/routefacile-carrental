import { BadRequestException, Controller, Get, Inject, NotFoundException, Param, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { isAbsolute, join } from 'path';
import { PortalJwtAuthGuard } from 'src/auth/guard/portal-jwt-auth.guard';
import { MemoCategoryService } from 'src/memo/memo.category.service';
import { MemoAccessResolverService } from 'src/memo/memo.access.resolver.service';
import { MemoDocumentViewService } from 'src/memo/memo.document.view.service';
import { MemoAuditLogService } from 'src/memo/memo.audit.log.service';
import { MemoAuditActorScope } from 'src/entities/memo.audit.log.entity';

/**
 * Public memo portal APIs (separate website). Authenticated via PortalJwt
 * (email+PIN flow). Visibility is by ALL or USER-by-email entries only.
 * Mounted at /api/v1/memo-portal.
 */
@ApiExcludeController()
@UseGuards(PortalJwtAuthGuard)
@Controller('memo-portal')
export class MemoPortalController {
  constructor(
    @Inject(MemoCategoryService) private categoryService: MemoCategoryService,
    @Inject(MemoAccessResolverService) private resolver: MemoAccessResolverService,
    @Inject(MemoDocumentViewService) private viewService: MemoDocumentViewService,
    @Inject(MemoAuditLogService) private auditService: MemoAuditLogService,
  ) {}

  @Get('categories')
  async categories() {
    return await this.categoryService.getAll(
      { status: 1 },
      ['id', 'name', 'slug'],
      {},
      null,
      false,
      1,
      1000,
      { column: 'entity.name', order: 'ASC' },
    );
  }

  @Get('documents')
  async listing(
    @Query() params: { page?: number; page_size?: number; q?: string; category_id?: number },
    @Request() req,
  ) {
    return await this.resolver.listVisibleDocumentsForPortal(req.user.email, params);
  }

  @Get('documents/:id')
  async detail(@Param('id') id: number, @Request() req) {
    const r = await this.resolver.resolveViewableForPortal(req.user.email, Number(id));
    if (!r) throw new NotFoundException();
    return {
      id: r.document.id,
      title: r.document.title,
      description: r.document.description,
      tags: r.document.tags,
      category_id: r.document.category_id,
      published_at: r.document.published_at,
      view_count: r.document.view_count || 0,
      version: {
        id: r.version.id,
        version_no: r.version.version_no,
        file_name: r.version.file_name,
        mime_type: r.version.mime_type,
        file_size: r.version.file_size,
        uploaded_at: r.version.uploaded_at,
      },
    };
  }

  @Post('documents/:id/view-event')
  async viewEvent(@Param('id') id: number, @Request() req) {
    const r = await this.resolver.resolveViewableForPortal(req.user.email, Number(id));
    if (!r) throw new NotFoundException();

    const counted = await this.viewService.recordView({
      document_id: r.document.id,
      version_id: r.version.id,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: (req.headers['user-agent'] || '').toString().slice(0, 500),
    });
    if (counted) {
      await this.auditService.record(
        req.user.id,
        'document.view',
        'memo_documents',
        r.document.id,
        { version_id: r.version.id, email: req.user.email, source: 'view-event' },
        req.ip,
        MemoAuditActorScope.PORTAL,
      );
    }
    const fresh = await this.resolver.getDocumentRaw(r.document.id);
    return { counted, view_count: fresh?.view_count ?? r.document.view_count ?? 0 };
  }

  @Get('documents/:id/view')
  async view(@Param('id') id: number, @Request() req, @Res() res: Response) {
    const r = await this.resolver.resolveViewableForPortal(req.user.email, Number(id));
    if (!r) throw new NotFoundException();

    const absPath = isAbsolute(r.version.file_path)
      ? r.version.file_path
      : join(process.cwd(), r.version.file_path);
    if (!fs.existsSync(absPath)) {
      throw new BadRequestException('File missing on storage');
    }

    await this.viewService.recordView({
      document_id: r.document.id,
      version_id: r.version.id,
      user_id: req.user.id, // portal-user id
      ip_address: req.ip,
      user_agent: (req.headers['user-agent'] || '').toString().slice(0, 500),
    });
    await this.auditService.record(
      req.user.id,
      'document.view',
      'memo_documents',
      r.document.id,
      { version_id: r.version.id, email: req.user.email },
      req.ip,
      MemoAuditActorScope.PORTAL,
    );

    res.setHeader('Content-Type', r.version.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(r.version.file_name)}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    fs.createReadStream(absPath).pipe(res);
  }
}
