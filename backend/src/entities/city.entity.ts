import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { Enquiry } from './enquiry.entity';
import { UserFeedback } from './user.feedback.entity';
import { Location } from './location.entity';
import { CityOpeningHour } from './city.opening.hour.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'name_en' })
  name_en: string;

  @Column({ type: "varchar", length: 255, name: 'name_ar' })
  name_ar: string;

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "tinyint", name: 'buffer_hours' })
  buffer_hours: number;

  @Column({ type: "json" })
  recipients: [];

  @Column({ type: "varchar", length: 255, name: 'contact_number', nullable: true })
  contact_number: string;

  // Relationship columns start

  @OneToMany(() => CityOpeningHour, cityOpeningHour => cityOpeningHour.city)
  city_opening_hours: CityOpeningHour[]

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

  @OneToMany(() => Enquiry, enquiry => enquiry.city)
  enquiries: Enquiry[];

  @OneToMany(() => Location, location => location.city)
  locations: Location[];

  @OneToMany(() => UserFeedback, feedback => feedback.city)
  user_feedbacks: UserFeedback[];

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}