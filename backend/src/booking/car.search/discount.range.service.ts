import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountRange } from 'src/entities/discount.range.entity';
import { BaseService } from 'src/service/base.service';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CarExtraDto } from '../car.extra/car.extra.dto';
import { getDaysBetweenDates } from 'src/admin/utils/date.util';

@Injectable()
export class DiscountRangeService extends BaseService<DiscountRange> {
    constructor(
        @InjectRepository(DiscountRange) repo: Repository<DiscountRange>
    ) {
        super(repo)
    }

    async getDiscountRange(body: CarExtraDto) {
        const booking_days_res = getDaysBetweenDates(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
        const discount_range_where = { from: LessThanOrEqual(booking_days_res.total_days), to: MoreThanOrEqual(booking_days_res.total_days), status: DiscountRangeService.ACTIVE }
        return await this.getAll(discount_range_where)
    }
}
