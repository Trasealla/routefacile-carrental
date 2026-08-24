import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { KycSubmissionStatus } from './enums/kyc.submission.status';
import { KycSubmissionAttachment } from './kyc.submission.attachment.entity';

@Entity('kyc_submissions')
export class KycSubmission {
    @PrimaryGeneratedColumn()
    id: number;

    /** Public reference token sent to the customer (used to resume the form / track status). */
    @Column({ type: 'varchar', length: 64, unique: true })
    reference_token: string;

    // ---- Personal / Residential ----
    @Column({ type: 'text', nullable: true })
    residential_address: string;

    @Column({ type: 'varchar', length: 10 })
    contact_mobile_code: string;

    @Column({ type: 'varchar', length: 20 })
    contact_mobile_number: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    contact_landline_code: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    contact_landline_number: string;

    // ---- Company ----
    @Column({ type: 'varchar', length: 255, nullable: true })
    company_name: string;

    @Column({ type: 'text', nullable: true })
    company_address: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    company_phone_code: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    company_phone_number: string;

    // ---- Email ----
    @Column({ type: 'varchar', length: 191 })
    email: string;

    // ---- Consent ----
    @Column({ type: 'tinyint', default: 0 })
    consent_given: number;

    @Column({ type: 'text', nullable: true })
    consent_text: string;

    @Column({ type: 'datetime', nullable: true })
    consent_given_at: Date;

    // ---- Phone OTP verification ----
    @Column({ type: 'varchar', length: 10, nullable: true, select: false })
    phone_otp: string;

    @Column({ type: 'datetime', nullable: true })
    phone_otp_expires_at: Date;

    @Column({ type: 'tinyint', default: 0 })
    phone_verified: number;

    @Column({ type: 'datetime', nullable: true })
    phone_verified_at: Date;

    // ---- Email OTP verification ----
    @Column({ type: 'varchar', length: 10, nullable: true, select: false })
    email_otp: string;

    @Column({ type: 'datetime', nullable: true })
    email_otp_expires_at: Date;

    @Column({ type: 'tinyint', default: 0 })
    email_verified: number;

    @Column({ type: 'datetime', nullable: true })
    email_verified_at: Date;

    // ---- Workflow ----
    @Column({ type: 'enum', enum: KycSubmissionStatus, default: KycSubmissionStatus.DRAFT })
    status: KycSubmissionStatus;

    @Column({ type: 'datetime', nullable: true })
    submitted_at: Date;

    @Column({ type: 'varchar', length: 64, nullable: true })
    submission_ip: string;

    // ---- Review (admin) ----
    @Column({ type: 'int', nullable: true })
    reviewed_by_admin_id: number;

    @Column({ type: 'datetime', nullable: true })
    reviewed_at: Date;

    @Column({ type: 'text', nullable: true })
    review_notes: string;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string;

    // ---- Status SMS notification ----
    @Column({ type: 'datetime', nullable: true })
    sms_status_sent_at: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    sms_status_error: string;

    // ---- Digital signature ----
    @Column({ type: 'longtext', nullable: true })
    signature_image: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    signature_method: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    signature_typed_text: string;

    @Column({ type: 'datetime', nullable: true })
    signature_signed_at: Date;

    @Column({ type: 'varchar', length: 64, nullable: true })
    signature_ip: string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    signature_user_agent: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    signature_hash: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => KycSubmissionAttachment, (a) => a.kyc_submission)
    attachments: KycSubmissionAttachment[];
}
