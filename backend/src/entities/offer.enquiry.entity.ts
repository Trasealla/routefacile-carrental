import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { Offer } from './offer.entity';
import { User } from './user.entity';

@Entity('offer_enquiries')
export class OfferEnquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, name: 'first_name' })
  first_name: string;

  @Column({ type: "varchar", length: 50, name: 'last_name' })
  last_name: string;

  @Column({ type: "varchar", length: 5, name: 'phone_code' })
  phone_code: string;

  @Column({ type: "varchar", length: 15, name: 'phone_number' })
  phone_number: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "text", name: 'address' })
  address: string;

  // Relationship columns Start

  @Column({ name: 'offer_id' })
  offer_id: number

  @ManyToOne(() => Offer, offer => offer.id)
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;

  @Column({ name: 'deleted_by', nullable: true })
  deleted_by: number

  @ManyToOne(() => AdminEntity, admin => admin.id)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by_admin: AdminEntity;

  // Relationship columns end

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deleted_at: Date;
}