import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJobApplication } from './career.job.applications.entity';
import { Admin as AdminEntity } from './admin.entity';

@Entity('recruiting_interviews')
export class RecruitingInterview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "datetime", name: 'interview_date' })
  interview_date: Date;

  @Column({ type: "varchar", length: 255, nullable: true, name: 'location' })
  location: string;

  @Column({ type: "varchar", length: 50, name: 'interview_type' })
  interview_type: string; // in-person, phone, video

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "tinyint", default: 0 })
  status: number;

  @Column({ type: "text", nullable: true })
  feedback: string;

  @Column({ type: "tinyint", nullable: true })
  rating: number; // 1-5

  // Relationship columns start

  @Column({ name: 'application_id' })
  application_id: number;

  @ManyToOne(() => CareerJobApplication, app => app.id)
  @JoinColumn({ name: 'application_id' })
  application: CareerJobApplication;

  @Column({ name: 'interviewer_id' })
  interviewer_id: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'interviewer_id' })
  interviewer: AdminEntity;

  @Column({ name: 'created_by' })
  created_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}
