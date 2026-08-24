import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';
import { CarGroup } from './car.group.entity';
import { RateRangeFile } from './rate.range.file.entity';
import { Location } from './location.entity';

@Entity('rates_range')
export class RateRange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: number;

  @Column()
  to: number;

  @Column({ type: "date", name: 'start_date' })
  start_date: string;

  @Column({ type: "date", name: 'end_date' })
  end_date: string;

  @Column('float', { precision: 10, scale: 2 })
  rate: number

  // Relationships columns start

  @Column({ name: 'location_id', nullable: true, default: null })
  location_id: number

  @ManyToOne(() => Location, (location) => location.id)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'group_id' })
  group_id: number

  @ManyToOne(() => CarGroup, (carGroup) => carGroup.id)
  @JoinColumn({ name: 'group_id' })
  car_group: CarGroup;

  @Column({ name: 'file_id' })
  file_id: number

  @ManyToOne(() => RateRangeFile, (rateRangeFile) => rateRangeFile.id, { nullable: false })
  @JoinColumn({ name: 'file_id' })
  rate_range_file: RateRangeFile;

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