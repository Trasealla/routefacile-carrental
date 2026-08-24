import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { AdminTypes } from './enums/admin.type';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: AdminTypes, default: AdminTypes.ADMIN, name: 'type' })
  type: string;

  @Column({ type: "varchar", name: "first_name", length: 50 })
  first_name: string;

  @Column({ type: "varchar", name: "last_name", length: 50 })
  last_name: string;

  @Column({ type: "varchar", length: 62, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "varchar", name: "country_code", length: 4 })
  country_code: string;

  @Column({ type: "varchar", name: "phone_number", length: 15 })
  phone_number: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "tinyint", name: "must_reset_password", default: 0 })
  must_reset_password: number;

  @Column({ type: "timestamp", name: "last_login_at", nullable: true })
  public last_login_at: Date;

  // Relationship columns start
  @Column({ name: 'created_by', nullable: true })
  created_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: Admin;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: Admin;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: Admin;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}