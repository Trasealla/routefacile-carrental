import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterCityCharge } from 'src/entities/ineter.cities.charge.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class InterCitiesChargesService extends BaseService<InterCityCharge> {

    constructor(
        @InjectRepository(InterCityCharge) repo: Repository<InterCityCharge>
    ) {
        super(repo)
    }
}