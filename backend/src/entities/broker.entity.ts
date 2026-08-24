import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

@Entity('brokers')
export class Broker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  username: string;

  @Column({ type: "varchar", length: 255, name: 'password_hash' })
  password_hash: string;

  @Column({ type: "varchar", length: 255, name: 'contact_email', nullable: true })
  contact_email: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  // Relationship columns start

  @Column({ name: 'created_by', nullable: true })
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
