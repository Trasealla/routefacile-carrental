import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CareerJobApplication } from './career.job.applications.entity';
import { Admin as AdminEntity } from './admin.entity';

@Entity('recruiting_application_ratings')
export class RecruitingApplicationRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "tinyint" })
  rating: number; // 1-5

  @Column({ type: "text", nullable: true })
  comments: string;

  // Relationship columns start

  @Column({ name: 'application_id' })
  application_id: number;

  @ManyToOne(() => CareerJobApplication, app => app.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: CareerJobApplication;

  @Column({ name: 'rated_by' })
  rated_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'rated_by' })
  rated_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;
}
