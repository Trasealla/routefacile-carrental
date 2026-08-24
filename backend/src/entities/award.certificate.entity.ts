import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { AwardCertificateTypes } from './enums/award.certificate.type';
import { Admin } from './admin.entity';

@Entity('awards_and_certificates')
export class AwardCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: AwardCertificateTypes, default: AwardCertificateTypes.AWARD })
  type: string;

  @Column({ type: "varchar", name: "title_en" })
  title_en: string;

  @Column({ type: "varchar", name: "title_ar" })
  title_ar: string;

  @Column({ type: "text", name: "description_en" })
  description_en: string;

  @Column({ type: "text", name: "description_ar" })
  description_ar: string;

  @Column({ type: "text", name: "link", nullable: true })
  link: string;

  @Column({ type: "varchar", name: "desktop" })
  desktop: string;

  @Column({ type: "varchar", name: "mobile" })
  mobile: string;

  @Column({ type: "varchar", name: "alt_text" })
  alt_text: string;

  @Column({ type: "tinyint" })
  status: number;

  // Relationship columns start
  @Column({ name: 'created_by', nullable: true })
  created_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: Admin;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: Admin;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => Admin, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: Admin;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}