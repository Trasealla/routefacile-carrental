import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/entities/city.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CityService extends BaseService<City> {
    constructor(
        @InjectRepository(City) private cityRepository: Repository<City>,
    ) {
        super(cityRepository);
    }

}
