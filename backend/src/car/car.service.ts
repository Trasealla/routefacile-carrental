import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from 'src/entities/car.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarService extends BaseService<Car> {

    constructor(
        @InjectRepository(Car) private carRepository: Repository<Car>
    ) {
        super(carRepository)
    }
}
