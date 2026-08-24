import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { promises as dns } from 'dns';
import * as fs from 'fs';
import * as path from 'path';

import { KycSubmission } from 'src/entities/kyc.submission.entity';
import { KycSubmissionAttachment } from 'src/entities/kyc.submission.attachment.entity';
import { KycDocumentType, KycSubmissionStatus } from 'src/entities/enums/kyc.submission.status';
import { BaseService } from 'src/service/base.service';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/mail/sms.service';

import { StartKycDto, SubmitKycDto } from './kyc.dto';

export const KYC_CONSENT_TEXT =
    "I'm giving my consent to M/s Route Facile Car Rental to obtaining my credit score from AECB on my behalf for the purpose of processing my car rental request";

export const KYC_OTP_TTL_MINUTES = 10;

const REQUIRED_DOCUMENT_TYPES: KycDocumentType[] = [
    KycDocumentType.CITIES_ID_FRONT,
    KycDocumentType.CITIES_ID_BACK,
    KycDocumentType.UAE_DRIVING_LICENSE_FRONT,
    KycDocumentType.UAE_DRIVING_LICENSE_BACK,
];

const OPTIONAL_DOCUMENT_TYPES: KycDocumentType[] = [
    KycDocumentType.PASSPORT_VISA,
];

const DOCUMENT_FIELD_MAP: Record<string, KycDocumentType> = {
    // Legacy single-side fields (still accepted to keep older clients working).
    cities_id: KycDocumentType.CITIES_ID,
    uae_driving_license: KycDocumentType.UAE_DRIVING_LICENSE,
    // New two-side fields (May 2026 onward).
    cities_id_front: KycDocumentType.CITIES_ID_FRONT,
    cities_id_back: KycDocumentType.CITIES_ID_BACK,
    uae_driving_license_front: KycDocumentType.UAE_DRIVING_LICENSE_FRONT,
    uae_driving_license_back: KycDocumentType.UAE_DRIVING_LICENSE_BACK,
    passport_visa: KycDocumentType.PASSPORT_VISA,
};

@Injectable()
export class KycSubmissionService extends BaseService<KycSubmission> {
    private readonly logger = new Logger(KycSubmissionService.name);

    constructor(
        @InjectRepository(KycSubmission) private readonly kycRepository: Repository<KycSubmission>,
        @InjectRepository(KycSubmissionAttachment) private readonly attachmentRepository: Repository<KycSubmissionAttachment>,
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
    ) {
        super(kycRepository);
    }

    /** Resolve a multipart-form field name (passport_visa, cities_id, ...) to a KycDocumentType. */
    static resolveDocumentType(fieldName: string): KycDocumentType | null {
        return DOCUMENT_FIELD_MAP[fieldName] || null;
    }

    /**
     * Validate that an email is well-formed AND its domain has working MX (or A)
     * records – i.e. it is at least theoretically deliverable.
     *
     *   { ok: true }                                  -> looks deliverable
     *   { ok: false, reason: 'invalid_format' }       -> regex failed
     *   { ok: false, reason: 'no_mx' }                -> domain has no MX/A records
     *   { ok: false, reason: 'lookup_failed', error } -> DNS lookup error (network etc.)
     */
    async verifyEmailDeliverable(
        email: string,
    ): Promise<{ ok: boolean; reason?: string; mx?: string[]; error?: string }> {
        if (!email || typeof email !== 'string') {
            return { ok: false, reason: 'invalid_format' };
        }
        const trimmed = email.trim();
        // RFC-5322-lite, good enough for the public form.
        const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!FORMAT_RE.test(trimmed)) {
            return { ok: false, reason: 'invalid_format' };
        }

        const domain = trimmed.split('@')[1];
        try {
            const mx = await dns.resolveMx(domain);
            if (mx && mx.length > 0) {
                return {
                    ok: true,
                    mx: mx
                        .sort((a, b) => a.priority - b.priority)
                        .map((r) => `${r.exchange} (prio ${r.priority})`),
                };
            }
        } catch (err: any) {
            // No MX record – fall through to A/AAAA lookup as a fallback (RFC 5321 §5).
            this.logger.debug(`MX lookup failed for ${domain}: ${err?.code || err?.message}`);
        }

