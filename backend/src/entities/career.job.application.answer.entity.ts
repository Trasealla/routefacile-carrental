import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJobApplication } from './career.job.applications.entity';
import { RecruitingQuestionnaire } from './recruiting.questionnaire.entity';

@Entity('career_job_application_answers')
export class CareerJobApplicationAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'career_job_application_id' })
  career_job_application_id: number;

  @ManyToOne(() => CareerJobApplication, app => app.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'career_job_application_id' })
  career_job_application: CareerJobApplication;

  @Column({ name: 'questionnaire_id' })
  questionnaire_id: number;

  @ManyToOne(() => RecruitingQuestionnaire, q => q.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: RecruitingQuestionnaire;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
