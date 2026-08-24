import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { CareerJob } from './career.job.entity';

@Entity('recruiting_screening_keywords')
export class RecruitingScreeningKeyword {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'career_job_id' })
  career_job_id!: number;

  @ManyToOne(() => CareerJob, job => job.id)
  @JoinColumn({ name: 'career_job_id' })
  career_job!: CareerJob;

  @Column({ type: 'varchar', length: 150, name: 'keyword' })
  keyword!: string;

  @Column({ type: 'varchar', length: 20, name: 'keyword_type', default: 'optional' })
  keyword_type!: string;

  @Column({ type: 'int', name: 'weight', default: 1 })
  weight!: number;

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
