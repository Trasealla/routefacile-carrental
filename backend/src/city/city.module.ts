import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from 'src/entities/city.entity';
import { CityController } from './city.controller';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/cache/cache.service';
import { CityOpeningHour } from 'src/entities/city.opening.hour.entity';
import { CityOpeningHourService } from './city.opening_hour.service';

@Module({
  providers: [CityService, ConfigService, CacheService, CityOpeningHourService],
  imports: [TypeOrmModule.forFeature([City, CityOpeningHour])],
  controllers: [CityController],
})

export class CityModule {}
