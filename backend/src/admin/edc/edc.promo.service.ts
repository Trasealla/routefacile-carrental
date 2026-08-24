import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EdcPromoConfig } from 'src/entities/edc.promo.config.entity';
import { BaseService } from 'src/service/base.service';
import { Repository, Between } from 'typeorm';
import { EdcVerification } from 'src/entities/edc.verification.entity';

@Injectable()
export class EdcPromoService extends BaseService<EdcPromoConfig> {
    constructor(
        @InjectRepository(EdcPromoConfig) private edcPromoConfigRepository: Repository<EdcPromoConfig>,
        @InjectRepository(EdcVerification) private edcVerificationRepository: Repository<EdcVerification>
    ) {
        super(edcPromoConfigRepository);
    }

    /**
     * Get the current (first) promo configuration
     */
    async getPromoConfig(): Promise<EdcPromoConfig | null> {
        return await this.edcPromoConfigRepository.findOne({
            where: {},
            order: { id: 'ASC' }
        });
    }

    /**
     * Create or update promo configuration
     */
    async upsertPromoConfig(data: Partial<EdcPromoConfig>): Promise<EdcPromoConfig> {
        const existing = await this.getPromoConfig();
        
        if (existing) {
            await this.edcPromoConfigRepository.update({ id: existing.id }, data);
            return await this.getPromoConfig();
        } else {
            const newConfig = this.edcPromoConfigRepository.create(data);
            return await this.edcPromoConfigRepository.save(newConfig);
        }
    }

    /**
     * Increment the usage count
     */
    async incrementUsage(): Promise<void> {
        const config = await this.getPromoConfig();
        if (config) {
            await this.edcPromoConfigRepository.update(
                { id: config.id },
                { current_uses: config.current_uses + 1 }
            );
        }
    }

    /**
     * Get usage statistics
     */
    async getUsageStats(from?: string, to?: string): Promise<{
        total_uses: number;
        unique_users: number;
        total_discount_given: number;
        usage_by_member_type: Record<string, number>;
        usage_by_month: { month: string; count: number }[];
    }> {
        const config = await this.getPromoConfig();
        
        // Build date filter
        const dateFilter: any = {};
        if (from && to) {
            dateFilter.created_at = Between(new Date(from), new Date(to));
        } else if (from) {
            dateFilter.created_at = Between(new Date(from), new Date());
        }

        // Get verifications with optional date filter
        const verifications = await this.edcVerificationRepository.find({
            where: dateFilter
        });

        // Calculate stats
        const uniqueEmails = new Set(verifications.map(v => v.email));
        
        const usageByMemberType: Record<string, number> = {
            student: 0,
            staff: 0,
            instructor: 0
        };

        verifications.forEach(v => {
            if (usageByMemberType[v.member_type] !== undefined) {
                usageByMemberType[v.member_type]++;
            }
        });

        // Group by month
        const usageByMonthMap = new Map<string, number>();
        verifications.forEach(v => {
            const month = v.created_at.toISOString().substring(0, 7); // YYYY-MM
            usageByMonthMap.set(month, (usageByMonthMap.get(month) || 0) + 1);
        });

        const usageByMonth = Array.from(usageByMonthMap.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Calculate total discount (estimate based on average booking value)
        const totalBookings = verifications.reduce((sum, v) => sum + v.bookings_count, 0);
        const discountPercentage = config?.discount_percentage || 15;
        const avgBookingValue = 500; // Estimated average
        const totalDiscountGiven = totalBookings * avgBookingValue * (discountPercentage / 100);

        return {
            total_uses: config?.current_uses || verifications.length,
            unique_users: uniqueEmails.size,
            total_discount_given: Math.round(totalDiscountGiven * 100) / 100,
            usage_by_member_type: usageByMemberType,
            usage_by_month: usageByMonth
        };
    }
}







