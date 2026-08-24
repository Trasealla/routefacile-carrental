import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateDaily } from 'src/entities/rate.daily.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateDailyService extends BaseService<RateDaily> {
    constructor(
        @InjectRepository(RateDaily) RateDailyRepo: Repository<RateDaily>
    ) {
        super(RateDailyRepo)
    }
}
