import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { CarCategoryController } from './car.category/car.category.controller';
import { CarCategoryService } from './car.category/car.category.service';
import { CarBrandService } from './car.brand/car.brand.service';
import { CarBrandController } from './car.brand/car.brand.controller';
import { CarFuelTypeController } from './car.fuel.type/car.fuel.type.controller';
import { CarFuelTypeService } from './car.fuel.type/car.fuel.type.service';
import { CarGroupController } from './car.group/car.group.controller';
import { CarTagController } from './car.tag/car.tag.controller';
import { CarTagService } from './car.tag/car.tag.service';
import { CarTransmissionController } from './car.transmission/car.transmission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarTag } from 'src/entities/car.tag.entity';
import { CarCategory } from 'src/entities/car.category.entity';
import { CarTransmission } from 'src/entities/car.transmission.entity';
import { CarFuelType } from 'src/entities/car.fuel.type.entity';
import { CarBrand } from 'src/entities/car.brand.entity';
import { CarGroup } from 'src/entities/car.group.entity';
import { CarTransmissionService } from './car.transmission/car.transmission.service';
import { CarGroupService } from './car.group/car.group.service';
import { Car } from 'src/entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    CarTag,
    CarCategory,
    CarTransmission,
    CarFuelType,
    CarBrand,
    CarGroup,
    Car
  ])],
  controllers: [CarController, CarCategoryController, CarBrandController, CarFuelTypeController, CarGroupController, CarTagController, CarTransmissionController],
  providers: [
    CarService,
    CarCategoryService,
    CarBrandService,
    CarFuelTypeService,
    CarTagService,
    CarTransmissionService,
    CarGroupService
  ]
})
export class CarModule {}
