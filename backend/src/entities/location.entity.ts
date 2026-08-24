import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';
import { LocationOpeningHour } from './location.opening.hour.entity';
import { LocationOpeningHourException } from './location.opening.hour.exception.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'name_en' })
  name_en: string;

  @Column({ type: "varchar", length: 255, name: 'name_ar' })
  name_ar: string;

  @Column({ type: "text", name: 'address_en' })
  address_en: string;

  @Column({ type: "text", name: 'address_ar' })
  address_ar: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "tinyint" })
  order: number;

  @Column({ type: "tinyint", name: 'buffer_hours' })
  buffer_hours: number;

  @Column({ type: "tinyint" })
  pickup: boolean;

  @Column({ type: "tinyint" })
  dropoff: boolean;

  @Column({ type: "tinyint", default: 0 })
  is_virtual: boolean;

  @Column({ type: "json" })
  recipients: [];

  @Column({ type: "varchar", length: 50 })
  lat: string;

  @Column({ type: "varchar", length: 50 })
  long: string;

  @Column({ type: "varchar", length: 255, name: 'contact_number' })
  contact_number: string;

  @Column({ type: "text", name: 'timing_detail_en' })
  timing_detail_en: string;

  @Column({ type: "text", name: 'timing_detail_ar' })
  timing_detail_ar: string;

  @Column({ type: "tinyint", default: 0, name: 'parking_charges' })
  parking_charges: number;

  // Relationship columns Start

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => LocationOpeningHour, locationOpeningHour => locationOpeningHour.location)
  location_opening_hours: LocationOpeningHour[]

  @OneToMany(() => LocationOpeningHourException, locationOpeningHourException => locationOpeningHourException.location)
  location_opening_hour_exceptions: LocationOpeningHourException[]

  @Column({ name: 'created_by' })
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