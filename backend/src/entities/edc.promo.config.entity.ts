import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount'
}

@Entity('edc_promo_config')
export class EdcPromoConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'promo_code' })
  promo_code: string;

  @Column({ type: "enum", enum: DiscountType, default: DiscountType.PERCENTAGE, name: 'discount_type' })
  discount_type: DiscountType;

  @Column('float', { precision: 10, scale: 2, name: 'discount_percentage', default: 0 })
  discount_percentage: number;

  @Column('float', { precision: 10, scale: 2, name: 'fixed_discount_amount', default: 0 })
  fixed_discount_amount: number;

  @Column({ type: "boolean", name: 'is_active', default: true })
  is_active: boolean;

  @Column({ type: "datetime", name: 'valid_from' })
  valid_from: Date;

  @Column({ type: "datetime", name: 'valid_until' })
  valid_until: Date;

  @Column({ type: "int", name: 'max_uses', default: 0, comment: '0 = unlimited' })
  max_uses: number;

  @Column({ type: "int", name: 'max_uses_per_user', default: 0, comment: '0 = unlimited' })
  max_uses_per_user: number;

  @Column({ type: "int", name: 'current_uses', default: 0 })
  current_uses: number;

  @Column({ type: "int", name: 'min_rental_days', default: 1 })
  min_rental_days: number;

  @Column({ type: "json", name: 'applicable_vehicles', nullable: true })
  applicable_vehicles: string[];

  @Column({ type: "varchar", length: 500, name: 'description_en', nullable: true })
  description_en: string;

  @Column({ type: "varchar", length: 500, name: 'description_ar', nullable: true })
  description_ar: string;

  // Audit fields
  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;
}







