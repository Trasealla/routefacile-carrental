import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { DayTypes } from './enums/day.type';
import { City } from './city.entity';
import { CarGroup } from './car.group.entity';
import { Car } from './car.entity';
import { RateDailyFile } from './rate.daily.file.entity';

@Entity('rates_daily')
export class RateDaily {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "enum", enum: DayTypes, name: 'day_type' })
  day_type: DayTypes;

  @Column('float', { precision: 10, scale: 2 })
  rate: number

  @Column('float', { precision: 10, scale: 2, nullable: true })
  cdw: number

  @Column('float', { precision: 10, scale: 2, nullable: true })
  scdw: number

  @Column('float', { precision: 10, scale: 2, nullable: true })
  pai: number

  @Column('float', { precision: 10, scale: 2, nullable: true })
  gps: number

  @Column('float', { precision: 10, scale: 2, name: 'baby_seat', nullable: true })
  baby_seat: number

  @Column('float', { precision: 10, scale: 2, nullable: true })
  driver: number

  // Relationships columns start

  @Column({ name: 'car_id' })
  car_id: number

  @ManyToOne(() => Car, (car) => car.id, { nullable: false })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, (city) => city.id, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'group_id' })
  group_id: number

  @ManyToOne(() => CarGroup, (carGroup) => carGroup.id, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  car_group: CarGroup;

  @Column({ name: 'file_id' })
  file_id: number

  @ManyToOne(() => RateDailyFile, (rateDailyFile) => rateDailyFile.id, { nullable: false })
  @JoinColumn({ name: 'file_id' })
  rate_daily_file: RateDailyFile;

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

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

}