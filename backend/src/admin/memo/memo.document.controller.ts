import {
  BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException,
  Param, Patch, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join, posix } from 'path';
import * as fs from 'fs';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { MemoDocumentService } from 'src/memo/memo.document.service';
import { MemoDocumentVersionService } from 'src/memo/memo.document.version.service';
import { MemoDocumentAccessService } from 'src/memo/memo.document.access.service';
import { MemoDocumentViewService } from 'src/memo/memo.document.view.service';
import { MemoAuditLogService } from 'src/memo/memo.audit.log.service';
import {
  MemoAccessAssignDto, MemoDocumentCreateDto, MemoDocumentListQueryDto,
  MemoDocumentUpdateDto, MemoVersionUploadDto,
} from 'src/memo/memo.dto';
import { MemoDocumentStatus, MemoAccessTargetType } from 'src/entities/enums/memo.enums';

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/octet-stream',
];

const MEMO_UPLOAD_BASE = join(process.cwd(), 'uploads', 'memos');
try { fs.mkdirSync(MEMO_UPLOAD_BASE, { recursive: true }); } catch { /* noop */ }

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/memo/documents')
export class AdminMemoDocumentController {
  constructor(
    @Inject(MemoDocumentService) private docService: MemoDocumentService,
    @Inject(MemoDocumentVersionService) private versionService: MemoDocumentVersionService,
    @Inject(MemoDocumentAccessService) private accessService: MemoDocumentAccessService,
    @Inject(MemoDocumentViewService) private viewService: MemoDocumentViewService,
    @Inject(MemoAuditLogService) private auditService: MemoAuditLogService,
  ) { }

  // ---------- LIST ----------
  @Get()
  async listing(@Query() params: MemoDocumentListQueryDto) {
    const where: Record<string, any> = {};
    if (params.category_id) where.category_id = params.category_id;
    if (params.status) where.status = params.status;
    if (params.uploaded_by) where.created_by = params.uploaded_by;

    const qb = this.docService.repo.createQueryBuilder('d')
      .leftJoinAndSelect('d.category', 'c')
      .where('d.deleted_at IS NULL');

    Object.keys(where).forEach((k, i) => {
      qb.andWhere(`d.${k} = :v${i}`, { [`v${i}`]: where[k] });
    });

    if (params.q && params.q.trim()) {
      qb.andWhere('(d.title LIKE :q OR d.description LIKE :q OR d.tags LIKE :q)', { q: `%${params.q.trim()}%` });
    }

    if (params.date_from && params.date_to) {
      qb.andWhere('d.created_at BETWEEN :df AND :dt', { df: params.date_from, dt: params.date_to });
    }

    const total_records = await qb.clone().getCount();

    qb.orderBy('d.created_at', 'DESC')
      .skip(((params.page || 1) - 1) * (params.page_size || 10))
      .take(params.page_size || 10);

    const data = await qb.getMany();
    return { data, total_records };
  }

  // ---------- CREATE ----------
  @Post()
  async create(@Body() body: MemoDocumentCreateDto, @Request() req) {
    body.created_by = req.user.id;
    const result = await this.docService.insert({ ...body, status: MemoDocumentStatus.DRAFT });
    const id = result?.status === 'success'
      ? result.response?.identifiers?.[0]?.id
      : undefined;
    if (id) {
      await this.auditService.record(req.user.id, 'document.create', 'memo_documents', id, { title: body.title }, req.ip);
    }
    // Surface `id` at the top level so admin wizards / clients can read it
    // directly without digging into `response.identifiers[0].id`.
    return { ...result, id, data: { id } };
  }

  // ---------- DETAIL ----------
  @Get(':id')
  async detail(@Param('id') id: number) {
    const doc = await this.docService.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.category', 'c')
      .where('d.id = :id', { id })
      .andWhere('d.deleted_at IS NULL')
      .getOne();
    if (!doc) throw new NotFoundException();
    const versions = await this.versionService.repo.find({
      where: { document_id: id } as any,
      order: { version_no: 'DESC' },
    });
    return { ...doc, versions };
  }

