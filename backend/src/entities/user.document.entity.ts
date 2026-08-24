import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UserDocumentTypes } from './enums/user.document.type';

@Entity('user_documents')
export class UserDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserDocumentTypes,
    name: 'doc_type'
  })
  doc_type: string;

  @Column({ type: "varchar", length: 255, name: 'front_image' })
  front_image: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: 'back_image' })
  back_image: string;

  @Column({ name: 'user_id' })
  user_id: number

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}