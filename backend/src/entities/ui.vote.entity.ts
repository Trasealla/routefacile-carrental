import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn } from 'typeorm';

export enum UIVoteChoice {
  FIRST = 'first',
  SECOND = 'second'
}

@Entity('ui_votes')
export class UIVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, name: 'username' })
  username: string;

  @Column({ type: "varchar", length: 20, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar", length: 100 })
  email: string;

  @Column({ type: "enum", enum: UIVoteChoice })
  choice: UIVoteChoice;

  @Column({ type: "varchar", length: 255, name: 'reason' })
  reason: string;
  

  @Column({ type: "tinyint", name: 'status', default: 1 })
  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}

