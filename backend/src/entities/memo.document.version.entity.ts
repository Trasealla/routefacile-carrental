import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { MemoDocument } from './memo.document.entity';

@Entity('memo_document_versions')
export class MemoDocumentVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'document_id' })
  document_id: number;

  @ManyToOne(() => MemoDocument, d => d.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: MemoDocument;

  @Column({ name: 'version_no', type: 'int' })
  version_no: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  file_name: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  file_path: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 150, nullable: true })
  mime_type: string;

  @Column({ name: 'checksum', type: 'varchar', length: 128, nullable: true })
  checksum: string;

  @Column({ name: 'change_notes', type: 'text', nullable: true })
  change_notes: string;

  @Column({ name: 'is_current', type: 'tinyint', default: 0 })
  is_current: number;

  @Column({ name: 'uploaded_by', nullable: true })
  uploaded_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_by_admin: AdminEntity;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploaded_at: Date;
}
