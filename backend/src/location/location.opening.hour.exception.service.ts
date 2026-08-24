import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationOpeningHourException } from 'src/entities/location.opening.hour.exception.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class LocationOpeningHourExceptionService extends BaseService<LocationOpeningHourException> {
  constructor(
    @InjectRepository(LocationOpeningHourException) private LocationOpeningHourExceptionRepository: Repository<LocationOpeningHourException>,
  ) {
    super(LocationOpeningHourExceptionRepository);
  }
}
