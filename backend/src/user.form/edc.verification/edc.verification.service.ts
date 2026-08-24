import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EdcVerification, EdcVerificationStatus, EdcMemberType } from 'src/entities/edc.verification.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';
import { EdcVerificationDto } from './edc.verification.dto';

// EDC Promo Code Configuration
export const EDC_PROMO_CONFIG = {
    code: 'EDCVIP2025',
    discount_percentage: 15,
    valid_until: '2026-12-31',
    valid_from: '2025-01-01'
};

// Demo roster for the EDC verification flow.
//
// This used to hold the real names and work email addresses of eight staff at
// the previous owner's group. That is other people's personal data sitting in
// source control for a feature Route Facile does not operate, so the named
// entries are gone. The generic IDs below keep the flow testable.
export const TEST_EDC_MEMBERS = [
    { student_id: 'TEST123', full_name: null, email: null, member_type: EdcMemberType.STUDENT },
    { student_id: 'DEMO456', full_name: null, email: null, member_type: EdcMemberType.STUDENT },
    { student_id: '1234', full_name: null, email: null, member_type: EdcMemberType.STUDENT },
];

@Injectable()
export class EdcVerificationService extends BaseService<EdcVerification> {
    constructor(
        @InjectRepository(EdcVerification) private edcVerificationRepository: Repository<EdcVerification>
    ) {
        super(edcVerificationRepository)
    }

    /**
     * Verify an EDC member and store their verification record
     * 
     * Currently uses simulated verification (auto-approve).
     * Can be extended to integrate with EDC database for real-time verification.
     * 
     * @param dto - Verification request data
     * @returns Verification result with promo code if verified
     */
    async verifyEdcMember(dto: EdcVerificationDto): Promise<{
        status: string;
        verified: boolean;
        data?: {
            promo_code: string;
            discount_percentage: number;
            valid_until: string;
            member_type: string;
            verification_id: number;
        };
        message?: string;
    }> {
        // Check if member is already verified
        const existingVerification = await this.getOne({ 
            student_id: dto.student_id,
            verification_status: EdcVerificationStatus.VERIFIED
        });

        if (existingVerification) {
            // Return existing verification data
            return {
                status: 'success',
                verified: true,
                data: {
                    promo_code: existingVerification.promo_code || EDC_PROMO_CONFIG.code,
                    discount_percentage: existingVerification.discount_percentage || EDC_PROMO_CONFIG.discount_percentage,
                    valid_until: existingVerification.valid_until || EDC_PROMO_CONFIG.valid_until,
                    member_type: existingVerification.member_type,
                    verification_id: existingVerification.id
                }
            };
        }

        // Validate EDC ID format (basic validation - customize as needed)
        if (!this.isValidEdcId(dto.student_id)) {
            return {
                status: 'error',
                verified: false,
                message: 'Invalid EDC ID format. Please enter a valid EDC Student/Staff ID.'
            };
        }

        /**
         * REAL-TIME VERIFICATION PLACEHOLDER
         * 
         * If you have access to EDC's database/API, implement the verification here:
         * 
         * const edcApiResponse = await this.checkEdcDatabase(dto);
         * if (!edcApiResponse.isValid) {
         *     return { status: 'error', verified: false, message: 'ID not found in EDC records' };
         * }
         * 
         * For now, we use simulated verification (auto-approve with stored records)
         */

        // Create verification record
        const verification = new EdcVerification();
        verification.student_id = dto.student_id;
        verification.full_name = dto.full_name;
        verification.email = dto.email;
        verification.member_type = dto.member_type || EdcMemberType.STUDENT;
        verification.promo_code = EDC_PROMO_CONFIG.code;
        verification.discount_percentage = EDC_PROMO_CONFIG.discount_percentage;
        verification.valid_until = EDC_PROMO_CONFIG.valid_until;
        
        // Auto-verify for now (can be changed to PENDING for manual verification)
        verification.verification_status = EdcVerificationStatus.VERIFIED;
        verification.verified_at = new Date();

        const insertResult = await this.insert(verification);

        if (insertResult.status !== 'success') {
            return {
                status: 'error',
                verified: false,
                message: 'Failed to process verification. Please try again.'
            };
        }

        return {
            status: 'success',
            verified: true,
            data: {
                promo_code: EDC_PROMO_CONFIG.code,
                discount_percentage: EDC_PROMO_CONFIG.discount_percentage,
                valid_until: EDC_PROMO_CONFIG.valid_until + 'T23:59:59Z',
                member_type: verification.member_type,
                verification_id: insertResult.response.identifiers[0]?.id
            }
        };
    }

    /**
     * Basic EDC ID format validation
     * Customize this based on actual EDC ID format requirements
     */
    private isValidEdcId(studentId: string): boolean {
        // Allow various formats - customize as needed
        // Examples: EDC12345, 12345, S12345, etc.
        if (!studentId || studentId.trim().length < 3) {
            return false;
        }
        
        // Remove common prefixes for validation
        const cleanId = studentId.toUpperCase().replace(/^(EDC|S|STF|INS)/, '');
        
        // Should have at least some alphanumeric characters
        return /^[A-Z0-9]+$/i.test(cleanId);
    }

    /**
     * Get verification by student ID
     */
    async getVerificationByStudentId(studentId: string): Promise<EdcVerification | null> {
        return await this.getOne({ student_id: studentId });
    }

    /**
     * Increment booking count for verified member
     */
    async incrementBookingCount(studentId: string): Promise<void> {
        const verification = await this.getOne({ student_id: studentId });
        if (verification) {
            await this.update(
                { id: verification.id },
                { bookings_count: verification.bookings_count + 1 }
            );
        }
    }
}

