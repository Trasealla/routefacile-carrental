import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateMonthly } from 'src/entities/rate.monthly.entity';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateMonthlyV2Service extends BaseService<RateMonthlyV2> {
    constructor(
        @InjectRepository(RateMonthlyV2) rateMonthlyV2Repo: Repository<RateMonthlyV2>
    ) {
        super(rateMonthlyV2Repo)
    }
}
