import { Body, Controller, Get, Inject, NotFoundException, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { EdcVerification, EdcVerificationStatus } from 'src/entities/edc.verification.entity';
import { VerificationListQueryDto, RevokeVerificationDto } from './edc.verification.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/edc/verifications')
export class EdcVerificationController {
    constructor(
        @InjectRepository(EdcVerification) private edcVerificationRepository: Repository<EdcVerification>
    ) {}

    /**
     * GET /api/admin/edc/verifications
     * List all verifications with pagination and filtering
     */
    @Get()
    async listVerifications(@Query() query: VerificationListQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: FindOptionsWhere<EdcVerification> = {};

        if (query.status) {
            where.verification_status = query.status;
        }

        if (query.member_type) {
            where.member_type = query.member_type;
        }

        // For search, we need to use QueryBuilder
        let queryBuilder = this.edcVerificationRepository.createQueryBuilder('v');

        if (query.status) {
            queryBuilder = queryBuilder.andWhere('v.verification_status = :status', { status: query.status });
        }

        if (query.member_type) {
            queryBuilder = queryBuilder.andWhere('v.member_type = :memberType', { memberType: query.member_type });
        }

        if (query.search) {
            queryBuilder = queryBuilder.andWhere(
                '(v.full_name LIKE :search OR v.email LIKE :search OR v.student_id LIKE :search)',
                { search: `%${query.search}%` }
            );
        }

        const total = await queryBuilder.getCount();

        const verifications = await queryBuilder
            .orderBy('v.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                verifications: verifications.map(v => ({
                    id: v.id,
                    student_id: v.student_id,
                    full_name: v.full_name,
                    email: v.email,
                    member_type: v.member_type,
                    promo_code_used: v.promo_code,
                    verified_at: v.verified_at,
                    expires_at: v.valid_until,
                    status: v.verification_status,
                    bookings_made: v.bookings_count
                })),
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit
                }
            }
        };
    }

    /**
     * PUT /api/admin/edc/verifications/:id/revoke
     * Revoke a verification
     */
    @Put(':id/revoke')
    async revokeVerification(
        @Param('id') id: number,
        @Body() body: RevokeVerificationDto,
        @Request() req
    ) {
        const verification = await this.edcVerificationRepository.findOne({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException({
                success: false,
                error: 'Verification not found'
            });
        }

        await this.edcVerificationRepository.update(
            { id },
            {
                verification_status: EdcVerificationStatus.REJECTED,
                admin_notes: `Revoked by admin: ${body.reason}`
            }
        );

        return {
            success: true,
            message: 'Verification revoked successfully'
        };
    }

    /**
     * GET /api/admin/edc/verifications/:id
     * Get single verification details
     */
    @Get(':id')
    async getVerification(@Param('id') id: number) {
        const verification = await this.edcVerificationRepository.findOne({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException({
                success: false,
                error: 'Verification not found'
            });
        }

        return {
            success: true,
            data: verification
        };
    }
}







