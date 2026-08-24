import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

@Entity('recruiting_departments')
export class RecruitingDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, name: 'name_en' })
  name_en: string;

  @Column({ type: "varchar", length: 100, name: 'name_ar' })
  name_ar: string;

  @Column({ type: "text", nullable: true, name: 'description_en' })
  description_en: string;

  @Column({ type: "text", nullable: true, name: 'description_ar' })
  description_ar: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  // Relationship columns start

  @Column({ name: 'created_by' })
  created_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number;

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
