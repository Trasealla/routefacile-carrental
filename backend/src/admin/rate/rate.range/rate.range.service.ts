import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateRange } from 'src/entities/rate.range.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateRangeService extends BaseService<RateRange> {
    constructor(
        @InjectRepository(RateRange) rateRangeRepo: Repository<RateRange>
    ) {
        super(rateRangeRepo)
    }
}
