import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UserDocumentSetTypes } from './enums/user.document.set.type';
import { UserDocumentTypes } from './enums/user.document.type';
import { UserDriver } from './user.driver.entity';

@Entity('user_driver_documents')
export class UserDriverDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, name: 'doc_number', nullable: true })
  doc_number: string;

  @Column({ type: "date", name: 'issue_date', nullable: true })
  issue_date: string;

  @Column({ type: "date", name: 'expiry_date', nullable: true })
  expiry_date: string;

  @Column({
    type: 'enum',
    enum: UserDocumentSetTypes,
    name: 'doc_set_type'
  })
  doc_set_type: string;

  @Column({
    type: 'enum',
    enum: UserDocumentTypes,
    name: 'doc_type'
  })
  doc_type: string;

  @Column({ type: "varchar", length: 255 , name: 'front_image' })
  front_image: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: 'back_image' })
  back_image: string;

  @Column({ name: 'user_driver_id' })
  user_driver_id: number

  @ManyToOne(() => UserDriver, (user_driver) => user_driver.id)
  @JoinColumn({ name: 'user_driver_id' })
  user_driver: UserDriver;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}