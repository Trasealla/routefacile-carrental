import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { MemoDocument } from './memo.document.entity';

@Entity('memo_document_views')
@Index(['document_id', 'user_id'])
export class MemoDocumentView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_id' })
  document_id: number;

  @ManyToOne(() => MemoDocument, d => d.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: MemoDocument;

  @Column({ name: 'version_id', nullable: true })
  version_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'user_id' })
  user: AdminEntity;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewed_at: Date;
}