  // ---------- UPDATE METADATA ----------
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: MemoDocumentUpdateDto, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    body.updated_by = req.user.id;
    const result = await this.docService.update({ id }, body);
    await this.auditService.record(req.user.id, 'document.update', 'memo_documents', id, body, req.ip);
    return result;
  }

  // ---------- PUBLISH ----------
  @Patch(':id/publish')
  async publish(@Param('id') id: number, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    if (!doc.current_version_id) throw new BadRequestException('Cannot publish: no version uploaded yet');
    const result = await this.docService.update({ id }, {
      status: MemoDocumentStatus.PUBLISHED,
      published_at: new Date(),
      updated_by: req.user.id,
    } as any);
    await this.auditService.record(req.user.id, 'document.publish', 'memo_documents', id, null, req.ip);
    return result;
  }

  // ---------- ARCHIVE ----------
  @Patch(':id/archive')
  async archive(@Param('id') id: number, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    const result = await this.docService.update({ id }, {
      status: MemoDocumentStatus.ARCHIVED,
      updated_by: req.user.id,
    } as any);
    await this.auditService.record(req.user.id, 'document.archive', 'memo_documents', id, null, req.ip);
    return result;
  }

  // ---------- SOFT DELETE ----------
  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    await this.docService.update({ id }, { deleted_by: req.user.id });
    const result = await this.docService.softDelete({ id });
    await this.auditService.record(req.user.id, 'document.delete', 'memo_documents', id, null, req.ip);
    return result;
  }

  // ---------- VIEW EVENT ----------
  // Lightweight counter bump for the admin detail page. Same dedupe rules
  // as the end-user / portal route (per-(user, document) within 30 min).
  @Post(':id/view-event')
  async viewEvent(@Param('id') id: number, @Request() req) {
    const doc = await this.docService.repo.findOne({ where: { id } as any });
    if (!doc || doc.deleted_at) throw new NotFoundException();
    const counted = await this.viewService.recordView({
      document_id: doc.id,
      version_id: doc.current_version_id ?? null,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: (req.headers['user-agent'] || '').toString().slice(0, 500),
    });
    if (counted) {
      await this.auditService.record(req.user.id, 'document.view', 'memo_documents', doc.id, { source: 'admin-view-event' }, req.ip);
    }
    const fresh = await this.docService.repo.findOne({ where: { id } as any });
    return { counted, view_count: fresh?.view_count ?? doc.view_count ?? 0 };
  }

  // ---------- UPLOAD NEW VERSION ----------
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, _file, cb) => {
        const dir = join(MEMO_UPLOAD_BASE, String(req.params.id));
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err) return cb(err, dir);
          cb(null, dir);
        });
      },
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `v-${unique}${extname(file.originalname) || ''}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype || ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
      else cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    },
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  }))
  async uploadVersion(
    @Param('id') id: number,
    @Body() body: MemoVersionUploadDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('File missing - make sure the form-data field name is "file" and a real file is attached');
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();

    // Store path relative to project root with POSIX separators so it works
    // identically on Windows dev and Linux production / docker.
    const relativePath = posix.join('uploads', 'memos', String(id), file.filename);

    const last = await this.versionService.repo
      .createQueryBuilder('v')
      .select('MAX(v.version_no)', 'max')
      .where('v.document_id = :id', { id })
      .getRawOne<{ max: number }>();
    const nextNo = Number(last?.max || 0) + 1;

    // Reset previous current
    await this.versionService.repo.update({ document_id: id, is_current: 1 } as any, { is_current: 0 });

    const insert = await this.versionService.insert({
      document_id: id,
      version_no: nextNo,
      file_name: file.originalname,
      file_path: relativePath,
      file_size: file.size,
      mime_type: file.mimetype,
      change_notes: body?.change_notes || null,
      is_current: 1,
      uploaded_by: req.user.id,
    });

    if (insert?.status === 'success') {
      const versionId = insert.response?.identifiers?.[0]?.id;
      await this.docService.update({ id }, { current_version_id: versionId, updated_by: req.user.id } as any);
      await this.auditService.record(req.user.id, 'version.upload', 'memo_documents', id, { version_no: nextNo, file: file.originalname }, req.ip);
    }
    return insert;
  }

  // ---------- LIST VERSIONS ----------
  @Get(':id/versions')
  async versions(@Param('id') id: number) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    const data = await this.versionService.repo.find({
      where: { document_id: id } as any,
      order: { version_no: 'DESC' },
    });
    return { data, total_records: data.length };
  }

  // ---------- SET CURRENT VERSION (rollback) ----------
  @Patch(':id/versions/:vid/set-current')
  async setCurrent(@Param('id') id: number, @Param('vid') vid: number, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    const v = await this.versionService.getOne({ id: vid });
    if (!v || v.document_id !== Number(id)) throw new NotFoundException();

    await this.versionService.repo.update({ document_id: id } as any, { is_current: 0 });
    await this.versionService.repo.update({ id: vid }, { is_current: 1 });
    await this.docService.update({ id }, { current_version_id: vid, updated_by: req.user.id } as any);
    await this.auditService.record(req.user.id, 'version.set-current', 'memo_documents', Number(id), { version_id: Number(vid) }, req.ip);
    return { status: 'success' };
  }

  // ---------- ACCESS: ASSIGN ----------
  @Post(':id/access')
  async assignAccess(@Param('id') id: number, @Body() body: MemoAccessAssignDto, @Request() req) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    if (!body?.entries?.length) throw new BadRequestException('entries[] required');

    const inserted: any[] = [];
    for (const e of body.entries) {
      if (e.target_type !== MemoAccessTargetType.ALL && !e.target_value) {
        throw new BadRequestException(`target_value required for target_type=${e.target_type}`);
      }
      // de-dup
      const existing = await this.accessService.repo.findOne({
        where: {
          document_id: Number(id),
          target_type: e.target_type,
          target_value: e.target_type === MemoAccessTargetType.ALL ? null : e.target_value,
        } as any,
      });
      if (existing) {
        inserted.push(existing);
        continue;
      }
      const r = await this.accessService.insert({
        document_id: id,
        target_type: e.target_type,
        target_value: e.target_type === MemoAccessTargetType.ALL ? null : e.target_value,
        granted_by: req.user.id,
      });
      inserted.push(r);
    }
    await this.auditService.record(req.user.id, 'access.assign', 'memo_documents', Number(id), { entries: body.entries }, req.ip);
    return { status: 'success', data: inserted };
  }

  // ---------- ACCESS: LIST ----------
  @Get(':id/access')
  async listAccess(@Param('id') id: number) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    const data = await this.accessService.repo.find({ where: { document_id: id } as any, order: { id: 'ASC' } });
    return { data, total_records: data.length };
  }

  // ---------- ACCESS: REVOKE ----------
  @Delete(':id/access/:accessId')
  async revokeAccess(@Param('id') id: number, @Param('accessId') accessId: number, @Request() req) {
    const row = await this.accessService.getOne({ id: accessId });
    if (!row || row.document_id !== Number(id)) throw new NotFoundException();
    const r = await this.accessService.hardDelete({ id: accessId });
    await this.auditService.record(req.user.id, 'access.revoke', 'memo_documents', Number(id), { access_id: Number(accessId) }, req.ip);
    return r;
  }

  // ---------- VIEW AUDIT LOG (who viewed this memo) ----------
  @Get(':id/views')
  async views(@Param('id') id: number, @Query() params: { page?: number; page_size?: number }) {
    const doc = await this.docService.getOne({ id });
    if (!doc) throw new NotFoundException();
    const page = Number(params.page) || 1;
    const page_size = Number(params.page_size) || 20;

    const qb = this.viewService.repo.createQueryBuilder('vw')
      .leftJoin('vw.user', 'u')
      .select([
        'vw.id AS id',
        'vw.document_id AS document_id',
        'vw.version_id AS version_id',
        'vw.user_id AS user_id',
        'u.email AS user_email',
        'u.first_name AS first_name',
        'u.last_name AS last_name',
        'u.type AS user_type',
        'vw.ip_address AS ip_address',
        'vw.user_agent AS user_agent',
        'vw.viewed_at AS viewed_at',
      ])
      .where('vw.document_id = :id', { id })
      .orderBy('vw.viewed_at', 'DESC');

    const total_records = await qb.clone().getCount();
    qb.offset((page - 1) * page_size).limit(page_size);
    const data = await qb.getRawMany();
    return { data, total_records };
  }
}
