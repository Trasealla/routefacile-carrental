import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarCategory } from 'src/entities/car.category.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarCategoryService extends BaseService<CarCategory> {
    constructor(
        @InjectRepository(CarCategory) private carCategoryRepository: Repository<CarCategory>
    ) {
        super(carCategoryRepository)
    }
}
