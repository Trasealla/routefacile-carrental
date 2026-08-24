import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/entities/country.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CountryService extends BaseService<Country> {

    constructor(
        @InjectRepository(Country) private countryRepository: Repository<Country>
    ) {
        super(countryRepository)
    }
}
