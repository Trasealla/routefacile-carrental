import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MemoPortalUserStatus {
  ACTIVE = 1,
  BLOCKED = 0,
}

@Entity('memo_portal_users')
export class MemoPortalUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ name: 'first_login_at', type: 'datetime', nullable: true })
  first_login_at: Date;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  last_login_at: Date;

  @Column({ type: 'tinyint', default: MemoPortalUserStatus.ACTIVE })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
