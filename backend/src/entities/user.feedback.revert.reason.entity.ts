import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { UserFeedback } from './user.feedback.entity';

@Entity('user_feedback_revert_reasons')
export class UserFeedbackRevertReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'name_en' })
  name_en: string;

  @Column({ type: "varchar", length: 50, name: 'name_ar' })
  name_ar: string;

  @Column({ type: "tinyint" })
  status: number;

  // Relationship columns Start

  @OneToMany(() => UserFeedback, feedback => feedback.overall_rating)
  user_feedbacks: UserFeedback[];

  @Column({ name: 'created_by', nullable: true })
  created_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}