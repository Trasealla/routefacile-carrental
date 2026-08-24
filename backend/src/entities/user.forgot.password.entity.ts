import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_forgot_passwords')
export class UserForgotPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 6 })
  otp: string;

  @Column({ type: 'datetime', name: 'otp_expiry' })
  otp_expiry: string;

  @Column({ type: 'tinyint' })
  status: number

  @Column({ name: 'user_id' })
  user_id: number

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

}