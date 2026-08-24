import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Admin, OneToMany, Geometry, Point } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { User } from './user.entity';
import { City } from './city.entity';


@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 62, unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

}