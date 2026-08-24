import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EdcVerificationService, EDC_PROMO_CONFIG } from './edc.verification.service';
import { EdcVerificationDto, EdcVerificationResponseDto } from './edc.verification.dto';
import { EdcPromoService } from 'src/admin/edc/edc.promo.service';
import { EdcTermService } from 'src/admin/edc/edc.term.service';
import { LanguageTypes } from 'src/entities/enums/language.type';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('edc')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('edc')
export class EdcVerificationController {

    constructor(
        @Inject(EdcVerificationService) private edcVerificationService: EdcVerificationService,
        @Inject(EdcPromoService) private edcPromoService: EdcPromoService,
        @Inject(EdcTermService) private edcTermService: EdcTermService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @ApiOperation({ 
        summary: 'Verify EDC Student/Staff membership',
        description: 'Verifies if a user is a valid EDC student or staff member and returns the exclusive promo code if verified.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Verification result',
        type: EdcVerificationResponseDto
    })
    @Post('verify')
    async verify(@Body() body: EdcVerificationDto): Promise<EdcVerificationResponseDto> {

        const result = await this.edcVerificationService.verifyEdcMember(body);

        if (result.verified) {
            // Emit event for email notification or other processing
            this.eventEmitter.emit('edc.verification.success', {
                student_id: body.student_id,
                full_name: body.full_name,
                email: body.email,
                promo_code: result.data?.promo_code,
                verification_id: result.data?.verification_id
            });
        }

        return result;
    }

    @ApiOperation({ 
        summary: 'Get EDC promo configuration',
        description: 'Returns the current EDC promo code, discount details, and terms & conditions (public endpoint for display purposes)'
    })
    @ApiQuery({ name: 'lang', required: false, enum: LanguageTypes })
    @Get('promo-info')
    async getPromoInfo(@Query('lang') lang?: string) {
        // Get promo config from database
        const promoConfig = await this.edcPromoService.getPromoConfig();
        
        // Get active terms from database
        const terms = await this.edcTermService.getActiveTerms();

        // Use database config or fallback to static config
        const config = promoConfig || {
            promo_code: EDC_PROMO_CONFIG.code,
            discount_percentage: EDC_PROMO_CONFIG.discount_percentage,
            discount_type: 'percentage',
            is_active: true,
            valid_from: EDC_PROMO_CONFIG.valid_from,
            valid_until: EDC_PROMO_CONFIG.valid_until,
            description_en: 'Exclusive discount for Cities Driving Company students and staff',
            description_ar: 'خصم حصري لأعضاء مؤسسة الإمارات للتعليم'
        };

        // Format terms based on language
        const formattedTerms = terms.map(term => ({
            id: term.id,
            text: lang === 'ae' ? (term.text_ar || term.text_en) : term.text_en,
            text_ar: term.text_ar
        }));

        return {
            success: true,
            data: {
                promo_code: config.promo_code,
                discount_percentage: config.discount_percentage,
                discount_type: config.discount_type || 'percentage',
                is_active: config.is_active !== false,
                valid_until: config.valid_until,
                description: {
                    en: config.description_en || 'Exclusive discount for EDC members',
                    ar: config.description_ar || 'خصم حصري لأعضاء مؤسسة الإمارات للتعليم'
                },
                terms_and_conditions: formattedTerms
            }
        };
    }

    @ApiOperation({ 
        summary: 'Check verification status by student ID',
        description: 'Check if a student ID has already been verified'
    })
    @Get('verification-status/:student_id')
    async checkVerificationStatus(@Param('student_id') studentId: string) {
        const verification = await this.edcVerificationService.getVerificationByStudentId(studentId);

        if (!verification) {
            return {
                status: 'not_found',
                verified: false,
                message: 'No verification record found for this ID'
            };
        }

        return {
            status: 'success',
            verified: verification.verification_status === 'verified',
            data: {
                verification_status: verification.verification_status,
                member_type: verification.member_type,
                promo_code: verification.verification_status === 'verified' ? verification.promo_code : null,
                verified_at: verification.verified_at
            }
        };
    }
}

