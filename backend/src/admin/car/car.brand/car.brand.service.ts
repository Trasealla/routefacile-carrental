import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarBrand } from 'src/entities/car.brand.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarBrandService extends BaseService<CarBrand> {
    constructor(
        @InjectRepository(CarBrand) repo: Repository<CarBrand>
    ) {
        super(repo)
    }
}
