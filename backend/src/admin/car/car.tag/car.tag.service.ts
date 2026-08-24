import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarTag } from 'src/entities/car.tag.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarTagService extends BaseService<CarTag> {
    constructor(
        @InjectRepository(CarTag) carTagService: Repository<CarTag>
    ) {
        super(carTagService)
    }
}
