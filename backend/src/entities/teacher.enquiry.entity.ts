import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { Car } from './car.entity';

@Entity('teacher_enquiries')
export class TeacherEnquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: 'name' })
  name: string;

  @Column({ type: "varchar", length: 5, name: 'phone_code' })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ name: 'car_id', nullable: true })
  car_id: number

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => Car, car => car.enquiries)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => City, city => city.enquiries)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: "tinyint" })
  duration: number;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "text", name: 'details', nullable: true })
  details: string;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

}