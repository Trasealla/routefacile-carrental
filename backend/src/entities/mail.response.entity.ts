import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn } from 'typeorm';

@Entity('mail_responses')
export class MailResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  reference_number: number;

  @Column({ type: 'varchar' })
  to: string;

  @Column({type: "json"})
  cc: string[];

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'longtext' })
  template: string;

  @Column({ type: 'tinyint' })
  status: number;

  @Column({ type: 'text' })
  response: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
