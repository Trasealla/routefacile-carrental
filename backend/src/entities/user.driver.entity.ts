import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Genders } from './enums/gender';
import { Country } from './country.entity';
import { City } from './city.entity';
import { User } from './user.entity';

@Entity('user_drivers')
export class UserDriver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  first_name: string;

  @Column({ type: "varchar", length: 50 })
  last_name: string;

  @Column({ type: "varchar", length: 62})
  email: string;

  @Column({
    type: "enum",
    enum: Genders,
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

  // Relationships

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, (country) => country.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: "smallint", name: 'country_id' })
  country_id: number;

  @ManyToOne(() => Country, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'city_id', nullable: true })
  city_id: number;

  @ManyToOne(() => City, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  // Relationships

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}