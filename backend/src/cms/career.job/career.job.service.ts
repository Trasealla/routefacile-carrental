import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerJob } from 'src/entities/career.job.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CareerJobService extends BaseService<CareerJob> {
    constructor(@InjectRepository(CareerJob) private careerJobRepository: Repository<CareerJob>) {
        super(careerJobRepository)
    }
}
