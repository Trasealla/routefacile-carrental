import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

export enum MemoAuditActorScope {
  ADMIN = 'admin',
  PORTAL = 'portal',
}

@Entity('memo_audit_log')
@Index(['entity_type', 'entity_id'])
export class MemoAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'actor_id', nullable: true })
  actor_id: number;

  /**
   * 'admin' = actor_id references admins.id
   * 'portal' = actor_id references memo_portal_users.id
   */
  @Column({ name: 'actor_scope', type: 'enum', enum: MemoAuditActorScope, default: MemoAuditActorScope.ADMIN })
  actor_scope: MemoAuditActorScope;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'actor_id' })
  actor: AdminEntity;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 80, nullable: true })
  entity_type: string;

  @Column({ name: 'entity_id', nullable: true })
  entity_id: number;

  @Column({ name: 'metadata_json', type: 'text', nullable: true })
  metadata_json: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
