import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { TeachersPageService } from 'src/cms/teachers.page/teachers.page.service';
import { TeachersPageDto } from './teachers.page.dto';

const UPLOAD_PATH = './uploads/admin/teachers_page';

const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(UPLOAD_PATH, { recursive: true }, (err) => {
      if (err) return cb(err, UPLOAD_PATH);
      cb(null, UPLOAD_PATH);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      getCurrentDateFormatted() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml)$/)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Unsupported file type'), false);
  }
};

/**
 * Admin CRUD for the singleton Teachers Rental page CMS.
 *
 *   GET  /api/v1/admin/teachers-page          -> raw row (both _en and _ar fields)
 *   PUT  /api/v1/admin/teachers-page          -> upsert (creates row id=1 if missing)
 *
 * Multipart fields supported on PUT:
 *   - hero_background_image (file)
 *   - og_image              (file)
 *   - all other fields as form values; JSON sections must be sent as
 *     JSON-stringified strings (e.g. stats_en="[{...}]") and will be parsed.
 */
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/teachers-page')
export class TeachersPageAdminController {
  constructor(
    @Inject(TeachersPageService)
    private teachersPageService: TeachersPageService,
  ) {}

  @Get()
  async detail() {
    const row = await this.teachersPageService.getOne({});
    return row || null;
  }

  @Put()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: fileStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upsert(
    @Body() body: TeachersPageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    // Multipart form-data sends every field as a string. Parse JSON sections.
    this.parseJsonFields(body);

    if (files && files.length) {
      const hero = files.find((f) => f.fieldname === 'hero_background_image');
      const og = files.find((f) => f.fieldname === 'og_image');
      if (hero) body.hero_background_image = hero.filename;
      if (og) body.og_image = og.filename;
    }

    const existing = await this.teachersPageService.getOne({});

    if (existing) {
      body.updated_by = req.user.id;
      const result = await this.teachersPageService.update(
        { id: existing.id },
        body,
      );
      return { status: result.status, id: existing.id };
    }

    body.created_by = req.user.id;
    if (body.status === undefined || body.status === null) body.status = 1;
    const result = await this.teachersPageService.insert(body);
    return result;
  }

  /**
   * Convenience POST alias — same as PUT, useful for clients that prefer POST
   * for multipart uploads.
   */
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: fileStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async store(
    @Body() body: TeachersPageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    return this.upsert(body, files, req);
  }

  /**
   * Walk known JSON-section fields and JSON.parse() any that arrived as
   * strings (i.e. multipart form-data submission).
   */
  private parseJsonFields(body: TeachersPageDto) {
    const jsonFields = [
      'hero_en',
      'hero_ar',
      'hero_price_card_en',
      'hero_price_card_ar',
      'stats_en',
      'stats_ar',
      'benefits_en',
      'benefits_ar',
      'eligibility_en',
      'eligibility_ar',
      'referral_en',
      'referral_ar',
      'fleet_section_en',
      'fleet_section_ar',
      'enquiry_form_en',
      'enquiry_form_ar',
    ];

    for (const field of jsonFields) {
      const value = (body as any)[field];
      if (typeof value === 'string' && value.trim().length) {
        try {
          (body as any)[field] = JSON.parse(value);
        } catch {
          throw new BadRequestException(
            `Field "${field}" must be valid JSON.`,
          );
        }
      }
    }

    if (body.status !== undefined && body.status !== null) {
      body.status = Number(body.status);
    }
  }
}
