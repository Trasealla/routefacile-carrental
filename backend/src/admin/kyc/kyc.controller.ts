import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Response } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { AdminTypes } from 'src/entities/enums/admin.type';
import { KycSubmission } from 'src/entities/kyc.submission.entity';
import { KycSubmissionAttachment } from 'src/entities/kyc.submission.attachment.entity';
import { KycSubmissionStatus } from 'src/entities/enums/kyc.submission.status';
import { SmsService } from 'src/mail/sms.service';

import { AdminKycExportQueryDto, AdminKycListQueryDto, UpdateKycStatusDto } from './kyc.dto';

// pdfkit ships its own type definitions via @types/pdfkit; require keeps the
// CommonJS interop simple regardless of moduleResolution.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

const KYC_UPLOAD_ROOT = resolve('./uploads/kyc');

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminTypes.ADMIN, AdminTypes.KYC_OFFICER)
@Controller('admin/kyc/submissions')
export class AdminKycController {
    private readonly logger = new Logger(AdminKycController.name);

    constructor(
        @InjectRepository(KycSubmission) private readonly kycRepository: Repository<KycSubmission>,
        @InjectRepository(KycSubmissionAttachment) private readonly attachmentRepository: Repository<KycSubmissionAttachment>,
        private readonly smsService: SmsService,
    ) {}

