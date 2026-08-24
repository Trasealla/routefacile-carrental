import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { MemoCategory } from './memo.category.entity';
import { MemoDocumentStatus } from './enums/memo.enums';

@Entity('memo_documents')
export class MemoDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id', nullable: true })
  category_id: number;

  @ManyToOne(() => MemoCategory, c => c.id)
  @JoinColumn({ name: 'category_id' })
  category: MemoCategory;

  @Column({ name: 'current_version_id', nullable: true })
  current_version_id: number;

  @Column({ type: 'enum', enum: MemoDocumentStatus, default: MemoDocumentStatus.DRAFT })
  status: MemoDocumentStatus;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  view_count: number;

  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
