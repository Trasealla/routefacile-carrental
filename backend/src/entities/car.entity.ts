import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { CarFuelType } from './car.fuel.type.entity';
import { CarCategory } from './car.category.entity';
import { CarBrand } from './car.brand.entity';
import { CarTransmission } from './car.transmission.entity';
import { CarTag } from './car.tag.entity';
import { CarGroup } from './car.group.entity';
import { Enquiry } from './enquiry.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'name_en' })
  name_en: string;

  @Column({ type: "varchar", length: 255, name: 'name_ar' })
  name_ar: string;

  @Column({ type: "text", name: 'description_en' })
  description_en: string;

  @Column({ type: "text", name: 'description_ar' })
  description_ar: string;

  @Column({ type: "date", name: 'availability_date', nullable: true })
  availability_date: string;

  @Column({ type: "varchar", length: 255 })
  image: string;

  @Column({ type: "varchar", length: 255, name: 'banner_image' })
  banner_image: string;

  @Column({ 
    type: "text",
    transformer: {
      to: (value: any) => (value ? JSON.stringify(value) : '[]'),
      from: (value: string) => {
        if (!value) return [];
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          // Handle corrupted data - wrap plain string in array
          return value ? [value] : [];
        }
      }
    }
  })
  images: string[];

  @Column({ type: "tinyint" })
  status: number;

  @Column({ type: "varchar", length: 10, name: 'doors_en' })
  doors_en: string;

  @Column({ type: "varchar", length: 10, name: 'doors_ar' })
  doors_ar: string;

  @Column({ type: "varchar", length: 10, name: 'passengers_en' })
  passengers_en: string;

  @Column({ type: "varchar", length: 10, name: 'passengers_ar' })
  passengers_ar: string;

  @Column({ type: "varchar", length: 10, name: 'suit_cases_en' })
  suit_cases_en: string;

  @Column({ type: "varchar", length: 10, name: 'suit_cases_ar' })
  suit_cases_ar: string;

  @Column({ type: "tinyint", name: 'air_bags' })
  air_bags: boolean;

  @Column({ type: "tinyint", name: 'parking_sensors', nullable: true })
  parking_sensors: boolean;

  @Column({ type: "tinyint", name: 'rear_camera' })
  rear_camera: boolean;

  @Column({ type: "tinyint", name: 'infotainment_system' })
  infotainment_system: boolean;

  @Column({ type: "tinyint" })
  bluetooth: boolean;

  @Column({ type: "tinyint" })
  sunroof: boolean;

  @Column({ type: "tinyint", name: 'cruise_control' })
  cruise_control: boolean;

  @Column({ type: "tinyint" })
  electric: boolean;

  @Column({ type: "tinyint", nullable: true })
  abs: boolean;

  @Column({ type: "tinyint", nullable: true })
  ac: boolean;

  @Column({ type: "tinyint", nullable: true })
  featured: boolean;

  // Special Rates Feature - show special image in selected cities
  // JSON format: { all: true } or { all: false, ids: [1, 2, 3] }
  // null = feature disabled, use default image everywhere
  @Column({ type: "json", name: 'special_rates_cities', nullable: true })
  special_rates_cities: { all: boolean, ids?: number[] };

  // Special image that replaces the main car image in selected cities
  @Column({ type: "varchar", length: 255, name: 'special_rates_image', nullable: true })
  special_rates_image: string;

  @Column({ type: "tinyint", nullable: true })
  fuel_avg: number;

  @Column({ type: "int", nullable: true })
  hp: number;

  @Column({ type: "int", nullable: true })
  year: number;

  // Relation Columns Start

  @Column({ name: 'group_id' })
  group_id: number

  @ManyToOne(() => CarGroup, (group) => group.id)
  @JoinColumn({ name: 'group_id' })
  group: CarGroup;

  @Column({ name: 'fuel_type_id' })
  fuel_type_id: number

  @ManyToOne(() => CarFuelType, (carFuelType) => carFuelType.id)
  @JoinColumn({ name: 'fuel_type_id' })
  fuel_type: CarFuelType;

  @Column({ name: 'category_id' })
  category_id: number

  @ManyToOne(() => CarCategory, (carCategory) => carCategory.id)
  @JoinColumn({ name: 'category_id' })
  category: CarCategory;

  @Column({ name: 'brand_id' })
  brand_id: number

  @ManyToOne(() => CarBrand, (carBrand) => carBrand.id)
  @JoinColumn({ name: 'brand_id' })
  brand: CarBrand;

  @Column({ name: 'tag_id', nullable: true })
  tag_id: number

  @ManyToOne(() => CarTag, (carTag) => carTag.id)
  @JoinColumn({ name: 'tag_id' })
  tag: CarTag;

  @Column({ name: 'transmission_id' })
  transmission_id: number

  @ManyToOne(() => CarTransmission, (carTransmission) => carTransmission.id)
  @JoinColumn({ name: 'transmission_id' })
  transmission: CarTransmission;

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

  @OneToMany(() => Enquiry, enquiry => enquiry.car)
  enquiries: Enquiry[]

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}
