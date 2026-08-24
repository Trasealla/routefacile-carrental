import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { CarService } from './car.service';
import { CarListingDto } from './dtos/car.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CarDetailDto } from './dtos/car.detail.dto';
import { CARS_PATH } from 'src/config/contants';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('car')
@UseGuards(ApiKeyAuthGuard)
@Controller('car')
export class CarController {

    constructor(
        @Inject(CarService) private carService: CarService
    ) { }

    @Get()
    async listing(@Query() params: CarListingDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const path = process.env.FILE_SERVER + CARS_PATH;
        const select = ['id', `name_${lang}`, `description_${lang}`, 'availability_date', 'air_bags',
            'sunroof', 'parking_sensors', 'infotainment_system', 'rear_camera', 'featured', 'electric', 'cruise_control', 'bluetooth',
            `doors_${lang}`, `suit_cases_${lang}`, `passengers_${lang}`, 'image', 'banner_image',
            'abs', 'ac', 'fuel_avg', 'hp', 'year', 'special_rates_cities', 'special_rates_image'
        ];

        const relations = this.relations(params);
        const where = { status: CarService.ACTIVE };
        
        const response = await this.carService.getAll(where, select, relations, CarService.LEFT_JOIN, true, params.page, params.page_size);
        
        // Apply special rates image replacement if city_id is provided
        let carsData = response.data;
        if (params.city_id) {
            carsData = this.applySpecialRatesImages(carsData, params.city_id, path);
        }
        
        const response_update = this.carService.removePostfix(carsData, { image: path, banner_image: path });
        return { ...response, data: response_update };
    }
    
    /**
     * Apply special rates images - replaces main image with special_rates_image
     * when the selected city matches the car's special_rates_cities configuration
     */
    private applySpecialRatesImages(cars: any[], city_id: number, path: string): any[] {
        return cars.map(car => {
            if (car.special_rates_image && car.special_rates_cities) {
                const cities = car.special_rates_cities;
                const shouldApplySpecial = 
                    cities.all === true || 
                    (cities.ids && Array.isArray(cities.ids) && cities.ids.includes(Number(city_id)));
                
                if (shouldApplySpecial) {
                    return {
                        ...car,
                        image: car.special_rates_image,
                        has_special_rate: true
                    };
                }
            }
            // Remove special rates fields from response (not needed by frontend)
            const { special_rates_cities, special_rates_image, ...cleanCar } = car;
            return cleanCar;
        });
    }

    @Get('featured')
    async featured(@Query() params: CarListingDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const path = process.env.FILE_SERVER + CARS_PATH;
        const select = ['id', `name_${lang}`, `description_${lang}`, 'availability_date', 'air_bags',
            'sunroof', 'parking_sensors', 'infotainment_system', 'rear_camera', 'featured', 'electric', 'cruise_control', 'bluetooth',
            `doors_${lang}`, `suit_cases_${lang}`, `passengers_${lang}`, 'image', 'banner_image',
            'abs', 'ac', 'fuel_avg', 'hp', 'year', 'special_rates_cities', 'special_rates_image'
        ];

        const relations = this.relations(params);
        const where = { status: CarService.ACTIVE, featured: 1 };

        const response = await this.carService.getAll(where, select, relations, CarService.LEFT_JOIN, true, params.page, params.page_size);

        let carsData = response.data;
        if (params.city_id) {
            carsData = this.applySpecialRatesImages(carsData, params.city_id, path);
        }

        const response_update = this.carService.removePostfix(carsData, { image: path, banner_image: path });
        return { ...response, data: response_update };
    }

    @Get(':id')
    async detail(@Param('id') id: number, @Query() params: CarDetailDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;

        const select = ['sunroof', `suit_cases_${lang}`, 'rear_camera', `passengers_${lang}`,
            'parking_sensors', `name_${lang}`, 'infotainment_system', 'images',
            'image', 'id', 'featured', 'electric', `doors_${lang}`, `description_${lang}`,
            'cruise_control', 'bluetooth', 'banner_image', 'availability_date', 'air_bags',
            'abs', 'ac', 'fuel_avg', 'hp', 'year', 'special_rates_cities', 'special_rates_image'];

        const where = { id: id, status: CarService.ACTIVE };

        const relations = this.relations(params);

        const response = await this.carService.getOne(where, select, relations, CarService.LEFT_JOIN);

        if (!response) {
            throw new NotFoundException('Car not found');
        }

        const path = process.env.FILE_SERVER + CARS_PATH;
        const carResponse: any = response;
        
        // If city_id is provided, check if special rates image should be applied
        if (params.city_id && carResponse.special_rates_image && carResponse.special_rates_cities) {
            const cities = carResponse.special_rates_cities;
            const shouldApplySpecial = 
                cities.all === true || 
                (cities.ids && Array.isArray(cities.ids) && cities.ids.includes(Number(params.city_id)));
            
            if (shouldApplySpecial) {
                carResponse.image = carResponse.special_rates_image;
                carResponse.has_special_rate = true;
            }
        }
        
        // Remove special rates fields from response
        delete carResponse.special_rates_cities;
        delete carResponse.special_rates_image;
        
        let response_update = this.carService.removePostfix(carResponse, { image: path, banner_image: path, images: path });

        return response_update;
    }

    private relations(params: any) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const relations = {
            group: { columns: [`id`, `name_${lang}`] },
            fuel_type: { columns: [`id`, `name_${lang}`] },
            category: { columns: [`id`, `name_${lang}`] },
            brand: { columns: [`id`, `name_${lang}`] },
            tag: { columns: [`id`, `name_${lang}`] },
            transmission: { columns: [`id`, `name_${lang}`] },
        };
        if (params.group_id) {
            relations['group']['where'] = { id: params.group_id };
        }
        if (params.fuel_type_id) {
            relations['fuel_type']['where'] = { id: params.fuel_type_id };
        }
        if (params.category_id) {
            relations['category']['where'] = { id: params.category_id };
        }
        if (params.brand_id) {
            relations['brand']['where'] = { id: params.brand_id };
        }
        if (params.tag_id) {
            relations['tag']['where'] = { id: params.tag_id };
        }
        if (params.transmission_id) {
            relations['transmission']['where'] = { id: params.transmission_id };
        }

        return relations;
    }
}
