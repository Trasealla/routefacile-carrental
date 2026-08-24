import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'title_en' })
  title_en: string;

  @Column({ type: "varchar", length: 255, name: 'title_ar' })
  title_ar: string;

  @Column({ type: "varchar", length: 255, name: 'title_fr' })
  title_fr: string;

  @Column({ type: "text", name: 'description_en' })
  description_en: string;

  @Column({ type: "text", name: 'description_ar' })
  description_ar: string;

  @Column({ type: "text", name: 'description_fr' })
  description_fr: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "tinyint", default: 0 })
  featured: number;

  @Column({ type: "date", name: 'start_date' })
  start_date: string;

  @Column({ type: "date", name: 'end_date' })
  end_date: string;

  @Column({ type: "varchar", length: 255, name: 'mobile' })
  mobile: string;

  @Column({ type: "varchar", length: 255, name: 'desktop' })
  desktop: string;

  @Column({ type: "varchar", length: 255, name: 'image_alt_text' })
  image_alt_text: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_ar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_ar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_fr: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_fr: string;

  // Relationship columns Start

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

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