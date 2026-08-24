import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { BlogTypes } from './enums/blog.type';
import { BlogCategory } from './blog.category.entity';
import { BlogTag } from './blog.tag.entity';
import { City } from './city.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: BlogTypes })
  type: BlogTypes;

  /* ── Content-engine fields ──────────────────────────────────────────────
     Populated by the SearchAtlas webhook (see cms/article-webhook). `slug` and
     `external_id` are unique: the slug owns the public URL, and `external_id`
     is what makes a re-delivered webhook update the existing row instead of
     inserting a duplicate. Nullable because the 25 legacy posts predate them. */
  @Column({ type: "varchar", length: 255, nullable: true })
  slug: string;

  @Column({ type: "varchar", length: 100, nullable: true, name: "external_id" })
  external_id: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  source: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "canonical_url" })
  canonical_url: string;

  /* Article + FAQPage JSON-LD exactly as the engine produced it. Stored rather
     than regenerated so the markup Google reads is the markup the SEO routine
     intended. */
  @Column({ type: "longtext", nullable: true, name: "schema_json" })
  schema_json: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "image_alt" })
  image_alt: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "image_caption" })
  image_caption: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "excerpt_en" })
  excerpt_en: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "excerpt_ar" })
  excerpt_ar: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "excerpt_fr" })
  excerpt_fr: string;

  @Column({ type: "varchar", length: 255, name: "title_en" })
  title_en: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "title_fr" })
  title_fr: string;

  @Column({ type: "varchar", length: 255, name: "title_ar" })
  title_ar: string;

  @Column({ type: "varchar", nullable: true })
  author: string;

  @Column({ type: "date", nullable: true })
  publish_date: string;

  @Column({ type: "longtext", name: "description_en" })
  description_en: string;

  @Column({ type: "longtext", nullable: true, name: "description_fr" })
  description_fr: string;

  @Column({ type: "longtext", name: "description_ar" })
  description_ar: string;

  // Nullable: the content-engine webhook can create a row with no featured
  // image (the payload's media block is optional).
  @Column({ type: "varchar", length: 255, nullable: true })
  image: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "tinyint", default: 0 })
  featured: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_en: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_tags_ar: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "seo_meta_tags_fr" })
  seo_meta_tags_fr: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "seo_meta_description_fr" })
  seo_meta_description_fr: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  seo_meta_description_ar: string;

  // Relationship columns start

  @ManyToMany(() => BlogCategory)
  @JoinTable({
    name: 'blog_category_mappings',
    joinColumn: {
      name: 'blog_id'
    },
    inverseJoinColumn: {
      name: 'blog_category_id'
    }
  })
  categories: BlogCategory[];

  @ManyToMany(() => BlogTag)
  @JoinTable({
    name: 'blog_tag_mappings',
    joinColumn: {
      name: 'blog_id'
    },
    inverseJoinColumn: {
      name: 'blog_tag_id'
    }
  })
  tags: BlogTag[];

  @Column({ name: 'city_id', nullable: true })
  city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  // Nullable: a webhook-created row has no admin author — see
  // cms/article-webhook for why that is left NULL rather than attributed.
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