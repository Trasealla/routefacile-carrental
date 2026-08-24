import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CarGroup } from './car.group.entity';

@Entity('monthly_km_plans')
export class MonthlyKMPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  km_1000: number;

  @Column()
  km_2000: number;

  @Column()
  km_3000: number;

  // Relationship columns start

  @Column({ name: 'group_id' })
  group_id: number

  @ManyToOne(() => CarGroup, group => group.id)
  @JoinColumn({ name: 'group_id' })
  group: CarGroup;

  // Relationship columns end
}