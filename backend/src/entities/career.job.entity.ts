import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

@Entity('career_jobs')
export class CareerJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'title_en' })
  title_en: string;

  @Column({ type: "varchar", length: 50, name: 'title_ar' })
  title_ar: string;

  @Column({ type: "varchar", length: 180, name: 'slug', nullable: true })
  slug: string;

  @Column({ type: "varchar", length: 500, name: 'image_url', nullable: true })
  image_url: string;

  @Column({ type: "text", name: 'description_en' })
  description_en: string;

  @Column({ type: "text", name: 'description_ar' })
  description_ar: string;

  @Column({ type: "date", name: 'expiry_date' })
  expiry_date: string;

  @Column({ type: "varchar", length: 50, name: 'location_en' })
  location_en: string;

  @Column({ type: "varchar", length: 50, name: 'location_ar' })
  location_ar: string;

  @Column({ name: 'experience_years' })
  experience_years: number;

  @Column({ type: "tinyint" })
  status: number;

  // Relationship columns start

  @Column({ name: 'created_by' })
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