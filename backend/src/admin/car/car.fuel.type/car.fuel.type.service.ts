import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarFuelType } from 'src/entities/car.fuel.type.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarFuelTypeService extends BaseService<CarFuelType> {
    constructor(
        @InjectRepository(CarFuelType) repo: Repository<CarFuelType>
    ) {
        super(repo)
    }
}
