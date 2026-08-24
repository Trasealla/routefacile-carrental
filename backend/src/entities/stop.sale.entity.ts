import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';
import { Location } from './location.entity';

@Entity('stop_sales')
export class StopSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date", name: 'start_date' })
  start_date: string;

  @Column({ type: "date", name: 'end_date' })
  end_date: string;

  @Column({ name: 'city_id' })
  city_id: number

  @Column({ name: 'location_id', nullable: true })
  location_id: number

  @Column({ type: "json", nullable: true, name: 'car_ids' })
  car_ids: { all: true, ids: [] };

  @Column({ type: "tinyint" })
  status: number;

  // Relationship columns start

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => Location, location => location.id)
  @JoinColumn({ name: 'location_id' })
  location: City;

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