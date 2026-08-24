import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateMonthlyFile } from 'src/entities/rate.monthly.file.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateMonthlyFileService extends BaseService<RateMonthlyFile> {
    constructor(
        @InjectRepository(RateMonthlyFile) rateMonthlyFileRepo: Repository<RateMonthlyFile>
    ) {
        super(rateMonthlyFileRepo)
    }
}