        try {
            const a = await dns.lookup(domain);
            if (a && a.address) {
                return { ok: true, mx: [`A:${a.address}`] };
            }
            return { ok: false, reason: 'no_mx' };
        } catch (err: any) {
            return { ok: false, reason: 'lookup_failed', error: err?.code || err?.message };
        }
    }

    /**
     * Same as verifyEmailDeliverable, but throws BadRequestException on failure.
     * Use at controller entry points where the request must be aborted.
     */
    async assertEmailDeliverable(email: string): Promise<void> {
        const result = await this.verifyEmailDeliverable(email);
        if (!result.ok) {
            switch (result.reason) {
                case 'invalid_format':
                    throw new BadRequestException('Email address is not valid.');
                case 'no_mx':
                    throw new BadRequestException(
                        'Email domain cannot receive mail (no MX records).',
                    );
                case 'lookup_failed':
                default:
                    throw new BadRequestException(
                        'Could not verify the email domain. Please check the address.',
                    );
            }
        }
    }

    /**
     * Create a draft submission and dispatch one OTP to the customer's phone (SMS).
     * Email is auto-verified internally (no email OTP step).
     */
    async startSubmission(dto: StartKycDto): Promise<KycSubmission> {
        // Block obviously bad / undeliverable emails before creating the draft.
        await this.assertEmailDeliverable(dto.email);

        const reference_token = `KYC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const phone_otp = this.generateOtp();
        const expires_at = this.getOtpExpiry();
        const now = new Date();

        const entity = this.kycRepository.create({
            reference_token,
            contact_mobile_code: dto.contact_mobile_code,
            contact_mobile_number: dto.contact_mobile_number,
            email: dto.email,
            phone_otp,
            phone_otp_expires_at: expires_at,
            // Email OTP step has been removed; auto-verify the email internally
            // so downstream checks and admin views reflect a verified state.
            email_verified: 1,
            email_verified_at: now,
            status: KycSubmissionStatus.DRAFT,
        });

        const saved = await this.kycRepository.save(entity);

        // Fire-and-forget; failures are already logged by SmsService.
        this.dispatchPhoneOtp(saved, phone_otp).catch(() => undefined);

        return saved;
    }

    async getByToken(reference_token: string, includeOtp = false): Promise<KycSubmission> {
        const qb = this.kycRepository.createQueryBuilder('s').where('s.reference_token = :t', { t: reference_token });
        if (includeOtp) {
            qb.addSelect(['s.phone_otp']);
        }
        const submission = await qb.getOne();
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }
        return submission;
    }

    async verifyPhoneOtp(reference_token: string, otp: string): Promise<KycSubmission> {
        const submission = await this.getByToken(reference_token, true);
        if (submission.status === KycSubmissionStatus.SUBMITTED) {
            throw new BadRequestException('Submission has already been submitted.');
        }
        if (submission.phone_verified) {
            return submission;
        }
        if (!submission.phone_otp || submission.phone_otp !== otp) {
            throw new BadRequestException('Invalid OTP.');
        }
        if (!submission.phone_otp_expires_at || submission.phone_otp_expires_at < new Date()) {
            throw new BadRequestException('OTP has expired. Please request a new one.');
        }

        await this.kycRepository.update(
            { id: submission.id },
            {
                phone_verified: 1,
                phone_verified_at: new Date(),
                phone_otp: null,
                phone_otp_expires_at: null,
            },
        );

        return this.getByToken(reference_token);
    }

    async resendPhoneOtp(reference_token: string): Promise<void> {
        const submission = await this.getByToken(reference_token);
        if (submission.status === KycSubmissionStatus.SUBMITTED) {
            throw new BadRequestException('Submission has already been submitted.');
        }
        if (submission.phone_verified) {
            throw new BadRequestException('Phone number is already verified.');
        }
        const phone_otp = this.generateOtp();
        await this.kycRepository.update(
            { id: submission.id },
            { phone_otp, phone_otp_expires_at: this.getOtpExpiry() },
        );
        await this.dispatchPhoneOtp(submission, phone_otp);
    }

    /**
     * Persist all the optional KYC fields, the consent flag and the uploaded documents.
     * Phone must be verified, and all 3 required document types must be present.
     */
    async finalizeSubmission(
        dto: SubmitKycDto,
        files: Express.Multer.File[],
        submission_ip: string | null,
        user_agent: string | null = null,
    ): Promise<KycSubmission> {
        const submission = await this.getByToken(dto.reference_token);

        if (submission.status === KycSubmissionStatus.SUBMITTED) {
            throw new BadRequestException('Submission has already been submitted.');
        }
        if (!submission.phone_verified) {
            throw new BadRequestException('Mobile number must be verified before submitting.');
        }

        const consentRaw: any = dto.consent_given;
        const consent = consentRaw === true || consentRaw === 'true' || consentRaw === '1' || consentRaw === 1;
        if (!consent) {
            throw new BadRequestException('Consent must be given before submitting.');
        }

        // Validate uploaded documents.
        if (!files || files.length === 0) {
            throw new BadRequestException('Required documents must be uploaded.');
        }
        const filesByType = new Map<KycDocumentType, Express.Multer.File>();
        for (const file of files) {
            const docType = KycSubmissionService.resolveDocumentType(file.fieldname);
            if (!docType) {
                throw new BadRequestException(`Unexpected upload field: ${file.fieldname}`);
            }
            if (filesByType.has(docType)) {
                throw new BadRequestException(`Duplicate upload for: ${file.fieldname}`);
            }
            filesByType.set(docType, file);
        }
        for (const required of REQUIRED_DOCUMENT_TYPES) {
            if (!filesByType.has(required)) {
                // Back-compat: accept the legacy single-side upload as a substitute
                // for BOTH front and back of the same document.
                const legacyFallback =
                    (required === KycDocumentType.CITIES_ID_FRONT ||
                        required === KycDocumentType.CITIES_ID_BACK) &&
                    filesByType.has(KycDocumentType.CITIES_ID)
                        ? KycDocumentType.CITIES_ID
                        : (required === KycDocumentType.UAE_DRIVING_LICENSE_FRONT ||
                              required === KycDocumentType.UAE_DRIVING_LICENSE_BACK) &&
                          filesByType.has(KycDocumentType.UAE_DRIVING_LICENSE)
                        ? KycDocumentType.UAE_DRIVING_LICENSE
                        : null;
                if (!legacyFallback) {
                    throw new BadRequestException(`Missing required document: ${required}`);
                }
            }
        }

        // ---- Validate & persist digital signature ----
        const sigData = this.processSignature(dto, submission_ip, user_agent);

        const now = new Date();
        await this.kycRepository.update(
            { id: submission.id },
            {
                residential_address: dto.residential_address ?? null,
                contact_landline_code: dto.contact_landline_code ?? null,
                contact_landline_number: dto.contact_landline_number ?? null,
                company_name: dto.company_name ?? null,
                company_address: dto.company_address ?? null,
                company_phone_code: dto.company_phone_code ?? null,
                company_phone_number: dto.company_phone_number ?? null,
                consent_given: 1,
                consent_text: KYC_CONSENT_TEXT,
                consent_given_at: now,
                status: KycSubmissionStatus.SUBMITTED,
                submitted_at: now,
                submission_ip,
                // Email OTP step was removed; mark email as auto-verified on submit
                // so admin/list responses reflect a completed verification state.
                email_verified: 1,
                email_verified_at: now,
                // Digital signature.
                signature_image: sigData.dataUrl,
                signature_method: sigData.method,
                signature_typed_text: sigData.typedText,
                signature_signed_at: now,
                signature_ip: submission_ip,
                signature_user_agent: sigData.userAgent,
                signature_hash: sigData.hash,
            },
        );

        // Persist the raw PNG to disk alongside the documents (best effort – DB is the
        // source of truth via signature_image; disk copy is for PDF/admin views).
        try {
            const safeToken = submission.reference_token.replace(/[^A-Za-z0-9_-]/g, '');
            const dir = path.resolve(`./uploads/kyc/${safeToken}`);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'signature.png'), sigData.buffer);
        } catch (err: any) {
            this.logger.warn(`Failed to write signature to disk for ${submission.reference_token}: ${err?.message}`);
        }

        for (const [docType, file] of filesByType) {
            await this.attachmentRepository.save(
                this.attachmentRepository.create({
                    kyc_submission_id: submission.id,
                    document_type: docType,
                    file_name: file.filename,
                    original_name: file.originalname,
                    file_type: file.mimetype,
                    file_size: file.size,
                }),
            );
        }

        return this.getByToken(dto.reference_token);
    }

    async getStatusForCustomer(reference_token: string) {
        const submission = await this.kycRepository.findOne({
            where: { reference_token },
            relations: ['attachments'],
        });
        if (!submission) {
            throw new NotFoundException('Submission not found.');
        }

        const attachments = (submission.attachments || []).map((a) => ({
            id: a.id,
            document_type: a.document_type,
            original_name: a.original_name,
            file_type: a.file_type,
            file_size: a.file_size,
            uploaded_at: a.created_at,
            preview_url: `/api/v1/kyc/attachments/${a.id}/preview?token=${submission.reference_token}`,
            download_url: `/api/v1/kyc/attachments/${a.id}/download?token=${submission.reference_token}`,
        }));

        const timeline: Array<{ event: string; at: Date | null; note?: string | null }> = [
            { event: 'created', at: submission.created_at },
        ];
        if (submission.phone_verified_at) {
            timeline.push({ event: 'phone_verified', at: submission.phone_verified_at });
        }
        if (submission.email_verified_at) {
            timeline.push({ event: 'email_verified', at: submission.email_verified_at });
        }
        if (submission.signature_signed_at) {
            timeline.push({ event: 'signed', at: submission.signature_signed_at });
        }
        if (submission.submitted_at) {
            timeline.push({ event: 'submitted', at: submission.submitted_at });
        }
        if (submission.reviewed_at) {
            timeline.push({
                event: submission.status,
                at: submission.reviewed_at,
                note:
                    submission.status === KycSubmissionStatus.REJECTED
                        ? submission.rejection_reason
                        : null,
            });
        }
        if (submission.sms_status_sent_at) {
            timeline.push({ event: 'sms_notified', at: submission.sms_status_sent_at });
        }

        return {
            reference_token: submission.reference_token,
            status: submission.status,
            phone_verified: !!submission.phone_verified,
            email_verified: !!submission.email_verified,
            submitted_at: submission.submitted_at,
            reviewed_at: submission.reviewed_at,
            review: {
                status: submission.status,
                reviewed_at: submission.reviewed_at,
                rejection_reason:
                    submission.status === KycSubmissionStatus.REJECTED
                        ? submission.rejection_reason
                        : null,
                sms_notified_at: submission.sms_status_sent_at,
            },
            signature: {
                signed: !!submission.signature_signed_at,
                method: submission.signature_method,
                signed_at: submission.signature_signed_at,
            },
            attachments,
            timeline,
        };
    }

    /**
     * Resolve an attachment by id, validating the caller-supplied reference token.
     * Returns the attachment plus the on-disk path so the controller can stream it.
     */
    async resolveAttachmentForCustomer(
        attachmentId: number,
        reference_token: string,
    ): Promise<{ attachment: KycSubmissionAttachment; filePath: string }> {
        const attachment = await this.attachmentRepository.findOne({
            where: { id: attachmentId },
            relations: ['kyc_submission'],
        });
        if (!attachment || !attachment.kyc_submission) {
            throw new NotFoundException('Attachment not found.');
        }
        if (
            attachment.kyc_submission.reference_token.toUpperCase() !==
            (reference_token || '').toUpperCase()
        ) {
            throw new NotFoundException('Attachment not found.');
        }
        const safeToken = attachment.kyc_submission.reference_token.replace(/[^A-Za-z0-9_-]/g, '');
        const root = path.resolve('./uploads/kyc');
        const filePath = path.join(root, safeToken, attachment.file_name);
        if (!filePath.startsWith(root)) {
            throw new NotFoundException('Attachment not found.');
        }
        return { attachment, filePath };
    }

    /**
     * Locate a submission by reference token and return signature metadata + buffer
     * for streaming. Throws if no signature has been captured yet.
     */
    async getSignatureForToken(reference_token: string): Promise<{
        buffer: Buffer;
        method: string | null;
        signed_at: Date | null;
        hash: string | null;
        typed_text: string | null;
    }> {
        const submission = await this.getByToken(reference_token);
        if (!submission.signature_image) {
            throw new NotFoundException('Signature not found.');
        }
        const buffer = this.dataUrlToBuffer(submission.signature_image);
        return {
            buffer,
            method: submission.signature_method,
            signed_at: submission.signature_signed_at,
            hash: submission.signature_hash,
            typed_text: submission.signature_typed_text,
        };
    }

    /**
     * Validate a signature data URL: must be PNG, ≤200KB, non-blank.
     * Returns the cleaned data URL, raw buffer, method/typed text and a SHA-256 hash.
     */
    private processSignature(
        dto: SubmitKycDto,
        ip: string | null,
        user_agent: string | null,
    ): {
        dataUrl: string;
        buffer: Buffer;
        method: string;
        typedText: string | null;
        hash: string;
        userAgent: string | null;
    } {
        const raw = (dto.signature_image || '').toString().trim();
        if (!raw) {
            throw new BadRequestException('Signature is required.');
        }
        const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(raw);
        if (!match) {
            throw new BadRequestException('Signature must be a PNG data URL.');
        }
        let buffer: Buffer;
        try {
            buffer = Buffer.from(match[1], 'base64');
        } catch {
            throw new BadRequestException('Signature is not valid base64.');
        }
        if (buffer.length === 0) {
            throw new BadRequestException('Signature is empty.');
        }
        if (buffer.length > 200 * 1024) {
            throw new BadRequestException('Signature exceeds 200KB.');
        }
        // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        if (
            buffer[0] !== 0x89 ||
            buffer[1] !== 0x50 ||
            buffer[2] !== 0x4e ||
            buffer[3] !== 0x47
        ) {
            throw new BadRequestException('Signature is not a valid PNG image.');
        }

        const method = (dto.signature_method || 'drawn').toString().toLowerCase();
        if (method !== 'drawn' && method !== 'typed') {
            throw new BadRequestException('signature_method must be "drawn" or "typed".');
        }
        const typedText =
            method === 'typed'
                ? (dto.signature_typed_text || '').toString().trim() || null
                : null;
        if (method === 'typed' && !typedText) {
            throw new BadRequestException('signature_typed_text is required when method is typed.');
        }

        const signedAtIso = new Date().toISOString();
        const hash = crypto
            .createHash('sha256')
            .update(buffer)
            .update(signedAtIso)
            .update((ip || '').toString())
            .digest('hex');

        const ua = user_agent ? user_agent.toString().slice(0, 500) : null;

        return { dataUrl: raw, buffer, method, typedText, hash, userAgent: ua };
    }

    private dataUrlToBuffer(dataUrl: string): Buffer {
        const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
        if (!match) {
            throw new BadRequestException('Stored signature is malformed.');
        }
        return Buffer.from(match[1], 'base64');
    }

    private generateOtp(): string {
        // 6-digit numeric OTP
        return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    }

    private getOtpExpiry(): Date {
        return new Date(Date.now() + KYC_OTP_TTL_MINUTES * 60 * 1000);
    }

    private async dispatchPhoneOtp(submission: KycSubmission, otp: string): Promise<void> {
        const message = `Your Route Facile KYC verification code is ${otp}. It expires in ${KYC_OTP_TTL_MINUTES} minutes. Do not share this code with anyone.`;
        await this.smsService.send(
            submission.contact_mobile_code,
            submission.contact_mobile_number,
            message,
            'kyc_phone_otp',
            submission.id,
        );
    }
}
