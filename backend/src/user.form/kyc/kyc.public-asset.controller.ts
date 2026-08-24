import {
    BadRequestException,
    Controller,
    Get,
    Inject,
    NotFoundException,
    Param,
    ParseIntPipe,
    Query,
    Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { existsSync } from 'fs';

import { KycSubmissionService } from './kyc.service';

/**
 * Truly public KYC asset endpoints.
 *
 * These routes intentionally bypass the global x-api-key header so that
 * customer-facing browsers can render thumbnails / open downloads via plain
 * <img src> / <a href> tags. Authorization is enforced by the unguessable
 * reference_token in the URL (16 random hex chars, scoped to one submission).
 */
@ApiTags('kyc-public')
@Controller('kyc')
export class KycPublicAssetController {
    constructor(@Inject(KycSubmissionService) private readonly kycService: KycSubmissionService) {}

    @ApiOperation({
        summary: 'Stream an uploaded document inline (preview). Token must match submission.',
    })
    @Get('attachments/:attachmentId/preview')
    async previewAttachment(
        @Param('attachmentId', ParseIntPipe) attachmentId: number,
        @Query('token') token: string,
        @Res() res: Response,
    ) {
        if (!token) {
            throw new BadRequestException('token query param is required.');
        }
        const { attachment, filePath } = await this.kycService.resolveAttachmentForCustomer(
            attachmentId,
            token,
        );
        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found.');
        }
        res.setHeader('Content-Type', attachment.file_type || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${attachment.original_name.replace(/"/g, '')}"`,
        );
        // Allow embedding from the public website domain.
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        return res.sendFile(filePath);
    }

    @ApiOperation({
        summary: 'Download an uploaded document. Token must match the submission reference token.',
    })
    @Get('attachments/:attachmentId/download')
    async downloadAttachment(
        @Param('attachmentId', ParseIntPipe) attachmentId: number,
        @Query('token') token: string,
        @Res() res: Response,
    ) {
        if (!token) {
            throw new BadRequestException('token query param is required.');
        }
        const { attachment, filePath } = await this.kycService.resolveAttachmentForCustomer(
            attachmentId,
            token,
        );
        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found.');
        }
        res.setHeader('Content-Type', attachment.file_type || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${attachment.original_name.replace(/"/g, '')}"`,
        );
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        return res.sendFile(filePath);
    }

    @ApiOperation({
        summary: 'Stream the customer signature PNG inline (token-protected).',
    })
    @Get('signature/:reference_token')
    async signature(
        @Param('reference_token') reference_token: string,
        @Res() res: Response,
    ) {
        const sig = await this.kycService.getSignatureForToken(reference_token);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="signature-${reference_token}.png"`,
        );
        res.setHeader('X-Signature-Method', sig.method || '');
        res.setHeader('X-Signature-Hash', sig.hash || '');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.end(sig.buffer);
    }
}
