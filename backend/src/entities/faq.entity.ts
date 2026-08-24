import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { FaqCategory } from './faq.category.entity';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: "question_en" })
  question_en: string;

  @Column({ type: "varchar", length: 255, name: "question_ar" })
  question_ar: string;

  @Column({ type: "longtext", name: "answer_en" })
  answer_en: string;

  @Column({ type: "longtext", name: "answer_ar" })
  answer_ar: string;

  @Column({ type: "tinyint" })
  status: number;

  // Relationship columns start

  @Column({ name: 'category_id' })
  category_id: number

  @ManyToOne(() => FaqCategory, faqCategory => faqCategory.id)
  @JoinColumn({ name: 'category_id' })
  category: FaqCategory;

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

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}