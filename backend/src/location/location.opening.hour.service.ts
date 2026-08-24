import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class LocationOpeningHourService extends BaseService<LocationOpeningHour> {
    constructor(
        @InjectRepository(LocationOpeningHour) private LocationOpeningHoursRepository: Repository<LocationOpeningHour>,
    ) {
        super(LocationOpeningHoursRepository);
    }

    generateTimeRange(from_hours: number, to_hours: number): string[] {
        const timeRange: string[] = [];
        
        for (let hour = from_hours; hour < to_hours; hour++) {
          for (let minutes of [0, 15, 30, 45]) {
            const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            timeRange.push(time);
          }
        }
      
        return timeRange;
      }
}
