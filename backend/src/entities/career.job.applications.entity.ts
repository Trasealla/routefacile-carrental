import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CareerJob } from './career.job.entity';
import { Admin as AdminEntity } from './admin.entity';
import { CareerJobApplicationAttachment } from './career.job.application.attachments.entity';

@Entity('career_job_applications')
export class CareerJobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'first_name' })
  first_name: string;

  @Column({ type: "varchar", length: 50, name: 'last_name' })
  last_name: string;

  @Column({ type: "varchar", length: 5, name: 'phone_code' })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar", length: 62 })
  email: string;

  @Column({ type: "varchar" })
  cv: string;

  @Column({ type: "varchar", length: 120, name: 'current_location', nullable: true })
  current_location: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: 'expected_salary', nullable: true })
  expected_salary: number;

  @Column({ type: "int", name: 'notice_period_days', nullable: true })
  notice_period_days: number;

  @Column({ type: "varchar", length: 30, name: 'source_channel', default: 'routefacile' })
  source_channel: string;

  @Column({ type: "tinyint", default: 0 })
  status: number;

  @Column({ type: "text", nullable: true, name: 'admin_notes' })
  admin_notes: string;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true, name: 'ai_score' })
  ai_score: number;

  @Column({ type: "varchar", length: 20, nullable: true, name: 'ai_status' })
  ai_status: string;

  @Column({ type: "text", nullable: true, name: 'ai_match_summary' })
  ai_match_summary: string;

  @Column({ type: "datetime", nullable: true, name: 'ai_screened_at' })
  ai_screened_at: Date;

  // Relationship columns Start

  @Column({ name: 'career_job_id', nullable: true })
  career_job_id: number

  @ManyToOne(() => CareerJob, job => job.id)
  @JoinColumn({ name: 'career_job_id' })
  career_job: CareerJob;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewed_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by_admin: AdminEntity;

  @OneToMany(() => CareerJobApplicationAttachment, attachment => attachment.career_job_application)
  attachments: CareerJobApplicationAttachment[];

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;
}