import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJob } from './career.job.entity';

@Entity('career_job_views')
export class CareerJobView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'career_job_id' })
  career_job_id: number;

  @ManyToOne(() => CareerJob, job => job.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'career_job_id' })
  career_job: CareerJob;

  @Column({ type: 'varchar', length: 60, nullable: true })
  utm_source: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  utm_medium: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  utm_campaign: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip_hash: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
