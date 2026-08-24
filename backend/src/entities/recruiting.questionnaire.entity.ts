import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { CareerJob } from './career.job.entity';

@Entity('recruiting_questionnaires')
export class RecruitingQuestionnaire {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'career_job_id' })
  career_job_id!: number;

  @ManyToOne(() => CareerJob, job => job.id)
  @JoinColumn({ name: 'career_job_id' })
  career_job!: CareerJob;

  @Column({ type: 'text', name: 'question_en' })
  question_en!: string;

  @Column({ type: 'text', name: 'question_ar', nullable: true })
  question_ar!: string;

  @Column({ type: 'varchar', length: 30, name: 'question_type', default: 'text' })
  question_type!: string;

  @Column({ type: 'text', name: 'options', nullable: true })
  options!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'help_text_en', nullable: true })
  help_text_en!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'help_text_ar', nullable: true })
  help_text_ar!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'placeholder_en', nullable: true })
  placeholder_en!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'placeholder_ar', nullable: true })
  placeholder_ar!: string | null;

  @Column({ type: 'int', name: 'min_value', nullable: true })
  min_value!: number | null;

  @Column({ type: 'int', name: 'max_value', nullable: true })
  max_value!: number | null;

  @Column({ type: 'varchar', length: 60, name: 'category', nullable: true })
  category!: string | null;

  @Column({ type: 'tinyint', name: 'is_required', default: 1 })
  is_required!: number;

  @Column({ type: 'int', name: 'display_order', default: 1 })
  display_order!: number;

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
