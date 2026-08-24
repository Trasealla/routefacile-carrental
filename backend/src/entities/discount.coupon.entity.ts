import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { CouponTypes } from './enums/coupon.type';
import { CouponDiscountTypes } from './enums/coupon.discount.type';
import { CouponDiscountApplicableFor } from './enums/coupon.discount.applicable.for';

@Entity('discount_coupons')
export class DiscountCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: CouponTypes, default: CouponTypes.DAILY })
  type: CouponTypes;

  @Column({ name: "discount_type", type: "enum", enum: CouponDiscountTypes, default: CouponDiscountTypes.PERCENTAGE })
  discount_type: CouponDiscountTypes;

  @Column({ type: "json", name: 'applicable_for', nullable: true })
  applicable_for: string[];

  @Column()
  code: string;

  @Column({ type: "date", name: 'start_date' })
  start_date: string;

  @Column({ type: "date", name: 'end_date' })
  end_date: string;

  @Column('float', { precision: 10, scale: 2 })
  rate: number

  @Column('float', { precision: 10, scale: 2 })
  cdw: number

  @Column('float', { precision: 10, scale: 2 })
  scdw: number

  @Column('float', { precision: 10, scale: 2 })
  pai: number

  @Column('float', { precision: 10, scale: 2 })
  gps: number

  @Column('float', { precision: 10, scale: 2, name: 'baby_seat' })
  baby_seat: number

  @Column('float', { precision: 10, scale: 2 })
  driver: number

  @Column({ nullable: true })
  note: string;

  @Column({ type: "json", nullable: true, name: 'car_ids' })
  car_ids: { all: true, ids: [] };

  @Column({ type: "json", nullable: true, name: 'city_ids' })
  city_ids: { all: true, ids: [] };

  @Column({ type: "json", nullable: true, name: 'group_ids' })
  group_ids: { all: true, ids: [] };

  @Column({ type: "json", nullable: true, name: 'location_ids' })
  location_ids: { all: true, ids: [] };

  @Column({ type: "tinyint" })
  status: number;

  /**
   * Maximum number of times this coupon can be redeemed.
   * NULL = unlimited (legacy/regular coupons).
   * 1 = single-use coupon (becomes invalid after first booking).
   */
  @Column({ type: "int", nullable: true, name: 'usage_limit' })
  usage_limit: number;

  /**
   * Number of times this coupon has been redeemed (incremented on
   * successful booking confirmation).
   */
  @Column({ type: "int", default: 0, name: 'usage_count' })
  usage_count: number;

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