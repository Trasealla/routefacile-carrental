import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

/**
 * Small key/value store for runtime switches that admins need to flip without a
 * deploy. First use: `pay_now_enabled` — turned off until the CMI payment
 * gateway goes live, so customers only ever see "Pay Later".
 */
@Entity('app_settings')
export class AppSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'key_name', unique: true })
  key_name: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  /** shown to the public API — non-public settings stay admin-only */
  @Column({ type: 'tinyint', name: 'is_public', default: 1 })
  is_public: number;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, (admin) => admin.id, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: AdminEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
