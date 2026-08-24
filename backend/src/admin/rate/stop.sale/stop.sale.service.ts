import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StopSale } from 'src/entities/stop.sale.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class StopSaleService extends BaseService<StopSale> {

    constructor(
        @InjectRepository(StopSale) repo: Repository<StopSale>
    ) {
        super(repo)
    }
}
