import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarTransmission } from 'src/entities/car.transmission.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarTransmissionService extends BaseService<CarTransmission> {
    constructor(
        @InjectRepository(CarTransmission) carTransmissionRepo: Repository<CarTransmission>
    ) {
        super(carTransmissionRepo)
    }
}
