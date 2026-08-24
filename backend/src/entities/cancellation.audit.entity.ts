import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity('cancellation_audits')
export class CancellationAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'booking_id' })
  booking_id: number;

  @ManyToOne(() => Booking, (booking) => booking.id)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  /**
   * UAE business date (Asia/Dubai, UTC+4) at the time of cancellation.
   * Stored as 'YYYY-MM-DD' string for easy daily-limit queries.
   */
  @Column({ name: 'uae_business_date', type: 'date' })
  uae_business_date: string;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellation_reason: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
