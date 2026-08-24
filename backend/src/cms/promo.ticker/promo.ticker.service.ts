import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PromoTicker } from 'src/entities/promo.ticker.entity';
import { BaseService } from 'src/service/base.service';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class PromoTickerService extends BaseService<PromoTicker> {
    constructor(@InjectRepository(PromoTicker) promoTickerRepository: Repository<PromoTicker>) {
        super(promoTickerRepository)
    }

    /**
     * Get all active promo tickers that are currently valid (within date range)
     */
    async getActivePromoTickers(): Promise<PromoTicker[]> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        const query = this.repository.createQueryBuilder('entity')
            .select([
                'entity.id',
                'entity.text_en',
                'entity.text_ar',
                'entity.description_en',
                'entity.description_ar',
                'entity.link',
                'entity.sort_order',
                'entity.scroll_speed'
            ])
            .where('entity.status = :status', { status: BaseService.ACTIVE })
            .andWhere('entity.start_date <= :today', { today })
            .andWhere('entity.end_date >= :today', { today })
            .orderBy('entity.sort_order', 'ASC');

        return await query.getMany();
    }
}







