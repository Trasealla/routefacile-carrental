import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';

@Entity('edc_terms')
export class EdcTerm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 500, name: 'text_en' })
  text_en: string;

  @Column({ type: "varchar", length: 500, name: 'text_ar', nullable: true })
  text_ar: string;

  @Column({ type: "boolean", name: 'is_active', default: true })
  is_active: boolean;

  @Column({ type: "int", name: 'sort_order', default: 0 })
  sort_order: number;

  // Audit fields
  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'created_by' })
  created_by_admin: AdminEntity;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: number;

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by_admin: AdminEntity;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}







