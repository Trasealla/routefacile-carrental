import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CareerJobApplicationService extends BaseService<CareerJobApplication> {

    constructor(@InjectRepository(CareerJobApplication) private careerJobApplication: Repository<CareerJobApplication>) {
        super(careerJobApplication)
    }
}
