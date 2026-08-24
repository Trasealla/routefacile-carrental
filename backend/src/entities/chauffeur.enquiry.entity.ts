import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn } from 'typeorm';

@Entity('chauffeur_enquiries')
export class ChauffeurEnquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: 'name' })
  name: string;

  @Column({ type: "varchar", length: 5, name: 'phone_code' })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar", name: 'car', nullable: true })
  car: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "text", name: 'details', nullable: true })
  details: string;

  @Column({ type: "varchar", name: 'service_type', nullable: true })
  service_type: string;

  @Column({ name: 'pickup_date_time', nullable: true })
  pickup_date_time: Date;

  @Column({ name: 'pickup_address', type: 'text', nullable: true })
  pickup_address: string

  @Column({ type: "json", name: 'pickup_coordinates', nullable: true })
  pickup_coordinates: string[];

  @Column({ name: 'dropoff_date_time', nullable: true })
  dropoff_date_time: Date;

  @Column({ name: 'dropoff_address', type: 'text', nullable: true })
  dropoff_address: string

  @Column({ type: "json", name: 'dropoff_coordinates', nullable: true })
  dropoff_coordinates: string[];

  @Column({ type: 'tinyint', nullable: true })
  passengers: number;

  @Column({ type: 'tinyint', nullable: true })
  luggage_bags: number;

  @Column({ type: "json", name: 'child_seats', nullable: true })
  child_seats: { infant: 0, toddler: 0, booster: 0 };

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

}