import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';
import { EnquiryTypes } from './enums/enquiry.type';
import { EnquiryDurations } from './enums/enquiry.duration';
import { Car } from './car.entity';

@Entity('enquiries')
export class Enquiry {
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

  @Column({ type: "varchar", length: 62 })
  email: string;

  @Column({ type: "enum", enum: EnquiryTypes, default: EnquiryTypes.CORPORATE })
  type: EnquiryTypes;

  @Column({ type: "enum", enum: EnquiryDurations, default: EnquiryDurations.DAILY })
  duration: EnquiryDurations;

  @Column({ type: "text" })
  detail: string;

  // Relationship columns Start

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, city => city.enquiries)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'car_id', nullable: true })
  car_id: number

  @ManyToOne(() => Car, car => car.enquiries)
  @JoinColumn({ name: 'car_id' })
  car: Car;

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