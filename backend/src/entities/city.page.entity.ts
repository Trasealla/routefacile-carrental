import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';

@Entity('city_pages')
export class CityPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'title_en' })
  title_en: string;

  @Column({ type: "varchar", length: 255, name: 'title_ar' })
  title_ar: string;

  @Column({ type: "longtext", name: 'content_en' })
  content_en: string;

  @Column({ type: "longtext", name: 'content_ar' })
  content_ar: string;

  @Column({ type: "varchar", length: 255 })
  image: string;

  @Column({ type: "varchar", length: 255 })
  type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_title: string;
  @Column({ type: "varchar", length: 255, nullable: true })
  seo_description: string;

  // @Column({ type: "json", nullable: true, name: 'seo_en' })
  // seo_en: { title: string, meta_description: string, keywords: string[] };

  // @Column({ type: "json", nullable: true, name: 'seo_ar' })
  // seo_ar: { title: string, meta_description: string, keywords: string[] };

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_ar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_ar: string;

  // Relationship columns start

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