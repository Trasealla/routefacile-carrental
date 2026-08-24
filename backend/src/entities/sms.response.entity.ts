import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn } from 'typeorm';

@Entity('sms_responses')
export class SmsResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  reference_number: number;

  @Column({ type: 'varchar' })
  to: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint' })
  status: number;

  @Column({ type: 'text' })
  response: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
