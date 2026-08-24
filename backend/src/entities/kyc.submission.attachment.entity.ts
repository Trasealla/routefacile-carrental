import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { KycDocumentType } from './enums/kyc.submission.status';
import { KycSubmission } from './kyc.submission.entity';

@Entity('kyc_submission_attachments')
export class KycSubmissionAttachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    kyc_submission_id: number;

    @Column({ type: 'enum', enum: KycDocumentType })
    document_type: KycDocumentType;

    @Column({ type: 'varchar', length: 255 })
    file_name: string;

    @Column({ type: 'varchar', length: 255 })
    original_name: string;

    @Column({ type: 'varchar', length: 100 })
    file_type: string;

    @Column({ type: 'int' })
    file_size: number;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @ManyToOne(() => KycSubmission, (s) => s.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'kyc_submission_id' })
    kyc_submission: KycSubmission;
}
