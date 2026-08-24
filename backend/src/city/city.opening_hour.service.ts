import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/entities/city.entity';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CityOpeningHourService extends BaseService<CityOpeningHour> {
    constructor(
        @InjectRepository(CityOpeningHour) private cityOpeningHourRepository: Repository<CityOpeningHour>,
    ) {
        super(cityOpeningHourRepository);
    }

}
