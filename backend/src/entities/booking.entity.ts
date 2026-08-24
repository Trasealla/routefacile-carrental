import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Location } from './location.entity';
import { BookingActions } from './enums/booking.action';
import { BookingTypes } from './enums/booking.type';
import { Car } from './car.entity';
import { CarGroup } from './car.group.entity';
import { PickupTypes } from './enums/pickup.type'
import { City } from './city.entity';
import { DropoffTypes } from './enums/dropoff.type'
import { PaymentTypes } from './enums/payment.type';
import { BookingSources } from './enums/booking.source';
import { Country } from './country.entity';
import { BookingMonthlyInstallment } from './booking.monthly.installment.entity';
import { Broker } from './broker.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  // Basic Details

  @Column({ type: 'enum', enum: BookingActions, default: BookingActions.BOOK })
  action: string

  @Column({ name: 'parent_id', nullable: true })
  parent_id: number

  @ManyToOne(() => Booking, booking => booking.id)
  @JoinColumn({ name: 'parent_id' })
  parent_booking: Booking;

  @Column({ name: 'booking_number' })
  booking_number: string

  @Column({ name: 'booking_log_number', unique: true })
  booking_log_number: string

  @Column({ type: 'enum', enum: BookingTypes, default: BookingTypes.DAILY })
  type: string

  @Column({ name: 'booking_days', nullable: true })
  booking_days: number

  @Column({ name: 'booking_months', nullable: true })
  booking_months: number

  @Column({ name: 'flexi_days', nullable: true })
  flexi_days: number

  @Column({ type: 'enum', name: 'payment_type', enum: PaymentTypes, default: PaymentTypes.PAY_LATER })
  payment_type: string

  @CreateDateColumn({ name: 'booking_date' })
  booking_date: Date;

  @Column({ type: 'enum', name: 'booking_source', enum: BookingSources, default: BookingSources.WEB })
  booking_source: string

  @Column({ name: 'broker_id', nullable: true })
  broker_id: number

  @ManyToOne(() => Broker, broker => broker.id)
  @JoinColumn({ name: 'broker_id' })
  broker: Broker;

  @Column({ name: 'broker_reference', nullable: true })
  broker_reference: string

  // Basic Details end


  // User Personal Details

  @Column({ name: 'user_first_name' })
  user_first_name: string

  @Column({ name: 'user_last_name' })
  user_last_name: string

  @Column({ name: 'user_email' })
  user_email: string

  @Column({ name: 'user_phone_code' })
  user_phone_code: string

  @Column({ name: 'user_phone_number' })
  user_phone_number: string

  @Column({ name: 'user_id' })
  user_id: number

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_country_id', nullable: true })
  user_country_id: number

  @ManyToOne(() => Country, country => country.id)
  @JoinColumn({ name: 'user_country_id' })
  user_country: Country;

  @Column({ name: 'user_ip' })
  user_ip: string

  // User Personal Details End

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

  @Column({ name: 'pickup_landmark', nullable: true })
  pickup_landmark: string

  @Column({ name: 'pickup_address', type: 'text', nullable: true })
  pickup_address: string

  @Column({ type: "json", name: 'pickup_coordinates', nullable: true })
  pickup_coordinates: string[];

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

  @Column({ name: 'dropoff_landmark', nullable: true })
  dropoff_landmark: string

  @Column({ name: 'dropoff_address', type: 'text', nullable: true })
  dropoff_address: string

  @Column({ type: "json", name: 'dropoff_coordinates', nullable: true })
  dropoff_coordinates: string[];

  // Dropoff details End

  @Column({ type: 'text', nullable: true })
  comments: string

  // Car details
  @Column({ name: 'car_id' })
  car_id: number

  @ManyToOne(() => Car, car => car.id)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ name: 'group_id' })
  group_id: number

  @ManyToOne(() => CarGroup, car => car.id)
  @JoinColumn({ name: 'group_id' })
  group: CarGroup;

  @Column({ type: "json", name: 'car_extras', nullable: true })
  car_extras: any[];

  // Car details end

  // Rates

  @Column({ name: 'car_rate_total', nullable: true, type: "decimal", precision: 10, scale: 2 })
  car_rate_total: number;

  @Column({ name: 'car_extras_rate_total', nullable: true, type: "decimal", precision: 10, scale: 2 })
  car_extras_rate_total: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  monthly_mileage: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  per_month_rate: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  flexi_days_rate: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  extra_kms_per_month: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  extra_kms_per_month_rate: number;

  @Column({ nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  extra_kms_total_rate: number;

  // Rates end

  // Coupon Discount Details

  @Column({ name: 'coupon_code', nullable: true })
  coupon_code: string;

  @Column({ type: "json", name: 'coupon_details', nullable: true })
  coupon_details: {};

  @Column({ name: 'coupon_discount_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  coupon_discount_amount: number;

  // Advance Booking Discount

  @Column({ name: 'advance_booking_days', nullable: true })
  advance_booking_days: number;

  @Column({ name: 'advance_booking_discount_percentage', nullable: true, type: "decimal", precision: 10, scale: 2 })
  advance_booking_discount_percentage: number;

  @Column({ name: 'advance_booking_discount_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  advance_booking_discount_amount: number;

  // Pay now and pay later amouns

  @Column({ name: 'pay_now_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  pay_now_amount: number;

  @Column({ name: 'pay_later_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  pay_later_amount: number;

  // Pay Now Discount

  @Column({ name: 'pay_now_discount_percentage', nullable: true, type: "decimal", precision: 10, scale: 2 })
  pay_now_discount_percentage: number;

  @Column({ name: 'pay_now_discount_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  pay_now_discount_amount: number;

  // Total Discount

  @Column({ name: 'discount_total', nullable: true, type: "decimal", precision: 10, scale: 2 })
  discount_total: number;

  // Surge

  @Column({ name: 'surge_percentage', nullable: true, type: "decimal", precision: 10, scale: 2 })
  surge_percentage: number;

  @Column({ name: 'surge_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  surge_amount: number;

  @Column({ type: "json", name: 'surge_details', nullable: true })
  surge_details: {};

  // Misc. Charges

  @Column({ name: 'inter_cities_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  inter_cities_charges: number;

  @Column({ name: 'pickup_parking_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  pickup_parking_charges: number;

  @Column({ name: 'dropoff_parking_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  dropoff_parking_charges: number;

  @Column({ name: 'vmd_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  vmd_charges: number;

  @Column({ name: 'delivery_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  delivery_charges: number;

  @Column({ name: 'collection_charges', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  collection_charges: number;

  @Column({ name: 'sub_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  sub_amount: number;

  @Column({ name: 'vat_percentage', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  vat_percentage: number;

  @Column({ name: 'vat_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  vat_amount: number;

  @Column({ name: 'previous_total_amount', nullable: true, default: 0, type: "decimal", precision: 10, scale: 2 })
  previous_total_amount: number;

  @Column({ name: 'total_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  total_amount: number;

  @Column({ name: 'actual_total_amount', nullable: true, type: "decimal", precision: 10, scale: 2 })
  actual_total_amount: number;

  @Column({ name: 'amount_message', nullable: true })
  amount_message: string;

  @Column({ name: 'payment_triggered', type: 'tinyint', default: 0 })
  payment_triggered: number;

  @Column({ name: 'payment_status', type: 'tinyint', default: 0 })
  payment_status: number;

  @Column({ nullable: true })
  payfort_id: string;

  @Column({ type: "json", nullable: true })
  payfort_response: {};

  // CMI (Morocco) — order id we sent for the current attempt + raw approved callback
  @Column({ name: 'cmi_oid', nullable: true })
  cmi_oid: string;

  @Column({ type: "json", name: 'cmi_response', nullable: true })
  cmi_response: {};

  @Column({ name: 'cancellation_charges', nullable: true, default: 0 })
  cancellation_charges: number;

  @Column({ name: 'cancellation_date_time', nullable: true })
  cancellation_date_time: Date;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellation_reason: string;

  @Column({ name: 'refund_amount', nullable: true, default: 0 })
  refund_amount: number;

  @Column({ name: 'refund_status', type: 'tinyint', nullable: true, default: 0 })
  refund_status: number;

  @Column({ type: 'json', nullable: true })
  user_request: {};

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  // relations
  @OneToMany(() => BookingMonthlyInstallment, installment => installment.booking)
  monthly_installments: BookingMonthlyInstallment[];

  @Column({ name: 'rate_query', type: 'text', nullable: true })
  rate_query: string

  @Column({ name: 'extra_rate_query', type: 'text', nullable: true })
  extra_rate_query: string

  @Column({ name: 'adjust_device_id', nullable: true })
  adjust_device_id: string
}