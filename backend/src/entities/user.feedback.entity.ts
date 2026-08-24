import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin as AdminEntity } from './admin.entity';
import { City } from './city.entity';
import { UserFeedbackSource } from './user.feedback.source.entity';
import { UserFeedbackService } from './user.feedback.service.entity';
import { UserFeedbackRating } from './user.feedback.rating.entity';
import { UserFeedbackOverallRating } from './user.feedback.overall.rating.entity';
import { UserFeedbackRevertReason } from './user.feedback.revert.reason.entity';
import { UserFeedbackServiceCategory } from './user.feedback.service.category.entity';

@Entity('user_feedbacks')
export class UserFeedback {
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

  @Column({ type: "varchar", length: 62 })
  email: string;

  @Column({ type: "text" })
  detail: string;

  // Relationship columns Start

  @Column({ name: 'city_id' })
  city_id: number

  @ManyToOne(() => City, city => city.enquiries)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'user_feedback_source_id' })
  user_feedback_source_id: number

  @ManyToOne(() => UserFeedbackSource, user_feedback_source => user_feedback_source.user_feedbacks)
  @JoinColumn({ name: 'user_feedback_source_id' })
  user_feedback_source: UserFeedbackSource;

  @Column({ name: 'user_feedback_service_id' })
  user_feedback_service_id: number

  @ManyToOne(() => UserFeedbackService, user_feedback_service => user_feedback_service.user_feedbacks)
  @JoinColumn({ name: 'user_feedback_service_id' })
  user_feedback_service: UserFeedbackService;

  @Column({ name: 'user_feedback_service_category_id' })
  user_feedback_service_category_id: number

  @ManyToOne(() => UserFeedbackServiceCategory, user_feedback_service_category => user_feedback_service_category.user_feedbacks)
  @JoinColumn({ name: 'user_feedback_service_category_id' })
  user_feedback_service_category: UserFeedbackServiceCategory;

  @Column({ name: 'product_knowledge_rating_id' })
  product_knowledge_rating_id: number

  @ManyToOne(() => UserFeedbackRating, product_knowledge_rating => product_knowledge_rating.user_feedbacks)
  @JoinColumn({ name: 'product_knowledge_rating_id' })
  product_knowledge_rating: UserFeedbackRating;

  @Column({ name: 'professionalism_rating_id' })
  professionalism_rating_id: number

  @ManyToOne(() => UserFeedbackRating, professionalism_rating => professionalism_rating.user_feedbacks)
  @JoinColumn({ name: 'professionalism_rating_id' })
  professionalism_rating: UserFeedbackRating;

  @Column({ name: 'friendliness_rating_id' })
  friendliness_rating_id: number

  @ManyToOne(() => UserFeedbackRating, friendliness_rating => friendliness_rating.user_feedbacks)
  @JoinColumn({ name: 'friendliness_rating_id' })
  friendliness_rating: UserFeedbackRating;

  @Column({ name: 'timely_response_rating_id' })
  timely_response_rating_id: number

  @ManyToOne(() => UserFeedbackRating, timely_response_rating => timely_response_rating.user_feedbacks)
  @JoinColumn({ name: 'timely_response_rating_id' })
  timely_response_rating: UserFeedbackRating;

  @Column({ name: 'reliability_rating_id' })
  reliability_rating_id: number

  @ManyToOne(() => UserFeedbackRating, reliability_rating => reliability_rating.user_feedbacks)
  @JoinColumn({ name: 'reliability_rating_id' })
  reliability_rating: UserFeedbackRating;

  @Column({ name: 'cleanliness_rating_id' })
  cleanliness_rating_id: number

  @ManyToOne(() => UserFeedbackRating, cleanliness_rating => cleanliness_rating.user_feedbacks)
  @JoinColumn({ name: 'cleanliness_rating_id' })
  cleanliness_rating: UserFeedbackRating;

  @Column({ name: 'overall_rating_id' })
  overall_rating_id: number

  @ManyToOne(() => UserFeedbackOverallRating, overall_rating => overall_rating.user_feedbacks)
  @JoinColumn({ name: 'overall_rating_id' })
  overall_rating: UserFeedbackOverallRating;

  @Column({ name: 'revert_reason_id' })
  revert_reason_id: number

  @ManyToOne(() => UserFeedbackRevertReason, revert_reason => revert_reason.user_feedbacks)
  @JoinColumn({ name: 'revert_reason_id' })
  revert_reason: UserFeedbackRevertReason;

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