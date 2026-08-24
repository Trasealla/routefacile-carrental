import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Location } from './location.entity';
import { BookingTypes } from './enums/booking.type';
import { PickupTypes } from './enums/pickup.type'
import { City } from './city.entity';
import { DropoffTypes } from './enums/dropoff.type'
import { BookingSources } from './enums/booking.source';

@Entity('booking_form_submissions')
export class BookingFormSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BookingTypes, default: BookingTypes.DAILY })
  type: string

  @Column({ name: 'booking_months', nullable: true })
  booking_months: number

  @Column({ type: 'enum', name: 'booking_source', enum: BookingSources, default: BookingSources.WEB })
  booking_source: BookingSources

  @Column({ name: 'form_submit', nullable: true })
  form_submit: number

  // Pickup details

  @Column({ type: 'enum', name: 'pickup_type', enum: PickupTypes, default: PickupTypes.SELF })
  pickup_type: string

  @Column({ name: 'pickup_location_id', nullable: true })
  pickup_location_id: number

  @ManyToOne(() => Location, location => location.id)
  @JoinColumn({ name: 'pickup_location_id' })
  pickup_location: Location;

  @Column({ name: 'pickup_city_id', nullable: true })
  pickup_city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'pickup_city_id' })
  pickup_city: City;

  @Column({ name: 'pickup_date_time' })
  pickup_date_time: Date;

  // Pickup details End

  // Dropoff details

  @Column({ type: 'enum', name: 'dropoff_type', enum: DropoffTypes, default: DropoffTypes.SELF })
  dropoff_type: string

  @Column({ name: 'dropoff_location_id', nullable: true })
  dropoff_location_id: number

  @ManyToOne(() => Location, location => location.id)
  @JoinColumn({ name: 'dropoff_location_id' })
  dropoff_location: Location;

  @Column({ name: 'dropoff_city_id', nullable: true })
  dropoff_city_id: number

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'dropoff_city_id' })
  dropoff_city: City;

  @Column({ name: 'dropoff_date_time' })
  dropoff_date_time: Date;

  // Dropoff details End

  @Column({ name: 'coupon_code', nullable: true })
  coupon_code: string;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;
}