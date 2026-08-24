import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from 'src/entities/car.entity';
import { CarCategoryService } from './car.category.service';
import { CarCategoryController } from './car.category.controller';
import { CarCategory } from 'src/entities/car.category.entity';
import { CarBrandController } from './car.brand.controller';
import { CarBrandService } from './car.brand.service';
import { CarBrand } from 'src/entities/car.brand.entity';
import { CacheService } from 'src/cache/cache.service';

@Module({
  providers: [CarService, CarCategoryService, CarBrandService, CacheService],
  imports: [TypeOrmModule.forFeature([Car, CarCategory, CarBrand])],
  controllers: [CarController, CarCategoryController, CarBrandController],
})
export class CarModule {}
