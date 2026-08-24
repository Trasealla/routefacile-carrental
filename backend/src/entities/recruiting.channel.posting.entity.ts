import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { CareerJob } from './career.job.entity';

@Entity('recruiting_channel_postings')
export class RecruitingChannelPosting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'career_job_id' })
  career_job_id!: number;

  @ManyToOne(() => CareerJob, job => job.id)
  @JoinColumn({ name: 'career_job_id' })
  career_job!: CareerJob;

  @Column({ type: 'varchar', length: 50, name: 'channel_name' })
  channel_name!: string;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'external_post_id' })
  external_post_id!: string;

  @Column({ type: 'varchar', length: 30, default: 'queued', name: 'posting_status' })
  posting_status!: string;

  @Column({ type: 'text', nullable: true, name: 'status_message' })
  status_message!: string;

  @Column({ type: 'datetime', nullable: true, name: 'last_synced_at' })
  last_synced_at!: Date;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  // Relationship columns start

  @Column({ name: 'created_by' })
  created_by!: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin!: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by!: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin!: AdminEntity;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by!: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin!: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at!: Date;
}
