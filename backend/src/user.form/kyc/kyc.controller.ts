import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';
import { Response } from 'express';

import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';

import {
    KYC_CONSENT_TEXT,
    KycSubmissionService,
} from './kyc.service';
import {
    ResendOtpDto,
    StartKycDto,
    StartKycResponseDto,
    SubmitKycDto,
    VerifyOtpDto,
} from './kyc.dto';

const KYC_UPLOAD_FIELDS = new Set([
    // Legacy fields kept for back-compat with older clients.
    'cities_id',
    'uae_driving_license',
    // New two-side fields (May 2026 onward).
    'cities_id_front',
    'cities_id_back',
    'uae_driving_license_front',
    'uae_driving_license_back',
    'passport_visa',
]);

@ApiHeader({ name: 'x-api-key', required: true, description: 'Api key' })
@ApiTags('kyc')
@UseGuards(ApiKeyAuthGuard)
@Controller('kyc')
export class KycController {
    constructor(@Inject(KycSubmissionService) private readonly kycService: KycSubmissionService) {}

    @ApiOperation({
        summary: 'Get the static KYC form metadata (consent text + required documents)',
    })
    @Get('config')
    getConfig() {
        return {
            status: 'success',
            data: {
                consent_text: KYC_CONSENT_TEXT,
                required_documents: [
                    'cities_id_front',
                    'cities_id_back',
                    'uae_driving_license_front',
                    'uae_driving_license_back',
                ],
                optional_documents: ['passport_visa'],
                // Legacy single-side fields are still accepted on submit so older
                // clients keep working until the website is updated.
                legacy_documents: ['cities_id', 'uae_driving_license'],
                max_file_size_mb: 10,
                allowed_mime_types: [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/heic',
                    'image/heif',
                ],
                otp_ttl_minutes: 10,
            },
        };
    }

    @ApiOperation({
        summary: 'Validate that an email address is well-formed and its domain can receive mail.',
    })
    @Get('verify-email')
    async verifyEmail(@Query('email') email: string) {
        if (!email) {
            return { status: 'error', message: 'email query param is required' };
        }
        const result = await this.kycService.verifyEmailDeliverable(email);
        return { status: result.ok ? 'success' : 'error', data: result };
    }

    @ApiOperation({
        summary: 'Start a KYC submission – creates a draft and dispatches a phone OTP',
    })
    @Post('start')
    async start(@Body() body: StartKycDto): Promise<StartKycResponseDto> {
        const submission = await this.kycService.startSubmission(body);
        return {
            status: 'success',
            reference_token: submission.reference_token,
            message: 'An OTP has been sent to the provided mobile number.',
        };
    }

    @ApiOperation({ summary: 'Verify the phone-number OTP' })
    @Post('verify-phone-otp')
    async verifyPhoneOtp(@Body() body: VerifyOtpDto) {
        await this.kycService.verifyPhoneOtp(body.reference_token, body.otp);
        return { status: 'success', message: 'Phone number verified successfully.' };
    }

    @ApiOperation({ summary: 'Resend the phone OTP' })
    @Post('resend-phone-otp')
    async resendPhoneOtp(@Body() body: ResendOtpDto) {
        await this.kycService.resendPhoneOtp(body.reference_token);
        return { status: 'success', message: 'A new OTP has been sent to your phone.' };
    }

    @ApiOperation({
        summary: 'Submit the KYC form (multipart) with documents + consent. Phone OTP must already be verified.',
    })
    @Post('submit')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, _file, cb) => {
                    const token = (req.body as any)?.reference_token || 'unsorted';
                    const safeToken = token.toString().replace(/[^A-Za-z0-9_-]/g, '');
                    const upload_path = `./uploads/kyc/${safeToken}`;
                    fs.mkdir(upload_path, { recursive: true }, (err) => {
                        if (err) return cb(err, upload_path);
                        cb(null, upload_path);
                    });
                },
                filename: (_req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (!KYC_UPLOAD_FIELDS.has(file.fieldname)) {
                    return cb(
                        new BadRequestException(
                            `Unsupported field: ${file.fieldname}. Allowed: cities_id_front, cities_id_back, uae_driving_license_front, uae_driving_license_back, passport_visa (or legacy cities_id, uae_driving_license).`,
                        ),
                        false,
                    );
                }
                if (file.mimetype.match(/\/(pdf|jpeg|jpg|png|heic|heif)$/i)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type. Allowed: PDF, JPG, PNG, HEIC.'), false);
                }
            },
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per document
        }),
    )
    async submit(
        @Body() body: SubmitKycDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: any,
    ) {
        const ip = (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;
        const userAgent = (req.headers?.['user-agent'] as string) || null;
        const submission = await this.kycService.finalizeSubmission(body, files || [], ip, userAgent);
        return {
            status: 'success',
            message: 'Your KYC submission has been received. Our team will contact you shortly.',
            data: {
                reference_token: submission.reference_token,
                submitted_at: submission.submitted_at,
            },
        };
    }

    @ApiOperation({ summary: 'Check the status of a KYC submission by reference token' })
    @Get('status/:reference_token')
    async status(@Param('reference_token') reference_token: string) {
        const data = await this.kycService.getStatusForCustomer(reference_token);
        return { status: 'success', data };
    }
}