    /** GET /api/v1/admin/kyc/submissions */
    @Get()
    async list(@Query() query: AdminKycListQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const qb = this.buildFilteredQuery(query);

        const [items, total] = await qb
            .orderBy('s.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            success: true,
            data: {
                submissions: items.map((s) => ({
                    id: s.id,
                    reference_token: s.reference_token,
                    email: s.email,
                    contact_mobile: `${s.contact_mobile_code}${s.contact_mobile_number}`,
                    company_name: s.company_name,
                    status: s.status,
                    phone_verified: !!s.phone_verified,
                    email_verified: !!s.email_verified,
                    submitted_at: s.submitted_at,
                    created_at: s.created_at,
                    reviewed_at: s.reviewed_at,
                })),
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit,
                },
            },
        };
    }

    /**
     * GET /api/v1/admin/kyc/submissions/export
     * Streams a CSV with all rows matching the filters.
     */
    @Get('export')
    async export(@Query() query: AdminKycExportQueryDto, @Res() res: Response) {
        const qb = this.buildFilteredQuery(query);
        const rows = await qb.orderBy('s.created_at', 'DESC').getMany();

        const headers = [
            'reference_token',
            'name',
            'email',
            'mobile',
            'company',
            'status',
            'phone_verified',
            'email_verified',
            'submitted_at',
            'reviewed_at',
            'submission_ip',
        ];

        const escape = (val: any): string => {
            if (val === null || val === undefined) return '';
            const str = val instanceof Date ? val.toISOString() : String(val);
            if (/[",\n\r]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const lines: string[] = [headers.join(',')];
        for (const s of rows) {
            lines.push(
                [
                    s.reference_token,
                    s.company_name || '',
                    s.email,
                    `${s.contact_mobile_code || ''}${s.contact_mobile_number || ''}`,
                    s.company_name || '',
                    s.status,
                    s.phone_verified ? 'yes' : 'no',
                    s.email_verified ? 'yes' : 'no',
                    s.submitted_at,
                    s.reviewed_at,
                    s.submission_ip,
                ]
                    .map(escape)
                    .join(','),
            );
        }

        const filename = `kyc-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        // BOM for Excel compatibility with non-ASCII chars
        res.write('\uFEFF');
        res.write(lines.join('\r\n'));
        res.end();
    }

    /** GET /api/v1/admin/kyc/submissions/:id */
    @Get(':id')
    async detail(@Param('id', ParseIntPipe) id: number) {
        const submission = await this.kycRepository.findOne({
            where: { id },
            relations: ['attachments'],
        });
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }

        // Strip OTP fields just in case (they are select:false but defensive).
        const { phone_otp, email_otp, ...rest } = submission as any;
        return { success: true, data: rest };
    }

    /**
     * PATCH /api/v1/admin/kyc/submissions/:id/status
     * Move a submission through the review workflow:
     *   under_review | approved | rejected
     * Captures reviewer id, timestamp, notes and (when rejected) reason.
     */
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateKycStatusDto,
        @Req() req: any,
    ) {
        const submission = await this.kycRepository.findOne({ where: { id } });
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }

        const allowed = [
            KycSubmissionStatus.UNDER_REVIEW,
            KycSubmissionStatus.APPROVED,
            KycSubmissionStatus.REJECTED,
        ];
        if (!allowed.includes(body.status)) {
            throw new BadRequestException(
                'Status must be one of: under_review, approved, rejected.',
            );
        }

        if (submission.status === KycSubmissionStatus.DRAFT) {
            throw new BadRequestException(
                'Cannot review a draft submission. Customer has not submitted yet.',
            );
        }

        if (body.status === KycSubmissionStatus.REJECTED) {
            if (!body.rejection_reason || body.rejection_reason.trim().length === 0) {
                throw new BadRequestException('rejection_reason is required when rejecting.');
            }
        }

        await this.kycRepository.update(
            { id },
            {
                status: body.status,
                reviewed_by_admin_id: req.user?.id || null,
                reviewed_at: new Date(),
                review_notes: body.notes ?? submission.review_notes ?? null,
                rejection_reason:
                    body.status === KycSubmissionStatus.REJECTED
                        ? body.rejection_reason
                        : null,
            },
        );

        const updated = await this.kycRepository.findOne({
            where: { id },
            relations: ['attachments'],
        });

        // Dispatch SMS for terminal review states. Failures must not roll back the
        // status change – they are only logged on the entity for the admin to see.
        if (
            updated &&
            (body.status === KycSubmissionStatus.APPROVED ||
                body.status === KycSubmissionStatus.REJECTED)
        ) {
            await this.dispatchStatusSms(updated, body.status, body.rejection_reason);
        }

        const refreshed =
            (await this.kycRepository.findOne({ where: { id }, relations: ['attachments'] })) || updated;
        const { phone_otp, email_otp, ...rest } = refreshed as any;
        return { success: true, message: 'Status updated.', data: rest };
    }

    private async dispatchStatusSms(
        submission: KycSubmission,
        status: KycSubmissionStatus,
        rejection_reason?: string | null,
    ): Promise<void> {
        const ref = submission.reference_token;
        const message =
            status === KycSubmissionStatus.APPROVED
                ? `Good news! Your request for our deposit-free rental option has been approved. Our team will contact you shortly to proceed with your booking.`
                : `Thank you for choosing Route Facile Car Rental. At the moment, we are unable to approve the requested rental option based on the current details provided. Our team will be happy to assist you with alternative rental options.`;

        try {
            await this.smsService.send(
                submission.contact_mobile_code,
                submission.contact_mobile_number,
                message,
                'kyc_status_update',
                submission.id,
            );
            await this.kycRepository.update(
                { id: submission.id },
                { sms_status_sent_at: new Date(), sms_status_error: null },
            );
        } catch (err: any) {
            const reason = (err?.message || 'sms_dispatch_failed').toString().slice(0, 250);
            this.logger.error(`KYC status SMS failed for ${ref}: ${reason}`);
            await this.kycRepository.update(
                { id: submission.id },
                { sms_status_error: reason },
            );
        }
    }

    /** GET /api/v1/admin/kyc/submissions/:id/attachments/:attachmentId/download */
    @Get(':id/attachments/:attachmentId/download')
    async download(
        @Param('id', ParseIntPipe) id: number,
        @Param('attachmentId', ParseIntPipe) attachmentId: number,
        @Res() res: Response,
    ) {
        const attachment = await this.attachmentRepository.findOne({
            where: { id: attachmentId, kyc_submission_id: id },
            relations: ['kyc_submission'],
        });
        if (!attachment || !attachment.kyc_submission) {
            throw new NotFoundException('Attachment not found.');
        }

        const safeToken = attachment.kyc_submission.reference_token.replace(/[^A-Za-z0-9_-]/g, '');
        const filePath = join(KYC_UPLOAD_ROOT, safeToken, attachment.file_name);

        // Defensive path traversal check.
        if (!filePath.startsWith(KYC_UPLOAD_ROOT) || !existsSync(filePath)) {
            throw new NotFoundException('File not found on disk.');
        }

        res.setHeader('Content-Type', attachment.file_type || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${attachment.original_name.replace(/"/g, '')}"`,
        );
        return res.sendFile(filePath);
    }

    /** GET /api/v1/admin/kyc/submissions/:id/signature */
    @Get(':id/signature')
    async signature(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const submission = await this.kycRepository.findOne({ where: { id } });
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }
        if (!submission.signature_image) {
            throw new NotFoundException('Signature not captured for this submission.');
        }
        const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(submission.signature_image);
        if (!match) {
            throw new NotFoundException('Stored signature is malformed.');
        }
        const buffer = Buffer.from(match[1], 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="signature-${submission.reference_token}.png"`);
        res.setHeader('X-Signature-Method', submission.signature_method || '');
        res.setHeader('X-Signature-Hash', submission.signature_hash || '');
        res.setHeader(
            'X-Signature-Signed-At',
            submission.signature_signed_at ? submission.signature_signed_at.toISOString() : '',
        );
        res.end(buffer);
    }

    /**
     * GET /api/v1/admin/kyc/submissions/:id/download
     * Streams an A4 PDF report of the submission.
     */
    @Get(':id/download')
    async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const submission = await this.kycRepository.findOne({
            where: { id },
            relations: ['attachments'],
        });
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }

        const filename = `kyc-${submission.reference_token}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
        doc.pipe(res);

        try {
            this.renderKycPdf(doc, submission);
        } catch (err: any) {
            this.logger.error(`PDF render failed for ${submission.reference_token}: ${err?.message}`);
        }
        doc.end();
    }

    /** Render all sections of the KYC PDF into the given pdfkit document. */
    private renderKycPdf(doc: any, s: KycSubmission): void {
        const COLOR_PRIMARY = '#1f2a44';
        const COLOR_ACCENT = '#e07a3c';
        const COLOR_MUTED = '#6b7280';

        const fmt = (d: Date | null | undefined): string =>
            d ? new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }) : '-';
        const yesNo = (n: any): string => (n ? 'Yes' : 'No');

        // Header
        doc.fillColor(COLOR_PRIMARY).fontSize(18).text('KYC Submission Report', { align: 'left' });
        doc.fillColor(COLOR_ACCENT).fontSize(10).text('Route Facile Car Rental  -  AECB Compliance');
        doc.moveDown(0.5);
        doc.strokeColor(COLOR_ACCENT).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.8);

        // Reference + status block
        doc.fillColor(COLOR_PRIMARY).fontSize(11);
        doc.font('Helvetica-Bold').text('Reference: ', { continued: true })
            .font('Helvetica').text(s.reference_token);
        doc.font('Helvetica-Bold').text('Status: ', { continued: true })
            .font('Helvetica').text(s.status.toUpperCase());
        doc.font('Helvetica-Bold').text('Submitted: ', { continued: true })
            .font('Helvetica').text(fmt(s.submitted_at));
        doc.font('Helvetica-Bold').text('Reviewed: ', { continued: true })
            .font('Helvetica').text(fmt(s.reviewed_at));
        doc.moveDown(0.6);

        const section = (title: string) => {
            doc.moveDown(0.4);
            doc.fillColor(COLOR_ACCENT).fontSize(11).font('Helvetica-Bold').text(title.toUpperCase());
            doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
            doc.moveDown(0.4);
            doc.fillColor(COLOR_PRIMARY).fontSize(10).font('Helvetica');
        };

        const kv = (label: string, value: any) => {
            doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').text(value === null || value === undefined || value === '' ? '-' : String(value));
        };

        // Applicant
        section('Applicant');
        kv('Email', s.email);
        kv('Mobile', `${s.contact_mobile_code || ''}${s.contact_mobile_number || ''}`);
        kv('Landline', `${s.contact_landline_code || ''}${s.contact_landline_number || ''}`.trim() || '-');
        kv('Residential address', s.residential_address);

        // Company
        section('Company');
        kv('Name', s.company_name);
        kv('Address', s.company_address);
        kv('Phone', `${s.company_phone_code || ''}${s.company_phone_number || ''}`.trim() || '-');

        // Verification
        section('Verification');
        kv('Phone verified', yesNo(s.phone_verified));
        kv('Phone verified at', fmt(s.phone_verified_at));
        kv('Email verified', yesNo(s.email_verified));
        kv('Email verified at', fmt(s.email_verified_at));

        // Consent
        section('Consent (AECB)');
        doc.fillColor(COLOR_MUTED).fontSize(9).font('Helvetica-Oblique')
            .text(s.consent_text || '-', { align: 'justify' });
        doc.moveDown(0.3);
        doc.fillColor(COLOR_PRIMARY).fontSize(10).font('Helvetica');
        kv('Consent given', yesNo(s.consent_given));
        kv('Given at', fmt(s.consent_given_at));
        kv('Submission IP', s.submission_ip);

        // Signature
        section('Digital Signature');
        if (s.signature_image) {
            const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(s.signature_image);
            if (match) {
                try {
                    const buffer = Buffer.from(match[1], 'base64');
                    doc.image(buffer, { fit: [220, 80] });
                    doc.moveDown(0.3);
                } catch (err: any) {
                    this.logger.warn(`Signature image embed failed: ${err?.message}`);
                }
            }
            kv('Method', s.signature_method);
            if (s.signature_typed_text) kv('Typed name', s.signature_typed_text);
            kv('Signed at', fmt(s.signature_signed_at));
            kv('Signed IP', s.signature_ip);
            kv('Hash (sha256)', s.signature_hash ? `${s.signature_hash.slice(0, 16)}...` : '-');
        } else {
            doc.fillColor(COLOR_MUTED).text('No signature on file.');
            doc.fillColor(COLOR_PRIMARY);
        }

        // Documents
        section('Documents');
        const attachments = s.attachments || [];
        if (attachments.length === 0) {
            doc.text('No attachments uploaded.');
        } else {
            const headers = ['Type', 'Original name', 'Size (KB)', 'Uploaded'];
            const colWidths = [120, 220, 70, 110];
            const startX = 40;
            let y = doc.y;
            doc.font('Helvetica-Bold').fontSize(9);
            headers.forEach((h, i) => {
                doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
                    width: colWidths[i],
                });
            });
            doc.moveDown(0.4);
            doc.font('Helvetica').fontSize(9);
            for (const a of attachments) {
                y = doc.y;
                const cells = [
                    a.document_type,
                    a.original_name,
                    a.file_size ? Math.round(a.file_size / 1024).toString() : '-',
                    fmt(a.created_at),
                ];
                cells.forEach((c, i) => {
                    doc.text(String(c ?? '-'), startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
                        width: colWidths[i],
                    });
                });
                doc.moveDown(0.4);
            }
        }

        // Review
        section('Review');
        kv('Reviewer admin id', s.reviewed_by_admin_id);
        kv('Reviewed at', fmt(s.reviewed_at));
        kv('Notes', s.review_notes);
        if (s.status === KycSubmissionStatus.REJECTED) {
            kv('Rejection reason', s.rejection_reason);
        }
        kv('SMS sent at', fmt(s.sms_status_sent_at));
        if (s.sms_status_error) kv('SMS error', s.sms_status_error);

        // Footer (page numbers + generated_at)
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(range.start + i);
            const bottom = doc.page.height - 30;
            doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica');
            doc.text(
                `Generated ${fmt(new Date())}  -  Route Facile KYC`,
                40,
                bottom,
                { width: 250, align: 'left', lineBreak: false },
            );
            doc.text(
                `Page ${i + 1} of ${range.count}`,
                doc.page.width - 40 - 100,
                bottom,
                { width: 100, align: 'right', lineBreak: false },
            );
        }
    }

    /** Builds the filtered query used by both list and export. */
    private buildFilteredQuery(
        query: AdminKycListQueryDto | AdminKycExportQueryDto,
    ): SelectQueryBuilder<KycSubmission> {
        const qb = this.kycRepository.createQueryBuilder('s');

        if (query.status) {
            qb.andWhere('s.status = :status', { status: query.status });
        }
        if (query.search) {
            qb.andWhere(
                new Brackets((qb2) => {
                    qb2.where('s.reference_token LIKE :search', { search: `%${query.search}%` })
                        .orWhere('s.email LIKE :search', { search: `%${query.search}%` })
                        .orWhere('s.contact_mobile_number LIKE :search', { search: `%${query.search}%` })
                        .orWhere('s.company_name LIKE :search', { search: `%${query.search}%` });
                }),
            );
        }
        if (query.from) {
            qb.andWhere('s.created_at >= :from', { from: new Date(query.from) });
        }
        if (query.to) {
            // make `to` inclusive of the whole day
            const to = new Date(query.to);
            to.setHours(23, 59, 59, 999);
            qb.andWhere('s.created_at <= :to', { to });
        }
        return qb;
    }
}
