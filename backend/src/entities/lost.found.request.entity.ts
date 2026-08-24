import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { User } from './user.entity';
import { City } from './city.entity';


@Entity('lost_found_requests')
export class LostFoundRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'first_name' })
  first_name: string;

  @Column({ type: "varchar", length: 50, name: 'last_name' })
  last_name: string;

  @Column({ type: "varchar", length: 5, name: 'phone_code' })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar", length: 62})
  email: string;

  @Column({ type: "text" })
  detail: string;

  @Column({ type: "varchar", name: 'reference_number' })
  reference_number: string;

  // Relationship columns Start

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'created_by', nullable: true })
  created_by: number

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}