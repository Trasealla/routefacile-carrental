import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from 'src/entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationOpeningHourService } from './location.opening.hour.service';
import { LocationOpeningHourExceptionService } from './location.opening.hour.exception.service';
import { CityService } from 'src/city/city.service';
import { CityOpeningHourService } from 'src/city/city.opening_hour.service';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { LocationOpeningHourException } from 'src/entities/location.opening.hour.exception.entity';
import { City } from 'src/entities/city.entity';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { CacheService } from 'src/cache/cache.service';

@Module({
  controllers: [LocationController],
  imports: [TypeOrmModule.forFeature([Location, LocationOpeningHour, LocationOpeningHourException, City, CityOpeningHour])],
  providers: [LocationService, LocationOpeningHourService, LocationOpeningHourExceptionService, CityService, CityOpeningHourService, CacheService],
  exports: [LocationService, LocationOpeningHourService, LocationOpeningHourExceptionService, CityService, CityOpeningHourService]
})
export class LocationModule {}
