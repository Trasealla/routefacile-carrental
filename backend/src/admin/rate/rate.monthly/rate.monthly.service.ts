import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateMonthly } from 'src/entities/rate.monthly.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateMonthlyService extends BaseService<RateMonthly> {
    constructor(
        @InjectRepository(RateMonthly) rateMonthlyRepo: Repository<RateMonthly>
    ) {
        super(rateMonthlyRepo)
    }
}
