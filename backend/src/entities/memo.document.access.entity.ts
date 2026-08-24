import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { MemoDocument } from './memo.document.entity';
import { MemoAccessTargetType } from './enums/memo.enums';

@Entity('memo_document_access')
@Index(['document_id', 'target_type', 'target_value'])
export class MemoDocumentAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_id' })
  document_id: number;

  @ManyToOne(() => MemoDocument, d => d.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: MemoDocument;

  @Column({ name: 'target_type', type: 'enum', enum: MemoAccessTargetType })
  target_type: MemoAccessTargetType;

  /**
   * For target_type = ALL       -> NULL
   * For target_type = USER_TYPE -> admins.type value (e.g. 'hr_manager')
   * For target_type = USER      -> admins.id as string
   */
  @Column({ name: 'target_value', type: 'varchar', length: 100, nullable: true })
  target_value: string;

  @Column({ name: 'granted_by', nullable: true })
  granted_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'granted_by' })
  granted_by_admin: AdminEntity;

  @CreateDateColumn({ name: 'granted_at' })
  granted_at: Date;
}
