import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

import { Booking } from './booking.entity';

@Entity('booking_payment_transactions')
export class BookingPaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  merchant_reference: string;

  @Column({ type: "json" })
  payload: {};

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