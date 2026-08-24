import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn } from 'typeorm';

export enum EdcMemberType {
  STUDENT = 'student',
  STAFF = 'staff',
  INSTRUCTOR = 'instructor'
}

export enum EdcVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

@Entity('edc_verifications')
export class EdcVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: 'student_id' })
  student_id: string;

  @Column({ type: "varchar", name: 'full_name' })
  full_name: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ 
    type: "enum", 
    enum: EdcMemberType, 
    default: EdcMemberType.STUDENT,
    name: 'member_type' 
  })
  member_type: EdcMemberType;

  @Column({ 
    type: "enum", 
    enum: EdcVerificationStatus, 
    default: EdcVerificationStatus.PENDING,
    name: 'verification_status' 
  })
  verification_status: EdcVerificationStatus;

  @Column({ type: "varchar", name: 'promo_code', nullable: true })
  promo_code: string;

  @Column({ type: "int", name: 'discount_percentage', nullable: true })
  discount_percentage: number;

  @Column({ type: "date", name: 'valid_until', nullable: true })
  valid_until: string;

  @Column({ type: "text", name: 'admin_notes', nullable: true })
  admin_notes: string;

  @Column({ type: "int", name: 'bookings_count', default: 0 })
  bookings_count: number;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @Column({ type: "datetime", name: 'verified_at', nullable: true })
  verified_at: Date;
}







