import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

/**
 * Singleton CMS row (id = 1) that powers the Teachers Rental page
 * (route: /:lang/teachers-rental).
 *
 * - Plain string columns are bilingual (`_en` / `_ar`).
 * - Repeating / nested sections (perks, stats, benefits, eligibility items,
 *   notes, referral, fleet header, enquiry form, etc.) are stored as JSON
 *   so the admin portal can edit them as structured arrays without schema
 *   changes.
 */
@Entity('teachers_pages')
export class TeachersPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  // ---------------------------------------------------------------------------
  // 3.1 SEO BLOCK
  // ---------------------------------------------------------------------------
  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title_en: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_meta_tags_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_meta_tags_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_meta_description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_meta_description_ar: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_image: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonical_url: string;

  // ---------------------------------------------------------------------------
  // 3.2 HERO SECTION
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   badge_text, badge_icon,
   *   title_line_1, title_line_2,
   *   description,
   *   cta_primary:   { label, link, icon },
   *   cta_secondary: { label, link, icon }
   * }
   */
  @Column({ type: 'json', nullable: true })
  hero_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  hero_ar: Record<string, any>;

  /** Image filename stored in /uploads/admin/teachers_page/ */
  @Column({ type: 'varchar', length: 255, nullable: true })
  hero_background_image: string;

  // ---------------------------------------------------------------------------
  // 3.3 HERO FLOATING PRICE CARD
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   title, from_label, starting_price, currency, unit,
   *   perks: [{ icon, text }, ...]
   * }
   */
  @Column({ type: 'json', nullable: true })
  hero_price_card_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  hero_price_card_ar: Record<string, any>;

  // ---------------------------------------------------------------------------
  // 3.4 STATS STRIP
  // ---------------------------------------------------------------------------
  /** Array of { value, suffix, label } */
  @Column({ type: 'json', nullable: true })
  stats_en: any[];

  @Column({ type: 'json', nullable: true })
  stats_ar: any[];

  // ---------------------------------------------------------------------------
  // 3.5 BENEFITS SECTION
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   eyebrow, title, subtitle,
   *   items: [{ icon, title, description }, ...]
   * }
   */
  @Column({ type: 'json', nullable: true })
  benefits_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  benefits_ar: Record<string, any>;

  // ---------------------------------------------------------------------------
  // 3.6 ELIGIBILITY SECTION
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   eyebrow, title, subtitle,
   *   items: [{ icon, title, description }, ...],
   *   notes: [string, ...]
   * }
   */
  @Column({ type: 'json', nullable: true })
  eligibility_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  eligibility_ar: Record<string, any>;

  /** ISO date string (e.g. 2026-01-31) - allows notes to auto-expire on the FE. */
  @Column({ type: 'date', nullable: true })
  promotion_end_date: Date;

  // ---------------------------------------------------------------------------
  // 3.7 REFERRAL CTA
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   title, description, amount, currency, amount_label,
   *   minimum_rental_months
   * }
   */
  @Column({ type: 'json', nullable: true })
  referral_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  referral_ar: Record<string, any>;

  // ---------------------------------------------------------------------------
  // 3.8 FLEET SECTION HEADER
  // ---------------------------------------------------------------------------
  /** { eyebrow, title, subtitle } */
  @Column({ type: 'json', nullable: true })
  fleet_section_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  fleet_section_ar: Record<string, any>;

  // ---------------------------------------------------------------------------
  // 3.9 CLOSING QUOTE
  // ---------------------------------------------------------------------------
  @Column({ type: 'text', nullable: true })
  closing_quote_en: string;

  @Column({ type: 'text', nullable: true })
  closing_quote_ar: string;

  // ---------------------------------------------------------------------------
  // 5. ENQUIRY FORM
  // ---------------------------------------------------------------------------
  /**
   * Shape:
   * {
   *   title, success_message, error_message,
   *   duration_options: [1, 3, 6, 9],
   *   required_fields: ["name", "phone", "email", "city_id"]
   * }
   */
  @Column({ type: 'json', nullable: true })
  enquiry_form_en: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  enquiry_form_ar: Record<string, any>;

  // ---------------------------------------------------------------------------
  // Audit
  // ---------------------------------------------------------------------------
  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @ManyToOne(() => AdminEntity, (admin) => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, (admin) => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number;

  @ManyToOne(() => AdminEntity, (admin) => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: AdminEntity;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}
