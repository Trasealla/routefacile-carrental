import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Genders } from './enums/gender';
import { Country } from './country.entity';
import { City } from './city.entity';
import { UserDriver } from './user.driver.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  first_name: string;

  @Column({ type: "varchar", length: 50 })
  last_name: string;

  @Column({ type: "varchar", length: 62, unique: true })
  email: string;

  @Column()
  password: string;

  //temp
  @Column()
  password_org: string

  @Column({
    type: "enum",
    enum: Genders,
    nullable: true,
    default: null
  })
  gender: string;

  @Column({ type: "date", name: 'dob', nullable: true })
  dob: string;

  @Column({ type: "varchar", length: 4 })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar", length: 4, nullable: true })
  alt_phone_code: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  alt_phone_number: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "varchar", length: 255, name: 'house_number', nullable: true })
  house_number: string;

  @Column({ type: "varchar", length: 255, name: 'street_name', nullable: true })
  street_name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  state: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 255, name: 'zip_code', nullable: true })
  zip_code: string;

  @Column({ type: "timestamp", nullable: true, name: 'last_login_at' })
  public last_login_at: Date;

  @Column({ type: "varchar", length: 6, nullable: true })
  register_otp: string;

  @Column({ type: "smallint", name: 'country_id', nullable: true })
  country_id: number;

  @ManyToOne(() => Country, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'city_id', nullable: true })
  city_id: number;

  @ManyToOne(() => City, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city_detail: City;

  @OneToMany(() => UserDriver, drivers => drivers.user)
  drivers: UserDriver[]

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}