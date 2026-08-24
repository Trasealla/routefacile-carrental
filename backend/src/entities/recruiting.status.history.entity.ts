import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJobApplication } from './career.job.applications.entity';
import { Admin as AdminEntity } from './admin.entity';

@Entity('recruiting_status_history')
export class RecruitingStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "tinyint", name: 'from_status' })
  from_status: number;

  @Column({ type: "tinyint", name: 'to_status' })
  to_status: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  // Relationship columns start

  @Column({ name: 'application_id' })
  application_id: number;

  @ManyToOne(() => CareerJobApplication, app => app.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: CareerJobApplication;

  @Column({ name: 'changed_by' })
  changed_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'changed_by' })
  changed_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}
