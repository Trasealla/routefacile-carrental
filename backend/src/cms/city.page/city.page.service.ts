import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityPage } from 'src/entities/city.page.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CityPageService extends BaseService<CityPage> {

    constructor(
        @InjectRepository(CityPage) private cityPageRepository: Repository<CityPage>,
    ) {
        super(cityPageRepository);
    }
}
