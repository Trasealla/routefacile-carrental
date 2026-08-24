import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJobApplication } from './career.job.applications.entity';

@Entity('career_job_application_attachments')
export class CareerJobApplicationAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'file_name' })
  file_name: string;

  @Column({ type: "varchar", length: 255, name: 'original_name' })
  original_name: string;

  @Column({ type: "varchar", length: 50, name: 'file_type' })
  file_type: string;

  @Column({ name: 'file_size' })
  file_size: number;

  // Relationship columns Start

  @Column({ name: 'career_job_application_id' })
  career_job_application_id: number;

  @ManyToOne(() => CareerJobApplication, application => application.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'career_job_application_id' })
  career_job_application: CareerJobApplication;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}
