import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, Index } from 'typeorm';

@Entity('memo_portal_otp')
@Index(['email', 'used'])
export class MemoPortalOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  /**
   * bcrypt hash of the 6-digit PIN. Plaintext is never stored.
   */
  @Column({ name: 'pin_hash', type: 'varchar', length: 255 })
  pin_hash: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expires_at: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  /**
   * 0 = active, 1 = consumed (success) or invalidated.
   */
  @Column({ type: 'tinyint', default: 0 })
  used: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
