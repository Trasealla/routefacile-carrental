import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

import { Booking } from './booking.entity';

@Entity('booking_monthly_installments')
export class BookingMonthlyInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: 'installment_no' })
  installment_no: number;

  @Column({ type: "date", name: 'due_date' })
  due_date: string;

  @Column({ name: 'sub_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  sub_amount: number;

  @Column({ name: 'vat_percentage', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  vat_percentage: number;

  @Column({ name: 'vat_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  vat_amount: number;

  @Column({ name: 'actual_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  actual_amount: number;

  @Column({ name: 'total_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  total_amount: number;

  @Column({ name: 'previous_total_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  previous_total_amount: number;

  @Column({ name: 'refund_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  refund_amount: number;

  @Column({ name: 'amount_message', nullable: true, type: "varchar" })
  amount_message: string;

  @Column({name: 'details', nullable: true, type: 'json'})
  details: {}

  // Relationship columns start

  @Column({ name: 'booking_id' })
  booking_id: number

  @ManyToOne(() => Booking, booking => booking.id)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}