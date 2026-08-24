import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';

@Entity('promo_tickers')
export class PromoTicker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", name: 'text_en' })
  text_en: string;

  @Column({ type: "text", name: 'text_ar' })
  text_ar: string;

  @Column({ type: "text", name: 'description_en', nullable: true })
  description_en: string;

  @Column({ type: "text", name: 'description_ar', nullable: true })
  description_ar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  link: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @Column({ type: "int", default: 0 })
  sort_order: number;

  @Column({ type: "int", name: 'scroll_speed', default: 20 })
  scroll_speed: number;

  @Column({ type: "date", name: 'start_date' })
  start_date: string;

  @Column({ type: "date", name: 'end_date' })
  end_date: string;

  // Relationship columns Start

  @Column({ name: 'created_by' })
  created_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: Admin;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: Admin;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: Admin;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}





