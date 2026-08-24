import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { Car } from './car.entity';

@Entity('rates_teacher')
export class RateTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { precision: 10, scale: 2 })
  rate: number

  // Relationships columns start

  @Column({ name: 'car_id' })
  car_id: number

  @ManyToOne(() => Car, (car) => car.id, { nullable: false })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ name: 'created_by' })
  created_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

}