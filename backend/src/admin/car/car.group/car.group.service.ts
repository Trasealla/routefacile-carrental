import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarGroup } from 'src/entities/car.group.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarGroupService extends BaseService<CarGroup> {

    constructor(
        @InjectRepository(CarGroup) carGroupRepo: Repository<CarGroup>
    ) {
        super(carGroupRepo)
    }

    getIdNameArray(car_groups: CarGroup[]) {
        const group_object: { [key: string]: number } = {};
        car_groups.forEach(group => {
            group_object[group.name_en] = group.id;
        });

        return group_object;
    }
}
