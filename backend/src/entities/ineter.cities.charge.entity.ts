import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';

@Entity('ineter_cities_charges')
export class InterCityCharge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', name: 'charges', precision: 10, scale: 2 })
  charges: number;

  // Relationship columns start

  @Column({ name: 'pickup_city_id' })
  pickup_city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'pickup_city_id' })
  pickup_city: City;

  @Column({ name: 'dropoff_city_id' })
  dropoff_city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'dropoff_city_id' })
  dropoff_city: City;

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